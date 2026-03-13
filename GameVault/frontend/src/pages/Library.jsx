import React from 'react';
import GameCard from '../components/ui/GameCard';
import { mockGames, mockUser } from '../data/mock';

const Library = () => {
  const downloadedGames = mockGames.filter(g => !mockUser.recentlyPlayed.includes(g.id));
  const recentlyPlayed = mockGames.filter(g => mockUser.recentlyPlayed.includes(g.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-text-main)]">My Library</h1>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search library..." 
            className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] px-4 py-2 rounded-[var(--radius-button)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      </div>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-6 flex items-center gap-3">
          <span className="w-2 h-6 bg-[var(--color-accent)] rounded-r-md block"></span>
          Recently Played
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recentlyPlayed.map(g => (
            <GameCard key={g.id} game={g} action="play" />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-6 flex items-center gap-3">
          <span className="w-2 h-6 bg-[var(--color-accent)] rounded-r-md block"></span>
          All Games
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {downloadedGames.map(g => (
            <GameCard key={g.id} game={g} action="play" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Library;
