import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import ConsumerDashboard from './components/consumer/ConsumerDashboard';
import LabDashboard from './components/lab/LabDashboard';
import ProcessorDashboard from './components/processor/ProcessorDashboard';
import HerbSelection from './components/consumer/HerbSelection';
import OrderTracking from './components/consumer/OrderTracking';
import OrderHistory from './components/consumer/OrderHistory';
import FarmerDetail from './components/consumer/FarmerDetail';
import AddHerbDetails from './components/lab/AddHerbDetails';
import ProcessHerb from './components/processor/ProcessHerb';
import CreateHerb from './components/processor/CreateHerb';
import FarmerManager from './components/processor/FarmerManager';
import QRScanner from './components/QRScanner';
import AppNavbar from './components/Navbar';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = window.localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (_) {
      return null;
    }
  });

  // Check if user is authenticated
  const isAuthenticated = () => {
    return user !== null;
  };

  // Protected route component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'consumer') {
        return <Navigate to="/consumer/dashboard" replace />;
      } else if (user.role === 'lab') {
        return <Navigate to="/lab/dashboard" replace />;
      } else if (user.role === 'processor') {
        return <Navigate to="/processor/dashboard" replace />;
      }
    }
    
    return children;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<><AppNavbar user={null} /><LandingPage /></>} />
          <Route path="/login" element={<><AppNavbar user={null} /><Login setUser={(u) => { setUser(u); window.localStorage.setItem('user', JSON.stringify(u)); }} /></>} />
          <Route path="/scanner" element={<><AppNavbar user={null} /><QRScanner /></>} />
          
          {/* Consumer routes */}
          <Route 
            path="/consumer/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <AppNavbar user={user} />
                <ConsumerDashboard user={user} />
              </ProtectedRoute>
            } 
          />
          {/* Admin routes */}
          <Route 
            path="/admin/farmers" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppNavbar user={user} />
                <FarmerManager user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/consumer/herb-selection" 
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <AppNavbar user={user} />
                <HerbSelection user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/consumer/order-tracking/:orderId" 
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <AppNavbar user={user} />
                <OrderTracking user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/consumer/order-history" 
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <AppNavbar user={user} />
                <OrderHistory user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/consumer/farmer/:farmerId" 
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <AppNavbar user={user} />
                <FarmerDetail user={user} />
              </ProtectedRoute>
            } 
          />
          
          {/* Lab routes */}
          <Route 
            path="/lab/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['lab']}>
                <AppNavbar user={user} />
                <LabDashboard user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lab/add-herb-details" 
            element={
              <ProtectedRoute allowedRoles={['lab']}>
                <AppNavbar user={user} />
                <AddHerbDetails user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lab/create-herb" 
            element={
              <ProtectedRoute allowedRoles={['lab','admin']}>
                <AppNavbar user={user} />
                <CreateHerb user={user} />
              </ProtectedRoute>
            } 
          />
          
          {/* Processor routes */}
          <Route 
            path="/processor/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['processor']}>
                <AppNavbar user={user} />
                <ProcessorDashboard user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/processor/process-herb" 
            element={
              <ProtectedRoute allowedRoles={['processor']}>
                <AppNavbar user={user} />
                <ProcessHerb user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/processor/create-herb" 
            element={
              <ProtectedRoute allowedRoles={['processor','admin']}>
                <AppNavbar user={user} />
                <CreateHerb user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/processor/farmers" 
            element={
              <ProtectedRoute allowedRoles={['processor','admin']}>
                <AppNavbar user={user} />
                <FarmerManager user={user} />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;