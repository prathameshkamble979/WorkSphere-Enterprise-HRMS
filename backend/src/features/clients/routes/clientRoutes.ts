import express from 'express';
import { getClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/clientController';
import { protect, authorize } from '../../../middlewares/authMiddleware';
import { validate } from '../../../middlewares/validateMiddleware';
import { createClientSchema, updateClientSchema } from '../../../shared/validators/clientValidator';

const router = express.Router();

router.use(protect);

router.get('/', authorize('Admin', 'Manager', 'HR'), getClients);
router.get('/:id', authorize('Admin', 'Manager', 'HR'), getClientById);
router.post('/', authorize('Admin', 'Manager'), validate(createClientSchema), createClient);
router.put('/:id', authorize('Admin', 'Manager'), validate(updateClientSchema), updateClient);
router.delete('/:id', authorize('Admin', 'Manager'), deleteClient);

export default router;
