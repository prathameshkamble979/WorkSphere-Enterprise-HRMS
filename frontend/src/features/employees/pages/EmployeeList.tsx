import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Mail, Building, Circle, Briefcase } from 'lucide-react';
import { getEmployees, deleteEmployee } from '../api/employeeService';
import { getImageUrl } from '../../../shared/utils/imageUrl';
import type { Employee } from '../types/employee';
import EmployeeModal from '../components/EmployeeModal';
import EmployeeDetailsModal from '../components/EmployeeDetailsModal';
import RoleGuard from '../../../shared/components/RoleGuard';

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await getEmployees(page, 10, search, statusFilter);
      if (res.success && Array.isArray(res.data)) {
        setEmployees(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalRecords(res.pagination.total);
        }
      }
    } catch (error) {
      console.error('Failed to fetch employees', error);
      // Fallback data for preview purposes if API is unreachable
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee? This will also delete their login account.')) {
      try {
        await deleteEmployee(id);
        fetchEmployees();
      } catch (error) {
        console.error('Failed to delete employee', error);
        alert('Failed to delete employee');
      }
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleRowClick = (employee: Employee) => {
    setViewEmployee(employee);
    setIsDetailsOpen(true);
  };

  useEffect(() => {
    // Add a small debounce for search
    const delayDebounceFn = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search, statusFilter]);

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 fade-in">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage your workforce, roles, and profiles.</p>
        </div>
        <RoleGuard allowedRoles={['Admin', 'HR']}>
          <button 
            onClick={handleAdd}
            className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </button>
        </RoleGuard>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-2 rounded-2xl border shadow-sm">
        <div className="relative w-full sm:w-96 flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
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
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Department</th>
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
                      Loading employees...
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="bg-muted p-4 rounded-full mb-4">
                        <Briefcase className="h-8 w-8 opacity-50" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">No employees found</h3>
                      <p className="mt-1">We couldn't find any records matching your criteria.</p>
                      {(search || statusFilter) && (
                        <button 
                          onClick={() => { setSearch(''); setStatusFilter(''); }}
                          className="mt-4 text-primary font-medium hover:underline"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr 
                    key={emp._id} 
                    className="group hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(emp)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {emp.profilePicture ? (
                          <div className="h-10 w-10 shrink-0 rounded-full bg-muted border overflow-hidden">
                            <img src={getImageUrl(emp.profilePicture)} alt="Profile" className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                            {emp.firstName?.charAt(0) || ''}{emp.lastName?.charAt(0) || ''}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-foreground">{emp.firstName || ''} {emp.lastName || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground font-medium">{emp.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{emp.userId?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        Software Engineering
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${emp.status === 'Active' ? 'bg-success/10 text-success' : ''}
                        ${emp.status === 'On Leave' ? 'bg-warning/10 text-warning' : ''}
                        ${emp.status === 'Inactive' ? 'bg-danger/10 text-danger' : ''}
                      `}>
                        <Circle className="h-2 w-2 fill-current" />
                        {emp.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <RoleGuard allowedRoles={['Admin', 'HR', 'Manager']}>
                        <div className="opacity-100 transition-opacity flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(emp); }}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(emp._id); }}
                            className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </RoleGuard>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && employees.length > 0 && (
          <div className="px-6 py-4 border-t flex items-center justify-between bg-muted/20">
            <span className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * 10, totalRecords)}</span> of <span className="font-medium text-foreground">{totalRecords}</span> results
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <EmployeeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchEmployees()}
        employee={selectedEmployee}
      />

      <EmployeeDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        employee={viewEmployee}
      />
    </div>
  );
}
