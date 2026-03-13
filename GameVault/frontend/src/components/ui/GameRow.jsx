import React from 'react';
import GameCard from './GameCard';

const GameRow = ({ title, games, action = 'play' }) => {
  return (
    <section className="my-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-3">
          <span className="w-2 h-8 bg-[var(--color-accent)] rounded-r-md block"></span>
          {title}
        </h2>
        <button className="text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
          View All
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {games.map(game => (
          <GameCard key={game.id} game={game} action={action} />
        ))}
      </div>
    </section>
  );
};

export default GameRow;
