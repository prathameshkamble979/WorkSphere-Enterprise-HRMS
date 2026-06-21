import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEmployee extends Document {
  userId: Types.ObjectId;
  employeeId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  departmentId?: Types.ObjectId;
  managerId?: Types.ObjectId;
  assignedClients: Types.ObjectId[];
  status: 'Active' | 'Inactive' | 'On Leave';
  joiningDate: Date;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  skills: string[];
  profilePicture?: string;
}

const employeeSchema = new Schema<IEmployee>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    managerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    assignedClients: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
    status: { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active' },
    joiningDate: { type: Date, required: true },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
    skills: [{
      type: String,
      trim: true
    }],
    profilePicture: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);
