import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages (to be created)
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MentorList from './pages/MentorList';
import MentorProfilePage from './pages/MentorProfilePage';
import MentorDashboard from './pages/MentorDashboard';
import MenteeDashboard from './pages/MenteeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SessionPage from './pages/SessionPage';

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const { user, firebaseUser, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!firebaseUser) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/mentors" element={<MentorList />} />
              <Route path="/mentor/:id" element={<MentorProfilePage />} />
              
              <Route path="/dashboard/mentor" element={
                <ProtectedRoute role="mentor">
                  <MentorDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/mentee" element={
                <ProtectedRoute role="mentee">
                  <MenteeDashboard />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/admin" element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/session/:id" element={
                <ProtectedRoute>
                  <SessionPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
