import { Request, Response } from 'express';
import { Project } from '../models/Project';
import { logger } from '../../../config/logger';
import { createGoogleCalendarEvent } from '../../../utils/integrations';
import { parseTemplate } from '../../../utils/templateParser';

// @desc    Get all projects with pagination and search
// @route   GET /api/v1/projects
// @access  Admin, Manager, HR
export const getProjects = async (req: Request, res: Response) => {
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
      query.name = { $regex: search, $options: 'i' };
    }

    const startIndex = (page - 1) * limit;
    const total = await Project.countDocuments(query);

    const projects = await Project.find(query)
      .populate('clientId', 'companyName')
      .populate('teamMembers', 'firstName lastName')
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch projects' } });
  }
};

// @desc    Create new project
// @route   POST /api/v1/projects
// @access  Admin, Manager
export const createProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.create(req.body);

    if (project.startDate && project.deadline) {
      const defaultSubject = `Project Milestone: ${project.name}`;
      const defaultBody = `Project deadline/milestone for ${project.name}.\nStatus: ${project.status}`;

      const { subject, body } = await parseTemplate(
        'PROJECT_MILESTONE',
        'GoogleCalendar',
        { projectName: project.name, status: project.status },
        defaultSubject,
        defaultBody
      );

      await createGoogleCalendarEvent(
        subject,
        body,
        new Date(project.startDate),
        new Date(project.deadline)
      );
    }

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    logger.error('Error creating project:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create project' } });
  }
};

// @desc    Update project
// @route   PUT /api/v1/projects/:id
// @access  Admin, Manager
export const updateProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (!project) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }
    
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    logger.error('Error updating project:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update project' } });
  }
};

// @desc    Delete project
// @route   DELETE /api/v1/projects/:id
// @access  Admin, Manager
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    logger.error('Error deleting project:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete project' } });
  }
};
