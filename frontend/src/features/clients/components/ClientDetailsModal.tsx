import { X, Building2, Globe, Mail, Phone, MapPin, Circle } from 'lucide-react';
import type { Client } from '../types/client';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export default function ClientDetailsModal({ isOpen, onClose, client }: ClientDetailsModalProps) {
  if (!isOpen || !client) return null;

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
            <div className="h-full w-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-inner">
              <Building2 className="h-12 w-12" />
            </div>
          </div>
        </div>

        <div className="pt-16 px-8 pb-8 overflow-y-auto">
          {/* Profile Header section */}
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-3">{client.companyName}</h1>
            
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                ${client.status === 'Active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}
              `}>
                <Circle className="h-2 w-2 fill-current" />
                {client.status || 'Active'}
              </div>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium border border-border/50">
                {client.industry}
              </div>
              
              {client.website && (
                <a href={`https://${client.website}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-full text-xs font-medium border border-primary/20">
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Primary Contact */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Primary Contact</h3>
              
              <div className="flex items-center gap-3 p-3 bg-background rounded-xl border shadow-sm">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg"><Mail className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Email Address</p>
                  <p className="text-sm font-medium text-foreground truncate">{client.primaryContact?.email || client.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-xl border shadow-sm">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg"><Phone className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Phone Number</p>
                  <p className="text-sm font-medium text-foreground truncate">{client.primaryContact?.phone || client.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Company Details</h3>
              
              <div className="flex items-center gap-3 p-3 bg-background rounded-xl border shadow-sm">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg"><MapPin className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Address</p>
                  <p className="text-sm font-medium text-foreground truncate">{client.address || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-xl border shadow-sm">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg"><Building2 className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Contact Person</p>
                  <p className="text-sm font-medium text-foreground truncate">{client.primaryContact?.name || client.contactPerson || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
