import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Schedule } from './pages/Schedule';
import { Booking } from './pages/Booking';
import { BookingSuccess } from './pages/BookingSuccess';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { ClientDashboard } from './pages/Client/ClientDashboard';
import { EditProfile } from './pages/Client/EditProfile';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { useAuthStore } from './store/authStore';

function App() {
  const { user, initialize, initialized } = useAuthStore();
  
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  if (!initialized) {
    // Loading state while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/success" element={<BookingSuccess />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          
          {/* Client Routes */}
          <Route 
            path="/client" 
            element={user ? <ClientDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile/edit" 
            element={user ? <EditProfile /> : <Navigate to="/login" />} 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;