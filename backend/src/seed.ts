import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './features/users/models/User';
import { Employee } from './features/employees/models/Employee';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});

    console.log('Cleared existing users and employees.');

    const adminUser = new User({
      name: 'System Admin',
      email: 'admin@worksphere.dev',
      passwordHash: 'Admin@123',
      role: 'Admin',
      isActive: true,
    });

    const managerUser = new User({
      name: 'Project Manager',
      email: 'manager@worksphere.dev',
      passwordHash: 'Admin@123',
      role: 'Manager',
      isActive: true,
    });

    const employeeUser = new User({
      name: 'John Doe',
      email: 'employee@worksphere.dev',
      passwordHash: 'Admin@123',
      role: 'Employee',
      isActive: true,
    });

    const hrUser = new User({
      name: 'HR Manager',
      email: 'hr@worksphere.dev',
      passwordHash: 'Admin@123',
      role: 'HR',
      isActive: true,
    });

    await adminUser.save();
    await managerUser.save();
    await hrUser.save();
    await employeeUser.save();

    await Employee.create([
      {
        userId: adminUser._id,
        employeeId: 'WS-001',
        firstName: 'System',
        lastName: 'Admin',
        status: 'Active',
        joiningDate: new Date(),
        assignedClients: [],
        skills: ['Management', 'Strategy'],
      },
      {
        userId: managerUser._id,
        employeeId: 'WS-002',
        firstName: 'Project',
        lastName: 'Manager',
        status: 'Active',
        joiningDate: new Date(),
        assignedClients: [],
        skills: ['Agile', 'Scrum'],
      },
      {
        userId: hrUser._id,
        employeeId: 'WS-003',
        firstName: 'HR',
        lastName: 'Manager',
        status: 'Active',
        joiningDate: new Date(),
        assignedClients: [],
        skills: ['Recruitment', 'Payroll'],
      },
      {
        userId: employeeUser._id,
        employeeId: 'WS-004',
        firstName: 'John',
        lastName: 'Doe',
        status: 'Active',
        joiningDate: new Date(),
        assignedClients: [],
        skills: ['React', 'Node.js'],
      },
    ]);

    console.log('Database successfully seeded with demo credentials!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
