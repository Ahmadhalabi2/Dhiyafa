import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../store/authStore';

interface Props {
  children: React.ReactNode;
  requiredRole?: Role;
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { isAuthenticated, currentUser } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole && currentUser?.role !== requiredRole) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
