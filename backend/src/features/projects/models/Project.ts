import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  clientId: Types.ObjectId;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
  startDate: Date;
  deadline: Date;
  teamMembers: Types.ObjectId[];
  priority: 'Low' | 'Medium' | 'High';
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    status: { type: String, enum: ['Planning', 'In Progress', 'On Hold', 'Completed'], default: 'Planning' },
    startDate: { type: Date, required: true },
    deadline: { type: Date, required: true },
    teamMembers: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', projectSchema);
