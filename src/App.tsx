import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './routes/ProtectedRoute';

import LoginPage          from './pages/LoginPage';
import SignupPage         from './pages/SignupPage';
import HomePage           from './pages/HomePage';
import DashboardPage      from './pages/DashboardPage';
import HotelsPage         from './pages/hotels/HotelsPage';
import BookingsPage       from './pages/bookings/BookingsPage';
import CustomersPage      from './pages/customers/CustomersPage';
import AnalyticsPage      from './pages/analytics/AnalyticsPage';
import RoomsPage          from './pages/rooms/RoomsPage';
import RevenuePage        from './pages/revenue/RevenuePage';
import SettingsPage       from './pages/settings/SettingsPage';
import NotificationsPage  from './pages/notifications/NotificationsPage';
import ProfilePage        from './pages/profile/ProfilePage';
import UsersPage          from './pages/users/UsersPage';
import MyBookingsPage     from './pages/my-bookings/MyBookingsPage';
import BookHotelPage      from './pages/book-hotel/BookHotelPage';
import StartPage          from './pages/StartPage';
import SupportChatPage    from './pages/support/SupportChatPage';

export default function App() {
  const { isAuthenticated, currentUser } = useAuthStore();
  const role = currentUser?.role;

  const getDefaultRoute = () => {
    if (role === 'superadmin') return '/dashboard';
    if (role === 'support')    return '/support';
    return '/home';
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />

        <Route path="/login"  element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/home" replace />              : <SignupPage />} />

        <Route path="/home"          element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/hotels"        element={<ProtectedRoute><HotelsPage /></ProtectedRoute>} />
        <Route path="/settings"      element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/my-bookings"   element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
        <Route path="/book-hotel/:id" element={<ProtectedRoute><BookHotelPage /></ProtectedRoute>} />
        <Route path="/support"       element={<ProtectedRoute><SupportChatPage /></ProtectedRoute>} />

        <Route path="/bookings"  element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
        <Route path="/rooms"     element={<ProtectedRoute><RoomsPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/revenue"   element={<ProtectedRoute><RevenuePage /></ProtectedRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute requiredRole="superadmin"><DashboardPage /></ProtectedRoute>} />
        <Route path="/users"     element={<ProtectedRoute requiredRole="superadmin"><UsersPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
