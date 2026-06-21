import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './features/users/models/User';
import { Employee } from './features/employees/models/Employee';
import { Client } from './features/clients/models/Client';
import { Project } from './features/projects/models/Project';
import { Leave } from './features/leaves/models/Leave';
import { Payroll } from './features/payroll/models/Payroll';
import { Approval } from './features/approvals/models/Approval';
import { Notification } from './features/notifications/models/Notification';
import bcrypt from 'bcryptjs';

dotenv.config();

const indianNames = [
  { name: 'Aarav Patel', email: 'aarav.patel@worksphere.com', role: 'Employee', position: 'Frontend Developer', department: 'Engineering', skills: ['React', 'TypeScript', 'Tailwind'] },
  { name: 'Priya Singh', email: 'priya.singh@worksphere.com', role: 'Manager', position: 'Engineering Manager', department: 'Engineering', skills: ['Management', 'Agile', 'Node.js'] },
  { name: 'Rohan Sharma', email: 'rohan.sharma@worksphere.com', role: 'Employee', position: 'Backend Developer', department: 'Engineering', skills: ['Node.js', 'MongoDB', 'Express'] },
  { name: 'Anjali Desai', email: 'anjali.desai@worksphere.com', role: 'HR', position: 'HR Specialist', department: 'Human Resources', skills: ['Recruiting', 'Communication', 'Agile'] },
  { name: 'Vivek Kumar', email: 'vivek.kumar@worksphere.com', role: 'Employee', position: 'QA Engineer', department: 'Quality Assurance', skills: ['Testing', 'Cypress', 'Jest'] },
  { name: 'Neha Gupta', email: 'neha.gupta@worksphere.com', role: 'Employee', position: 'UI/UX Designer', department: 'Design', skills: ['Figma', 'UI/UX', 'CSS'] },
  { name: 'Siddharth Mehta', email: 'siddharth.mehta@worksphere.com', role: 'Employee', position: 'DevOps Engineer', department: 'Engineering', skills: ['AWS', 'Docker', 'CI/CD'] },
  { name: 'Aditi Rao', email: 'aditi.rao@worksphere.com', role: 'Admin', position: 'System Administrator', department: 'IT', skills: ['Linux', 'Networking', 'Security'] },
];

