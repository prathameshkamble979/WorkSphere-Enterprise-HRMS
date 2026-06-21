import mongoose, { Document, Schema } from 'mongoose';

export interface IClient extends Document {
  companyName: string;
  industry: string;
  website?: string;
  address?: string;
  status?: string;
  primaryContact?: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
}

const clientSchema = new Schema<IClient>(
  {
    companyName: { type: String, required: true },
    industry: { type: String, required: true },
    website: { type: String },
    address: { type: String },
    status: { type: String, default: 'Active' },
    primaryContact: {
      name: String,
      email: String,
      phone: String,
      position: String,
    },
  },
  { timestamps: true }
);

export const Client = mongoose.model<IClient>('Client', clientSchema);
