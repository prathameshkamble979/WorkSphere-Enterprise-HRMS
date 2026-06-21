import { Request, Response } from 'express';
import { Payroll } from '../models/Payroll';
import { sendSlackMessage } from '../../../utils/integrations';
import { parseTemplate } from '../../../utils/templateParser';
import { logger } from '../../../config/logger';

// @desc    Get all payroll records with pagination and filters
// @route   GET /api/v1/payroll
// @access  Admin, Manager, HR
export const getPayrollRecords = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const month = req.query.month as string;
    const year = parseInt(req.query.year as string);

    const query: any = {};

    if (status) query.status = status;
    if (month) query.month = month;
    if (year) query.year = year;

    const startIndex = (page - 1) * limit;
    const total = await Payroll.countDocuments(query);

    const records = await Payroll.find(query)
      .populate('employeeId', 'firstName lastName employeeId')
      .skip(startIndex)
      .limit(limit)
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching payroll records:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch payroll records' } });
  }
};

// @desc    Process new payroll
// @route   POST /api/v1/payroll
// @access  Admin, HR
export const createPayrollRecord = async (req: Request, res: Response) => {
  try {
    // NetPay is automatically calculated by pre-save hook in Mongoose
    const payroll = await Payroll.create(req.body);
    res.status(201).json({ success: true, data: payroll });
  } catch (error) {
    logger.error('Error creating payroll record:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create payroll record' } });
  }
};

// @desc    Update payroll status
// @route   PATCH /api/v1/payroll/:id/status
// @access  Admin, HR
export const updatePayrollStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Processed', 'Paid'].includes(status)) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid status' } });
    }

    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Payroll record not found' } });
    }

    payroll.status = status;
    if (status === 'Paid') {
      payroll.paymentDate = new Date();
    }
    
    await payroll.save();
    
    // Slack Integration
    if (status === 'Paid') {
      const defaultBody = `💰 *Payroll Completed!* The payroll for ${payroll.month} ${payroll.year} has been successfully processed and paid.`;
      const { body, channel } = await parseTemplate(
        'PAYROLL_COMPLETED',
        'Slack',
        { month: payroll.month, year: payroll.year.toString() },
        '',
        defaultBody
      );
      sendSlackMessage(body, channel);
    }

    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    logger.error('Error updating payroll status:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update payroll status' } });
  }
};
