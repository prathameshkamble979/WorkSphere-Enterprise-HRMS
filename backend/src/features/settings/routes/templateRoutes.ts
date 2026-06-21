import express from 'express';
import { getTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate } from '../controllers/templateController';
import { protect, authorize } from '../../../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/', authorize('Admin', 'HR', 'Manager'), getTemplates);
router.get('/:id', authorize('Admin', 'HR', 'Manager'), getTemplateById);
router.post('/', authorize('Admin', 'HR', 'Manager'), createTemplate);
router.put('/:id', authorize('Admin', 'HR', 'Manager'), updateTemplate);
router.delete('/:id', authorize('Admin', 'HR', 'Manager'), deleteTemplate);

export default router;
