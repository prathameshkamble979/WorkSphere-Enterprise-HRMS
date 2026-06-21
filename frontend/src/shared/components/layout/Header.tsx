import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, LogOut, Check, CheckCircle2, Info, AlertCircle, XCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications, type Notification } from '../../hooks/useNotifications';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.isRead) markAsRead(notif._id);
    setShowNotifications(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'error': return <XCircle className="h-4 w-4 text-danger" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-warning" />;
      default: return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 shadow-sm z-10 relative">
      <div className="flex items-center gap-4">
        <button className="p-2 -ml-2 rounded-xl text-muted-foreground hover:bg-muted md:hidden transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center relative w-64">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Global search..."
            className="w-full h-9 pl-9 pr-4 rounded-full border-none bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-danger border-2 border-card text-[8px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border rounded-xl shadow-lg overflow-hidden z-50 fade-in flex flex-col max-h-[80vh]">
              <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                <h3 className="font-bold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                    <Bell className="h-8 w-8 mb-2 opacity-20" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map(notif => (
                      <div 
                        key={notif._id} 
                        className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div className="flex gap-3">
                          <div className="mt-0.5">{getIcon(notif.type)}</div>
                          <div className="flex-1">
                            <p className={`text-sm ${!notif.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-2 opacity-70">
                              {new Date(notif.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!notif.isRead && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0"></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-8 w-px bg-border hidden sm:block"></div>
        
        <div className="flex items-center gap-3 pl-1 sm:pl-2">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-foreground">{user?.name || 'User'}</span>
            <span className="text-xs text-muted-foreground">{user?.role || 'Staff'}</span>
          </div>
          <Link to="/profile" className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center shadow-sm cursor-pointer border-2 border-background hover:scale-105 transition-transform text-decoration-none overflow-hidden">
            {user?.profilePicture ? (
              <img src={getImageUrl(user.profilePicture)} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="text-primary-foreground font-bold text-sm">{user?.name?.charAt(0) || 'U'}</span>
            )}
          </Link>
          
          <button 
            onClick={logout}
            className="p-2 ml-1 rounded-full text-danger hover:bg-danger/10 transition-colors"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
