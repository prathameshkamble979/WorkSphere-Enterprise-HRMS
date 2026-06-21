import express from 'express';
import { protect } from '../../../middlewares/authMiddleware';
import { getSettings, updateUserSettings, subscribeToPush, getPushPublicKey } from '../controllers/settingsController';

const router = express.Router();

router.get('/', protect, getSettings);
router.patch('/user', protect, updateUserSettings);
router.post('/push/subscribe', protect, subscribeToPush);
router.get('/push/public-key', protect, getPushPublicKey);

export default router;
