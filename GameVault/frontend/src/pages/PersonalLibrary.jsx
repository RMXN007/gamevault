import React, { useEffect, useState, useMemo } from 'react';
import { Library as LibraryIcon, Search, Gamepad2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import GameCard from '../components/ui/GameCard';
import { usersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function PersonalLibrary() {
  const { user, isAuthenticated, ready, openAuth } = useAuth();
  const [games, setGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let isMounted = true;
    usersApi
      .getLibrary()
      .then((data) => {
        if (!isMounted) return;
        setGames(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setErrorMessage(err.message || 'Unable to load library games.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const genres = useMemo(() => {
    return [...new Set(games.flatMap((g) => g.genre || g.genres || []))];
  }, [games]);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        game.title?.toLowerCase().includes(query) ||
        game.description?.toLowerCase().includes(query);

      const gameGenres = game.genre || game.genres || [];
      const matchesGenre = !selectedGenre || gameGenres.includes(selectedGenre);

      return matchesQuery && matchesGenre;
    });
  }, [games, searchQuery, selectedGenre]);

  // --------------------------------------------------
  // RESTORING SESSION SKELETON
  // --------------------------------------------------
  if (!ready) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-[var(--color-text-muted)] animate-pulse">
        Restoring your session…
      </div>
    );
  }

  // --------------------------------------------------
  // LOGGED-OUT STATE
  // --------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <div className="p-8 sm:p-12 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-color)] shadow-xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-accent)]">
            <LibraryIcon className="w-8 h-8" />
          </div>
          <span className="text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest">
            Personal Collection
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-main)] mt-1 tracking-tight">
            Your Library is Waiting
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-md mx-auto leading-relaxed">
            Sign in to access your saved games, download installers, and track your personalized GameVault catalog.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button onClick={() => openAuth('login')} size="lg" className="gap-2 font-bold">
              Sign In
            </Button>
            <Button
              variant="secondary"
              onClick={() => openAuth('register')}
              size="lg"
              className="gap-2 font-bold"
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // LOGGED-IN STATE
  // --------------------------------------------------
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border-color)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-1">
            <LibraryIcon className="w-4 h-4" />
            <span>Authenticated Library</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-text-main)] tracking-tight">
            {user?.username ? `${user.username}'s Library` : 'My Library'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
            Browse and launch titles available in your GameVault collection.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search library titles…"
            className="w-full pl-10 pr-4 py-2 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* GENRE FILTER CHIPS */}
      {genres.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedGenre('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              !selectedGenre
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border border-[var(--color-border-color)]'
            }`}
          >
            All Genres
          </button>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedGenre === g
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border border-[var(--color-border-color)]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* ERROR NOTICE */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* GAMES GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-80 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-color)]"
            />
          ))}
        </div>
      ) : filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <GameCard key={game._id || game.rawgId || game.id} game={game} action="play" />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-color)] p-8">
          <Gamepad2 className="w-12 h-12 mx-auto text-[var(--color-text-muted)] opacity-30 mb-3" />
          <h2 className="text-xl font-bold text-[var(--color-text-main)]">
            No Games Found
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1.5 max-w-sm mx-auto">
            {searchQuery || selectedGenre
              ? 'No titles in your library match the current filters. Try resetting your search.'
              : 'Discover and play titles from the GameVault collection.'}
          </p>
          <div className="mt-6">
            <Link to="/">
              <Button className="gap-2">
                Discover Games <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
