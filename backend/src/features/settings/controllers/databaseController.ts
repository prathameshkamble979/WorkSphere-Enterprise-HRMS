import { Request, Response } from 'express';
import { User } from '../../users/models/User';
import mongoose from 'mongoose';
import { logger } from '../../../config/logger';

export const exportDatabase = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-passwordHash -resetPasswordToken -resetPasswordExpire -refreshToken');
    
    // In a real application, you would also export Employees, Projects, Leaves, etc.
    // For now, we export the users collection as the workspace data representation.
    const exportData = {
      workspace: 'WorkSphere HRMS',
      exportDate: new Date(),
      collections: {
        users
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="worksphere-backup.json"');
    
    res.status(200).json(exportData);
  } catch (error) {
    logger.error('Database Export Error', error);
    res.status(500).json({ success: false, error: { message: 'Failed to export database' } });
  }
};

export const wipeDatabase = async (req: Request, res: Response) => {
  try {
    // Only allow Admins or Admins to wipe
    const role = (req as any).user?.role;
    if (role !== 'Admin' && role !== 'Admin') {
       return res.status(403).json({ success: false, error: { message: 'Not authorized to wipe database' } });
    }

    // Drop the entire database (Danger!)
    if (!mongoose.connection.db) {
      return res.status(500).json({ success: false, error: { message: 'Database connection not ready' } });
    }
    await mongoose.connection.db.dropDatabase();
    
    logger.warn('Database has been completely wiped by an Admin.');
    
    res.status(200).json({ success: true, message: 'Workspace deleted successfully' });
  } catch (error) {
    logger.error('Database Wipe Error', error);
    res.status(500).json({ success: false, error: { message: 'Failed to wipe database' } });
  }
};
