import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import Button from '../components/ui/Button';
import GameRow from '../components/ui/GameRow';
import { categories, mockGames } from '../data/mock';

const Home = () => {
  const featuredGame = mockGames[0];
  const popularGames = mockGames.slice(1, 5);
  const mostPlayedGames = [...mockGames].reverse().slice(0, 4);

  return (
    <div className="w-full">
      {/* Hero Banner Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center mb-16 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={featuredGame.banner} 
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
              <Link to={`/game/${featuredGame.id}`}>
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
            {categories.map((cat) => (
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
        <GameRow title="Popular Right Now" games={popularGames} action="play" />
        
        {/* Most Played Games */}
        <GameRow title="Most Played This Week" games={mostPlayedGames} action="download" />
      </div>
    </div>
  );
};

export default Home;
