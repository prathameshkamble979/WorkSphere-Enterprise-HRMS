import express from 'express';
import { getLeaves, applyLeave, updateLeaveStatus } from '../controllers/leaveController';
import { protect, authorize } from '../../../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/', authorize('Admin', 'Manager', 'HR', 'Employee'), getLeaves);
router.post('/', applyLeave);
router.patch('/:id/status', authorize('Admin', 'Manager', 'HR'), updateLeaveStatus);

export default router;
