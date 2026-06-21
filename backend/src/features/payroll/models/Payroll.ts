import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPayroll extends Document {
  employeeId: Types.ObjectId;
  month: string;
  year: number;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: 'Pending' | 'Processed' | 'Paid';
  paymentDate?: Date;
}

const payrollSchema = new Schema<IPayroll>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    baseSalary: { type: Number, required: true },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netPay: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Processed', 'Paid'], default: 'Pending' },
    paymentDate: { type: Date },
  },
  { timestamps: true }
);

// Pre-save hook to calculate net pay automatically
payrollSchema.pre('save', function () {
  if (this.isModified('baseSalary') || this.isModified('bonus') || this.isModified('deductions')) {
    this.netPay = this.baseSalary + this.bonus - this.deductions;
  }
});

export const Payroll = mongoose.model<IPayroll>('Payroll', payrollSchema);
