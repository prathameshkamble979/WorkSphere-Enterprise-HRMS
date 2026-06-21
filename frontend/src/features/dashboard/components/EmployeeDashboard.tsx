import { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { Calendar, Clock, FileText, Plus, ChevronRight, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeaveApplicationModal from '../../leaves/components/LeaveApplicationModal';
import { getEmployeeDashboardStats, type EmployeeDashboardStats } from '../api/dashboardService';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [stats, setStats] = useState<EmployeeDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const fetchStats = async () => {
      try {
        const data = await getEmployeeDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 fade-in">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 sm:p-12 text-primary-foreground shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              {greeting}, {user?.name?.split(' ')[0] || 'Employee'}! 👋
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl">
              Ready to tackle the day? Here is what's happening across your projects and schedule.
            </p>
          </div>
          <button 
            onClick={() => setShowLeaveModal(true)}
            className="w-fit flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Request Time Off
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-20 -translate-x-12 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quick Stats */}
        <div className="bg-card rounded-2xl p-6 border shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Briefcase className="w-24 h-24 text-primary" />
          </div>
          <p className="text-muted-foreground font-medium mb-1 relative z-10">Active Projects</p>
          <h2 className="text-4xl font-black text-foreground relative z-10">
            {loading ? <span className="animate-pulse bg-muted rounded w-16 h-10 inline-block"></span> : stats?.activeProjects || 0}
          </h2>
          <div className="mt-4 relative z-10">
            <button onClick={() => navigate('/projects')} className="text-sm text-primary font-semibold flex items-center hover:underline">
              View projects <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar className="w-24 h-24 text-primary" />
          </div>
          <p className="text-muted-foreground font-medium mb-1 relative z-10">Upcoming Time Off</p>
          <h2 className="text-4xl font-black text-foreground relative z-10">
            {loading ? <span className="animate-pulse bg-muted rounded w-24 h-10 inline-block"></span> : `${stats?.upcomingTimeOffDays || 0} Day${stats?.upcomingTimeOffDays !== 1 ? 's' : ''}`}
          </h2>
          <div className="mt-4 relative z-10">
            <button onClick={() => navigate('/leaves')} className="text-sm text-primary font-semibold flex items-center hover:underline">
              View schedule <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText className="w-24 h-24 text-warning" />
          </div>
          <p className="text-muted-foreground font-medium mb-1 relative z-10">Pending Leaves</p>
          <h2 className="text-4xl font-black text-foreground relative z-10">
            {loading ? <span className="animate-pulse bg-muted rounded w-16 h-10 inline-block"></span> : stats?.pendingLeaves || 0}
          </h2>
          <div className="mt-4 relative z-10">
            <button onClick={() => navigate('/leaves')} className="text-sm text-primary font-semibold flex items-center hover:underline">
              Manage requests <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Mock */}
        <div className="bg-card p-6 rounded-2xl border shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Recent Updates
          </h2>
          <div className="space-y-6">
            {loading ? (
              <div className="animate-pulse flex gap-4"><div className="w-8 h-8 rounded-full bg-muted"></div><div className="flex-1 h-12 bg-muted rounded"></div></div>
            ) : stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity, idx) => (
                <div key={activity.id} className="flex gap-4 relative">
                  {idx !== stats.recentActivities.length - 1 && <div className="absolute top-8 left-2.5 bottom-0 w-px bg-border -mb-6"></div>}
                  <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center shrink-0 z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No recent activity.</p>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-card p-6 rounded-2xl border shadow-sm">
          <h2 className="text-xl font-bold mb-6">Quick Links</h2>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/projects')}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="font-semibold">My Projects</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>

            <button 
              onClick={() => navigate('/leaves')}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="font-semibold">My Leaves</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
            
            <button 
              onClick={() => navigate('/profile')}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <span className="w-5 h-5 block">👤</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">My Profile</p>
                  <p className="text-xs text-muted-foreground">Update your details</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {showLeaveModal && (
        <LeaveApplicationModal
          onClose={() => setShowLeaveModal(false)}
          onSuccess={() => {
            setShowLeaveModal(false);
            // Optionally could trigger a refresh of stats here
          }}
        />
      )}
    </div>
  );
}
