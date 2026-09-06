const RAWG_BASE_URL = 'https://api.rawg.io/api';

export class RawgServiceError extends Error {
  constructor(message, status = 502) { super(message); this.status = status; }
}

const request = async (path, params = {}) => {
  const key = process.env.RAWG_API_KEY;
  if (!key) throw new RawgServiceError('RAWG integration is not configured. Set RAWG_API_KEY on the server.', 503);
  const query = new URLSearchParams({ key, ...params });
  let response;
  try { response = await fetch(`${RAWG_BASE_URL}${path}?${query}`); } catch { throw new RawgServiceError('Unable to reach RAWG.'); }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new RawgServiceError(body.detail || 'RAWG request failed.', response.status === 404 ? 404 : 502);
  }
  return response.json();
};

export const rawgListGames = (params = {}) => request('/games', params);
export const rawgSearchGames = (query, params = {}) => request('/games', { search: query, ...params });
export const rawgGamesByGenre = (genre, params = {}) => request('/games', { genres: genre, ...params });
export const rawgGameDetails = async (slug) => {
  const game = await request(`/games/${encodeURIComponent(slug)}`);
  const [screenshots, stores] = await Promise.all([
    request(`/games/${encodeURIComponent(slug)}/screenshots`).catch(() => ({ results: [] })),
    request(`/games/${encodeURIComponent(slug)}/stores`).catch(() => ({ results: [] })),
  ]);
  return { ...game, screenshots: screenshots.results || [], storeLinksRaw: stores.results || [] };
};
export const rawgRelatedGames = (id, params = {}) => request(`/games/${encodeURIComponent(id)}/suggested`, params);

export const parseRequirements = (req) => {
  if (!req) return { os: '', processor: '', memory: '', graphics: '', storage: '' };
  if (typeof req === 'object') {
    return {
      os: req.os || '',
      processor: req.processor || req.cpu || '',
      memory: req.memory || req.ram || '',
      graphics: req.graphics || req.videoCard || req.gpu || '',
      storage: req.storage || req.hardDrive || req.disk || '',
    };
  }
  if (typeof req !== 'string') return { os: '', processor: '', memory: '', graphics: '', storage: '' };

  const extract = (fieldRegex) => {
    const match = req.match(fieldRegex);
    return match ? match[1].replace(/^[:\-\s]+/, '').replace(/[\r\n]+/g, ' ').trim() : '';
  };
  return {
    os: extract(/(?:OS|Operating System):\s*([^]+?)(?=(?:Processor|CPU|Memory|RAM|Graphics|Video Card|Storage|Hard Drive|Sound Card|DirectX|Additional Notes):|$)/i),
    processor: extract(/(?:Processor|CPU):\s*([^]+?)(?=(?:Memory|RAM|Graphics|Video Card|Storage|Hard Drive|Sound Card|DirectX|Additional Notes):|$)/i),
    memory: extract(/(?:Memory|RAM):\s*([^]+?)(?=(?:Graphics|Video Card|Storage|Hard Drive|Sound Card|DirectX|Additional Notes):|$)/i),
    graphics: extract(/(?:Graphics|Video Card|GPU):\s*([^]+?)(?=(?:Storage|Hard Drive|Disk Space|Sound Card|DirectX|Additional Notes):|$)/i),
    storage: extract(/(?:Storage|Hard Drive|Disk Space):\s*([^]+?)(?=(?:Sound Card|DirectX|Additional Notes):|$)/i),
  };
};

export const normalizeRawgGame = (rawg) => {
  const pcPlatform = rawg.platforms?.find((item) => item.platform?.slug === 'pc');
  const pcReq = pcPlatform?.requirements || {};

  return {
    rawgId: rawg.id,
    title: rawg.name || '',
    slug: rawg.slug || '',
    description: rawg.description_raw || rawg.description || '',
    coverImage: rawg.background_image || '',
    backgroundImage: rawg.background_image_additional || rawg.background_image || '',
    images: (rawg.screenshots || rawg.short_screenshots || []).map((shot) => shot.image).filter(Boolean),
    screenshots: (rawg.screenshots || rawg.short_screenshots || []).map((shot) => shot.image).filter(Boolean),
    genre: (rawg.genres || []).map((item) => item.name).filter(Boolean),
    genres: (rawg.genres || []).map((item) => item.name).filter(Boolean),
    tags: (rawg.tags || []).map((item) => item.name).filter(Boolean),
    developer: (rawg.developers || []).map((item) => item.name).filter(Boolean).join(', '),
    publisher: (rawg.publishers || []).map((item) => item.name).filter(Boolean).join(', '),
    releasedBy: (rawg.publishers || []).map((item) => item.name).filter(Boolean).join(', '),
    platform: (rawg.platforms || []).map((item) => item.platform?.name || item.name).filter(Boolean),
    platforms: (rawg.platforms || []).map((item) => item.platform?.name || item.name).filter(Boolean),
    releaseDate: rawg.released || null,
    releaseYear: rawg.released ? new Date(rawg.released).getUTCFullYear() : undefined,
    rating: typeof rawg.rating === 'number' ? rawg.rating : null,
    metacritic: typeof rawg.metacritic === 'number' ? rawg.metacritic : null,
    playtime: typeof rawg.playtime === 'number' ? rawg.playtime : null,
    systemRequirements: {
      minimum: parseRequirements(pcReq.minimum || rawg.systemRequirements?.minimum),
      recommended: parseRequirements(pcReq.recommended || rawg.systemRequirements?.recommended),
    },
    storeLinks: (rawg.stores || []).map((item) => {
      const directStore = (rawg.storeLinksRaw || []).find((s) => s.store_id === item.store?.id || s.id === item.id);
      const url = directStore?.url || item.url || (item.store?.domain ? `https://${item.store.domain}` : '');
      return { name: item.store?.name || 'Store', url };
    }).filter((item) => item.url),
    lastSyncedAt: new Date(),
  };
};
