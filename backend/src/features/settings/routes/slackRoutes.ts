import express from 'express';
import { protect } from '../../../middlewares/authMiddleware';
import { 
  getSlackAuthUrl, handleSlackCallback, testSlackMessage, disconnectSlack,
  getPersonalSlackUrl, handlePersonalSlackCallback, testPersonalSlackMessage, disconnectPersonalSlack,
  getSlackChannels, sendCustomSlackMessage
} from '../controllers/slackController';

const router = express.Router();

// Global (Admin) Routes
router.get('/url', protect, getSlackAuthUrl);
router.post('/callback', protect, handleSlackCallback);
router.post('/test', protect, testSlackMessage);
router.post('/disconnect', protect, disconnectSlack);
router.get('/channels', protect, getSlackChannels);
router.post('/send-custom', protect, sendCustomSlackMessage);

// Personal Routes
router.get('/personal/url', protect, getPersonalSlackUrl);
router.post('/personal/callback', protect, handlePersonalSlackCallback);
router.post('/personal/test', protect, testPersonalSlackMessage);
router.post('/personal/disconnect', protect, disconnectPersonalSlack);

export default router;
