import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatWidget  from './components/ChatWidget';
import VoiceAgent  from './components/VoiceAgent';

import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

import PatientDashboard   from './pages/patient/Dashboard';
import DoctorSearch       from './pages/patient/DoctorSearch';
import BookAppointment    from './pages/patient/BookAppointment';
import MyAppointments     from './pages/patient/MyAppointments';
import MedicalHistory     from './pages/patient/MedicalHistory';
import PatientReports     from './pages/patient/Reports';
import PatientPrescriptions from './pages/patient/Prescriptions';

import DoctorDashboard    from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorProfile      from './pages/doctor/Profile';
import PatientHistory     from './pages/doctor/PatientHistory';
import DoctorMessages     from './pages/doctor/Messages';

import PatientMessages    from './pages/patient/Messages';

import AssistantDashboard  from './pages/assistant/Dashboard';
import AssistantPayments   from './pages/assistant/Payments';
import AssistantMessages   from './pages/assistant/Messages';

import AdminDashboard     from './pages/admin/Dashboard';
import AdminUsers         from './pages/admin/Users';
import DoctorVerification from './pages/admin/DoctorVerification';
import AdminClinics       from './pages/admin/Clinics';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      {user?.role === 'patient' && <ChatWidget />}
      <VoiceAgent above={user?.role === 'patient'} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized"    element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <div className="text-6xl font-bold text-slate-200 mb-4">403</div>
                <p className="text-slate-500 font-medium">Access Denied</p>
              </div>
            </div>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Authenticated layout */}
          <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>

            {/* Patient */}
            <Route path="/patient/dashboard"        element={<PrivateRoute roles={['patient']}><PatientDashboard /></PrivateRoute>} />
            <Route path="/patient/doctors"          element={<PrivateRoute roles={['patient']}><DoctorSearch /></PrivateRoute>} />
            <Route path="/patient/book/:doctorId"   element={<PrivateRoute roles={['patient']}><BookAppointment /></PrivateRoute>} />
            <Route path="/patient/appointments"     element={<PrivateRoute roles={['patient']}><MyAppointments /></PrivateRoute>} />
            <Route path="/patient/history"          element={<PrivateRoute roles={['patient']}><MedicalHistory /></PrivateRoute>} />
            <Route path="/patient/reports"          element={<PrivateRoute roles={['patient']}><PatientReports /></PrivateRoute>} />
            <Route path="/patient/prescriptions"    element={<PrivateRoute roles={['patient']}><PatientPrescriptions /></PrivateRoute>} />
            <Route path="/patient/messages"         element={<PrivateRoute roles={['patient']}><PatientMessages /></PrivateRoute>} />

            {/* Doctor */}
            <Route path="/doctor/dashboard"    element={<PrivateRoute roles={['doctor']}><DoctorDashboard /></PrivateRoute>} />
            <Route path="/doctor/appointments" element={<PrivateRoute roles={['doctor']}><DoctorAppointments /></PrivateRoute>} />
            <Route path="/doctor/profile"      element={<PrivateRoute roles={['doctor']}><DoctorProfile /></PrivateRoute>} />
            <Route path="/doctor/history"      element={<PrivateRoute roles={['doctor']}><PatientHistory /></PrivateRoute>} />
            <Route path="/doctor/messages"     element={<PrivateRoute roles={['doctor']}><DoctorMessages /></PrivateRoute>} />

            {/* Assistant */}
            <Route path="/assistant/dashboard" element={<PrivateRoute roles={['assistant']}><AssistantDashboard /></PrivateRoute>} />
            <Route path="/assistant/payments"  element={<PrivateRoute roles={['assistant']}><AssistantPayments /></PrivateRoute>} />
            <Route path="/assistant/messages"  element={<PrivateRoute roles={['assistant']}><AssistantMessages /></PrivateRoute>} />

            {/* Admin + Super Admin */}
            <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin','super_admin']}><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/users"     element={<PrivateRoute roles={['admin','super_admin']}><AdminUsers /></PrivateRoute>} />
            <Route path="/admin/doctors"   element={<PrivateRoute roles={['admin','super_admin']}><DoctorVerification /></PrivateRoute>} />
            <Route path="/admin/clinics"   element={<PrivateRoute roles={['admin','super_admin']}><AdminClinics /></PrivateRoute>} />
            <Route path="/admin/payments"  element={<PrivateRoute roles={['admin','super_admin']}><AssistantPayments /></PrivateRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}
