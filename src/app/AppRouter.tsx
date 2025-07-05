import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { CoreLayout } from '../layouts/CoreLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import LoginPage from '../pages/Login/LoginPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import UserVotesPage from '../pages/UserVotes/UserVotesPage';
import JudgeVotesPage from '../pages/JudgeVotes/JudgeVotesPage';
import NotaryDashboard from '../pages/Notary/NotaryDashboard';
import NotaryVotes from '../pages/Notary/NotaryVotes';
import EventsAdmin from '../pages/admin/EventsAdmin';
import AdminReports from '../pages/Admin/AdminReports';
import { CandidatesAdmin } from '../pages/admin/CandidatesAdmin';
import SuperAdminUsers from '../pages/SuperAdmin/SuperAdminUsers';
import SuperAdminSettings from '../pages/SuperAdmin/SuperAdminSettings';
import ForbiddenPage from '../pages/Forbidden/ForbiddenPage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }
  
  return <>{children}</>;
};

export const AppRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      
      {/* Dashboard - Página de Bienvenida */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['user', 'judge', 'notary', 'admin', 'superadmin']}>
          <CoreLayout><DashboardPage /></CoreLayout>
        </ProtectedRoute>
      } />
      
      {/* User Routes */}
      <Route path="/votes" element={
        <ProtectedRoute allowedRoles={['user', 'judge', 'notary', 'admin', 'superadmin']}>
          <CoreLayout><UserVotesPage /></CoreLayout>
        </ProtectedRoute>
      } />
      
      {/* Judge Routes */}
      <Route path="/judge" element={
        <ProtectedRoute allowedRoles={['judge', 'admin', 'superadmin']}>
          <CoreLayout><JudgeVotesPage /></CoreLayout>
        </ProtectedRoute>
      } />
      
      {/* Notary Routes */}
      <Route path="/notary/dashboard" element={
        <ProtectedRoute allowedRoles={['notary', 'admin', 'superadmin']}>
          <CoreLayout><NotaryDashboard /></CoreLayout>
        </ProtectedRoute>
      } />
      <Route path="/notary/votes" element={
        <ProtectedRoute allowedRoles={['notary', 'admin', 'superadmin']}>
          <CoreLayout><NotaryVotes /></CoreLayout>
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/events" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <CoreLayout><EventsAdmin /></CoreLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <CoreLayout><AdminReports /></CoreLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/candidates" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <CoreLayout><CandidatesAdmin /></CoreLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
          <CoreLayout><SuperAdminUsers /></CoreLayout>
        </ProtectedRoute>
      } />
      
      {/* SuperAdmin Routes */}
      <Route path="/superadmin/users" element={
        <ProtectedRoute allowedRoles={['superadmin']}>
          <CoreLayout><SuperAdminUsers /></CoreLayout>
        </ProtectedRoute>
      } />
      <Route path="/superadmin/settings" element={
        <ProtectedRoute allowedRoles={['superadmin']}>
          <CoreLayout><SuperAdminSettings /></CoreLayout>
        </ProtectedRoute>
      } />
      
      {/* Error Routes */}
      <Route path="/forbidden" element={<CoreLayout><ForbiddenPage /></CoreLayout>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<CoreLayout><NotFoundPage /></CoreLayout>} />
    </Routes>
  );
};
