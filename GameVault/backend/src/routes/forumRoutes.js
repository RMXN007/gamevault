import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getCategories,
    createCategory,
    getThreads,
    getThreadById,
    createThread,
    upvoteThread,
    getRepliesByThreadId,
    createReply,
    upvoteReply,
} from '../controllers/forumController.js';

const router = express.Router();

// Categories -> /api/forum/categories
router.get('/categories', getCategories);
router.post('/categories', protect, createCategory);

// Threads -> /api/forum/threads
router.get('/threads', getThreads);
router.get('/threads/:id', getThreadById);
router.post('/threads', protect, createThread);
router.post('/threads/:id/upvote', protect, upvoteThread);

// Replies -> /api/forum/replies
router.get('/replies/:threadId', getRepliesByThreadId);
router.post('/replies', protect, createReply);
router.post('/replies/:id/upvote', protect, upvoteReply);

export default router;