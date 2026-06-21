import { Request, Response } from 'express';
import { Approval } from '../models/Approval';
import { logger } from '../../../config/logger';

// @desc    Get all approvals with pagination and search
// @route   GET /api/v1/approvals
// @access  Admin, Manager, HR
export const getApprovals = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    const startIndex = (page - 1) * limit;
    const total = await Approval.countDocuments(query);

    const approvals = await Approval.find(query)
      .populate('requesterId', 'email role')
      .populate('reviewerId', 'email role')
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: approvals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching approvals:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch approvals' } });
  }
};

// @desc    Create new approval
// @route   POST /api/v1/approvals
// @access  Authenticated User
export const createApproval = async (req: Request, res: Response) => {
  try {
    // Assuming req.user is set by the authMiddleware
    const requesterId = (req as any).user._id; 
    const approval = await Approval.create({ ...req.body, requesterId });
    res.status(201).json({ success: true, data: approval });
  } catch (error) {
    logger.error('Error creating approval:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create approval request' } });
  }
};

// @desc    Update approval status
// @route   PATCH /api/v1/approvals/:id/status
// @access  Admin, Manager, HR
export const updateApprovalStatus = async (req: Request, res: Response) => {
  try {
    const { status, comments } = req.body;
    
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid status' } });
    }

    const approval = await Approval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Approval not found' } });
    }

    approval.status = status;
    approval.reviewerId = (req as any).user._id;
    if (comments !== undefined) approval.comments = comments;
    if (status === 'Pending') {
      approval.comments = ''; // Clear comments when reverting to pending
    }
    
    await approval.save();
    
    res.status(200).json({ success: true, data: approval });
  } catch (error) {
    logger.error('Error updating approval status:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update approval status' } });
  }
};
