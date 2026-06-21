import { useAuth } from '../../../shared/context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import EmployeeDashboard from '../components/EmployeeDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  // If the user is an employee, render the employee-specific dashboard
  if (user?.role?.toLowerCase() === 'employee') {
    return <EmployeeDashboard />;
  }

  // Otherwise (Admin, HR, Manager), render the full analytics dashboard
  return <AdminDashboard />;
}
