import { X, Mail, Phone, Briefcase, Calendar, Circle, Shield, Activity } from 'lucide-react';
import type { Employee } from '../types/employee';
import { getImageUrl } from '../../../shared/utils/imageUrl';

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export default function EmployeeDetailsModal({ isOpen, onClose, employee }: EmployeeDetailsModalProps) {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm fade-in p-4">
      <div className="bg-background w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-border/50">
        
        {/* Header Background */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-primary to-primary/80 relative">
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Avatar (Absolutely positioned to perfectly straddle the header line) */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 h-28 w-28 rounded-full border-[6px] border-background shadow-lg overflow-hidden flex items-center justify-center bg-background z-20">
            {employee.profilePicture ? (
              <img 
                src={getImageUrl(employee.profilePicture)} 
                alt="Profile" 
                className="h-full w-full object-cover" 
              />
            ) : (
              <div className="h-full w-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-inner">
                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="pt-16 px-8 pb-8 overflow-y-auto">
          {/* Profile Header section */}
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-3">{employee.firstName} {employee.lastName}</h1>
            
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                ${employee.status === 'Active' ? 'bg-success/10 text-success' : ''}
                ${employee.status === 'On Leave' ? 'bg-warning/10 text-warning' : ''}
                ${employee.status === 'Inactive' ? 'bg-danger/10 text-danger' : ''}
              `}>
                <Circle className="h-2 w-2 fill-current" />
                {employee.status}
              </div>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium border border-border/50">
                <Briefcase className="h-3.5 w-3.5" />
                {employee.employeeId}
              </div>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium border border-border/50">
                <Shield className="h-3.5 w-3.5" />
                {employee.userId?.role || 'Employee'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Contact Information</h3>
              
              <div className="flex items-center gap-3 p-3 bg-background rounded-xl border shadow-sm">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg"><Mail className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Email Address</p>
                  <p className="text-sm font-medium text-foreground truncate">{employee.userId?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-xl border shadow-sm">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg"><Phone className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Phone Number</p>
                  <p className="text-sm font-medium text-foreground truncate">{employee.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Employment Details</h3>
              
              <div className="flex items-center gap-3 p-3 bg-background rounded-xl border shadow-sm">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg"><Calendar className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Joining Date</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-xl border shadow-sm">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg"><Briefcase className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Department</p>
                  <p className="text-sm font-medium text-foreground truncate">Software Engineering</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 ml-1 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Skills & Expertise
            </h3>
            {employee.skills && employee.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1.5 bg-muted text-foreground font-medium text-xs rounded-lg border border-border/50 shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-muted/50 rounded-xl border border-dashed flex flex-col items-center justify-center text-center">
                <Activity className="h-6 w-6 text-muted-foreground mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground font-medium">No skills listed for this employee yet.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
