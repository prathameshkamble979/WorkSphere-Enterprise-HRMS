import express from 'express';
import { exportDatabase, wipeDatabase } from '../controllers/databaseController';
import { protect, authorize } from '../../../middlewares/authMiddleware';

const router = express.Router();

router.get('/export', protect, authorize('Admin', 'Admin'), exportDatabase);
router.delete('/wipe', protect, authorize('Admin', 'Admin'), wipeDatabase);

export default router;
