import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Users, Building2, FileText, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../api/dashboardService';
import type { DashboardStats } from '../api/dashboardService';

const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err: any) {
        console.error('Failed to fetch dashboard stats', err);
        setError(err.response?.data?.error?.message || 'Failed to fetch dashboard data. You might not have permission.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center space-y-4 min-h-[400px]">
        <div className="p-4 bg-danger/10 text-danger rounded-xl">
          <p className="font-medium text-center">{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 fade-in">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Analytics and key metrics for your workforce.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Employees', value: stats.totalEmployees, icon: <Users className="h-5 w-5 text-primary" />, link: '/employees' },
          { title: 'Active Employees', value: stats.activeEmployees, icon: <Activity className="h-5 w-5 text-success" />, link: '/employees' },
          { title: 'Total Clients', value: stats.totalClients, icon: <Building2 className="h-5 w-5 text-warning" />, link: '/clients' },
          { title: 'Pending Approvals', value: stats.pendingApprovalsCount, icon: <FileText className="h-5 w-5 text-danger" />, link: '/approvals' },
        ].map((kpi, idx) => (
          <div 
            key={idx} 
            onClick={() => navigate(kpi.link)}
            className="bg-card p-6 rounded-2xl border shadow-sm cursor-pointer hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{kpi.title}</span>
              <div className="p-2 bg-muted rounded-lg">{kpi.icon}</div>
            </div>
            <div className="text-3xl font-bold text-foreground">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Employee Growth Chart */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Employee Growth</h2>
          <div className="h-80 w-full min-h-[300px] min-w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.employeeGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="employees" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills Distribution */}
        <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-6">Skills Distribution</h2>
          <div className="h-64 w-full min-h-[250px] min-w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.departmentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.departmentDistribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Approval Status */}
        <div className="bg-card p-6 rounded-2xl border shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Approval Statuses</h2>
          <div className="h-64 w-full min-h-[250px] min-w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.approvalStats} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} width={80} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {stats.approvalStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.name === 'Approved' ? '#22C55E' : 
                      entry.name === 'Rejected' ? '#EF4444' : '#F59E0B'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-1 bg-card p-6 rounded-2xl border shadow-sm h-[400px] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-6">Recent Activities</h2>
          <div className="space-y-6">
            {stats.recentActivities.map((activity: any, idx: number) => (
              <div key={activity.id} className="flex gap-4 relative">
                {idx !== stats.recentActivities.length - 1 && (
                  <div className="absolute top-8 left-2.5 bottom-0 w-px bg-border -mb-6"></div>
                )}
                <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 ring-8 ring-card">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{activity.text}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
