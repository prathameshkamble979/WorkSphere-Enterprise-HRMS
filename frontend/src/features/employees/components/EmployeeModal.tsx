import { useState, useEffect } from 'react';
import { X, Save, Loader2, Upload, User as UserIcon } from 'lucide-react';
import { createEmployee, updateEmployee } from '../api/employeeService';
import { uploadFile } from '../../../shared/api/uploadService';
import { getImageUrl } from '../../../shared/utils/imageUrl';
import type { Employee } from '../types/employee';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee?: Employee | null;
}

export default function EmployeeModal({ isOpen, onClose, onSuccess, employee }: EmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Employee',
    employeeId: '',
    phone: '',
    status: 'Active',
    profilePicture: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.userId?.email || '',
        password: '',
        role: employee.userId?.role || 'Employee',
        employeeId: employee.employeeId,
        phone: employee.phone || '',
        status: employee.status,
        profilePicture: employee.profilePicture || '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'Employee',
        employeeId: 'EMP' + Math.floor(Math.random() * 10000),
        phone: '',
        status: 'Active',
        profilePicture: '',
      });
    }
    setError(null);
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (employee) {
        // Edit mode
        await updateEmployee(employee._id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          status: formData.status,
          profilePicture: formData.profilePicture,
          role: formData.role,
        });
      } else {
        // Create mode
        await createEmployee(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm fade-in p-4">
      <div className="bg-background w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{employee ? 'Edit Employee' : 'Add New Employee'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-danger/10 text-danger text-sm font-medium rounded-xl border border-danger/20">
              {error}
            </div>
          )}

          <form id="employee-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex flex-col items-center justify-center space-y-4 mb-6">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full border-4 border-background shadow-md overflow-hidden bg-muted flex items-center justify-center relative">
                  {formData.profilePicture ? (
                    <img src={getImageUrl(formData.profilePicture)} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-10 w-10 text-muted-foreground opacity-50" />
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary/90 transition-colors">
                  <Upload className="h-4 w-4" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        try {
                          setUploadingImage(true);
                          const url = await uploadFile(e.target.files[0]);
                          setFormData(prev => ({ ...prev, profilePicture: url }));
                        } catch (err) {
                          setError('Failed to upload image');
                        } finally {
                          setUploadingImage(false);
                        }
                      }
                    }}
                  />
                </label>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Profile Picture</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">First Name *</label>
                <input
                  required
                  type="text"
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Last Name *</label>
                <input
                  required
                  type="text"
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email *</label>
                <input
                  required
                  disabled={!!employee}
                  type="email"
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50 disabled:hover:bg-muted/30"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {!employee && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Initial Password *</label>
                  <input
                    required
                    type="password"
                    className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Employee ID</label>
                <input
                  type="text"
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <input
                  type="text"
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role</label>
                <select
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="HR">HR</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t bg-muted/20 flex justify-end gap-3 mt-auto">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2 rounded-full font-medium border bg-background hover:bg-muted transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="employee-form"
            disabled={loading}
            className="px-6 py-2 rounded-full font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm flex items-center shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {employee ? 'Save Changes' : 'Create Employee'}
          </button>
        </div>

      </div>
    </div>
  );
}
