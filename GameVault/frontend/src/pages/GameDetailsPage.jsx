import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Cpu,
  ExternalLink,
  Gamepad2,
  HardDrive,
  Info,
  Layers,
  Maximize2,
  MessageSquare,
  Monitor,
  RefreshCw,
  Share2,
  Sparkles,
  Star,
  ThumbsUp,
  X,
  ChevronRight,
  ChevronLeft,
  Clock,
  Award,
  ArrowDownToLine
} from 'lucide-react';
import Button from '../components/ui/Button';
import GameCard from '../components/ui/GameCard';
import { gamesApi, commentsApi, usersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Requirement field mapping
const REQUIREMENT_SPECS = [
  { key: 'os', label: 'OS', icon: Monitor },
  { key: 'processor', label: 'Processor', icon: Cpu },
  { key: 'memory', label: 'Memory / RAM', icon: Layers },
  { key: 'graphics', label: 'Graphics', icon: Gamepad2 },
  { key: 'storage', label: 'Storage', icon: HardDrive },
];

// Helper to sanitize HTML into safe paragraphs without dangerouslySetInnerHTML
const parseDescriptionParagraphs = (rawText) => {
  if (!rawText) return [];
  // Replace HTML breaks/paragraphs with newlines
  const textWithBreaks = String(rawText)
    .replace(/<br\s*[/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '') // strip any remaining HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return textWithBreaks
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
};

// Fallback requirement parser in case raw strings exist in database
const extractRequirementSpec = (reqData, fieldKey) => {
  if (!reqData) return '';
  if (typeof reqData === 'object' && reqData[fieldKey]) {
    return String(reqData[fieldKey]).trim();
  }
  if (typeof reqData === 'string') {
    const patterns = {
      os: /(?:OS|Operating System):\s*([^]+?)(?=(?:Processor|CPU|Memory|RAM|Graphics|Video Card|Storage|Hard Drive|Sound Card|DirectX|Additional Notes):|$)/i,
      processor: /(?:Processor|CPU):\s*([^]+?)(?=(?:Memory|RAM|Graphics|Video Card|Storage|Hard Drive|Sound Card|DirectX|Additional Notes):|$)/i,
      memory: /(?:Memory|RAM):\s*([^]+?)(?=(?:Graphics|Video Card|Storage|Hard Drive|Sound Card|DirectX|Additional Notes):|$)/i,
      graphics: /(?:Graphics|Video Card|GPU):\s*([^]+?)(?=(?:Storage|Hard Drive|Disk Space|Sound Card|DirectX|Additional Notes):|$)/i,
      storage: /(?:Storage|Hard Drive|Disk Space):\s*([^]+?)(?=(?:Sound Card|DirectX|Additional Notes):|$)/i,
    };
    const match = reqData.match(patterns[fieldKey]);
    return match ? match[1].replace(/^[:\-\s]+/, '').replace(/[\r\n]+/g, ' ').trim() : '';
  }
  return '';
};

// Format relative date or absolute date
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) return formatDate(dateStr);
  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHour > 0) return `${diffHour}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return 'just now';
};

// Avatar fallback with deterministic background color
const getAvatarColor = (name = '') => {
  const colors = [
    'bg-blue-600',
    'bg-emerald-600',
    'bg-purple-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-indigo-600',
    'bg-cyan-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// ==========================================
// SCREENSHOT LIGHTBOX COMPONENT
// ==========================================
function ScreenshotLightbox({ images, currentIndex, onClose, onNavigate }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate((currentIndex + 1) % images.length);
      if (e.key === 'ArrowLeft') onNavigate((currentIndex - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, onClose, onNavigate]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar controls */}
        <div className="w-full flex items-center justify-between text-white/80 py-3 px-2">
          <span className="text-sm font-medium tracking-wide">
            {currentIndex + 1} / {images.length}
          </span>
          <button
            onClick={onClose}
            aria-label="Close Lightbox"
            className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Image */}
        <div className="relative w-full flex items-center justify-center overflow-hidden rounded-lg bg-black">
          <img
            src={images[currentIndex]}
            alt={`Screenshot ${currentIndex + 1}`}
            className="max-h-[75vh] w-auto max-w-full object-contain select-none"
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
                aria-label="Previous Screenshot"
                className="absolute left-3 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white transition-transform transform hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => onNavigate((currentIndex + 1) % images.length)}
                aria-label="Next Screenshot"
                className="absolute right-3 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white transition-transform transform hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMMENT ITEM & THREAD COMPONENT
// ==========================================
function CommentItem({ comment, gameId, onRefresh, depth = 0 }) {
  const { user, isAuthenticated, requireAuth } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [error, setError] = useState('');

  const authorName = comment.author?.username || 'Gamer';
  let authorAvatar = comment.author?.avatar;
  if (typeof authorAvatar === 'string') authorAvatar = authorAvatar.trim();
  const initial = (authorName[0] || 'G').toUpperCase();

  const hasUpvoted = user && comment.upvotedBy?.includes(user._id);

  const handleUpvote = () => {
    requireAuth(async () => {
      if (isUpvoting) return;
      setIsUpvoting(true);
      try {
        await commentsApi.upvote(comment._id);
        onRefresh();
      } catch (err) {
        console.error('Failed to upvote:', err);
      } finally {
        setIsUpvoting(false);
      }
    });
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    requireAuth(async () => {
      setIsSubmitting(true);
      setError('');
      try {
        await commentsApi.create(gameId, {
          content: replyText.trim(),
          parentComment: comment._id,
        });
        setReplyText('');
        setIsReplying(false);
        onRefresh();
      } catch (err) {
        setError(err.message || 'Failed to post reply');
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <article
      className={`relative ${
        depth > 0
          ? 'mt-4 pl-4 sm:pl-6 border-l-2 border-[var(--color-border-color)]'
          : 'py-5 border-b border-[var(--color-border-color)] last:border-b-0'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {authorAvatar ? (
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-9 h-9 rounded-full object-cover border border-[var(--color-border-color)] flex-shrink-0"
          />
        ) : (
          <div
            className={`w-9 h-9 rounded-full ${getAvatarColor(
              authorName
            )} text-white font-bold text-sm flex items-center justify-center flex-shrink-0 select-none`}
          >
            {initial}
          </div>
        )}

        {/* Comment Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-[var(--color-text-main)]">
              {authorName}
            </span>
            {user?.username === authorName && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-medium">
                You
              </span>
            )}
            <span className="text-xs text-[var(--color-text-muted)]">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>

          <p className="mt-2 text-sm text-[var(--color-text-main)] whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </p>

          {/* Action Bar */}
          <div className="mt-3 flex items-center gap-4 text-xs font-medium">
            <button
              onClick={handleUpvote}
              disabled={isUpvoting}
              className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                hasUpvoted ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-accent)]'
              }`}
            >
              <ThumbsUp
                className={`w-3.5 h-3.5 ${
                  hasUpvoted ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : ''
                }`}
              />
              <span>{comment.upvotes || 0}</span>
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  requireAuth();
                } else {
                  setIsReplying(!isReplying);
                }
              }}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
            >
              Reply
            </button>
          </div>

          {/* Reply Form Box */}
          {isReplying && (
            <form onSubmit={handleReplySubmit} className="mt-3 space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Replying to @${authorName}…`}
                rows={2}
                className="w-full p-2.5 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] focus:border-[var(--color-accent)] focus:outline-none text-[var(--color-text-main)]"
                autoFocus
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex items-center gap-2">
                <Button size="sm" type="submit" disabled={isSubmitting || !replyText.trim()}>
                  {isSubmitting ? 'Posting…' : 'Post Reply'}
                </Button>
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-3 py-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Render Nested Replies */}
          {Array.isArray(comment.replies) && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((childReply) => (
                <CommentItem
                  key={childReply._id}
                  comment={childReply}
                  gameId={gameId}
                  onRefresh={onRefresh}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ==========================================
// MAIN GAME DETAILS PAGE COMPONENT
// ==========================================
export default function GameDetailsPage() {
  const { id, slug } = useParams();
  const gameIdentifier = id || slug;

  const { isAuthenticated, requireAuth } = useAuth();

  // State
  const [game, setGame] = useState(null);
  const [relatedGames, setRelatedGames] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // UI Interactive States
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [selectedReqTier, setSelectedReqTier] = useState('minimum');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  // ==========================================
  // LIBRARY LOGIC
  // ==========================================
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && gameIdentifier) {
      usersApi.getLibrary().then(lib => {
        setIsInLibrary(lib.some(g => g._id === game?._id || g.rawgId === game?.rawgId));
      }).catch(err => console.error(err));
    }
  }, [isAuthenticated, gameIdentifier, game]);

  const handleLibraryToggle = () => {
    requireAuth(async () => {
      if (isLibraryLoading || !game?._id) return;
      setIsLibraryLoading(true);
      try {
        if (isInLibrary) {
          await usersApi.removeFromLibrary(game._id);
          setIsInLibrary(false);
        } else {
          await usersApi.addToLibrary(game._id);
          setIsInLibrary(true);
        }
      } catch (error) {
        console.error('Library toggle failed', error);
      } finally {
        setIsLibraryLoading(false);
      }
    });
  };

  // Scroll to top whenever gameIdentifier changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [gameIdentifier]);

  // Load comments
  const loadComments = useCallback(async () => {
    if (!gameIdentifier) return;
    try {
      const data = await commentsApi.list(gameIdentifier);
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setComments([]);
    }
  }, [gameIdentifier]);

  // Main fetch effect
  useEffect(() => {
    let isCancelled = false;

    async function loadGameData() {
      if (!gameIdentifier) return;
      try {
        const [gameData, relatedData] = await Promise.all([
          gamesApi.get(gameIdentifier),
          gamesApi.related(gameIdentifier).catch(() => []),
        ]);

        if (isCancelled) return;
        setGame(gameData);
        setRelatedGames(Array.isArray(relatedData) ? relatedData : []);
        setFetchError('');
      } catch (err) {
        if (isCancelled) return;
        setFetchError(err.message || 'Failed to load game details');
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadGameData();
    loadComments();

    return () => {
      isCancelled = true;
    };
  }, [gameIdentifier, loadComments]);

  // Derived properties
  const genres = useMemo(() => {
    if (!game) return [];
    const list = game.genres?.length ? game.genres : game.genre || [];
    return Array.isArray(list) ? list : [list];
  }, [game]);

  const platforms = useMemo(() => {
    if (!game) return [];
    const list = game.platforms?.length ? game.platforms : game.platform || [];
    return Array.isArray(list) ? list : [list];
  }, [game]);

  const screenshots = useMemo(() => {
    if (!game) return [];
    const raw = [...(game.screenshots || []), ...(game.images || [])];
    const cleaned = raw.map(url => typeof url === 'string' ? url.trim() : url).filter(Boolean);
    return [...new Set(cleaned)];
  }, [game]);

  const heroImage = useMemo(() => {
    if (!game) return '';
    const img = game.backgroundImage || game.coverImage || screenshots[0] || '';
    return typeof img === 'string' ? img.trim() : img;
  }, [game, screenshots]);

  const descriptionParagraphs = useMemo(() => {
    if (!game) return [];
    return parseDescriptionParagraphs(game.description);
  }, [game]);

  const shortDescription = useMemo(() => {
    if (!descriptionParagraphs.length) return '';
    return descriptionParagraphs[0];
  }, [descriptionParagraphs]);

  // System requirements evaluation
  const requirementsData = useMemo(() => {
    if (!game) return { minimum: {}, recommended: {}, hasRequirements: false };
    const rawReq = game.systemRequirements || {};
    const minObj = rawReq.minimum || {};
    const recObj = rawReq.recommended || {};

    const minParsed = {};
    const recParsed = {};
    let foundAny = false;

    REQUIREMENT_SPECS.forEach(({ key }) => {
      const minVal = extractRequirementSpec(minObj, key);
      const recVal = extractRequirementSpec(recObj, key);
      if (minVal) {
        minParsed[key] = minVal;
        foundAny = true;
      }
      if (recVal) {
        recParsed[key] = recVal;
        foundAny = true;
      }
    });

    return {
      minimum: minParsed,
      recommended: recParsed,
      hasRequirements: foundAny,
    };
  }, [game]);

  // Store & External Links
  const verifiedStoreLinks = useMemo(() => {
    if (!game) return [];
    const links = [];

    // RAWG storeLinks
    if (Array.isArray(game.storeLinks)) {
      game.storeLinks.forEach((item) => {
        if (item?.url && item.url.startsWith('http')) {
          links.push({
            name: item.name || 'Store',
            url: item.url,
          });
        }
      });
    }

    // Backend downloads array if present
    if (Array.isArray(game.downloads)) {
      game.downloads.forEach((item) => {
        if (item?.url && item.url.startsWith('http')) {
          links.push({
            name: item.platform ? `${item.platform} Store` : 'Official Download',
            url: item.url,
          });
        }
      });
    }

    // Deduplicate by URL
    const seen = new Set();
    return links.filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });
  }, [game]);

  // Handle Comment Submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    requireAuth(async () => {
      setIsSubmittingComment(true);
      setCommentError('');
      try {
        await commentsApi.create(gameIdentifier, {
          content: newComment.trim(),
        });
        setNewComment('');
        loadComments();
      } catch (err) {
        setCommentError(err.message || 'Failed to post comment');
      } finally {
        setIsSubmittingComment(false);
      }
    });
  };

  // ==========================================
  // LOADING SKELETON
  // ==========================================
  if (isLoading) {
    return (
      <div className="w-full min-h-screen pb-20 animate-pulse">
        {/* Hero Skeleton */}
        <div className="relative h-[55vh] min-h-[420px] bg-[var(--color-bg-secondary)] flex items-end">
          <div className="container mx-auto px-4 py-12">
            <div className="w-32 h-8 bg-[var(--color-bg-card)] rounded-full mb-6" />
            <div className="w-3/4 max-w-xl h-12 bg-[var(--color-bg-card)] rounded mb-4" />
            <div className="w-1/2 max-w-md h-6 bg-[var(--color-bg-card)] rounded mb-4" />
            <div className="flex gap-2">
              <div className="w-20 h-6 bg-[var(--color-bg-card)] rounded-full" />
              <div className="w-20 h-6 bg-[var(--color-bg-card)] rounded-full" />
              <div className="w-20 h-6 bg-[var(--color-bg-card)] rounded-full" />
            </div>
          </div>
        </div>

        {/* Content Skeleton Grid */}
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          <div className="space-y-10">
            <div className="h-40 bg-[var(--color-bg-card)] rounded-[var(--radius-card)]" />
            <div className="h-64 bg-[var(--color-bg-card)] rounded-[var(--radius-card)]" />
            <div className="h-48 bg-[var(--color-bg-card)] rounded-[var(--radius-card)]" />
          </div>
          <div>
            <div className="h-96 bg-[var(--color-bg-card)] rounded-[var(--radius-card)]" />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR STATE / GAME NOT FOUND
  // ==========================================
  if (fetchError || !game) {
    const isNotFound = fetchError?.toLowerCase().includes('not found');
    return (
      <div className="container mx-auto px-4 py-24 max-w-xl text-center">
        <div className="p-8 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-color)] shadow-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-accent)]">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text-main)] mb-2">
            {isNotFound ? 'Game Not Found' : 'Unable to Load Game'}
          </h1>
          <p className="text-[var(--color-text-muted)] mb-6 text-sm">
            {fetchError || 'The requested title could not be found in our database.'}
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/">
              <Button variant="primary" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Discovery
              </Button>
            </Link>
            {!isNotFound && (
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // NORMAL RENDER
  // ==========================================
  return (
    <div className="w-full pb-20">
      {/* ---------------------------------------------------- */}
      {/* 1. HERO / COVER SECTION */}
      {/* ---------------------------------------------------- */}
      <section className="relative w-full min-h-[500px] md:min-h-[580px] flex items-end overflow-hidden">
        {/* Background Image */}
        {heroImage ? (
          <img
            src={heroImage}
            alt={game.title}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-50 scale-105 transform motion-safe:transition-transform motion-safe:duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--color-bg-secondary)]" />
        )}

        {/* Dark Vignette & Gradient Overlays for High Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/80 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-primary)]/90 via-[var(--color-bg-primary)]/40 to-transparent" />

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto px-4 py-12 flex flex-col justify-end h-full">
          {/* Back Navigation Bar */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-md hover:bg-black/80 transition-all border border-white/10 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Discovery
            </Link>
          </div>

          <div className="max-w-4xl">
            {/* Genre / Category Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[var(--color-accent)] text-white shadow-sm"
                >
                  {genre}
                </span>
              ))}
              {game.metacritic && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Award className="w-3.5 h-3.5" /> Metacritic {game.metacritic}
                </span>
              )}
            </div>

            {/* Game Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md leading-tight mb-3">
              {game.title}
            </h1>

            {/* Short Tagline / Teaser */}
            {shortDescription && (
              <p className="text-gray-300 text-sm sm:text-base max-w-2xl line-clamp-2 mb-5 font-medium leading-relaxed">
                {shortDescription}
              </p>
            )}

            {/* Key Metric Highlights */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-200 mb-6">
              {game.rating != null && (
                <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-white">
                    {typeof game.rating === 'number' ? game.rating.toFixed(1) : game.rating}
                  </span>
                  <span className="text-xs text-gray-400">/ 5.0</span>
                </div>
              )}

              {game.releaseDate && (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Calendar className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>{formatDate(game.releaseDate)}</span>
                </div>
              )}

              {platforms.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Monitor className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>{platforms.slice(0, 3).join(', ')}{platforms.length > 3 ? ` +${platforms.length - 3}` : ''}</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={handleLibraryToggle}
                disabled={isLibraryLoading || !game?._id}
                className={isInLibrary ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-0 gap-2 shadow-lg shadow-emerald-500/20' : 'gap-2 shadow-lg shadow-[var(--color-accent)]/20'}
              >
                {isInLibrary ? (
                  <>
                    <HardDrive className="w-4 h-4" /> In Library
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-4 h-4" /> Add to Library
                  </>
                )}
              </Button>
              
              {verifiedStoreLinks.length > 0 ? (
                <a
                  href={verifiedStoreLinks[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button size="lg" variant="secondary" className="gap-2 shadow-lg">
                    <ExternalLink className="w-4 h-4" /> View on {verifiedStoreLinks[0].name}
                  </Button>
                </a>
              ) : null}

              <a href="#community-discussion">
                <Button variant="secondary" size="lg" className="gap-2">
                  <MessageSquare className="w-4 h-4" /> Community ({comments.length})
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* ---------------------------------------------------- */}
      {/* 2-COLUMN MAIN CONTENT & SIDEBAR */}
      {/* ---------------------------------------------------- */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-10">
        <main className="space-y-12">
          {/* -------------------------------------------------- */}
          {/* 4. ABOUT / DESCRIPTION */}
          {/* -------------------------------------------------- */}
          <section className="bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-5 flex items-center gap-3">
              <span className="w-2 h-6 bg-[var(--color-accent)] rounded-r-md block" />
              About the Game
            </h2>

            {descriptionParagraphs.length > 0 ? (
              <div className="space-y-4 text-[var(--color-text-muted)] text-base leading-relaxed">
                {(isDescriptionExpanded
                  ? descriptionParagraphs
                  : descriptionParagraphs.slice(0, 2)
                ).map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}

                {descriptionParagraphs.length > 2 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-accent)] hover:underline pt-2 cursor-pointer"
                  >
                    {isDescriptionExpanded ? (
                      <>
                        Show Less <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Read More <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-[var(--color-text-muted)] italic text-sm">
                No description is available for this title.
              </p>
            )}
          </section>

          {/* -------------------------------------------------- */}
          {/* 2. SCREENSHOTS / MEDIA GALLERY */}
          {/* -------------------------------------------------- */}
          <section className="bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-3">
                <span className="w-2 h-6 bg-[var(--color-accent)] rounded-r-md block" />
                Screenshots & Media
              </h2>
              {screenshots.length > 0 && (
                <span className="text-xs text-[var(--color-text-muted)] font-medium">
                  {screenshots.length} images
                </span>
              )}
            </div>

            {screenshots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {screenshots.map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    onClick={() => setLightboxIndex(index)}
                    className="group relative aspect-video overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-color)] bg-black/40 cursor-pointer hover:border-[var(--color-accent)] transition-all duration-300"
                  >
                    <img
                      src={imageUrl}
                      alt={`${game.title} screenshot ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-2 rounded-full bg-black/60 text-white backdrop-blur-sm">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] text-sm">
                Screenshots are unavailable for this game.
              </div>
            )}
          </section>

          {/* -------------------------------------------------- */}
          {/* 5. SYSTEM REQUIREMENTS */}
          {/* -------------------------------------------------- */}
          <section className="bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-6 flex items-center gap-3">
              <span className="w-2 h-6 bg-[var(--color-accent)] rounded-r-md block" />
              PC System Requirements
            </h2>

            {requirementsData.hasRequirements ? (
              <div>
                {/* Mobile / Tablet Tabs */}
                <div className="flex border-b border-[var(--color-border-color)] mb-6">
                  <button
                    onClick={() => setSelectedReqTier('minimum')}
                    className={`pb-3 px-4 text-sm font-bold capitalize transition-colors relative cursor-pointer ${
                      selectedReqTier === 'minimum'
                        ? 'text-[var(--color-accent)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                    }`}
                  >
                    Minimum
                    {selectedReqTier === 'minimum' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)]" />
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedReqTier('recommended')}
                    className={`pb-3 px-4 text-sm font-bold capitalize transition-colors relative cursor-pointer ${
                      selectedReqTier === 'recommended'
                        ? 'text-[var(--color-accent)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                    }`}
                  >
                    Recommended
                    {selectedReqTier === 'recommended' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)]" />
                    )}
                  </button>
                </div>

                {/* Requirements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['minimum', 'recommended'].map((tier) => {
                    const isSelected = selectedReqTier === tier;
                    const tierSpecs = requirementsData[tier] || {};
                    return (
                      <div
                        key={tier}
                        className={`p-5 rounded-[var(--radius-card)] border border-[var(--color-border-color)] bg-[var(--color-bg-secondary)]/50 ${
                          !isSelected ? 'hidden md:block' : 'block'
                        }`}
                      >
                        <h3 className="font-bold text-lg text-[var(--color-text-main)] capitalize mb-4 flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-[var(--color-accent)]" />
                          {tier} Requirements
                        </h3>

                        <div className="space-y-3">
                          {REQUIREMENT_SPECS.map((spec) => {
                            const { key, label, icon: SpecIcon } = spec;
                            const val = tierSpecs[key];
                            return (
                              <div
                                key={key}
                                className="border-b border-[var(--color-border-color)]/60 pb-2.5 last:border-b-0"
                              >
                                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5 mb-1">
                                  <SpecIcon className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                                  {label}
                                </div>
                                <div className="text-sm font-medium text-[var(--color-text-main)] break-words">
                                  {val || 'Not specified'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] flex flex-col items-center justify-center gap-2">
                <Monitor className="w-8 h-8 opacity-40" />
                <p className="text-sm">System requirements unavailable for this title.</p>
              </div>
            )}
          </section>

          {/* -------------------------------------------------- */}
          {/* 7. COMMUNITY DISCUSSION / COMMENTS */}
          {/* -------------------------------------------------- */}
          <section
            id="community-discussion"
            className="bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-6 sm:p-8 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-3">
                <span className="w-2 h-6 bg-[var(--color-accent)] rounded-r-md block" />
                Community Discussion
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border-color)]">
                {comments.length} Comments
              </span>
            </div>

            {/* Post Comment Input Box */}
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={
                    isAuthenticated
                      ? 'Share your thoughts, review, or tips about this game…'
                      : 'Sign in to join the conversation…'
                  }
                  onClick={() => {
                    if (!isAuthenticated) requireAuth();
                  }}
                  rows={3}
                  className="w-full p-4 rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] focus:border-[var(--color-accent)] focus:outline-none text-[var(--color-text-main)] text-sm transition-all"
                />
              </div>

              {commentError && (
                <p className="text-xs text-red-400 mt-2 font-medium">{commentError}</p>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)]">
                  {isAuthenticated
                    ? 'Comments are moderated and adhere to community guidelines.'
                    : 'Log in to post a comment or reply.'}
                </span>

                <Button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {isSubmittingComment ? 'Posting…' : 'Post Comment'}
                </Button>
              </div>
            </form>

            {/* Comment Thread List */}
            <div className="divide-y divide-[var(--color-border-color)]">
              {comments.length > 0 ? (
                comments.map((item) => (
                  <CommentItem
                    key={item._id}
                    comment={item}
                    gameId={gameIdentifier}
                    onRefresh={loadComments}
                  />
                ))
              ) : (
                <div className="py-12 text-center text-[var(--color-text-muted)]">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-sm">No comments yet</p>
                  <p className="text-xs mt-1">Be the first to share your thoughts on this game.</p>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* ---------------------------------------------------- */}
        {/* 3. GAME INFORMATION (SIDEBAR) */}
        {/* ---------------------------------------------------- */}
        <aside className="space-y-6">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Game Info Card */}
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-[var(--color-accent)]" />
                Game Specifications
              </h3>

              <div className="divide-y divide-[var(--color-border-color)]">
                {genres.length > 0 && (
                  <div className="py-3">
                    <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
                      Genre
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-text-main)]">
                      {genres.join(', ')}
                    </span>
                  </div>
                )}

                {game.developer && (
                  <div className="py-3">
                    <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
                      Developer
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-text-main)]">
                      {game.developer}
                    </span>
                  </div>
                )}

                {(game.publisher || game.releasedBy) && (
                  <div className="py-3">
                    <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
                      Publisher
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-text-main)]">
                      {game.publisher || game.releasedBy}
                    </span>
                  </div>
                )}

                {platforms.length > 0 && (
                  <div className="py-3">
                    <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
                      Platforms
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-text-main)]">
                      {platforms.join(', ')}
                    </span>
                  </div>
                )}

                {game.releaseDate && (
                  <div className="py-3">
                    <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
                      Release Date
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-text-main)]">
                      {formatDate(game.releaseDate)}
                    </span>
                  </div>
                )}

                {game.rating != null && (
                  <div className="py-3">
                    <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
                      Rating
                    </span>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-main)]">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{typeof game.rating === 'number' ? game.rating.toFixed(1) : game.rating} / 5.0</span>
                    </div>
                  </div>
                )}

                {game.metacritic != null && (
                  <div className="py-3">
                    <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
                      Metacritic Score
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-bold text-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {game.metacritic}
                      </span>
                    </div>
                  </div>
                )}

                {game.playtime != null && game.playtime > 0 && (
                  <div className="py-3">
                    <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
                      Average Playtime
                    </span>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-main)]">
                      <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                      <span>{game.playtime} hours</span>
                    </div>
                  </div>
                )}

                {game.gameSize && (
                  <div className="py-3">
                    <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
                      Install Size
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-text-main)]">
                      {game.gameSize}
                    </span>
                  </div>
                )}

                {game.rawgId && (
                  <div className="py-3">
                    <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
                      Data Source ID
                    </span>
                    <span className="text-xs font-mono text-[var(--color-text-muted)]">
                      RAWG #{game.rawgId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* -------------------------------------------------- */}
            {/* 6. VERIFIED STORE / DOWNLOAD LINKS */}
            {/* -------------------------------------------------- */}
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-3 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-[var(--color-accent)]" />
                Store & Download Links
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mb-4">
                Verified external store links directly from official distributions:
              </p>

              {verifiedStoreLinks.length > 0 ? (
                <div className="space-y-2.5">
                  {verifiedStoreLinks.map((store) => (
                    <a
                      key={store.url}
                      href={store.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full justify-between group-hover:border-[var(--color-accent)] text-xs"
                      >
                        <span className="font-semibold">{store.name}</span>
                        <span className="flex items-center gap-1 text-[var(--color-accent)] font-bold">
                          View on Store <ExternalLink className="w-3 h-3" />
                        </span>
                      </Button>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)] text-center text-xs text-[var(--color-text-muted)]">
                  No official store links available.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 8. RELATED GAMES SECTION */}
      {/* ---------------------------------------------------- */}
      {relatedGames.length > 0 && (
        <section className="container mx-auto px-4 pt-12 border-t border-[var(--color-border-color)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-main)] flex items-center gap-3">
                <span className="w-2 h-7 bg-[var(--color-accent)] rounded-r-md block" />
                Related Games You Might Like
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
                Games sharing genres, platforms, and themes with {game.title}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedGames.slice(0, 4).map((item) => (
              <GameCard key={item._id || item.rawgId || item.id} game={item} action="play" />
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------- */}
      {/* SCREENSHOT LIGHTBOX MODAL */}
      {/* ---------------------------------------------------- */}
      {lightboxIndex !== null && (
        <ScreenshotLightbox
          images={screenshots}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}
    </div>
  );
}
