import { Request, Response } from 'express';
import { Leave } from '../models/Leave';
import { logger } from '../../../config/logger';
import { sendSlackMessage, createGoogleCalendarEvent, sendPersonalSlackMessage, createPersonalGoogleCalendarEvent } from '../../../utils/integrations';
import { sendInAppNotification } from '../../../utils/notifications';
import { parseTemplate } from '../../../utils/templateParser';

// @desc    Get all leaves with pagination and filters
// @route   GET /api/v1/leaves
// @access  Admin, Manager, HR
export const getLeaves = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const leaveType = req.query.leaveType as string;

    const query: any = {};

    // If user is an Employee, only show their own leaves
    if ((req as any).user?.role === 'Employee') {
      const { Employee } = await import('../../employees/models/Employee');
      const employee = await Employee.findOne({ userId: (req as any).user._id });
      if (employee) {
        query.employeeId = employee._id;
      } else {
        return res.status(200).json({ success: true, data: [], pagination: { total: 0, page: 1, limit, totalPages: 0 } });
      }
    }

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const startIndex = (page - 1) * limit;
    const total = await Leave.countDocuments(query);

    const leaves = await Leave.find(query)
      .populate('employeeId', 'firstName lastName employeeId')
      .populate('approvedBy', 'email role')
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: leaves,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching leaves:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch leaves' } });
  }
};

// @desc    Apply for leave
// @route   POST /api/v1/leaves
// @access  Authenticated User
export const applyLeave = async (req: Request, res: Response) => {
  try {
    let { employeeId } = req.body;
    
    // Automatically find Employee document if employeeId is missing
    if (!employeeId) {
      const { Employee } = await import('../../employees/models/Employee');
      const employee = await Employee.findOne({ userId: (req as any).user?._id });
      if (!employee) {
        return res.status(404).json({ success: false, error: { message: 'Employee profile not found for this user' } });
      }
      employeeId = employee._id;
    }

    const leave = await Leave.create({ ...req.body, employeeId });
    
    // Populate employee details and their manager for Slack notification
    const populatedLeave = await Leave.findById(leave._id).populate({
      path: 'employeeId',
      select: 'firstName lastName managerId',
      populate: { path: 'managerId', select: 'userId' }
    });
    
    if (populatedLeave && populatedLeave.employeeId) {
      const employee = populatedLeave.employeeId as any;
      const durationText = leave.duration === 'Full Day' ? '' : ` (${leave.duration})`;
      const datesText = leave.startDate.getTime() === leave.endDate.getTime() 
        ? `${new Date(leave.startDate).toLocaleDateString()}${durationText}`
        : `${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`;
        
      // Personal Manager Notification
      if (employee.managerId) {
        const manager = employee.managerId;
        if (manager && manager.userId) {
          await sendInAppNotification(
            manager.userId,
            'New Leave Request',
            `${employee.firstName} ${employee.lastName} has requested ${leave.leaveType} leave for ${datesText}.`,
            'info',
            '/approvals'
          );
        }
      }
    }

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    logger.error('Error applying for leave:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to apply for leave' } });
  }
};

// @desc    Update leave status
// @route   PATCH /api/v1/leaves/:id/status
// @access  Admin, Manager, HR
export const updateLeaveStatus = async (req: Request, res: Response) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid status' } });
    }

    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Leave request not found' } });
    }

    leave.status = status;
    // Assuming req.user exists from protect middleware
    leave.approvedBy = (req as any).user?._id; 
    
    if (status === 'Rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    } else if (status !== 'Rejected') {
      leave.rejectionReason = undefined;
    }

    await leave.save();
    
    // Populate employee for notifications
    const populatedLeave = await Leave.findById(leave._id).populate('employeeId', 'firstName lastName userId');
    if (populatedLeave && populatedLeave.employeeId) {
      const employee = populatedLeave.employeeId as any;
      
      if (status === 'Approved') {
        // Global Notifications
        const defaultSubject = `${employee.firstName} ${employee.lastName} - OOO (${leave.leaveType})`;
        const defaultBody = `Approved time off for ${employee.firstName} ${employee.lastName}.\nReason: ${leave.reason}`;
        
        const { subject, body } = await parseTemplate(
          'LEAVE_APPROVED',
          'GoogleCalendar',
          { firstName: employee.firstName, lastName: employee.lastName, leaveType: leave.leaveType, reason: leave.reason },
          defaultSubject,
          defaultBody
        );

        await createGoogleCalendarEvent(
          subject,
          body,
          new Date(leave.startDate),
          new Date(leave.endDate)
        );

        // Personal Notifications
        if (employee.userId) {
          await sendInAppNotification(
            employee.userId,
            'Leave Approved',
            `Your request for ${leave.leaveType} leave has been approved.`,
            'success',
            '/leaves'
          );
          
          await createPersonalGoogleCalendarEvent(
            employee.userId.toString(),
            `OOO (${leave.leaveType})`,
            `Approved time off.\nReason: ${leave.reason}`,
            new Date(leave.startDate),
            new Date(leave.endDate)
          );
        }
      } else if (status === 'Rejected') {
        // Personal Notification
        if (employee.userId) {
          await sendInAppNotification(
            employee.userId,
            'Leave Rejected',
            `Your request for ${leave.leaveType} leave was rejected. Reason: ${rejectionReason}`,
            'error',
            '/leaves'
          );
        }
      }
    }

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    logger.error('Error updating leave status:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update leave status' } });
  }
};
