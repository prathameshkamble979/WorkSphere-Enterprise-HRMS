import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, streamNotifications } from '../controllers/notificationController';
import { protect } from '../../../middlewares/authMiddleware';

const router = Router();

// SSE Stream route must come before /:id routes or place it explicitly
router.get('/stream', protect, streamNotifications);

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

export default router;
