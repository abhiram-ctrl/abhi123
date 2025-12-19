import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout components
import Layout from './components/Layout';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DonatePage from './pages/DonatePage';

// Citizen pages
import CitizenDashboard from './components/citizen/CitizenDashboard';
import SOSPage from './components/citizen/SOSPage';
import ReportRiskPage from './components/citizen/ReportRiskPage';
import EmergencyContactsPage from './components/citizen/EmergencyContactsPage';
import IncidentHistoryPage from './components/citizen/IncidentHistoryPage';

// Volunteer pages
import VolunteerIncidentDetail from './components/volunteer/VolunteerIncidentDetail';
import VolunteerApply from './components/volunteer/VolunteerApply';
import VolunteerDashboard from './components/volunteer/VolunteerDashboard';
import ApplicationStatus from './components/volunteer/ApplicationStatus';
import IncidentCard from './components/volunteer/IncidentCard';

// Admin pages
import AdminDashboard from './components/admin/AdminDashboard';
import IncidentList from './components/admin/IncidentList';
import IncidentDetail from './components/admin/IncidentDetail';
import OfficerAssignment from './components/admin/OfficerAssignment';
import VolunteerAssignment from './components/admin/VolunteerAssignment';
import VolunteerVerification from './components/admin/VolunteerVerification';
import Donations from './components/admin/Donations';

// Auth components
import ProtectedRoute from './components/auth/ProtectedRoute';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Public Routes without Layout - these have their own styling */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/donate" element={<DonatePage />} />
          
          {/* Routes with common Layout */}
          <Route element={<Layout />}>
            {/* Volunteer Apply Direct Route */}
            <Route 
              path="/volunteer/apply-direct" 
              element={
                <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                  <VolunteerApply />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/volunteer/incident/:id" 
              element={
                <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                  <VolunteerIncidentDetail />
                </ProtectedRoute>
              } 
            />
            
            {/* Volunteer Application Status */}
            <Route 
              path="/volunteer/application-status" 
              element={
                <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                  <ApplicationStatus />
                </ProtectedRoute>
              } 
            />
            
            {/* Citizen Protected Routes */}
            <Route path="/citizen" element={<Navigate to="/citizen/dashboard" replace />} />
            
            <Route 
              path="/citizen/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                  <CitizenDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/citizen/sos" 
              element={
                <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                  <SOSPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/citizen/report-risk" 
              element={
                <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                  <ReportRiskPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/citizen/contacts" 
              element={
                <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                  <EmergencyContactsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/citizen/incident-history" 
              element={
                <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                  <IncidentHistoryPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Volunteer Protected Routes */}
            <Route 
              path="/volunteer/apply" 
              element={
                <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                  <VolunteerApply />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/volunteer/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                  <VolunteerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route
  path="/volunteer/incident/:id"
  element={<VolunteerIncidentDetail />}
/>

            {/* Admin Protected Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/incidents" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <IncidentList />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/incidents/:id" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <IncidentDetail />
                </ProtectedRoute>
              } 
            />

            {/* Admin - Assign Officers to Incident */}
            <Route 
              path="/admin/incidents/:id/assign-officers" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <OfficerAssignment />
                </ProtectedRoute>
              } 
            />

            {/* Admin - Assign Volunteers to Incident */}
            <Route 
              path="/admin/incidents/:id/assign-volunteers" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <VolunteerAssignment />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/volunteers/verification" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <VolunteerVerification />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/donations" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Donations />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;