const indianClients = [
  { companyName: 'Reliance Industries', industry: 'Conglomerate', contactPerson: 'Mukesh Ambani', email: 'contact@ril.com', phone: '+91 22 2271 5000' },
  { companyName: 'Tata Consultancy Services', industry: 'IT Services', contactPerson: 'Rajesh Gopinathan', email: 'info@tcs.com', phone: '+91 22 6778 9999' },
  { companyName: 'HDFC Bank', industry: 'Banking', contactPerson: 'Sashidhar Jagdishan', email: 'support@hdfcbank.com', phone: '+91 22 6652 1000' },
  { companyName: 'Infosys', industry: 'IT Services', contactPerson: 'Salil Parekh', email: 'contact@infosys.com', phone: '+91 80 2852 0261' },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/worksphere');
    console.log('Connected to MongoDB...');

    // Clear existing data except the user who just logged in via Google if possible
    // Actually, let's just wipe it all so we don't have dangling references
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Client.deleteMany({});
    await Project.deleteMany({});
    await Leave.deleteMany({});
    await Payroll.deleteMany({});
    await Approval.deleteMany({});

    console.log('Database cleared.');

    // Seed Users & Employees
    const createdEmployees: any[] = [];
    for (const person of indianNames) {
      const user = await User.create({
        name: person.name,
        email: person.email,
        passwordHash: 'Password@123',
        role: person.role as any,
      });

      const nameParts = person.name.split(' ');
      const employee = await Employee.create({
        userId: user._id,
        employeeId: 'EMP' + Math.floor(Math.random() * 10000),
        firstName: nameParts[0],
        lastName: nameParts[1] || '',
        status: 'Active',
        joiningDate: new Date(Date.now() - Math.random() * 10000000000),
        skills: person.skills || [],
      });

      createdEmployees.push(employee);
    }

    // Seed Clients
    const createdClients = await Client.insertMany(indianClients);

    // Seed Projects
    const projects = await Project.insertMany([
      {
        name: 'UPI Payment Gateway Integration',
        description: 'Integrating national UPI payment gateway with the existing e-commerce checkout flow.',
        clientId: createdClients[2]._id, // HDFC
        status: 'In Progress',
        startDate: new Date(),
        deadline: new Date(Date.now() + 5000000000),
        members: [createdEmployees[0]._id, createdEmployees[2]._id],
      },
      {
        name: 'JioMart E-Commerce Scaling',
        description: 'Scaling backend infrastructure to support 10x peak traffic during Diwali sale.',
        clientId: createdClients[0]._id, // Reliance
        status: 'Planning',
        startDate: new Date(),
        deadline: new Date(Date.now() + 8000000000),
        members: [createdEmployees[1]._id, createdEmployees[5]._id, createdEmployees[6]._id],
      },
      {
        name: 'TCS Internal HR Portal Migration',
        description: 'Migrating legacy on-prem HR system to the new WorkSphere cloud platform.',
        clientId: createdClients[1]._id, // TCS
        status: 'Completed',
        startDate: new Date(Date.now() - 5000000000),
        deadline: new Date(Date.now() - 1000000000),
        members: [createdEmployees[3]._id, createdEmployees[4]._id],
      }
    ]);

    // Seed Leaves
    await Leave.insertMany([
      {
        employeeId: createdEmployees[0]._id,
        leaveType: 'Sick',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 2),
        reason: 'Viral Fever',
        status: 'Approved'
      },
      {
        employeeId: createdEmployees[2]._id,
        leaveType: 'Vacation',
        startDate: new Date(Date.now() + 86400000 * 5),
        endDate: new Date(Date.now() + 86400000 * 7),
        reason: 'Diwali Celebration at Hometown',
        status: 'Pending'
      }
    ]);

    // Seed Payroll
    await Payroll.insertMany([
      {
        employeeId: createdEmployees[0]._id,
        month: 'June',
        year: 2026,
        baseSalary: 80000,
        bonus: 5000,
        deductions: 2000,
        netPay: 83000,
        status: 'Paid'
      },
      {
        employeeId: createdEmployees[1]._id,
        month: 'June',
        year: 2026,
        baseSalary: 120000,
        bonus: 10000,
        deductions: 4000,
        netPay: 126000,
        status: 'Pending'
      }
    ]);

    // Seed Approvals
    await Approval.insertMany([
      {
        type: 'Leave',
        requesterId: createdEmployees[2].userId, // Rohan Sharma
        status: 'Pending',
        title: 'Diwali Vacation',
        description: 'Need 2 days off for Diwali'
      },
      {
        type: 'Expense',
        requesterId: createdEmployees[0].userId, // Aarav
        status: 'Approved',
        title: 'Client Dinner',
        description: 'Client Meeting Dinner at Taj for Rs 4500'
      }
    ]);

    // Seed Notifications (Company Feed)
    const notificationsToSeed = [];
    for (const emp of createdEmployees) {
      notificationsToSeed.push(
        {
          userId: emp.userId,
          title: 'New Health Insurance Policy',
          message: 'We have upgraded our health insurance coverage for all employees. Please review the new policy on the HR portal.',
          type: 'info',
          isRead: false
        },
        {
          userId: emp.userId,
          title: 'Welcome to WorkSphere!',
          message: 'The new HRMS portal is officially live. Please complete your profile.',
          type: 'success',
          isRead: false
        },
        {
          userId: emp.userId,
          title: 'Manager Training Workshop',
          message: 'Reminder for all managers: Mandatory leadership workshop this Friday at 10 AM.',
          type: 'warning',
          isRead: false
        }
      );
    }
    await Notification.insertMany(notificationsToSeed);

    console.log('Projects seeded:', projects.length);
    console.log('Indian Dummy Data Seeded Successfully!');
    console.log('\n--- Login Credentials for Dummy Users ---');
    console.log('Password for all users below: Password@123');
    indianNames.forEach(p => console.log(`- ${p.role}: ${p.email}`));
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDatabase();
