import { Request, Response } from 'express';
import { Employee } from '../models/Employee';
import { User } from '../../users/models/User';
import { sendSlackMessage } from '../../../utils/integrations';
import { parseTemplate } from '../../../utils/templateParser';
import { logger } from '../../../config/logger';

// @desc    Get all employees with pagination and filters
// @route   GET /api/v1/employees
// @access  Admin, Manager, HR
export const getEmployees = async (req: Request, res: Response) => {
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
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const startIndex = (page - 1) * limit;
    const total = await Employee.countDocuments(query);

    const employees = await Employee.find(query)
      .populate('userId', 'email role isActive')
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching employees:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch employees' } });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/v1/employees/:id
// @access  Admin, Manager, HR, Self
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'email role isActive');

    if (!employee) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Employee not found' } });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    logger.error('Error fetching employee:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch employee' } });
  }
};

// @desc    Create new employee
// @route   POST /api/v1/employees
// @access  Admin, HR
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { email, password, role, firstName, lastName, employeeId, phone, status, joiningDate, skills, profilePicture } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: { code: 'DUPLICATE', message: 'Email already exists' } });
    }

    // Create User credentials
    const user = await User.create({
      email,
      passwordHash: password, // Pre-save hook will hash this
      role: role || 'Employee',
      isActive: true
    });

    // Create Employee profile
    const employee = await Employee.create({
      userId: user._id,
      employeeId,
      firstName,
      lastName,
      phone,
      status: status || 'Active',
      joiningDate: joiningDate || new Date(),
      skills: skills || [],
      profilePicture: profilePicture || ''
    });

    res.status(201).json({ success: true, data: employee });

    // Background Integration hook
    const defaultBody = `🎉 *New Hire Alert!* We are thrilled to welcome ${firstName} ${lastName} to the team as a new ${role || 'Employee'}. Say hello! 👋`;
    
    const { body, channel } = await parseTemplate(
      'NEW_HIRE',
      'Slack',
      { firstName, lastName, role: role || 'Employee', email, phone: phone || '' },
      '',
      defaultBody
    );

    sendSlackMessage(body, channel);
  } catch (error) {
    logger.error('Error creating employee:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create employee' } });
  }
};

// @desc    Update employee
// @route   PUT /api/v1/employees/:id
// @access  Admin, HR
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { role, ...employeeData } = req.body;
    
    const employee = await Employee.findByIdAndUpdate(req.params.id, employeeData, { new: true, runValidators: true });

    if (!employee) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Employee not found' } });
    }

    if (role) {
      await User.findByIdAndUpdate(employee.userId, { role });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    logger.error('Error updating employee:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update employee' } });
  }
};

// @desc    Delete employee
// @route   DELETE /api/v1/employees/:id
// @access  Admin, HR
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Employee not found' } });
    }

    // Delete associated user account
    await User.findByIdAndDelete(employee.userId);
    
    // Delete employee record
    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    logger.error('Error deleting employee:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete employee' } });
  }
};
