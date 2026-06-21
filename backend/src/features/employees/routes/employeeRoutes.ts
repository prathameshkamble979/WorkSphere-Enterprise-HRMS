import express from 'express';
import { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController';
import { protect, authorize } from '../../../middlewares/authMiddleware';
import { validate } from '../../../middlewares/validateMiddleware';
import { createEmployeeSchema, updateEmployeeSchema } from '../../../shared/validators/employeeValidator';

const router = express.Router();

router.use(protect);

router.get('/', authorize('Admin', 'Manager', 'HR'), getEmployees);
router.get('/:id', getEmployeeById); // Self access logic can be handled in controller

router.post('/', authorize('Admin', 'HR'), validate(createEmployeeSchema), createEmployee);
router.put('/:id', authorize('Admin', 'HR'), validate(updateEmployeeSchema), updateEmployee);
router.delete('/:id', authorize('Admin', 'HR'), deleteEmployee);

export default router;
