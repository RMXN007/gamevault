import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Download, Play } from 'lucide-react';
import Button from './Button';

const GameCard = ({ game, action = 'play' }) => {
  return (
    <div className="group relative bg-[var(--color-bg-card)] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-border-color)] hover:border-[var(--color-accent)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex flex-col h-full">
      <Link to={`/game/${game.id}`} className="block relative aspect-video overflow-hidden">
        <img 
          src={game.thumbnail} 
          alt={game.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 text-yellow-400 text-xs font-bold">
          <Star className="w-3 h-3 fill-current" />
          {game.rating}
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-[var(--color-text-muted)] mb-1 uppercase tracking-wider font-semibold">
          {game.genre}
        </div>
        <Link to={`/game/${game.id}`}>
          <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-1 group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
            {game.title}
          </h3>
        </Link>
        <div className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">
          {game.description}
        </div>
        
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--color-border-color)]">
          <div className="font-bold text-[var(--color-text-main)]">
            ${game.price}
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            className="w-auto gap-2"
          >
            {action === 'play' ? <Play className="w-4 h-4 fill-current" /> : <Download className="w-4 h-4" />}
            {action === 'play' ? 'Play' : 'Download'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
