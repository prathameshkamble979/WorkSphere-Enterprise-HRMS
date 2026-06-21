import express from 'express';
import { 
  getGoogleOAuthUrl, handleGoogleCallback, testGoogleCalendarEvent, disconnectGoogleWorkspace,
  getPersonalGoogleUrl, handlePersonalGoogleCallback, testPersonalGoogleEvent, disconnectPersonalGoogle,
  createCustomCalendarEvent
} from '../controllers/googleController';
import { protect } from '../../../middlewares/authMiddleware';

const router = express.Router();

// Global (Admin) Routes
router.get('/url', protect, getGoogleOAuthUrl);
router.post('/callback', protect, handleGoogleCallback);
router.post('/test', protect, testGoogleCalendarEvent);
router.post('/disconnect', protect, disconnectGoogleWorkspace);
router.post('/send-custom', protect, createCustomCalendarEvent);

// Personal Routes
router.get('/personal/url', protect, getPersonalGoogleUrl);
router.post('/personal/callback', protect, handlePersonalGoogleCallback);
router.post('/personal/test', protect, testPersonalGoogleEvent);
router.post('/personal/disconnect', protect, disconnectPersonalGoogle);

export default router;
