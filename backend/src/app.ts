import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { logger } from './config/logger';
import authRoutes from './features/auth/routes/authRoutes';
import databaseRoutes from './features/settings/routes/databaseRoutes';
import settingsRoutes from './features/settings/routes/settingsRoutes';
import slackRoutes from './features/settings/routes/slackRoutes';
import googleRoutes from './features/settings/routes/googleRoutes';
import employeeRoutes from './features/employees/routes/employeeRoutes';
import clientRoutes from './features/clients/routes/clientRoutes';
import notificationRoutes from './features/notifications/routes/notificationRoutes';
import approvalRoutes from './features/approvals/routes/approvalRoutes';
import dashboardRoutes from './features/dashboard/routes/dashboardRoutes';
import projectRoutes from './features/projects/routes/projectRoutes';
import leaveRoutes from './features/leaves/routes/leaveRoutes';
import payrollRoutes from './features/payroll/routes/payrollRoutes';
import templateRoutes from './features/settings/routes/templateRoutes';
import uploadRoutes from './features/upload/routes/uploadRoutes';
import communicationRoutes from './features/communications/routes/communicationRoutes';
import path from 'path';

const app: Application = express();

// Security and Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://work-sphere-enterprise-hrms.vercel.app',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Request Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Basic Health Check
app.use('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/database', databaseRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/slack', slackRoutes);
app.use('/api/v1/google', googleRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/communications', communicationRoutes);
app.use('/api/v1/approvals', approvalRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/settings/templates', templateRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error processing request: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred.',
    },
  });
});

export default app;
