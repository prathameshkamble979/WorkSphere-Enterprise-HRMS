import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IApproval extends Document {
  requesterId: Types.ObjectId;
  type: 'Leave' | 'Expense' | 'Promotion' | 'Other';
  title: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewerId?: Types.ObjectId;
  comments?: string;
  attachments?: string[];
}

const approvalSchema = new Schema<IApproval>(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Leave', 'Expense', 'Promotion', 'Other'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
    comments: { type: String },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

export const Approval = mongoose.model<IApproval>('Approval', approvalSchema);
