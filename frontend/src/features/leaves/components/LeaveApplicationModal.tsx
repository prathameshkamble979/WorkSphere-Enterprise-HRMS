import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { applyLeave } from '../api/leaveService';

interface LeaveApplicationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function LeaveApplicationModal({ onClose, onSuccess }: LeaveApplicationModalProps) {
  const [leaveType, setLeaveType] = useState('Vacation');
  const [duration, setDuration] = useState('Full Day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate || (duration === 'Full Day' && !endDate) || !reason) {
      setError('Please fill in all required fields.');
      return;
    }

    if (duration === 'Full Day' && new Date(startDate) > new Date(endDate)) {
      setError('End date cannot be before start date.');
      return;
    }

    try {
      setIsSubmitting(true);
      await applyLeave({
        leaveType,
        duration,
        startDate,
        endDate: duration === 'Full Day' ? endDate : startDate,
        reason,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to submit leave application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-border scale-in-center">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
            Apply for Leave
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            >
              <option value="Vacation">Vacation</option>
              <option value="Sick">Sick Leave</option>
              <option value="Maternity">Maternity Leave</option>
              <option value="Paternity">Paternity Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Duration</label>
            <div className="flex bg-background border border-border p-1 rounded-xl">
              {['Full Day', 'First Half', 'Second Half'].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${duration === d ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className={`grid ${duration === 'Full Day' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{duration === 'Full Day' ? 'Start Date' : 'Date'}</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            {duration === 'Full Day' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">End Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Reason</label>
            <div className="relative">
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly explain the reason for your leave..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
              />
              <FileText className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 shadow-md hover:shadow-lg active:scale-95"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
