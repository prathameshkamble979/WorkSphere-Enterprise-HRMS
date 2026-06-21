import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { createClient, updateClient } from '../api/clientService';
import type { Client } from '../types/client';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client?: Client | null;
}

export default function ClientModal({ isOpen, onClose, onSuccess, client }: ClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        companyName: client.companyName,
        industry: client.industry,
        contactPerson: client.primaryContact?.name || client.contactPerson || '',
        email: client.primaryContact?.email || client.email || '',
        phone: client.primaryContact?.phone || client.phone || '',
        address: client.address || '',
        status: client.status || 'Active',
      });
    } else {
      setFormData({
        companyName: '',
        industry: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        status: 'Active',
      });
    }
    setError(null);
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        companyName: formData.companyName,
        industry: formData.industry,
        address: formData.address,
        status: formData.status,
        primaryContact: {
          name: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          position: 'Contact'
        }
      };

      if (client) {
        // Edit mode
        await updateClient(client._id, payload);
      } else {
        // Create mode
        await createClient(payload);
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
          <h2 className="text-xl font-bold">{client ? 'Edit Client' : 'Add New Client'}</h2>
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

          <form id="client-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Company Name *</label>
              <input
                required
                type="text"
                className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Industry *</label>
                <input
                  required
                  type="text"
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Contact Person *</label>
                <input
                  required
                  type="text"
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email *</label>
                <input
                  required
                  type="email"
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <input
                  type="text"
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Address</label>
                <input
                  type="text"
                  className="w-full h-10 px-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
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
            form="client-form"
            disabled={loading}
            className="px-6 py-2 rounded-full font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm flex items-center shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {client ? 'Save Changes' : 'Create Client'}
          </button>
        </div>

      </div>
    </div>
  );
}
