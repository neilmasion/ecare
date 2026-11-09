import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import CookieConsent from './components/CookieConsent';
import { PageLoadingSkeleton } from './components/Skeleton';

// Lazy Loaded Route Pages (Code Splitting & Performance)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Services = lazy(() => import('./pages/Services'));
const Assistance = lazy(() => import('./pages/Assistance'));
const TrackStatus = lazy(() => import('./pages/TrackStatus'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Account = lazy(() => import('./pages/Account'));
const Profile = lazy(() => import('./pages/Profile'));

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // While verifying stored session credentials
  if (loading) {
    return <PageLoadingSkeleton />;
  }

  // If unauthenticated: user starts with Login and Register screen
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageLoadingSkeleton />}>
        <Account />
      </Suspense>
    );
  }

  // Authenticated Resident Dashboard Workspace
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-150">
      {/* Left Navigation Sidebar */}
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      {/* Right Main Dashboard Workspace */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <TopHeader onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 min-w-0">
          <Suspense fallback={<PageLoadingSkeleton />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/services" element={<Services />} />
              <Route path="/assistance" element={<Assistance />} />
              <Route path="/track" element={<TrackStatus />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/profile" element={<Profile />} />
              {/* Fallback to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>

      <ScrollToTop />
      <CookieConsent />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
