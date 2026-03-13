import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, User, Library, Settings as SettingsIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { mockUser } from '../../data/mock';

// We map themes to icons or labels here, or just keep it simple.
const Navbar = () => {
  const { theme, setTheme, themes } = useTheme();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--color-border-color)] bg-[var(--color-bg-primary)]/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-[var(--color-accent)]">
          <Gamepad2 className="w-8 h-8" />
          <span className="hidden sm:inline-block tracking-tight">GameVault</span>
        </Link>
        
        <div className="flex items-center gap-1 sm:gap-4 md:gap-8">
          <Link to="/" className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-[var(--radius-button)] font-medium transition-colors ${isActive('/') ? 'text-[var(--color-text-main)] bg-[var(--color-bg-secondary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-secondary)]'}`}>
            Store
          </Link>
          <Link to="/library" className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-button)] font-medium transition-colors ${isActive('/library') ? 'text-[var(--color-text-main)] bg-[var(--color-bg-secondary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-secondary)]'}`}>
            <Library className="w-5 h-5 sm:hidden" />
            <span className="hidden sm:inline-block">Library</span>
          </Link>
          
          <div className="w-px h-6 bg-[var(--color-border-color)] mx-2 hidden sm:block"></div>
          
          <div className="flex items-center gap-2">
            <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] text-sm rounded-[var(--radius-button)] px-2 py-1.5 border border-[var(--color-border-color)] outline-none cursor-pointer focus:border-[var(--color-accent)] transition-colors hidden md:block"
            >
              {themes.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            
            <Link to="/settings" className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors rounded-full hover:bg-[var(--color-bg-secondary)]">
              <SettingsIcon className="w-5 h-5" />
            </Link>
            
            <Link to="/profile" className="flex items-center gap-2 ml-2 hover:opacity-80 transition-opacity">
              <img src={mockUser.avatar} alt={mockUser.username} className="w-8 h-8 rounded-full border-2 border-[var(--color-accent)] object-cover" />
              <span className="hidden sm:inline-block font-medium text-sm text-[var(--color-text-main)]">{mockUser.username}</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
