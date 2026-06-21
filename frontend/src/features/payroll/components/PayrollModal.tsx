import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { createPayrollRecord } from '../api/payrollService';
import { getEmployees } from '../../employees/api/employeeService';

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PayrollModal({ isOpen, onClose, onSuccess }: PayrollModalProps) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    baseSalary: '',
    bonus: '0',
    deductions: '0',
    status: 'Pending'
  });

  useEffect(() => {
    if (isOpen) {
      getEmployees().then(res => {
        if (res.success) setEmployees(res.data as any[]);
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPayrollRecord({
        ...formData,
        year: Number(formData.year),
        baseSalary: Number(formData.baseSalary),
        bonus: Number(formData.bonus),
        deductions: Number(formData.deductions)
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create payroll', error);
      alert('Failed to process payroll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 fade-in">
      <div className="bg-background w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col border border-border/50 max-h-[90vh]">
        
        <div className="flex items-center justify-between p-6 border-b bg-muted/10">
          <div>
            <h2 className="text-xl font-bold text-foreground">Process Payroll</h2>
            <p className="text-sm text-muted-foreground mt-1">Create a new payroll record for an employee</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          <form id="payroll-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Employee</label>
              <select 
                required
                className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Month</label>
                <select 
                  required
                  className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.month}
                  onChange={(e) => setFormData({...formData, month: e.target.value})}
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Year</label>
                <input 
                  type="number"
                  required
                  className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: Number(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Base Salary (₹)</label>
              <input 
                type="number"
                required
                min="0"
                className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={formData.baseSalary}
                onChange={(e) => setFormData({...formData, baseSalary: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-success">Bonus (₹)</label>
                <input 
                  type="number"
                  min="0"
                  className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-success/20 focus:border-success outline-none transition-all"
                  value={formData.bonus}
                  onChange={(e) => setFormData({...formData, bonus: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-danger">Deductions (₹)</label>
                <input 
                  type="number"
                  min="0"
                  className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-danger/20 focus:border-danger outline-none transition-all"
                  value={formData.deductions}
                  onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Status</label>
              <select 
                required
                className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Pending">Pending</option>
                <option value="Processed">Processed</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50 text-center">
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Calculated Net Pay</span>
              <span className="text-2xl font-bold text-foreground">
                ₹{((Number(formData.baseSalary) || 0) + (Number(formData.bonus) || 0) - (Number(formData.deductions) || 0)).toLocaleString('en-IN')}
              </span>
            </div>
          </form>
        </div>

        <div className="p-6 border-t bg-muted/20 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-medium border bg-background hover:bg-muted transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="payroll-form"
            disabled={loading}
            className="px-6 py-2.5 rounded-full font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm flex items-center shadow-sm disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Payroll
          </button>
        </div>
      </div>
    </div>
  );
}
