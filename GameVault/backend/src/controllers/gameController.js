import mongoose from 'mongoose';
import Game from '../models/Game.js';
import Comment from '../models/Comment.js';
import {
  normalizeRawgGame,
  rawgGameDetails,
  rawgGamesByGenre,
  rawgListGames,
  rawgRelatedGames,
  rawgSearchGames,
  RawgServiceError,
} from '../services/rawgService.js';

const CACHE_TTL_MS = Number(process.env.RAWG_CACHE_TTL_MS) || 24 * 60 * 60 * 1000;
const freshSince = () => new Date(Date.now() - CACHE_TTL_MS);
const pageOptions = (req) => ({ page: Math.max(1, Number(req.query.page) || 1), page_size: Math.min(40, Math.max(1, Number(req.query.pageSize) || 12)) });
const rawgIdentityFilter = (game) => ({
  $or: [
    { rawgId: game.rawgId },
    { slug: game.slug },
    { title: game.title },
  ],
});

// RAWG IDs are the primary identity. Slug/title preserve and adopt legacy local records
// that predate RAWG synchronization, preventing the title unique index from being hit.
const syncRawgGame = async (rawgGame) => {
  const normalized = normalizeRawgGame(rawgGame);
  let existing = await Game.findOne(rawgIdentityFilter(normalized));
  if (existing) return Game.findByIdAndUpdate(existing._id, { $set: normalized }, { new: true, runValidators: true });

  try {
    return await Game.findOneAndUpdate(
      { rawgId: normalized.rawgId },
      { $set: normalized },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );
  } catch (error) {
    // Concurrent sync or a legacy unique title/slug collision: re-read and update instead.
    if (error?.code !== 11000) throw error;
    existing = await Game.findOne(rawgIdentityFilter(normalized));
    if (!existing) throw error;
    return Game.findByIdAndUpdate(existing._id, { $set: normalized }, { new: true, runValidators: true });
  }
};

const upsertRawgGames = async (rawgGames) => {
  const synced = [];
  for (const game of rawgGames.filter((game) => game?.id && game?.slug && game?.name)) synced.push(await syncRawgGame(game));
  return synced;
};
const sendRawgError = (res, error) => res.status(error instanceof RawgServiceError ? error.status : 500).json({ message: error.message || 'Unable to load external game data.' });

// Helper to find a game by ObjectId, rawgId, or Slug
const findGameByIdOrSlug = async (identifier) => {
  if (!identifier) return null;
  if (mongoose.isValidObjectId(identifier)) {
    const game = await Game.findById(identifier);
    if (game) return game;
  }
  const numericId = Number(identifier);
  if (!Number.isNaN(numericId) && Number.isInteger(numericId)) {
    const game = await Game.findOne({ rawgId: numericId });
    if (game) return game;
  }
  return await Game.findOne({ slug: String(identifier).toLowerCase() });
};

// Helper to build recursive comment tree
const buildCommentTree = (comments, parentId = null) => {
  return comments
    .filter((comment) => String(comment.parentComment || '') === String(parentId || ''))
    .map((comment) => ({
      ...comment,
      replies: buildCommentTree(comments, comment._id),
    }));
};

// Helper to validate download URLs
const validateDownloads = (downloads) => {
  if (!downloads || !Array.isArray(downloads)) return;
  for (const item of downloads) {
    if (!item.platform || !item.url) {
      throw new Error('Each download item must have a platform and url');
    }
    try {
      const parsedUrl = new URL(item.url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Download URL must use HTTP or HTTPS protocol');
      }
    } catch (e) {
      throw new Error(`Invalid download URL format: ${item.url}`);
    }
  }
};

// ==========================================
// GAME CONTROLLERS
// ==========================================

