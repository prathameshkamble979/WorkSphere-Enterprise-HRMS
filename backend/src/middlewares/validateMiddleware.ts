import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../config/logger';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const zodError = error as ZodError;
        logger.warn(`Validation failed: ${JSON.stringify(zodError.issues)}`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: zodError.issues.map((err: any) => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        });
      }
      return next(error);
    }
  };
};
