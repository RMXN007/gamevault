import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upvoteComment } from '../controllers/gameController.js';

const router = express.Router();

// Direct comment upvote routes: /api/comments/:id/upvote
router.post('/:id/upvote', protect, upvoteComment);
router.put('/:id/upvote', protect, upvoteComment);

export default router;
