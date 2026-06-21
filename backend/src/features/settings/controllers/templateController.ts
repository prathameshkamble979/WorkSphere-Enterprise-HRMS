import { Request, Response } from 'express';
import { NotificationTemplate } from '../models/NotificationTemplate';
import { logger } from '../../../config/logger';

// @desc    Get all templates
// @route   GET /api/v1/settings/templates
// @access  Admin, HR
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await NotificationTemplate.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch templates' } });
  }
};

// @desc    Get template by ID
// @route   GET /api/v1/settings/templates/:id
// @access  Admin, HR
export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const template = await NotificationTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: { message: 'Template not found' } });
    }
    res.status(200).json({ success: true, data: template });
  } catch (error) {
    logger.error('Error fetching template:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch template' } });
  }
};

// @desc    Create template
// @route   POST /api/v1/settings/templates
// @access  Admin, HR
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { name, type, eventTrigger, subject, body, isActive, channel } = req.body;
    
    // If setting to active, deactivate others of same type/eventTrigger
    if (isActive) {
      await NotificationTemplate.updateMany(
        { type, eventTrigger },
        { isActive: false }
      );
    }

    const template = await NotificationTemplate.create({
      name, type, eventTrigger, subject, body, isActive, channel
    });

    res.status(201).json({ success: true, data: template });
  } catch (error: any) {
    logger.error('Error creating template:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: { message: 'An active template already exists for this trigger and type. Please deactivate it first.' } });
    }
    res.status(500).json({ success: false, error: { message: 'Failed to create template' } });
  }
};

// @desc    Update template
// @route   PUT /api/v1/settings/templates/:id
// @access  Admin, HR
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { isActive, type, eventTrigger } = req.body;

    const template = await NotificationTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: { message: 'Template not found' } });
    }

    if (isActive && !template.isActive) {
      await NotificationTemplate.updateMany(
        { type: type || template.type, eventTrigger: eventTrigger || template.eventTrigger },
        { isActive: false }
      );
    }

    const updatedTemplate = await NotificationTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedTemplate });
  } catch (error: any) {
    logger.error('Error updating template:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: { message: 'An active template already exists for this trigger and type. Please deactivate it first.' } });
    }
    res.status(500).json({ success: false, error: { message: 'Failed to update template' } });
  }
};

// @desc    Delete template
// @route   DELETE /api/v1/settings/templates/:id
// @access  Admin, HR
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const template = await NotificationTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: { message: 'Template not found' } });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    logger.error('Error deleting template:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to delete template' } });
  }
};
