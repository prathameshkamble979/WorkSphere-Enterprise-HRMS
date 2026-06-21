import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { createApproval } from '../api/approvalService';

interface NewApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewApprovalModal({ isOpen, onClose, onSuccess }: NewApprovalModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Leave',
    description: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createApproval(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create request', error);
      alert('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 fade-in">
      <div className="bg-background w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col border border-border/50 max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b bg-muted/10">
          <div>
            <h2 className="text-xl font-bold text-foreground">New Request</h2>
            <p className="text-sm text-muted-foreground mt-1">Submit a new request for approval</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          <form id="approval-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Request Title</label>
              <input 
                type="text"
                required
                placeholder="e.g., Q3 Marketing Budget, Sick Leave"
                className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Type</label>
              <select 
                required
                className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Leave">Leave</option>
                <option value="Expense">Expense</option>
                <option value="Promotion">Promotion</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Description / Justification</label>
              <textarea 
                required
                rows={4}
                placeholder="Provide detailed justification for this request..."
                className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t bg-muted/20 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full font-medium border bg-background hover:bg-muted transition-colors text-sm">
            Cancel
          </button>
          <button type="submit" form="approval-form" disabled={loading} className="px-6 py-2.5 rounded-full font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm flex items-center shadow-sm disabled:opacity-70">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}
