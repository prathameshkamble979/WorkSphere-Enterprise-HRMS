import express from 'express';
import { getDashboardStats, getEmployeeDashboardStats } from '../controllers/dashboardController';
import { protect, authorize } from '../../../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/stats', authorize('Admin', 'Manager', 'HR', 'Employee'), getDashboardStats);
router.get('/employee-stats', authorize('Employee'), getEmployeeDashboardStats);

export default router;
