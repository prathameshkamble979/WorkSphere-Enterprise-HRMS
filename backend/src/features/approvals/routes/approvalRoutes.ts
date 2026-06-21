import express from 'express';
import { getApprovals, createApproval, updateApprovalStatus } from '../controllers/approvalController';
import { protect, authorize } from '../../../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/', authorize('Admin', 'Manager', 'HR'), getApprovals);
router.post('/', createApproval);
router.patch('/:id/status', authorize('Admin', 'Manager', 'HR'), updateApprovalStatus);

export default router;
