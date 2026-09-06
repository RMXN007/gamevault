import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getGames,
  getRawgHomeGames,
  searchRawgGames,
  getRawgGamesByGenre,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  getRelatedGames,
  getCommentsByGameId,
  createComment,
  upvoteComment,
  adminRawgSearch,
  adminRawgAdd,
} from '../controllers/gameController.js';

const router = express.Router();

// Games
router.get('/', getGames);
router.get('/home', getRawgHomeGames);
router.get('/search', searchRawgGames);
router.get('/genre/:genre', getRawgGamesByGenre);
router.get('/admin/rawg-search', protect, admin, adminRawgSearch);
router.post('/admin/rawg-add', protect, admin, adminRawgAdd);
router.post('/', protect, admin, createGame);
router.get('/:id', getGameById);
router.put('/:id', protect, admin, updateGame);
router.delete('/:id', protect, admin, deleteGame);
router.get('/:id/related', getRelatedGames);

// Comments on game
router.get('/:gameId/comments', getCommentsByGameId);
router.post('/:gameId/comments', protect, createComment);

// Upvote comment
router.post('/comments/:id/upvote', protect, upvoteComment);
router.put('/comments/:id/upvote', protect, upvoteComment);

export default router;
