import { useEffect, useState } from 'react';
import { Plus, Umbrella, HeartPulse, Clock, FileWarning, CheckCircle2, XCircle, X } from 'lucide-react';
import { getLeaves, updateLeaveStatus } from '../api/leaveService';
import RoleGuard from '../../../shared/components/RoleGuard';
import { useAuth } from '../../../shared/context/AuthContext';
import LeaveApplicationModal from '../components/LeaveApplicationModal';
import type { Leave } from '../types/leave';

export default function LeaveList() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [rejectingLeaveId, setRejectingLeaveId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const [showApplyModal, setShowApplyModal] = useState(false);

  const { user } = useAuth();
  const isAdminOrManager = user && ['Admin', 'Manager', 'HR'].includes(user.role);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await getLeaves(page, 10, statusFilter, typeFilter);
      if (res.success && Array.isArray(res.data)) {
        setLeaves(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalRecords(res.pagination.total);
        }
      }
    } catch (error) {
      console.error('Failed to fetch leaves', error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leaveId: string, newStatus: string, reason?: string) => {
    if (newStatus === 'Rejected' && !reason) {
      setRejectingLeaveId(leaveId);
      setRejectionReason('');
      setRejectError('');
      return;
    }
    
    try {
      await updateLeaveStatus(leaveId, newStatus, reason);
      fetchLeaves();
    } catch (error) {
      console.error('Failed to update leave status', error);
      alert('Failed to update leave status');
    }
  };

  const submitRejection = () => {
    if (!rejectionReason.trim()) {
      setRejectError("A rejection reason is required.");
      return;
    }
    if (rejectingLeaveId) {
      handleStatusUpdate(rejectingLeaveId, 'Rejected', rejectionReason);
      setRejectingLeaveId(null);
      setRejectError('');
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLeaves();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, statusFilter, typeFilter]);

  const getLeaveIcon = (type: string) => {
    switch (type) {
      case 'Sick': return <HeartPulse className="h-5 w-5 text-danger" />;
      case 'Vacation': return <Umbrella className="h-5 w-5 text-primary" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Leave Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage time-off requests.</p>
        </div>
        <RoleGuard allowedRoles={['Employee']}>
          <button 
            onClick={() => setShowApplyModal(true)}
            className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Apply for Leave
          </button>
        </RoleGuard>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-2 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
          <select 
            className="h-10 px-4 rounded-xl border bg-background text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Leave Types</option>
            <option value="Sick">Sick Leave</option>
            <option value="Vacation">Vacation</option>
            <option value="Maternity">Maternity</option>
            <option value="Paternity">Paternity</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Other">Other</option>
          </select>

          <select 
            className="h-10 px-4 rounded-xl border bg-background text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-2xl border p-6 shadow-sm animate-pulse">
              <div className="flex justify-between items-center mb-4">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="h-6 w-20 bg-muted rounded-full"></div>
              </div>
              <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-12 bg-muted rounded w-full mt-4"></div>
            </div>
          ))
        ) : leaves.length === 0 ? (
          <div className="col-span-full py-16 text-center border rounded-2xl bg-card border-dashed">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <div className="bg-muted p-4 rounded-full mb-4">
                <FileWarning className="h-8 w-8 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No leave records</h3>
              <p className="mt-1">There are no leave requests matching your criteria.</p>
            </div>
          </div>
        ) : (
          leaves.map((leave) => (
            <div key={leave._id} className="bg-card rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
                    {getLeaveIcon(leave.leaveType)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{leave.leaveType}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(leave.startDate).toLocaleDateString()}
                      {leave.startDate !== leave.endDate && ` - ${new Date(leave.endDate).toLocaleDateString()}`}
                      {leave.duration && leave.duration !== 'Full Day' && ` (${leave.duration})`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {isAdminOrManager ? (
                    <div className="relative inline-flex items-center">
                      <div className={`absolute left-2.5 h-3 w-3 pointer-events-none flex items-center justify-center
                        ${leave.status === 'Approved' ? 'text-success' : ''}
                        ${leave.status === 'Pending' ? 'text-warning' : ''}
                        ${leave.status === 'Rejected' ? 'text-danger' : ''}
                      `}>
                        {leave.status === 'Approved' && <CheckCircle2 className="h-full w-full" />}
                        {leave.status === 'Pending' && <Clock className="h-full w-full" />}
                        {leave.status === 'Rejected' && <XCircle className="h-full w-full" />}
                      </div>
                      <select
                        value={leave.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusUpdate(leave._id, e.target.value)}
                        className={`appearance-none cursor-pointer outline-none pl-7 pr-6 py-1 rounded-full text-xs font-semibold transition-colors border border-transparent hover:border-border/50
                          ${leave.status === 'Approved' ? 'bg-success/10 text-success' : ''}
                          ${leave.status === 'Pending' ? 'bg-warning/10 text-warning' : ''}
                          ${leave.status === 'Rejected' ? 'bg-danger/10 text-danger' : ''}
                        `}
                      >
                        <option value="Pending" className="text-foreground bg-background">Pending</option>
                        <option value="Approved" className="text-foreground bg-background">Approved</option>
                        <option value="Rejected" className="text-foreground bg-background">Rejected</option>
                      </select>
                      <div className="absolute right-2 pointer-events-none opacity-50">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  ) : (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                      ${leave.status === 'Approved' ? 'bg-success/10 text-success' : ''}
                      ${leave.status === 'Pending' ? 'bg-warning/10 text-warning' : ''}
                      ${leave.status === 'Rejected' ? 'bg-danger/10 text-danger' : ''}
                    `}>
                      {leave.status === 'Approved' && <CheckCircle2 className="h-3 w-3" />}
                      {leave.status === 'Pending' && <Clock className="h-3 w-3" />}
                      {leave.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                      {leave.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 mt-2">
                <div className="text-sm font-medium text-foreground mb-1">
                  {leave.employeeId?.firstName} {leave.employeeId?.lastName}
                </div>
                <div className="text-xs text-muted-foreground mb-4 font-mono">
                  {leave.employeeId?.employeeId || 'EMP-XXXX'}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 bg-muted/30 p-3 rounded-xl border border-border/50 italic">
                  "{leave.reason}"
                </p>
                {leave.status === 'Rejected' && leave.rejectionReason && (
                  <div className="mt-3 p-3 bg-danger/5 rounded-xl border border-danger/10">
                    <p className="text-xs font-semibold text-danger mb-1">Rejection Reason:</p>
                    <p className="text-sm text-danger/80">{leave.rejectionReason}</p>
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {!loading && leaves.length > 0 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{totalRecords}</span> leave requests
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Custom Rejection Modal */}
      {rejectingLeaveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm fade-in p-4">
          <div className="bg-background w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col border border-border/50">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-danger flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Reject Leave Request
              </h2>
              <button onClick={() => setRejectingLeaveId(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-4">Please provide a reason for rejecting this leave request. This will be visible to the employee.</p>
              <textarea
                className={`w-full p-3 rounded-xl border bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 outline-none transition-all resize-none
                  ${rejectError ? 'border-danger focus:ring-danger/20 focus:border-danger' : 'border-border/50 focus:ring-primary/20 focus:border-primary'}
                `}
                rows={4}
                placeholder="E.g., Not enough coverage during this period..."
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (rejectError) setRejectError('');
                }}
                autoFocus
              />
              {rejectError && <p className="text-xs text-danger mt-2 font-medium">{rejectError}</p>}
            </div>
            
            <div className="p-6 border-t bg-muted/20 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setRejectingLeaveId(null);
                  setRejectError('');
                }}
                className="px-6 py-2 rounded-full font-medium border bg-background hover:bg-muted transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={submitRejection}
                className="px-6 py-2 rounded-full font-medium bg-danger text-white hover:bg-danger/90 transition-colors text-sm shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {showApplyModal && (
        <LeaveApplicationModal
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setShowApplyModal(false);
            fetchLeaves();
          }}
        />
      )}
    </div>
  );
}
