import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './features/users/models/User';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/worksphere');
    console.log('Connected to MongoDB...');

    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    // Create the user, bypassing the pre-save hook since we hash it here
    // Wait, the pre-save hook in User model hashes it if it's modified.
    // So we can just pass the plain text password and let the pre-save hook hash it!
    const user = await User.create({
      name: 'Admin User',
      email: 'admin@worksphere.dev',
      passwordHash: 'Admin@123', // Pre-save hook will hash this!
      role: 'Admin',
      isActive: true
    });

    console.log('Admin account created successfully!', user.email, hashedPassword);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
