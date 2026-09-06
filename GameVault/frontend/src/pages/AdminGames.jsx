import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Edit2, Trash2, X, AlertTriangle, Search, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { gamesApi } from '../services/api';
import Button from '../components/ui/Button';

export default function AdminGames() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('local'); // 'local' or 'rawg'
  
  // Local games state
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Local games form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    coverImage: '',
    price: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // RAWG Search state
  const [rawgQuery, setRawgQuery] = useState('');
  const [rawgResults, setRawgResults] = useState([]);
  const [rawgLoading, setRawgLoading] = useState(false);
  const [rawgPage, setRawgPage] = useState(1);
  const [rawgTotalCount, setRawgTotalCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate('/');
      return;
    }
    fetchGames();
  }, [isAuthenticated, user, navigate]);

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const data = await gamesApi.list();
      setGames(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      setError('Failed to load games');
    } finally {
      setIsLoading(false);
    }
  };

  // ----- LOCAL GAMES FUNCTIONS -----
  const openAddModal = () => {
    setEditingGame(null);
    setFormData({ title: '', description: '', genre: '', coverImage: '', price: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (game) => {
    setEditingGame(game);
    setFormData({
      title: game.title || '',
      description: game.description || '',
      genre: Array.isArray(game.genre) ? game.genre.join(', ') : (game.genre || ''),
      coverImage: game.coverImage || '',
      price: game.price || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGame(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setFormError('Title and Description are required.');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      const payload = {
        ...formData,
        genre: formData.genre.split(',').map(g => g.trim()).filter(Boolean)
      };

      if (editingGame) {
        await gamesApi.update(editingGame._id, payload);
      } else {
        await gamesApi.create(payload);
      }
      closeModal();
      fetchGames();
    } catch (err) {
      setFormError(err.message || 'Failed to save game.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    try {
      await gamesApi.delete(id);
      fetchGames();
    } catch (err) {
      alert(err.message || 'Failed to delete game.');
    }
  };

  // ----- RAWG SEARCH FUNCTIONS -----
  const handleRawgSearch = async (e, page = 1) => {
    if (e) e.preventDefault();
    if (!rawgQuery.trim()) return;

    setRawgLoading(true);
    try {
      const data = await gamesApi.adminRawgSearch(rawgQuery, page);
      if (page === 1) {
        setRawgResults(data.results || []);
      } else {
        setRawgResults(prev => [...prev, ...(data.results || [])]);
      }
      setRawgPage(data.page || page);
      setRawgTotalCount(data.count || 0);
    } catch (err) {
      alert(err.message || 'Failed to search RAWG.');
    } finally {
      setRawgLoading(false);
    }
  };

  const handleAddFromRawg = async (rawgId) => {
    try {
      setRawgLoading(true); // Optional: global loading or specific button loading
      await gamesApi.adminRawgAdd(rawgId);
      // Update local state to show it's added
      setRawgResults(prev => prev.map(game => 
        game.rawgId === rawgId ? { ...game, isAdded: true } : game
      ));
      fetchGames(); // refresh local games list
    } catch (err) {
      alert(err.message || 'Failed to add game from RAWG.');
    } finally {
      setRawgLoading(false);
    }
  };

  if (!isAuthenticated || !user?.isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text-main)] flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-500" />
            Admin Game Management
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2">Manage local games and import from RAWG.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-4 mb-6 border-b border-[var(--color-border-color)]">
        <button
          onClick={() => setActiveTab('local')}
          className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'local' ? 'border-red-500 text-red-500' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}
        >
          Local Games
        </button>
        <button
          onClick={() => setActiveTab('rawg')}
          className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'rawg' ? 'border-red-500 text-red-500' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}
        >
          Import from RAWG
        </button>
      </div>

      {activeTab === 'local' && (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={openAddModal} className="gap-2 bg-red-600 hover:bg-red-700 text-white border-0">
              <Plus className="w-4 h-4" /> Add Custom Game
            </Button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12 text-[var(--color-text-muted)] animate-pulse">Loading games...</div>
          ) : (
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-color)] text-[var(--color-text-muted)] uppercase text-xs font-bold">
                    <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4 hidden sm:table-cell">Genre</th>
                      <th className="px-6 py-4 hidden md:table-cell">Price</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-color)]">
                    {games.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                          No games found. Add one or import from RAWG!
                        </td>
                      </tr>
                    ) : (
                      games.map(game => (
                        <tr key={game._id} className="hover:bg-[var(--color-bg-secondary)]/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-[var(--color-text-main)]">
                            {game.title}
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell text-[var(--color-text-muted)]">
                            {Array.isArray(game.genre) ? game.genre.join(', ') : game.genre}
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell text-[var(--color-text-muted)]">
                            {game.price ? `$${game.price}` : 'Free'}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => openEditModal(game)}
                              className="inline-flex items-center justify-center p-2 rounded-md bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] border border-[var(--color-border-color)] transition-colors"
                              title="Edit Game"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(game._id)}
                              className="inline-flex items-center justify-center p-2 rounded-md bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:text-red-500 border border-[var(--color-border-color)] transition-colors"
                              title="Delete Game"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'rawg' && (
        <div className="space-y-6">
          <form onSubmit={e => handleRawgSearch(e, 1)} className="flex gap-2">
            <input
              type="text"
              value={rawgQuery}
              onChange={e => setRawgQuery(e.target.value)}
              placeholder="Search RAWG database..."
              className="flex-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] rounded-md px-4 py-2 focus:outline-none focus:border-red-500"
            />
            <Button type="submit" disabled={rawgLoading} className="bg-red-600 hover:bg-red-700 text-white border-0 gap-2">
              <Search className="w-4 h-4" /> Search
            </Button>
          </form>

          {rawgLoading && <div className="text-center py-8 text-[var(--color-text-muted)] animate-pulse">Searching RAWG...</div>}

          {!rawgLoading && rawgResults.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rawgResults.map(game => (
                  <div key={game.rawgId} className="bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] overflow-hidden flex flex-col">
                    {game.coverImage ? (
                      <img src={game.coverImage} alt={game.title} className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-text-muted)]">No Image</div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-[var(--color-text-main)] text-lg mb-1 line-clamp-1">{game.title}</h3>
                      <div className="text-sm text-[var(--color-text-muted)] mb-4 flex justify-between">
                        <span>{game.releaseYear || 'Unknown Year'}</span>
                        <span>{game.rating ? `⭐ ${game.rating}` : ''}</span>
                      </div>
                      <div className="mt-auto">
                        {game.isAdded ? (
                          <div className="w-full text-center py-2 text-sm font-semibold text-green-500 bg-green-500/10 rounded-md">
                            Already Added
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleAddFromRawg(game.rawgId)} 
                            className="w-full justify-center gap-2"
                            variant="secondary"
                          >
                            <Download className="w-4 h-4" /> Add to GameVault
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination (Load More) */}
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => handleRawgSearch(null, rawgPage + 1)}
                  disabled={rawgLoading || rawgResults.length >= rawgTotalCount}
                  variant="outline"
                >
                  Load More
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Local Game Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-color)] mb-4">
              <h2 className="text-xl font-bold text-[var(--color-text-main)]">
                {editingGame ? 'Edit Game' : 'Add Custom Game'}
              </h2>
              <button onClick={closeModal} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-md">
                  {formError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Description *</label>
                <textarea
                  name="description"
                  required
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Genre (comma separated)</label>
                <input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
                  placeholder="Action, RPG, Strategy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Cover Image URL</label>
                <input
                  type="url"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Price (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading} className="bg-red-600 hover:bg-red-700 text-white border-0">
                  {formLoading ? 'Saving...' : 'Save Game'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
