import { Request, Response } from 'express';
import { Client } from '../models/Client';
import { logger } from '../../../config/logger';

// @desc    Get all clients with pagination and search
// @route   GET /api/v1/clients
// @access  Admin, Manager, HR
export const getClients = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const query: any = {};

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }

    const startIndex = (page - 1) * limit;
    const total = await Client.countDocuments(query);

    const clients = await Client.find(query)
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: clients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching clients:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch clients' } });
  }
};

// @desc    Create new client
// @route   POST /api/v1/clients
// @access  Admin, Manager
export const createClient = async (req: Request, res: Response) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json({ success: true, data: client });
  } catch (error) {
    logger.error('Error creating client:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create client' } });
  }
};

// @desc    Get single client by ID
// @route   GET /api/v1/clients/:id
// @access  Admin, Manager, HR
export const getClientById = async (req: Request, res: Response) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } });
    }

    res.status(200).json({ success: true, data: client });
  } catch (error) {
    logger.error('Error fetching client:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch client' } });
  }
};

// @desc    Update client
// @route   PUT /api/v1/clients/:id
// @access  Admin, Manager
export const updateClient = async (req: Request, res: Response) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!client) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } });
    }

    res.status(200).json({ success: true, data: client });
  } catch (error) {
    logger.error('Error updating client:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update client' } });
  }
};

// @desc    Delete client
// @route   DELETE /api/v1/clients/:id
// @access  Admin, Manager
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    logger.error('Error deleting client:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete client' } });
  }
};
