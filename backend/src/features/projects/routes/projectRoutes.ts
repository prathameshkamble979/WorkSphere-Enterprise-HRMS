import express from 'express';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/projectController';
import { protect, authorize } from '../../../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/', authorize('Admin', 'Manager', 'HR'), getProjects);
router.post('/', authorize('Admin', 'Manager'), createProject);
router.put('/:id', authorize('Admin', 'Manager'), updateProject);
router.delete('/:id', authorize('Admin', 'Manager'), deleteProject);

export default router;
