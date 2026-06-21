# WorkSphere HRMS

WorkSphere HRMS is a comprehensive Human Resource Management System designed to streamline company operations, manage employees, track projects, handle leave requests, and automate payroll. It also integrates seamlessly with Slack and Google Workspace.

## Features

- **Employee Directory**: Complete CRUD operations for staff with role-based access.
- **Client & Project Management**: Manage client portfolios and assign employees to ongoing projects.
- **Leave & Attendance Tracking**: Intuitive leave application with multi-level approval workflows.
- **Payroll Automation**: Track salaries, bonuses, and deductions securely.
- **Real-Time Notifications**: Server-Sent Events (SSE) provide live updates directly to users.
- **Slack & Google Integrations**: Push announcements to Slack and sync schedules with Google Calendar natively.

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+

### Installation

1. Clone the repository
2. Install Backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install Frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

### Running Locally

1. Create a `.env` file in the `backend` directory based on the deployment documentation.
2. Seed the database to create an initial Admin account:
   ```bash
   npm run seed
   ```
3. Start the Backend:
   ```bash
   npm run dev
   ```
4. Start the Frontend (in a separate terminal):
   ```bash
   cd frontend
   npm run dev
   ```

## Technical Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend**: Node.js, Express.js, TypeScript.
- **Database**: MongoDB with Mongoose ODM.
- **Authentication**: JWT & HTTP-Only Cookies, RBAC.
- **File Uploads**: Multer.

## Documentation
Additional documentation available in the artifact vault:
- Architecture Guide
- API Specification
- Database Schema
- Deployment Guide

## License
MIT License
