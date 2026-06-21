import { Router } from 'express';
import { protect } from '../../../middlewares/authMiddleware';
import { getCompanyFeed, getSlackActivity, getCalendarEvents } from '../controllers/communicationController';

const router = Router();

router.use(protect);

router.get('/feed', getCompanyFeed);
router.get('/slack/activity', getSlackActivity);
router.get('/calendar/events', getCalendarEvents);

export default router;

