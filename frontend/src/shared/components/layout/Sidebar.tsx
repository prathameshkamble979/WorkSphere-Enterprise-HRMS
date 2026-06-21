import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building, Target, Umbrella, DollarSign, CheckSquare, Settings, MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { companyLogo } = useSettings();
  const { user } = useAuth();
  const allNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
    { name: 'Employees', icon: Users, path: '/employees', roles: ['Admin', 'Manager', 'HR'] },
    { name: 'Clients', icon: Building, path: '/clients', roles: ['Admin', 'Manager', 'HR'] },
    { name: 'Projects', icon: Target, path: '/projects', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
    { name: 'Leaves', icon: Umbrella, path: '/leaves', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
    { name: 'Payroll', icon: DollarSign, path: '/payroll', roles: ['Admin', 'Manager', 'HR'] },
    { name: 'Approvals', icon: CheckSquare, path: '/approvals', roles: ['Admin', 'Manager', 'HR'] },
    { name: 'Communication', icon: MessageCircle, path: '/communications', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
  ];

  const navItems = allNavItems.filter(item => {
    if (!user || !user.role) return false;
    const userRole = user.role.toLowerCase();
    return item.roles.some(r => r.toLowerCase() === userRole);
  });

  return (
    <aside className="w-64 bg-card border-r flex flex-col h-full shrink-0 shadow-sm hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b shrink-0">
        <div className="flex items-center gap-2">
          {companyLogo ? (
            <img src={companyLogo} alt="Logo" className="h-8 w-auto object-contain max-w-[150px] rounded-sm" />
          ) : (
            <>
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-bold text-lg">W</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground truncate">WorkSphere</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Main Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t shrink-0">
        <NavLink 
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground w-full'
            }`
          }
        >
          <Settings className="h-5 w-5" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