// GET /api/games
export const getGames = async (req, res) => {
  try {
    const { search, genre, platform, developer, releaseYear, sort, limit, page } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (genre) {
      const genreList = Array.isArray(genre)
        ? genre
        : String(genre).split(',').map((g) => g.trim()).filter(Boolean);
      if (genreList.length > 0) {
        query.genre = { $in: genreList };
      }
    }

    if (platform) {
      const platformList = Array.isArray(platform)
        ? platform
        : String(platform).split(',').map((p) => p.trim()).filter(Boolean);
      if (platformList.length > 0) {
        query.platform = { $in: platformList };
      }
    }

    if (developer) {
      query.developer = { $regex: developer, $options: 'i' };
    }

    if (releaseYear) {
      query.releaseYear = Number(releaseYear);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'title') sortOption = { title: 1 };
    else if (sort === 'releaseYear') sortOption = { releaseYear: -1 };

    const gamesQuery = Game.find(query).sort(sortOption);

    if (limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = parseInt(limit, 10);
      gamesQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const games = await gamesQuery;
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/games/home - cached RAWG discovery list
export const getRawgHomeGames = async (req, res) => {
  const options = pageOptions(req);
  try {
    const cached = await Game.find({ rawgId: { $exists: true }, lastSyncedAt: { $gte: freshSince() } }).sort({ rating: -1, lastSyncedAt: -1 }).limit(options.page_size);
    if (cached.length >= options.page_size) return res.json({ results: cached, page: options.page, pageSize: options.page_size, cached: true });
    const rawg = await rawgListGames(options);
    const games = await upsertRawgGames(rawg.results || []);
    res.json({ results: games, page: rawg.page || options.page, pageSize: options.page_size, count: rawg.count, cached: false });
  } catch (error) { sendRawgError(res, error); }
};

// GET /api/games/search?q=
export const searchRawgGames = async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) return res.status(400).json({ message: 'Query parameter q is required.' });
  const options = pageOptions(req);
  try {
    const cached = await Game.find({ rawgId: { $exists: true }, lastSyncedAt: { $gte: freshSince() }, title: { $regex: query, $options: 'i' } }).limit(options.page_size);
    if (cached.length) return res.json({ results: cached, page: options.page, pageSize: options.page_size, cached: true });
    const rawg = await rawgSearchGames(query, options);
    const games = await upsertRawgGames(rawg.results || []);
    res.json({ results: games, page: rawg.page || options.page, pageSize: options.page_size, count: rawg.count, cached: false });
  } catch (error) { sendRawgError(res, error); }
};

// GET /api/games/genre/:genre
export const getRawgGamesByGenre = async (req, res) => {
  const genre = String(req.params.genre || '').trim();
  if (!genre) return res.status(400).json({ message: 'Genre is required.' });
  const options = pageOptions(req);
  try {
    const cached = await Game.find({ rawgId: { $exists: true }, lastSyncedAt: { $gte: freshSince() }, genres: { $regex: `^${genre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }).limit(options.page_size);
    if (cached.length) return res.json({ results: cached, page: options.page, pageSize: options.page_size, cached: true });
    const rawg = await rawgGamesByGenre(genre, options);
    const games = await upsertRawgGames(rawg.results || []);
    res.json({ results: games, page: rawg.page || options.page, pageSize: options.page_size, count: rawg.count, cached: false });
  } catch (error) { sendRawgError(res, error); }
};

// GET /api/games/:id
export const getGameById = async (req, res) => {
  try {
    let game = await findGameByIdOrSlug(req.params.id);
    // Local/admin games remain authoritative. RAWG games refresh only after cache expiry.
    if (game && (!game.rawgId || (game.lastSyncedAt && game.lastSyncedAt >= freshSince()))) return res.json(game);
    try {
      const rawg = await rawgGameDetails(game?.slug || req.params.id);
      game = await syncRawgGame(rawg);
      return res.json(game);
    } catch (rawgError) {
      if (game) return res.json(game); // stale data is preferable to an external outage
      if (rawgError instanceof RawgServiceError && rawgError.status === 404) return res.status(404).json({ message: 'Game not found' });
      return sendRawgError(res, rawgError);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/games/admin/rawg-search
export const adminRawgSearch = async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) return res.status(400).json({ message: 'Query parameter q is required.' });
  const options = pageOptions(req);
  try {
    const rawg = await rawgSearchGames(query, options);
    const results = rawg.results || [];
    
    // Check which ones are already in DB
    const rawgIds = results.map(g => g.id);
    const existingGames = await Game.find({ rawgId: { $in: rawgIds } }).select('rawgId');
    const existingIds = new Set(existingGames.map(g => g.rawgId));

    const mapped = results.map(rawgGame => {
      const normalized = normalizeRawgGame(rawgGame);
      return {
        ...normalized,
        isAdded: existingIds.has(rawgGame.id)
      };
    });
    res.json({ results: mapped, page: rawg.page || options.page, count: rawg.count });
  } catch (error) { sendRawgError(res, error); }
};

// POST /api/games/admin/rawg-add
export const adminRawgAdd = async (req, res) => {
  try {
    const { rawgId } = req.body;
    if (!rawgId) return res.status(400).json({ message: 'rawgId is required.' });
    
    let existing = await Game.findOne({ rawgId });
    if (existing) return res.status(400).json({ message: 'Game already added.' });
    
    const rawgDetails = await rawgGameDetails(rawgId);
    const game = await syncRawgGame(rawgDetails);
    res.status(201).json(game);
  } catch (error) {
    if (error instanceof RawgServiceError && error.status === 404) {
      return res.status(404).json({ message: 'Game not found on RAWG' });
    }
    res.status(500).json({ message: error.message || 'Failed to add game from RAWG' });
  }
};

// POST /api/games (Admin only)
export const createGame = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      genre,
      developer,
      platform,
      platforms,
      gameSize,
      releasedBy,
      version,
      releaseYear,
      coverImage,
      images,
      systemRequirements,
      downloads,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // Format genre array
    let formattedGenre = [];
    if (Array.isArray(genre)) {
      formattedGenre = genre.map((g) => String(g).trim()).filter(Boolean);
    } else if (typeof genre === 'string' && genre.trim()) {
      formattedGenre = genre.split(',').map((g) => g.trim()).filter(Boolean);
    }

    // Support platform or platforms array
    let rawPlatform = platform !== undefined ? platform : platforms;
    let formattedPlatform = [];
    if (Array.isArray(rawPlatform)) {
      formattedPlatform = rawPlatform.map((p) => String(p).trim()).filter(Boolean);
    } else if (typeof rawPlatform === 'string' && rawPlatform.trim()) {
      formattedPlatform = rawPlatform.split(',').map((p) => p.trim()).filter(Boolean);
    }

    // Validate download URLs
    if (downloads) {
      validateDownloads(downloads);
    }

    const gameData = {
      title: title.trim(),
      description: description.trim(),
      genre: formattedGenre,
      developer: developer ? developer.trim() : '',
      platform: formattedPlatform,
      gameSize: gameSize ? gameSize.trim() : '',
      releasedBy: releasedBy ? releasedBy.trim() : '',
      version: version ? version.trim() : '',
      releaseYear: releaseYear ? Number(releaseYear) : undefined,
      coverImage: coverImage ? coverImage.trim() : '',
      images: Array.isArray(images) ? images.map((img) => String(img).trim()).filter(Boolean) : [],
      systemRequirements: systemRequirements || {},
      downloads: Array.isArray(downloads) ? downloads : [],
    };

    if (slug && slug.trim()) {
      gameData.slug = slug.trim().toLowerCase();
    }

    const game = await Game.create(gameData);
    res.status(201).json(game);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/games/:id (Admin only)
export const updateGame = async (req, res) => {
  try {
    const game = await findGameByIdOrSlug(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const {
      title,
      slug,
      description,
      genre,
      developer,
      platform,
      platforms,
      gameSize,
      releasedBy,
      version,
      releaseYear,
      coverImage,
      images,
      systemRequirements,
      downloads,
    } = req.body;

    if (title !== undefined) {
      game.title = title.trim();
      if (!slug) {
        game.slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
    }

    if (slug !== undefined && slug.trim()) {
      game.slug = slug.trim().toLowerCase();
    }

    if (description !== undefined) {
      game.description = description.trim();
    }

    if (genre !== undefined) {
      if (Array.isArray(genre)) {
        game.genre = genre.map((g) => String(g).trim()).filter(Boolean);
      } else if (typeof genre === 'string') {
        game.genre = genre.split(',').map((g) => g.trim()).filter(Boolean);
      }
    }

    if (developer !== undefined) {
      game.developer = developer ? developer.trim() : '';
    }

    const rawPlatform = platform !== undefined ? platform : platforms;
    if (rawPlatform !== undefined) {
      if (Array.isArray(rawPlatform)) {
        game.platform = rawPlatform.map((p) => String(p).trim()).filter(Boolean);
      } else if (typeof rawPlatform === 'string') {
        game.platform = rawPlatform.split(',').map((p) => p.trim()).filter(Boolean);
      }
    }

    if (gameSize !== undefined) {
      game.gameSize = gameSize ? gameSize.trim() : '';
    }

    if (releasedBy !== undefined) {
      game.releasedBy = releasedBy ? releasedBy.trim() : '';
    }

    if (version !== undefined) {
      game.version = version ? version.trim() : '';
    }

    if (releaseYear !== undefined) {
      game.releaseYear = releaseYear ? Number(releaseYear) : undefined;
    }

    if (coverImage !== undefined) {
      game.coverImage = coverImage ? coverImage.trim() : '';
    }

    if (images !== undefined) {
      game.images = Array.isArray(images) ? images.map((img) => String(img).trim()).filter(Boolean) : [];
    }

    if (systemRequirements !== undefined) {
      game.systemRequirements = {
        minimum: { ...game.systemRequirements?.minimum, ...systemRequirements?.minimum },
        recommended: { ...game.systemRequirements?.recommended, ...systemRequirements?.recommended },
      };
    }

    if (downloads !== undefined) {
      validateDownloads(downloads);
      game.downloads = Array.isArray(downloads) ? downloads : [];
    }

    const updatedGame = await game.save();
    res.json(updatedGame);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/games/:id (Admin only)
export const deleteGame = async (req, res) => {
  try {
    const game = await findGameByIdOrSlug(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    await Game.findByIdAndDelete(game._id);
    await Comment.deleteMany({ game: game._id });

    res.json({ message: 'Game and associated comments removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/games/:id/related
export const getRelatedGames = async (req, res) => {
  try {
    const game = await findGameByIdOrSlug(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const limit = Math.max(1, parseInt(req.query.limit, 10) || 6);
    const conditions = [];

    if (game.genre && game.genre.length > 0) {
      conditions.push({ genre: { $in: game.genre } });
    }

    if (game.platform && game.platform.length > 0) {
      conditions.push({ platform: { $in: game.platform } });
    }

    if (game.developer) {
      conditions.push({ developer: game.developer });
    }

    const query = {
      _id: { $ne: game._id },
    };

    if (conditions.length > 0) {
      query.$or = conditions;
    }

    let relatedGames = await Game.find(query).limit(limit);

    // If fewer than limit games match metadata, fill with other newest games
    if (relatedGames.length < limit) {
      const existingIds = [game._id, ...relatedGames.map((g) => g._id)];
      const fallbackGames = await Game.find({
        _id: { $nin: existingIds },
      })
        .sort({ createdAt: -1 })
        .limit(limit - relatedGames.length);

      relatedGames = [...relatedGames, ...fallbackGames];
    }

    if (relatedGames.length || !game.rawgId) return res.json(relatedGames);
    try {
      const rawg = await rawgRelatedGames(game.rawgId, { page_size: limit });
      return res.json(await upsertRawgGames(rawg.results || []));
    } catch (error) {
      return res.json(relatedGames); // related games are optional; keep the established endpoint resilient
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// COMMENT CONTROLLERS
// ==========================================

// GET /api/games/:gameId/comments
export const getCommentsByGameId = async (req, res) => {
  try {
    const game = await findGameByIdOrSlug(req.params.gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const allComments = await Comment.find({ game: game._id })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .lean();

    const commentTree = buildCommentTree(allComments);
    res.json(commentTree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/games/:gameId/comments (Protected)
export const createComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const author = req.user._id; // Never trust author from body
    const gameIdentifier = req.params.gameId || req.body.game;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const game = await findGameByIdOrSlug(gameIdentifier);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (parentComment) {
      const parentExists = await Comment.findById(parentComment);
      if (!parentExists) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const comment = await Comment.create({
      content: content.trim(),
      parentComment: parentComment || null,
      author,
      game: game._id,
    });

    const populatedComment = await Comment.findById(comment._id).populate('author', 'username avatar');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST or PUT /api/comments/:id/upvote (Protected)
export const upvoteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userId = req.user._id;
    const hasUpvoted = comment.upvotedBy.includes(userId);

    if (hasUpvoted) {
      comment.upvotedBy.pull(userId);
      comment.upvotes = Math.max(0, comment.upvotes - 1);
    } else {
      comment.upvotedBy.push(userId);
      comment.upvotes += 1;
    }

    await comment.save();

    const populatedComment = await Comment.findById(comment._id).populate('author', 'username avatar');
    res.json(populatedComment || comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
