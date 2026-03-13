import React from 'react';
import { Settings, Award, Clock, Library as LibraryIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import GameCard from '../components/ui/GameCard';
import Button from '../components/ui/Button';
import { mockUser, mockGames } from '../data/mock';

const Profile = () => {
  const favoriteGames = mockGames.filter(g => mockUser.favorites.includes(g.id));

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Profile Header */}
      <div className="bg-[var(--color-bg-card)] rounded-[var(--radius-card)] p-8 border border-[var(--color-border-color)] mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        {/* Decorative background element based on theme */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-accent)] opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <img 
            src={mockUser.avatar} 
            alt={mockUser.username} 
            className="w-32 h-32 rounded-full border-4 border-[var(--color-accent)] object-cover shadow-lg" 
          />
          <div className="absolute -bottom-2 -right-2 bg-[var(--color-accent)] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-[var(--color-bg-card)]">
            {mockUser.level}
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-4xl font-bold text-[var(--color-text-main)] mb-2">{mockUser.username}</h1>
          <p className="text-[var(--color-text-muted)] font-medium mb-4">Member since {mockUser.joinDate}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <Link to="/settings">
              <Button variant="secondary" size="sm" className="gap-2">
                <Settings className="w-4 h-4" /> Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[var(--color-bg-card)] rounded-[var(--radius-card)] p-6 border border-[var(--color-border-color)] flex items-center gap-4 hover:border-[var(--color-accent)] transition-colors">
          <div className="p-3 bg-[var(--color-bg-secondary)] rounded-full text-[var(--color-accent)]">
            <LibraryIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-bold text-[var(--color-text-main)]">{mockUser.stats.gamesOwned}</div>
            <div className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Games Owned</div>
          </div>
        </div>
        
        <div className="bg-[var(--color-bg-card)] rounded-[var(--radius-card)] p-6 border border-[var(--color-border-color)] flex items-center gap-4 hover:border-[var(--color-accent)] transition-colors">
          <div className="p-3 bg-[var(--color-bg-secondary)] rounded-full text-green-500">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-bold text-[var(--color-text-main)]">{mockUser.stats.hoursPlayed}</div>
            <div className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Hours Played</div>
          </div>
        </div>
        
        <div className="bg-[var(--color-bg-card)] rounded-[var(--radius-card)] p-6 border border-[var(--color-border-color)] flex items-center gap-4 hover:border-[var(--color-accent)] transition-colors">
          <div className="p-3 bg-[var(--color-bg-secondary)] rounded-full text-yellow-500">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-bold text-[var(--color-text-main)]">{mockUser.stats.achievements}</div>
            <div className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Achievements</div>
          </div>
        </div>
      </div>

      {/* Favorite Games */}
      <section>
        <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-6 flex items-center gap-3">
          <span className="w-2 h-6 bg-[var(--color-accent)] rounded-r-md block"></span>
          Favorite Games
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteGames.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Profile;
