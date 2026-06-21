import express from 'express';
import { getPayrollRecords, createPayrollRecord, updatePayrollStatus } from '../controllers/payrollController';
import { protect, authorize } from '../../../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/', authorize('Admin', 'Manager', 'HR'), getPayrollRecords);
router.post('/', authorize('Admin', 'HR'), createPayrollRecord);
router.patch('/:id/status', authorize('Admin', 'HR'), updatePayrollStatus);

export default router;
