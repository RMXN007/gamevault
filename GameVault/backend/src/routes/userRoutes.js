import express from 'express';
import { registerUser, loginUser, getUserProfile, logoutUser, updateUserProfile, changePassword, getPublicProfile, getLibrary, addToLibrary, removeFromLibrary } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.put('/password', protect, changePassword);
router.get('/me', protect, getUserProfile); // Alias

router.route('/library')
  .get(protect, getLibrary);
router.route('/library/:gameId')
  .post(protect, addToLibrary)
  .delete(protect, removeFromLibrary);

router.get('/:username', getPublicProfile);

export default router;
