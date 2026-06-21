import { useState } from 'react';
import { X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { updateApprovalStatus } from '../api/approvalService';
import type { Approval } from '../types/approval';

interface ReviewApprovalModalProps {
  approval: Approval | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewApprovalModal({ approval, isOpen, onClose, onSuccess }: ReviewApprovalModalProps) {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !approval) return null;

  const handleAction = async (status: 'Approved' | 'Rejected') => {
    if (status === 'Rejected' && !comments.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await updateApprovalStatus(approval._id, status, comments);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update approval', err);
      setError('Failed to update approval status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 fade-in">
      <div className="bg-background w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col border border-border/50 max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b bg-muted/10">
          <div>
            <h2 className="text-xl font-bold text-foreground">Review Request</h2>
            <p className="text-sm text-muted-foreground mt-1">Review and process this organizational request.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 space-y-6">
          <div className="space-y-4 bg-muted/30 p-5 rounded-xl border">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</span>
              <p className="text-base font-medium text-foreground mt-1">{approval.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Requester</span>
                <p className="text-sm text-foreground mt-1">{approval.requesterId?.email}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</span>
                <p className="text-sm text-foreground mt-1">{approval.type}</p>
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Justification</span>
              <p className="text-sm text-foreground mt-1 bg-background p-3 rounded-lg border mt-2 whitespace-pre-wrap">{approval.description}</p>
            </div>
          </div>

          {approval.status === 'Pending' ? (
            <div>
              <label className="block text-sm font-semibold mb-1.5">Reviewer Comments</label>
              <textarea 
                rows={3}
                placeholder="Provide context for approval or reason for rejection (optional for approval)..."
                className={`w-full p-3 rounded-xl border bg-background focus:ring-2 outline-none transition-all resize-none
                  ${error ? 'border-danger focus:ring-danger/20' : 'focus:border-primary focus:ring-primary/20'}
                `}
                value={comments}
                onChange={(e) => {
                  setComments(e.target.value);
                  if (error) setError('');
                }}
              />
              {error && <p className="text-danger text-xs font-medium mt-1.5">{error}</p>}
            </div>
          ) : approval.comments ? (
            <div className={`p-4 rounded-xl border ${approval.status === 'Rejected' ? 'bg-danger/10 border-danger/20' : 'bg-success/10 border-success/20'}`}>
              <span className={`block text-xs font-bold uppercase tracking-wider mb-1 ${approval.status === 'Rejected' ? 'text-danger' : 'text-success'}`}>
                {approval.status === 'Rejected' ? 'Rejection Reason' : 'Reviewer Comments'}
              </span>
              <p className="text-sm font-medium">{approval.comments}</p>
            </div>
          ) : null}
        </div>

        <div className="p-6 border-t bg-muted/20 flex flex-col sm:flex-row justify-between gap-3 items-center">
          <button 
            type="button" 
            onClick={() => {
              setError('');
              setComments('');
              onClose();
            }} 
            className="w-full sm:w-auto px-6 py-2.5 rounded-full font-medium border bg-background hover:bg-muted transition-colors text-sm"
          >
            {approval.status === 'Pending' ? 'Cancel' : 'Close'}
          </button>
          
          {approval.status === 'Pending' && (
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => handleAction('Rejected')} 
                disabled={loading} 
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-full font-medium bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors text-sm flex items-center justify-center shadow-sm disabled:opacity-70"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button 
                onClick={() => handleAction('Approved')} 
                disabled={loading} 
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-full font-medium bg-success text-white hover:bg-success/90 transition-colors text-sm flex items-center justify-center shadow-sm disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Approve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
