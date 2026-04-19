import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Discover from './pages/Discover';
import TalentDetail from './pages/TalentDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Messaging from './pages/Messaging';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import CreateTalent from './pages/CreateTalent';
import TrainerProfile from './pages/TrainerProfile';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  console.log('🔐 PrivateRoute check:', { user: user?.email, loading });
  
  if (loading) {
    console.log('⏳ PrivateRoute: Still loading...');
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    console.log('🚫 PrivateRoute: No user, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  console.log('✅ PrivateRoute: User authenticated, rendering children');
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return isAdmin ? <>{children}</> : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <Navbar />
      <div className="pt-20">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/talent/:id" element={<TalentDetail />} />
          <Route path="/trainer/:trainerId" element={<TrainerProfile />} />
          <Route path="/create-talent" element={<PrivateRoute><CreateTalent /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/messaging" element={<PrivateRoute><Messaging /></PrivateRoute>} />
          <Route path="/messaging/:chatId" element={<PrivateRoute><Messaging /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
