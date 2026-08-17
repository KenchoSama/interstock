import { useApp } from './state/AppContext';
import { useAuthSync } from './hooks/useAuthSync';
import StudentShell  from './shells/StudentShell';
import StaffShell    from './shells/StaffShell';
import SchoolShell   from './shells/SchoolShell';
import PartnerShell  from './shells/PartnerShell';
import AdminShell    from './shells/AdminShell';
import Login         from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import './styles/global.css';

export default function App() {
  useAuthSync();
  const { state } = useApp();

  if (state.screen === 'login') return <Login />;
  if (state.screen === 'reset-password') return <ResetPassword />;

  switch (state.role) {
    case 'student':      return <StudentShell />;
    case 'staff':        return <StaffShell />;
    case 'school_admin': return <SchoolShell />;
    case 'partner':      return <PartnerShell />;
    case 'admin':        return <AdminShell />;
    default:             return <Login />;
  }
}
