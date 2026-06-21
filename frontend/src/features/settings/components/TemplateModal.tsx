import React, { useState } from 'react';
import { X, Save, HelpCircle } from 'lucide-react';
import { templateService, type INotificationTemplate } from '../api/templateService';

interface TemplateModalProps {
  template?: INotificationTemplate;
  onClose: () => void;
  onSave: () => void;
}

const EVENT_TRIGGERS = [
  { value: 'NEW_HIRE', label: 'New Hire' },
  { value: 'LEAVE_APPROVED', label: 'Leave Approved' },
  { value: 'PAYROLL_COMPLETED', label: 'Payroll Completed' },
  { value: 'PROJECT_MILESTONE', label: 'Project Milestone' }
];

const TYPES = ['Slack', 'GoogleCalendar', 'Email'];

const VARIABLES: Record<string, { var: string; desc: string }[]> = {
  NEW_HIRE: [
    { var: '{{firstName}}', desc: 'Employee first name' },
    { var: '{{lastName}}', desc: 'Employee last name' },
    { var: '{{role}}', desc: 'Job role/title' },
    { var: '{{email}}', desc: 'Work email' },
    { var: '{{phone}}', desc: 'Phone number' }
  ],
  LEAVE_APPROVED: [
    { var: '{{firstName}}', desc: 'Employee first name' },
    { var: '{{lastName}}', desc: 'Employee last name' },
    { var: '{{leaveType}}', desc: 'Type of leave (Sick, Casual)' },
    { var: '{{reason}}', desc: 'Provided reason' }
  ],
  PAYROLL_COMPLETED: [
    { var: '{{month}}', desc: 'Payroll month' },
    { var: '{{year}}', desc: 'Payroll year' }
  ],
  PROJECT_MILESTONE: [
    { var: '{{projectName}}', desc: 'Name of the project' },
    { var: '{{status}}', desc: 'Current status' }
  ]
};

export default function TemplateModal({ template, onClose, onSave }: TemplateModalProps) {
  const [formData, setFormData] = useState<Partial<INotificationTemplate>>(
    template || {
      name: '',
      type: 'Slack',
      eventTrigger: 'NEW_HIRE',
      subject: '',
      body: '',
      isActive: true,
      channel: ''
    }
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (template?._id) {
        await templateService.updateTemplate(template._id, formData);
      } else {
        await templateService.createTemplate(formData);
      }
      onSave();
    } catch (error) {
      alert((error as any).response?.data?.error?.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInsertVariable = (variable: string) => {
    setFormData((prev) => ({
      ...prev,
      body: (prev.body || '') + variable
    }));
  };

  const activeVariables = VARIABLES[formData.eventTrigger || 'NEW_HIRE'] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm fade-in p-4">
      <div className="bg-background w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-xl font-bold text-foreground">
            {template ? 'Edit Template' : 'Create Template'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="template-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4 items-start">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="e.g. Default Slack Welcome"
                />
              </div>
              
              <div className="flex items-center mt-8 ml-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive || false}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary bg-muted/30 border-border/50 rounded focus:ring-primary/20 focus:ring-2 transition-all cursor-pointer"
                  />
                  <span className="text-sm font-medium text-foreground">Set as Active</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Platform Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Email' | 'Slack' | 'GoogleCalendar' })}
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Event Trigger</label>
                <select
                  value={formData.eventTrigger}
                  onChange={(e) => setFormData({ ...formData, eventTrigger: e.target.value as 'NEW_HIRE' | 'LEAVE_APPROVED' | 'PAYROLL_COMPLETED' | 'PROJECT_MILESTONE' })}
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                  {EVENT_TRIGGERS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {(formData.type === 'Slack') && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Override Channel (Optional)</label>
                <input
                  type="text"
                  value={formData.channel || ''}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm font-mono focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="#announcements"
                />
              </div>
            )}

            {(formData.type === 'Email' || formData.type === 'GoogleCalendar') && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {formData.type === 'GoogleCalendar' ? 'Event Title *' : 'Subject *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm font-mono focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="e.g. Welcome {{firstName}}!"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Template Body *</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <textarea
                    required
                    value={formData.body || ''}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="w-full min-h-[160px] p-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm font-mono focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y"
                    placeholder="Type your message here..."
                  />
                </div>
                
                <div className="col-span-1 bg-muted/20 rounded-xl border border-border/50 p-4 overflow-y-auto max-h-[160px]">
                  <div className="flex items-center text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                    Variables
                  </div>
                  <div className="space-y-2">
                    {activeVariables.map((v) => (
                      <div 
                        key={v.var} 
                        onClick={() => handleInsertVariable(v.var)}
                        className="group cursor-pointer p-2 rounded-lg bg-background border border-border/50 hover:border-primary/50 hover:shadow-sm transition-all"
                      >
                        <div className="font-mono text-xs font-semibold text-primary mb-1">{v.var}</div>
                        <div className="text-[10px] text-muted-foreground leading-tight">{v.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-border/50 bg-muted/10 flex justify-end space-x-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="template-form"
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center">Loading...</span>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
