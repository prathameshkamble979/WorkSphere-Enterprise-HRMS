import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './shared/context/ThemeContext';
import EmployeeList from './features/employees/pages/EmployeeList';
import ClientList from './features/clients/pages/ClientList';
import ApprovalList from './features/approvals/pages/ApprovalList';
import Dashboard from './features/dashboard/pages/Dashboard';
import ProjectList from './features/projects/pages/ProjectList';
import LeaveList from './features/leaves/pages/LeaveList';
import PayrollList from './features/payroll/pages/PayrollList';
import AppLayout from './shared/components/layout/AppLayout';
import ProtectedRoute from './shared/components/layout/ProtectedRoute';
import { AuthProvider } from './shared/context/AuthContext';
import { SettingsProvider } from './shared/context/SettingsContext';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import ResetPassword from './features/auth/pages/ResetPassword';
import Profile from './features/profile/pages/Profile';
import Settings from './features/settings/pages/Settings';
import CommunicationCenter from './features/communications/pages/CommunicationCenter';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="worksphere-ui-theme">
      <AuthProvider>
        <SettingsProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-sans">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/resetpassword/:token" element={<ResetPassword />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/employees" element={<EmployeeList />} />
                    <Route path="/clients" element={<ClientList />} />
                    <Route path="/projects" element={<ProjectList />} />
                    <Route path="/leaves" element={<LeaveList />} />
                    <Route path="/payroll" element={<PayrollList />} />
                    <Route path="/approvals" element={<ApprovalList />} />
                    <Route path="/communications" element={<CommunicationCenter />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
