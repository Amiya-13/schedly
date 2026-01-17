import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages (to be created)
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import EventDetails from './pages/EventDetails';
import MyRegistrations from './pages/MyRegistrations';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes - Student */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute roles={['Student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-registrations"
            element={
              <ProtectedRoute roles={['Student']}>
                <MyRegistrations />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Event Organizer */}
          <Route
            path="/organizer/*"
            element={
              <ProtectedRoute roles={['Event Organizer']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Faculty Mentor */}
          <Route
            path="/faculty/*"
            element={
              <ProtectedRoute roles={['Faculty Mentor']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - College Admin */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={['College Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Super Admin */}
          <Route
            path="/super-admin/*"
            element={
              <ProtectedRoute roles={['Super Admin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Shared Protected Routes */}
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
