import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Download, Play, Trophy, Users, Globe } from 'lucide-react';
import Button from '../components/ui/Button';
import { mockGames } from '../data/mock';

const GameDetails = () => {
  const { id } = useParams();
  const game = mockGames.find(g => g.id === id) || mockGames[0]; // fallback useful for demo

  return (
    <div className="w-full pb-16">
      {/* Banner */}
      <div className="relative h-[50vh] w-full">
        <img 
          src={game.banner} 
          alt={game.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent"></div>
        <div className="absolute top-4 left-4 z-10">
          <Link to="/" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar / Thumbnail */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="bg-[var(--color-bg-card)] rounded-[var(--radius-card)] p-4 border border-[var(--color-border-color)] shadow-xl sticky top-24">
              <img 
                src={game.thumbnail} 
                alt={game.title} 
                className="w-full aspect-[3/4] object-cover rounded-md mb-4"
              />
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="text-xl font-bold text-[var(--color-text-main)]">${game.price}</div>
                  <div className="flex items-center gap-1 text-sm text-yellow-500 font-bold mt-1">
                    <Star className="w-4 h-4 fill-current" /> {game.rating} / 5.0
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Developer</div>
                  <div className="text-sm font-semibold text-[var(--color-accent)]">{game.developer}</div>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full py-3 gap-2 text-lg">
                  <Play className="w-5 h-5 fill-current" /> Play Now
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Download className="w-4 h-4" /> Download
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--color-border-color)]">
                <h4 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Features</h4>
                <ul className="space-y-2">
                  {game.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[var(--color-text-main)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"></div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-2/3 lg:w-3/4 pt-8 md:pt-32">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text-main)] mb-2">
              {game.title}
            </h1>
            <div className="flex items-center gap-3 mb-8">
              <span className="px-3 py-1 bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] rounded-full text-sm font-medium border border-[var(--color-border-color)]">
                {game.genre}
              </span>
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-4 flex items-center gap-3">
                <span className="w-2 h-6 bg-[var(--color-accent)] rounded-r-md block"></span>
                About this game
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
                {game.description}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-4 flex items-center gap-3">
                <span className="w-2 h-6 bg-[var(--color-accent)] rounded-r-md block"></span>
                Screenshots
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {game.screenshots.map((shot, idx) => (
                  <img 
                    key={idx}
                    src={shot} 
                    alt={`Screenshot ${idx + 1}`} 
                    className="w-full aspect-video object-cover rounded-[var(--radius-card)] border border-[var(--color-border-color)] hover:border-[var(--color-accent)] transition-colors cursor-pointer"
                  />
                ))}
              </div>
            </section>

            {/* Leaderboards */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-6 flex items-center gap-3">
                <span className="w-2 h-6 bg-[var(--color-accent)] rounded-r-md block"></span>
                Global Leaderboard
              </h2>
              <div className="bg-[var(--color-bg-card)] rounded-[var(--radius-card)] border border-[var(--color-border-color)] overflow-hidden">
                {[
                  { rank: 1, name: 'CyberDemon', score: '99,402', icon: Trophy, color: 'text-yellow-400' },
                  { rank: 2, name: 'NeonRider', score: '98,110', icon: Users, color: 'text-gray-300' },
                  { rank: 3, name: 'VoidWalker', score: '95,504', icon: Globe, color: 'text-amber-600' },
                  { rank: 4, name: 'PlayerOne', score: '92,000', icon: null, color: 'text-[var(--color-text-muted)]' },
                  { rank: 5, name: 'StarGazer', score: '88,940', icon: null, color: 'text-[var(--color-text-muted)]' }
                ].map((player, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 ${idx !== 4 ? 'border-b border-[var(--color-border-color)]' : ''} hover:bg-[var(--color-bg-secondary)] transition-colors`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 text-center font-bold text-lg ${player.color}`}>
                        #{player.rank}
                      </div>
                      <div className="font-medium text-[var(--color-text-main)]">{player.name}</div>
                      {player.icon && <player.icon className={`w-4 h-4 ${player.color}`} />}
                    </div>
                    <div className="font-mono text-[var(--color-accent)] font-bold">{player.score}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
