import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './features/users/models/User';
import { Employee } from './features/employees/models/Employee';
import { Client } from './features/clients/models/Client';
import { Project } from './features/projects/models/Project';
import { Leave } from './features/leaves/models/Leave';
import { Payroll } from './features/payroll/models/Payroll';
import { Approval } from './features/approvals/models/Approval';

dotenv.config();

const indianNames = [
  { name: 'Aarav Patel', email: 'aarav.patel@worksphere.com', role: 'Employee', position: 'Frontend Developer', department: 'Engineering' },
  { name: 'Priya Singh', email: 'priya.singh@worksphere.com', role: 'Manager', position: 'Engineering Manager', department: 'Engineering' },
  { name: 'Rohan Sharma', email: 'rohan.sharma@worksphere.com', role: 'Employee', position: 'Backend Developer', department: 'Engineering' },
  { name: 'Anjali Desai', email: 'anjali.desai@worksphere.com', role: 'HR', position: 'HR Specialist', department: 'Human Resources' },
  { name: 'Vivek Kumar', email: 'vivek.kumar@worksphere.com', role: 'Employee', position: 'QA Engineer', department: 'Quality Assurance' },
  { name: 'Neha Gupta', email: 'neha.gupta@worksphere.com', role: 'Employee', position: 'UI/UX Designer', department: 'Design' },
  { name: 'Siddharth Mehta', email: 'siddharth.mehta@worksphere.com', role: 'Employee', position: 'DevOps Engineer', department: 'Engineering' },
  { name: 'Aditi Rao', email: 'aditi.rao@worksphere.com', role: 'Admin', position: 'System Administrator', department: 'IT' },
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
        passwordHash: 'dummy_hash', // We won't log in as them directly
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

    console.log('Projects seeded:', projects.length);
    console.log('Indian Dummy Data Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDatabase();
