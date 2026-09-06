import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import Button from '../components/ui/Button';
import GameRow from '../components/ui/GameRow';
import { gamesApi } from '../services/api';

const Home = () => {
  const [games, setGames] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { 
    gamesApi.home()
      .then((data) => setGames(data.results || []))
      .catch((err) => setError(err.message)); 
  }, []);
  const featuredGame = games[0];
  const genres = useMemo(() => [...new Set(games.flatMap((game) => game.genre || []))], [games]);
  const recentGames = games.slice(0, 5);
  const popularGames = games.slice(1, 6);

  if (error) return <div className="container mx-auto px-4 py-16 text-[var(--color-text-muted)]">Unable to load games: {error}</div>;
  if (!featuredGame) return <div className="container mx-auto px-4 py-16 text-[var(--color-text-muted)]">Loading GameVault discovery…</div>;
  const heroImage = featuredGame.coverImage || featuredGame.images?.[0];
  return (
    <div className="w-full">
      {/* Hero Banner Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center mb-16 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt={featuredGame.title} 
            className="w-full h-full object-cover object-top opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/70 to-transparent"></div>
        </div>

        <div className="container relative z-10 px-4 mx-auto">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-widest text-[#1a1a1a] bg-yellow-400 rounded-sm">
              Featured Title
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight text-white drop-shadow-md">
              {featuredGame.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl line-clamp-3 drop-shadow">
              {featuredGame.description}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="lg" className="gap-2">
                <Play className="w-5 h-5 fill-current" /> Play Now
              </Button>
              <Link to={`/games/${featuredGame.rawgId || featuredGame._id || featuredGame.slug}`}>
                <Button variant="secondary" size="lg">Details</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container px-4 mx-auto pb-16">
        {/* Categories Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-3 mb-6">
            <span className="w-2 h-8 bg-[var(--color-accent)] rounded-r-md block"></span>
            Browse Categories
          </h2>
          <div className="flex flex-wrap gap-3">
            {genres.map((cat) => (
              <button 
                key={cat} 
                className="px-4 py-2 rounded-full border border-[var(--color-border-color)] bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all font-medium whitespace-nowrap"
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Popular Games */}
        <GameRow title="Trending Games" games={popularGames} action="play" />
        
        {/* Most Played Games */}
        <GameRow title="Recently Added" games={recentGames} action="download" />
        {genres.slice(0, 3).map((genre) => <GameRow key={genre} title={`Popular ${genre} Games`} games={games.filter((game) => game.genre?.includes(genre)).slice(0, 5)} action="download" />)}
      </div>
    </div>
  );
};

export default Home;
