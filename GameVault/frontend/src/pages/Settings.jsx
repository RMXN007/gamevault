import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-[var(--color-text-main)]">Settings</h1>
      
      <div className="bg-[var(--color-bg-secondary)] rounded-[var(--radius-card)] p-6 mb-8 border border-[var(--color-border-color)]">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-main)]">Appearance</h2>
        <p className="mb-4 text-[var(--color-text-muted)]">Select your preferred UI style.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex items-center justify-between p-4 rounded-[var(--radius-card)] border-2 transition-all ${theme === t ? 'border-[var(--color-accent)] bg-[var(--color-bg-primary)]' : 'border-transparent bg-[var(--color-bg-primary)] hover:border-[var(--color-border-color)]'}`}
            >
              <div className="text-left">
                <h3 className="font-semibold text-lg capitalize text-[var(--color-text-main)]">{t}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {t === 'minimal' && 'Clean, monochrome developer style.'}
                  {t === 'futuristic' && 'Neon accents, dark mode glow.'}
                  {t === 'apple' && 'Soft shadows, bright colors, rounded corners.'}
                  {t === 'cyberpunk' && 'High contrast, bright raw neon.'}
                </p>
              </div>
              <div 
                className={`w-6 h-6 rounded-full border-2 ${theme === t ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-text-muted)] bg-transparent'}`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
