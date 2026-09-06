import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowBigUp,
  Award,
  ChevronRight,
  Clock,
  Eye,
  Flame,
  MessageSquare,
  PenSquare,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
  User as UserIcon,
  X
} from 'lucide-react';
import Button from '../components/ui/Button';
import { forumApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Helper for relative timestamps
const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHour > 0) return `${diffHour}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return 'just now';
};

// Avatar colors
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

export default function CommunityView() {
  const { user, isAuthenticated, requireAuth } = useAuth();

  // Data states
  const [categories, setCategories] = useState([]);
  const [threads, setThreads] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('hot'); // 'hot' | 'new' | 'top'
  const [searchQuery, setSearchQuery] = useState('');

  // UI / Interactive States
  const [activeThread, setActiveThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const replyInputRef = React.useRef(null);

  // Compose Thread Modal
  const [isComposing, setIsComposing] = useState(false);
  const [draft, setDraft] = useState({ title: '', content: '', category: '', tags: '' });
  const [isSubmittingThread, setIsSubmittingThread] = useState(false);
  const [threadFormError, setThreadFormError] = useState('');

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load Categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await forumApi.categories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  // Load Threads
  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const data = await forumApi.threads(params);
      setThreads(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to load discussions.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Filter and Sort Threads
  const visibleThreads = useMemo(() => {
    return threads
      .filter((thread) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        const titleMatch = (thread.title || '').toLowerCase().includes(query);
        const contentMatch = (thread.content || '').toLowerCase().includes(query);
        const tagMatch = (thread.tags || []).some((t) => t.toLowerCase().includes(query));
        const authorMatch = (thread.author?.username || '').toLowerCase().includes(query);
        return titleMatch || contentMatch || tagMatch || authorMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'new') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === 'top') {
          return (b.upvotes || 0) - (a.upvotes || 0);
        }
        // 'hot' algorithm: upvotes * 2 + views
        const scoreA = (a.upvotes || 0) * 2 + (a.views || 0);
        const scoreB = (b.upvotes || 0) * 2 + (b.views || 0);
        return scoreB - scoreA;
      });
  }, [threads, searchQuery, sortBy]);

  // Open Thread Detail
  const handleOpenThread = async (thread) => {
    setActiveThread(thread);
    setIsLoadingReplies(true);
    setReplies([]);
    setReplyError('');
    setReplyText('');
    try {
      const [threadDetails, replyData] = await Promise.all([
        forumApi.thread(thread._id).catch(() => thread),
        forumApi.replies(thread._id).catch(() => []),
      ]);
      setActiveThread(threadDetails);
      setReplies(Array.isArray(replyData) ? replyData : []);
    } catch (err) {
      console.error('Failed to open thread:', err);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  // Upvote Thread
  const handleUpvoteThread = (e, threadId) => {
    e.stopPropagation();
    requireAuth(async () => {
      try {
        const updated = await forumApi.upvoteThread(threadId);
        setThreads((prev) =>
          prev.map((t) => (t._id === threadId ? { ...t, upvotes: updated.upvotes } : t))
        );
        if (activeThread?._id === threadId) {
          setActiveThread((prev) => ({ ...prev, upvotes: updated.upvotes }));
        }
      } catch (err) {
        console.error('Failed to upvote thread:', err);
      }
    });
  };

  // Upvote Reply
  const handleUpvoteReply = (replyId) => {
    requireAuth(async () => {
      try {
        const updated = await forumApi.upvoteReply(replyId);
        setReplies((prev) =>
          prev.map((r) => (r._id === replyId ? { ...r, upvotes: updated.upvotes } : r))
        );
      } catch (err) {
        console.error('Failed to upvote reply:', err);
      }
    });
  };

  // Post Reply
  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    requireAuth(async () => {
      setIsPostingReply(true);
      setReplyError('');
      try {
        await forumApi.createReply({
          thread: activeThread._id,
          content: replyText.trim(),
        });
        setReplyText('');
        // Refresh replies
        const updatedReplies = await forumApi.replies(activeThread._id);
        setReplies(Array.isArray(updatedReplies) ? updatedReplies : []);
      } catch (err) {
        setReplyError(err.message || 'Failed to post reply.');
      } finally {
        setIsPostingReply(false);
      }
    });
  };

  // Create New Thread
  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.content.trim() || !draft.category) {
      setThreadFormError('Please fill in all required fields.');
      return;
    }

    requireAuth(async () => {
      setIsSubmittingThread(true);
      setThreadFormError('');
      try {
        const formattedTags = draft.tags
          ? draft.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [];

        await forumApi.createThread({
          title: draft.title.trim(),
          content: draft.content.trim(),
          category: draft.category,
          tags: formattedTags,
        });

        setIsComposing(false);
        setDraft({ title: '', content: '', category: '', tags: '' });
        fetchThreads();
      } catch (err) {
        setThreadFormError(err.message || 'Failed to create discussion.');
      } finally {
        setIsSubmittingThread(false);
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ---------------------------------------------------- */}
      {/* HEADER & SEARCH BANNER */}
      {/* ---------------------------------------------------- */}
      <header className="relative overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-6 sm:p-8 mb-8 shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-2">
            <MessageSquare className="w-4 h-4" />
            <span>GameVault Community Forum</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-main)] tracking-tight">
            Gaming Discussions & Guides
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] mt-2 leading-relaxed">
            Join discussions, share gameplay strategies, troubleshoot issues, and discover recommendations with fellow gamers.
          </p>

          {/* Search Box */}
          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, topics, tags, or members…"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* MAIN 2-COLUMN LAYOUT: CATEGORIES & THREAD FEED */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
        {/* SIDEBAR: CATEGORIES */}
        <aside className="bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-5 shadow-sm space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Categories
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="text-xs text-[var(--color-accent)] font-semibold hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setSelectedCategory('')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-[var(--radius-card)] font-medium transition-colors cursor-pointer ${
                !selectedCategory
                  ? 'bg-[var(--color-accent)] text-white shadow-sm'
                  : 'text-[var(--color-text-main)] hover:bg-[var(--color-bg-secondary)]'
              }`}
            >
              <span>All Discussions</span>
              <span className="text-xs opacity-75">{threads.length}</span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat._id;
              return (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat._id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-[var(--radius-card)] font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--color-accent)] text-white shadow-sm'
                      : 'text-[var(--color-text-main)] hover:bg-[var(--color-bg-secondary)]'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Action Prompt */}
          <div className="pt-4 border-t border-[var(--color-border-color)]">
            <Button
              variant="primary"
              className="w-full gap-2 justify-center shadow-sm"
              onClick={() => (isAuthenticated ? setIsComposing(true) : requireAuth())}
            >
              <PenSquare className="w-4 h-4" /> Start Discussion
            </Button>
          </div>
        </aside>

        {/* FEED SECTION */}
        <section className="space-y-4">
          {/* SORT CONTROLS & NEW THREAD ACTION */}
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-1.5 bg-[var(--color-bg-secondary)] p-1 rounded-lg">
              <button
                onClick={() => setSortBy('hot')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  sortBy === 'hot'
                    ? 'bg-[var(--color-bg-card)] text-[var(--color-accent)] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                }`}
              >
                <Flame className="w-3.5 h-3.5" /> Hot
              </button>
              <button
                onClick={() => setSortBy('new')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  sortBy === 'new'
                    ? 'bg-[var(--color-bg-card)] text-[var(--color-accent)] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> New
              </button>
              <button
                onClick={() => setSortBy('top')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  sortBy === 'top'
                    ? 'bg-[var(--color-bg-card)] text-[var(--color-accent)] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" /> Top
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-muted)] font-medium">
                {visibleThreads.length} {visibleThreads.length === 1 ? 'post' : 'posts'}
              </span>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => (isAuthenticated ? setIsComposing(true) : requireAuth())}
              >
                <Plus className="w-4 h-4" /> New Thread
              </Button>
            </div>
          </div>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-between text-red-400 text-xs font-medium">
              <span>{errorMessage}</span>
              <button
                onClick={fetchThreads}
                className="flex items-center gap-1 text-red-300 hover:underline font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          )}

          {/* THREAD LIST */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="p-5 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-color)] animate-pulse flex gap-4"
                >
                  <div className="w-10 h-14 bg-[var(--color-bg-secondary)] rounded-md" />
                  <div className="flex-1 space-y-3">
                    <div className="w-1/3 h-4 bg-[var(--color-bg-secondary)] rounded" />
                    <div className="w-3/4 h-6 bg-[var(--color-bg-secondary)] rounded" />
                    <div className="w-full h-4 bg-[var(--color-bg-secondary)] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleThreads.length > 0 ? (
            <div className="space-y-3">
              {visibleThreads.map((thread) => {
                const authorName = thread.author?.username || 'Member';
                const initial = (authorName[0] || 'M').toUpperCase();
                const categoryName = thread.category?.name || 'General';

                return (
                  <article
                    key={thread._id}
                    onClick={() => handleOpenThread(thread)}
                    className="group bg-[var(--color-bg-card)] border border-[var(--color-border-color)] hover:border-[var(--color-accent)] rounded-[var(--radius-card)] p-4 sm:p-5 flex gap-3 sm:gap-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    {/* Upvote Pill */}
                    <div
                      className="flex flex-col items-center justify-start py-1 px-2 rounded-lg bg-[var(--color-bg-secondary)] h-fit"
                      onClick={(e) => handleUpvoteThread(e, thread._id)}
                    >
                      <button
                        aria-label="Upvote thread"
                        className={`transition-transform cursor-pointer hover:scale-110 ${
                          user && thread.upvotedBy?.includes(user._id)
                            ? 'text-[var(--color-accent)]'
                            : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)]'
                        }`}
                      >
                        <ArrowBigUp
                          className={`w-6 h-6 ${
                            user && thread.upvotedBy?.includes(user._id)
                              ? 'text-[var(--color-accent)] fill-[var(--color-accent)]'
                              : ''
                          }`}
                        />
                      </button>
                      <span className="text-xs font-bold text-[var(--color-text-main)] mt-0.5">
                        {thread.upvotes || 0}
                      </span>
                    </div>

                    {/* Thread Details */}
                    <div className="flex-1 min-w-0">
                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1.5">
                        <span className="px-2 py-0.5 rounded-full font-bold bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] border border-[var(--color-border-color)]">
                          {categoryName}
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1 font-medium">
                          <div
                            className={`w-4 h-4 rounded-full ${getAvatarColor(
                              authorName
                            )} text-white flex items-center justify-center text-[9px] font-bold`}
                          >
                            {initial}
                          </div>
                          <span>{authorName}</span>
                        </div>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(thread.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
                        {thread.title}
                      </h2>

                      {/* Snippet */}
                      <p className="mt-1.5 text-xs sm:text-sm text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                        {thread.content}
                      </p>

                      {/* Tags */}
                      {Array.isArray(thread.tags) && thread.tags.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {thread.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] font-medium"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="mt-3.5 flex items-center gap-4 text-xs font-semibold text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border-color)]/50">
                        <span className="flex items-center gap-1.5 hover:text-[var(--color-accent)] transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" />
                          View Discussion
                        </span>
                        {thread.views > 0 && (
                          <span className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                            <Eye className="w-3.5 h-3.5" />
                            {thread.views} views
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-color)]">
              <MessageSquare className="w-12 h-12 mx-auto text-[var(--color-text-muted)] opacity-30 mb-3" />
              <h3 className="text-lg font-bold text-[var(--color-text-main)]">
                No Discussions Found
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'No posts matched your search criteria. Try a different search term.'
                  : 'There are no active discussions in this category yet. Be the first to start one!'}
              </p>
              <Button
                className="mt-5 gap-2"
                onClick={() => (isAuthenticated ? setIsComposing(true) : requireAuth())}
              >
                <Plus className="w-4 h-4" /> Start Discussion
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* ---------------------------------------------------- */}
      {/* THREAD DETAIL & REPLIES MODAL */}
      {/* ---------------------------------------------------- */}
      {activeThread && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex justify-center items-start"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveThread(null)}
        >
          <article
            className="relative w-full max-w-3xl my-8 bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-color)]">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] border border-[var(--color-border-color)]">
                  {activeThread.category?.name || 'General'}
                </span>
                <span>•</span>
                <span>Posted by {activeThread.author?.username || 'Member'}</span>
                <span>•</span>
                <span>{formatRelativeTime(activeThread.createdAt)}</span>
              </div>
              <button
                onClick={() => setActiveThread(null)}
                className="p-1.5 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer"
                aria-label="Close thread"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thread Main Content */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-main)] leading-tight">
                {activeThread.title}
              </h2>

              <p className="text-sm sm:text-base text-[var(--color-text-main)] whitespace-pre-wrap leading-relaxed">
                {activeThread.content}
              </p>

              {/* Tags */}
              {Array.isArray(activeThread.tags) && activeThread.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {activeThread.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] font-medium"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Thread Action Bar */}
              <div className="flex items-center gap-4 pt-4 border-t border-[var(--color-border-color)]">
                <button
                  onClick={(e) => handleUpvoteThread(e, activeThread._id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] text-xs font-bold transition-colors cursor-pointer ${
                    user && activeThread.upvotedBy?.includes(user._id)
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-text-main)] hover:text-[var(--color-accent)]'
                  }`}
                >
                  <ArrowBigUp
                    className={`w-4 h-4 ${
                      user && activeThread.upvotedBy?.includes(user._id)
                        ? 'text-[var(--color-accent)] fill-[var(--color-accent)]'
                        : ''
                    }`}
                  />
                  <span>{activeThread.upvotes || 0} Upvotes</span>
                </button>

                <button
                  onClick={() => (isAuthenticated ? replyInputRef.current?.focus() : requireAuth())}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] text-xs font-bold text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              </div>
            </div>

            {/* -------------------------------------------------- */}
            {/* REPLIES SECTION */}
            {/* -------------------------------------------------- */}
            <div className="pt-6 border-t border-[var(--color-border-color)] space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--color-text-main)] flex items-center gap-2">
                  <span>Replies</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]">
                    {replies.length}
                  </span>
                </h3>
              </div>

              {/* Reply Form */}
              <form onSubmit={handlePostReply} className="space-y-3">
                <textarea
                  ref={replyInputRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    isAuthenticated
                      ? 'Write a helpful reply or comment…'
                      : 'Sign in to join the conversation and reply…'
                  }
                  onClick={() => {
                    if (!isAuthenticated) requireAuth();
                  }}
                  rows={3}
                  className="w-full p-3.5 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] focus:border-[var(--color-accent)] focus:outline-none text-[var(--color-text-main)]"
                />

                {replyError && (
                  <p className="text-xs text-red-400 font-medium">{replyError}</p>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPostingReply || !replyText.trim()}
                    className="gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {isPostingReply ? 'Posting…' : 'Post Reply'}
                  </Button>
                </div>
              </form>

              {/* Reply List */}
              {isLoadingReplies ? (
                <div className="py-8 text-center text-xs text-[var(--color-text-muted)] animate-pulse">
                  Loading discussion replies…
                </div>
              ) : replies.length > 0 ? (
                <div className="divide-y divide-[var(--color-border-color)]">
                  {replies.map((replyItem) => {
                    const replyAuthor = replyItem.author?.username || 'Member';
                    const initial = (replyAuthor[0] || 'M').toUpperCase();
                    const hasUpvotedReply = user && replyItem.upvotedBy?.includes(user._id);

                    return (
                      <div key={replyItem._id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full ${getAvatarColor(
                                replyAuthor
                              )} text-white flex items-center justify-center text-[10px] font-bold`}
                            >
                              {initial}
                            </div>
                            <span className="font-semibold text-[var(--color-text-main)]">
                              {replyAuthor}
                            </span>
                            {user?.username === replyAuthor && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[var(--color-text-muted)]">
                            {formatRelativeTime(replyItem.createdAt)}
                          </span>
                        </div>

                        <p className="text-sm text-[var(--color-text-main)] whitespace-pre-wrap leading-relaxed pl-8">
                          {replyItem.content}
                        </p>

                        <div className="pl-8 pt-1 flex items-center gap-3 text-xs">
                          <button
                            onClick={() => handleUpvoteReply(replyItem._id)}
                            className={`inline-flex items-center gap-1 transition-colors cursor-pointer ${
                              hasUpvotedReply
                                ? 'text-[var(--color-accent)]'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-accent)]'
                            }`}
                          >
                            <ArrowBigUp
                              className={`w-4 h-4 ${
                                hasUpvotedReply
                                  ? 'text-[var(--color-accent)] fill-[var(--color-accent)]'
                                  : ''
                              }`}
                            />
                            <span>{replyItem.upvotes || 0}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-[var(--color-text-muted)]">
                  No replies yet. Be the first to reply!
                </div>
              )}
            </div>
          </article>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* COMPOSE THREAD MODAL */}
      {/* ---------------------------------------------------- */}
      {isComposing && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsComposing(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-6 sm:p-8 shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-color)] mb-6">
              <div>
                <span className="text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest">
                  Create Post
                </span>
                <h2 className="text-2xl font-extrabold text-[var(--color-text-main)] mt-0.5">
                  Start a Community Discussion
                </h2>
              </div>
              <button
                onClick={() => setIsComposing(false)}
                className="p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {threadFormError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                {threadFormError}
              </div>
            )}

            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  required
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent)] cursor-pointer"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                  Title *
                </label>
                <input
                  required
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="What is your topic or question?"
                  className="w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                  Content *
                </label>
                <textarea
                  required
                  rows={6}
                  value={draft.content}
                  onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                  placeholder="Share details, thoughts, questions, or guides…"
                  className="w-full p-3.5 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent)] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                  Tags (optional, comma-separated)
                </label>
                <input
                  type="text"
                  value={draft.tags}
                  onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
                  placeholder="e.g. gameplay, guide, fps, update"
                  className="w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div className="pt-4 border-t border-[var(--color-border-color)] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsComposing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingThread}
                  className="gap-2 font-bold"
                >
                  <PenSquare className="w-4 h-4" />
                  {isSubmittingThread ? 'Publishing…' : 'Publish Discussion'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
