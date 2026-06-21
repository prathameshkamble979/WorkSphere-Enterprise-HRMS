import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'Admin' | 'Manager' | 'HR' | 'Employee';
  isActive: boolean;
  refreshToken?: string;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  integrations?: {
    slack?: { connected: boolean; accessToken?: string; channelId?: string };
    google?: { connected: boolean; accessToken?: string; refreshToken?: string };
  };
  pushSubscriptions?: Array<{
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }>;
  profilePicture?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['Admin', 'Manager', 'HR', 'Employee'],
      default: 'Employee' 
    },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String },
    lastLogin: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
    },
    integrations: {
      slack: {
        connected: { type: Boolean, default: false },
        accessToken: { type: String },
        channelId: { type: String },
      },
      google: {
        connected: { type: Boolean, default: false },
        accessToken: { type: String },
        refreshToken: { type: String },
      }
    },
    pushSubscriptions: [{
      endpoint: { type: String, required: true },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true }
      }
    }]
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', userSchema);
