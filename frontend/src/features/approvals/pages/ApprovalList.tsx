import { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, Clock, FileText, Plus } from 'lucide-react';
import { getApprovals, updateApprovalStatus } from '../api/approvalService';
import { useAuth } from '../../../shared/context/AuthContext';
import NewApprovalModal from '../components/NewApprovalModal';
import ReviewApprovalModal from '../components/ReviewApprovalModal';
import type { Approval } from '../types/approval';

export default function ApprovalList() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [rejectingApprovalId, setRejectingApprovalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  const { user } = useAuth();
  const isEmployee = user && user.role === 'Employee';

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await getApprovals(page, 10, search, statusFilter);
      if (res.success && Array.isArray(res.data)) {
        setApprovals(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalRecords(res.pagination.total);
        }
      }
    } catch (error) {
      console.error('Failed to fetch approvals', error);
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchApprovals();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search, statusFilter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (newStatus === 'Rejected') {
      setRejectingApprovalId(id);
      setRejectionReason('');
      setRejectionError('');
      return; 
    }
    
    try {
      await updateApprovalStatus(id, newStatus, '');
      fetchApprovals();
    } catch (error) {
      console.error('Failed to update approval status', error);
      alert('Failed to update approval status');
    }
  };

  const confirmRejection = async () => {
    if (!rejectionReason.trim()) {
      setRejectionError('Please provide a reason for rejection.');
      return;
    }
    try {
      await updateApprovalStatus(rejectingApprovalId!, 'Rejected', rejectionReason);
      setRejectingApprovalId(null);
      setRejectionReason('');
      fetchApprovals();
    } catch (error) {
      console.error('Failed to reject', error);
      setRejectionError('Failed to update status');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Approvals</h1>
          <p className="text-muted-foreground mt-1">Review and manage organizational requests.</p>
        </div>
        {isEmployee && (
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-2 rounded-2xl border shadow-sm">
        <div className="relative w-full sm:w-96 flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search requests..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border-none bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
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

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Request</th>
                <th className="px-6 py-4">Requester</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
                      Loading approvals...
                    </div>
                  </td>
                </tr>
              ) : approvals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="bg-muted p-4 rounded-full mb-4">
                        <FileText className="h-8 w-8 opacity-50" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">No approvals found</h3>
                      <p className="mt-1">Everything is caught up.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                approvals.map((app) => (
                  <tr 
                    key={app._id} 
                    onClick={() => setSelectedApproval(app)}
                    className="group hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{app.title}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">{app.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-foreground">{app.requesterId?.email || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-muted-foreground">{new Date(app.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      {!isEmployee ? (
                        <div className="relative inline-flex items-center">
                          <div className={`absolute left-2.5 pointer-events-none flex items-center justify-center 
                            ${app.status === 'Approved' ? 'text-success' : ''}
                            ${app.status === 'Pending' ? 'text-warning' : ''}
                            ${app.status === 'Rejected' ? 'text-danger' : ''}
                          `}>
                            {app.status === 'Approved' && <CheckCircle className="h-3 w-3" />}
                            {app.status === 'Pending' && <Clock className="h-3 w-3" />}
                            {app.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                          </div>
                          <select
                            value={app.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                            className={`appearance-none cursor-pointer outline-none pl-7 pr-6 py-1 rounded-full text-xs font-semibold transition-colors border hover:border-border/50
                              ${app.status === 'Approved' ? 'bg-success/10 text-success border-success/20' : ''}
                              ${app.status === 'Pending' ? 'bg-warning/10 text-warning border-warning/20' : ''}
                              ${app.status === 'Rejected' ? 'bg-danger/10 text-danger border-danger/20' : ''}
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
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                          ${app.status === 'Approved' ? 'bg-success/10 text-success' : ''}
                          ${app.status === 'Pending' ? 'bg-warning/10 text-warning' : ''}
                          ${app.status === 'Rejected' ? 'bg-danger/10 text-danger' : ''}
                        `}>
                          {app.status === 'Approved' && <CheckCircle className="h-3 w-3" />}
                          {app.status === 'Pending' && <Clock className="h-3 w-3" />}
                          {app.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                          {app.status}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApproval(app);
                        }}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && approvals.length > 0 && (
          <div className="px-6 py-4 border-t flex items-center justify-between bg-muted/20">
            <span className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * 10, totalRecords)}</span> of <span className="font-medium text-foreground">{totalRecords}</span> results
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
      </div>

      <NewApprovalModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
        onSuccess={fetchApprovals} 
      />

      <ReviewApprovalModal 
        approval={selectedApproval} 
        isOpen={!!selectedApproval} 
        onClose={() => setSelectedApproval(null)} 
        onSuccess={fetchApprovals} 
      />

      {rejectingApprovalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 fade-in">
          <div className="bg-background w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col border border-border/50">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground">Rejection Reason</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Please provide a reason for rejecting this request.</p>
              <textarea 
                className={`w-full p-3 rounded-xl border bg-background focus:ring-2 outline-none transition-all resize-none
                  ${rejectionError ? 'border-danger focus:ring-danger/20' : 'focus:border-primary focus:ring-primary/20'}
                `}
                rows={3}
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (rejectionError) setRejectionError('');
                }}
                placeholder="Reason..."
              />
              {rejectionError && <p className="text-danger text-xs font-medium mt-1.5">{rejectionError}</p>}
            </div>
            <div className="p-4 border-t bg-muted/20 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setRejectingApprovalId(null);
                  setRejectionReason('');
                  setRejectionError('');
                }}
                className="px-6 py-2 rounded-full border bg-background text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRejection}
                className="px-6 py-2 rounded-full bg-danger text-white text-sm font-medium hover:bg-danger/90 transition-colors shadow-sm"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
