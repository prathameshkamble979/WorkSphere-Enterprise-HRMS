import { useEffect, useState } from 'react';
import { Plus, DollarSign, Download, CircleCheck, CircleDashed, Filter } from 'lucide-react';
import { getPayrollRecords, updatePayrollStatus } from '../api/payrollService';
import { useAuth } from '../../../shared/context/AuthContext';
import PayrollModal from '../components/PayrollModal';
import type { Payroll } from '../types/payroll';

export default function PayrollList() {
  const [records, setRecords] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useAuth();
  const isHR = user && user.role === 'HR';

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await getPayrollRecords(page, 10, statusFilter, monthFilter, yearFilter);
      if (res.success && Array.isArray(res.data)) {
        setRecords(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalRecords(res.pagination.total);
        }
      }
    } catch (error) {
      console.error('Failed to fetch payroll records', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, statusFilter, monthFilter, yearFilter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updatePayrollStatus(id, newStatus);
      fetchRecords();
    } catch (error) {
      console.error('Failed to update payroll status', error);
      alert('Failed to update payroll status');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      alert("No records to export.");
      return;
    }
    
    const headers = ['Employee Name', 'Employee ID', 'Month', 'Year', 'Base Salary', 'Bonus', 'Deductions', 'Net Pay', 'Status'];
    const rows = records.map(r => [
      `${r.employeeId?.firstName || ''} ${r.employeeId?.lastName || ''}`,
      r.employeeId?.employeeId || 'EMP-XXXX',
      r.month,
      r.year,
      r.baseSalary,
      r.bonus,
      r.deductions,
      r.netPay,
      r.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Payroll_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-success/10 text-success border-success/20';
      case 'Processed': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <CircleCheck className="h-3 w-3 mr-1" />;
      default: return <CircleDashed className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payroll</h1>
          <p className="text-muted-foreground mt-1">Manage employee compensation, bonuses, and deductions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-6 py-2 shadow-sm border"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </button>
          {isHR && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Process Payroll
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-2 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto px-2">
          <Filter className="h-4 w-4 text-muted-foreground mr-1" />
          <select 
            className="h-10 px-4 rounded-xl border bg-background text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[120px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processed">Processed</option>
            <option value="Paid">Paid</option>
          </select>

          <select 
            className="h-10 px-4 rounded-xl border bg-background text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[120px]"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            <option value="">All Months</option>
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select 
            className="h-10 px-4 rounded-xl border bg-background text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[120px]"
            value={yearFilter || ''}
            onChange={(e) => setYearFilter(e.target.value ? parseInt(e.target.value) : undefined)}
          >
            <option value="">All Years</option>
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Base Salary</th>
                <th className="px-6 py-4">Add/Ded</th>
                <th className="px-6 py-4 font-bold text-foreground">Net Pay</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="border-b last:border-0 animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-5 bg-muted rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-muted rounded-full w-24"></div></td>
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-muted p-4 rounded-full mb-4">
                        <DollarSign className="h-8 w-8 opacity-50" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">No payroll records found</h3>
                      <p className="mt-1">Try adjusting your filters or process a new payroll batch.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {record.employeeId?.firstName?.charAt(0)}{record.employeeId?.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{record.employeeId?.firstName} {record.employeeId?.lastName}</p>
                          <p className="text-xs text-muted-foreground">{record.employeeId?.employeeId || 'EMP-XXXX'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-foreground">{record.month}</p>
                      <p className="text-xs text-muted-foreground">{record.year}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatCurrency(record.baseSalary)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        {record.bonus > 0 && <span className="text-success">+{formatCurrency(record.bonus)}</span>}
                        {record.deductions > 0 && <span className="text-danger">-{formatCurrency(record.deductions)}</span>}
                        {record.bonus === 0 && record.deductions === 0 && <span className="text-muted-foreground">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {formatCurrency(record.netPay)}
                    </td>
                    <td className="px-6 py-4">
                      {isHR ? (
                        <div className="relative inline-flex items-center">
                          <div className={`absolute left-2.5 pointer-events-none flex items-center justify-center ${getStatusColor(record.status).split(' ')[1]}`}>
                            {getStatusIcon(record.status)}
                          </div>
                          <select
                            value={record.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStatusUpdate(record._id, e.target.value)}
                            className={`appearance-none cursor-pointer outline-none pl-7 pr-6 py-1 rounded-full text-xs font-semibold transition-colors border hover:border-border/50
                              ${getStatusColor(record.status)}
                            `}
                          >
                            <option value="Pending" className="text-foreground bg-background">Pending</option>
                            <option value="Processed" className="text-foreground bg-background">Processed</option>
                            <option value="Paid" className="text-foreground bg-background">Paid</option>
                          </select>
                          <div className="absolute right-2 pointer-events-none opacity-50">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {record.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && records.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{totalRecords}</span> records
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

      <PayrollModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchRecords} 
      />
    </div>
  );
}
