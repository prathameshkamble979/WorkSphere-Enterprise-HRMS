import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILeave extends Document {
  employeeId: Types.ObjectId;
  leaveType: 'Sick' | 'Vacation' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Other';
  duration: 'Full Day' | 'First Half' | 'Second Half';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: Types.ObjectId;
  rejectionReason?: string;
}

const leaveSchema = new Schema<ILeave>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: { type: String, enum: ['Sick', 'Vacation', 'Maternity', 'Paternity', 'Unpaid', 'Other'], required: true },
    duration: { type: String, enum: ['Full Day', 'First Half', 'Second Half'], default: 'Full Day' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export const Leave = mongoose.model<ILeave>('Leave', leaveSchema);
