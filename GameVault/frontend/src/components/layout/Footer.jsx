import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-[var(--color-border-color)] bg-[var(--color-bg-primary)] mt-auto py-8 text-center text-[var(--color-text-muted)]">
      <div className="container mx-auto px-4">
        <p className="text-sm">© {new Date().getFullYear()} GameVault. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-4">
          <a href="#" className="hover:text-[var(--color-text-main)] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[var(--color-text-main)] transition-colors">Terms</a>
          <a href="#" className="hover:text-[var(--color-text-main)] transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
