import { useEffect, useState } from 'react';
import { Search, Plus, Building2, Globe, Phone, Mail } from 'lucide-react';
import { getClients, deleteClient } from '../api/clientService';
import type { Client } from '../types/client';
import ClientModal from '../components/ClientModal';
import ClientDetailsModal from '../components/ClientDetailsModal';
import { Edit, Trash2 } from 'lucide-react';
import RoleGuard from '../../../shared/components/RoleGuard';

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsModalOpen(true);
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await getClients(page, 10, search);
      if (res.success && Array.isArray(res.data)) {
        setClients(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalRecords(res.pagination.total);
        }
      }
    } catch (error) {
      console.error('Failed to fetch clients', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(id);
        fetchClients();
      } catch (error) {
        console.error('Failed to delete client', error);
        alert('Failed to delete client');
      }
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchClients();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search]);

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage partner companies and accounts.</p>
        </div>
        <RoleGuard allowedRoles={['Admin', 'Manager']}>
          <button 
            onClick={handleAdd}
            className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </button>
        </RoleGuard>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-2 rounded-2xl border shadow-sm">
        <div className="relative w-full sm:w-96 flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients or industry..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border-none bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-2xl border p-6 shadow-sm animate-pulse">
              <div className="h-12 w-12 bg-muted rounded-xl mb-4"></div>
              <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
              <div className="space-y-3 border-t pt-4">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          ))
        ) : clients.length === 0 ? (
          <div className="col-span-full py-16 text-center border rounded-2xl bg-card border-dashed">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Building2 className="h-8 w-8 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No clients found</h3>
              <p className="mt-1">Add your first client to start tracking projects.</p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-4 text-primary font-medium hover:underline">
                  Clear search
                </button>
              )}
            </div>
          </div>
        ) : (
          clients.map((client) => (
            <div 
              key={client._id} 
              className="bg-card rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden cursor-pointer"
              onClick={() => handleViewDetails(client)}
            >
              <RoleGuard allowedRoles={['Admin', 'Manager']}>
                <div className="absolute top-4 right-4 opacity-100 transition-opacity flex items-center gap-1 bg-background/80 backdrop-blur-sm p-1 rounded-lg shadow-sm border">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(client); }}
                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(client._id); }}
                    className="p-1.5 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </RoleGuard>
              
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-primary/20 to-primary/10 flex items-center justify-center text-primary mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              
              <h3 className="text-lg font-bold text-foreground mb-1">{client.companyName}</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground mb-4">
                {client.industry}
              </span>

              <div className="space-y-3 border-t border-border pt-4 mt-2 text-sm text-muted-foreground">
                {client.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a href={`https://${client.website}`} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors truncate">
                      {client.website}
                    </a>
                  </div>
                )}
                {client.primaryContact && (
                  <>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{client.primaryContact.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{client.primaryContact.phone}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && clients.length > 0 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{totalRecords}</span> total clients
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

      <ClientModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchClients()}
        client={selectedClient}
      />
      <ClientDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        client={selectedClient}
      />
    </div>
  );
}
