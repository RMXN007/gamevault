import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import GamesPage from './pages/GamesPage';
import GameDetails from './pages/GameDetailsPage';
import Library from './pages/PersonalLibrary';
import Profile from './pages/AccountProfile';
import PublicProfile from './pages/PublicProfile';
import Settings from './pages/Settings';
import Community from './pages/CommunityView';
import AdminGames from './pages/AdminGames';

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 w-full bg-[var(--color-bg-primary)] text-[var(--color-text-main)] transition-colors duration-300">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/:id" element={<GameDetails />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile/:username" element={<PublicProfile />} />

          {/* Protected Routes — pages handle their own guest states */}
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings/*" element={<Settings />} />
          
          {/* Admin Routes */}
          <Route path="/admin/games" element={<AdminGames />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
