import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Gamepad2, Search, SlidersHorizontal, X, RefreshCw } from 'lucide-react';
import GameCard from '../components/ui/GameCard';
import { gamesApi } from '../services/api';
import Button from '../components/ui/Button';

const POPULAR_GENRES = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Shooter', 
  'Casual', 'Simulation', 'Puzzle', 'Arcade', 'Platformer', 
  'Racing', 'Sports', 'Fighting', 'Family'
];

const GENRE_SLUGS = {
  'Action': 'action',
  'Adventure': 'adventure',
  'RPG': 'role-playing-games-rpg',
  'Strategy': 'strategy',
  'Shooter': 'shooter',
  'Casual': 'casual',
  'Simulation': 'simulation',
  'Puzzle': 'puzzle',
  'Arcade': 'arcade',
  'Platformer': 'platformer',
  'Racing': 'racing',
  'Sports': 'sports',
  'Fighting': 'fighting',
  'Family': 'family'
};

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('rating'); // 'title' | 'rating' | 'newest'

  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchGames = useCallback(async (resetPage = false) => {
    const currentPage = resetPage ? 1 : page;
    if (resetPage) {
      setIsLoading(true);
      setPage(1);
    } else {
      setIsLoadingMore(true);
    }
    setErrorMessage('');
    
    try {
      let data;
      if (activeSearch) {
        data = await gamesApi.search(activeSearch, currentPage);
      } else if (selectedGenre) {
        const slug = GENRE_SLUGS[selectedGenre] || selectedGenre.toLowerCase();
        data = await gamesApi.genre(slug, currentPage);
      } else {
        data = await gamesApi.home(currentPage);
      }

      const newGames = data.results || [];
      if (resetPage) {
        setGames(newGames);
      } else {
        setGames(prev => {
          const existingIds = new Set(prev.map(g => g.rawgId || g._id));
          const uniqueNew = newGames.filter(g => !existingIds.has(g.rawgId || g._id));
          return [...prev, ...uniqueNew];
        });
      }
      setTotalCount(data.count || 0);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to load games.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [activeSearch, selectedGenre, page]);

  // Effect to refetch on search/genre change
  useEffect(() => {
    fetchGames(true);
  }, [activeSearch, selectedGenre]); // fetch when search or genre changes

  // Effect to fetch more on page change
  useEffect(() => {
    if (page > 1) {
      fetchGames(false);
    }
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSelectedGenre(''); // Clear genre when searching
    setActiveSearch(searchQuery.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
  };

  const handleGenreClick = (g) => {
    setSearchQuery('');
    setActiveSearch('');
    setSelectedGenre(g === selectedGenre ? '' : g); // Toggle
  };

  // Local Sort
  const visibleGames = useMemo(() => {
    return [...games].sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
      }
      return (a.title || '').localeCompare(b.title || '');
    });
  }, [games, sortBy]);

  const hasMore = games.length < totalCount;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* PAGE HEADER */}
      <header className="relative overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-2">
            <Gamepad2 className="w-4 h-4" />
            <span>Game Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-main)] tracking-tight">
            Discover Games
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] mt-2 leading-relaxed">
            Explore a massive catalog powered by RAWG. Search, filter by genre, and discover your next favorite title.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6 relative max-w-xl flex">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games by name…"
              className="flex-1 pl-10 pr-10 py-2.5 text-sm rounded-l-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-[100px] top-2.5 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <Button type="submit" className="rounded-l-none border-l-0 w-24 justify-center">
              Search
            </Button>
          </form>
        </div>
      </header>

      {/* CONTROLS: GENRE FILTER + SORT */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Genre Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-1 min-w-0 w-full">
          <button
            onClick={() => handleGenreClick('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex-shrink-0 ${
              !selectedGenre && !activeSearch
                ? 'bg-[var(--color-accent)] text-white border border-[var(--color-accent)]'
                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border border-[var(--color-border-color)]'
            }`}
          >
            Trending
          </button>
          {POPULAR_GENRES.map((g) => (
            <button
              key={g}
              onClick={() => handleGenreClick(g)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex-shrink-0 ${
                selectedGenre === g
                  ? 'bg-[var(--color-accent)] text-white border border-[var(--color-accent)]'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border border-[var(--color-border-color)]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-[var(--color-text-muted)]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] text-xs font-bold rounded-[var(--radius-button)] px-3 py-1.5 border border-[var(--color-border-color)] outline-none cursor-pointer focus:border-[var(--color-accent)] transition-colors"
          >
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
            <option value="title">Alphabetical</option>
          </select>
          {totalCount > 0 && (
            <span className="text-xs text-[var(--color-text-muted)] font-medium ml-1">
              ~{totalCount.toLocaleString()} found
            </span>
          )}
        </div>
      </div>

      {/* ERROR */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-between text-red-400 text-xs font-medium">
          <span>{errorMessage}</span>
          <button
            onClick={() => fetchGames(true)}
            className="flex items-center gap-1 text-red-300 hover:underline font-bold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* GAMES GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="h-80 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-color)]"
            />
          ))}
        </div>
      ) : visibleGames.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleGames.map((game) => (
              <GameCard key={game._id || game.rawgId || game.id} game={game} action="play" />
            ))}
          </div>
          
          {hasMore && (
            <div className="flex justify-center pt-4 pb-8">
              <Button 
                onClick={() => setPage(p => p + 1)} 
                disabled={isLoadingMore}
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto min-w-[200px] justify-center"
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-color)] p-8">
          <Gamepad2 className="w-12 h-12 mx-auto text-[var(--color-text-muted)] opacity-30 mb-3" />
          <h2 className="text-xl font-bold text-[var(--color-text-main)]">No Games Found</h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1.5 max-w-sm mx-auto">
            {activeSearch || selectedGenre
              ? 'No titles match the current filters from RAWG. Try adjusting your search or genre selection.'
              : 'The catalog is empty. Check back later!'}
          </p>
          {(activeSearch || selectedGenre) && (
            <button
              onClick={() => {
                handleClearSearch();
                setSelectedGenre('');
              }}
              className="mt-4 text-sm font-bold text-[var(--color-accent)] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
