import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './i18n/i18n';
import { PWAProvider } from './context/PWAContext';
import { initNativeApp, registerBackButtonHandler } from './services/nativeService';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import SosModal from './components/SosModal';
import IncidentModal from './components/IncidentModal';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import MobileEmergencyNav from './components/MobileEmergencyNav';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PWAUpdateToast from './components/PWAUpdateToast';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProfilePage from './pages/ProfilePage';
import EmergencyDashboard from './pages/EmergencyDashboard';
import SosPage from './pages/SosPage';
import SheltersPage from './pages/SheltersPage';
import AffectedAreasPage from './pages/AffectedAreasPage';
import AlertsPage from './pages/AlertsPage';
import DisasterGuidesPage from './pages/DisasterGuidesPage';
import IncidentReportsPage from './pages/IncidentReportsPage';
import MyReportsPage from './pages/MyReportsPage';
import EmergencyResourcesPage from './pages/EmergencyResourcesPage';
import DonationsPage from './pages/DonationsPage';
import ResourceTrackingPage from './pages/ResourceTrackingPage';
import TransparencyLedgerPage from './pages/TransparencyLedgerPage';
import OfflineEmergencyPage from './pages/OfflineEmergencyPage';
import WeatherPage from './pages/WeatherPage';
import WeatherGPTPage from './pages/WeatherGPTPage';
import AdminDashboard from './pages/AdminDashboard';
import GlobalCommandBar from './components/GlobalCommandBar';

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isIncidentOpen, setIsIncidentOpen] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global hotkey: '/' or 'Ctrl+K' opens the DisasterChain Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K'))) &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        setIsCommandBarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize native status bar and splash screen
  useEffect(() => {
    initNativeApp();
  }, []);

  // Hardware Back-Button hierarchy: Drawer -> AI -> Modal -> History Back
  useEffect(() => {
    const unregister = registerBackButtonHandler({
      isDrawerOpen: () => isMobileMenuOpen,
      closeDrawer: () => setIsMobileMenuOpen(false),
      isAiOpen: () => document.body.classList.contains('ai-assistant-open'),
      closeAi: () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      },
      isModalOpen: () => isSosOpen || isIncidentOpen,
      closeModal: () => {
        setIsSosOpen(false);
        setIsIncidentOpen(false);
      },
      navigateBack: () => navigate(-1),
      canGoBack: () => window.history.length > 1 && location.pathname !== '/' && location.pathname !== '/dashboard',
    });

    return () => unregister();
  }, [isMobileMenuOpen, isSosOpen, isIncidentOpen, location.pathname, navigate]);

  // Automatically close mobile menu on route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Show clean layout without desktop sidebar on standalone authentication/landing pages
  const isPublicStandalone =
    location.pathname === '/landing' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password' ||
    location.pathname === '/verify-email';

  return (
    <div className="app-container">
      {/* Sidebar navigation: Desktop rail hidden in favor of clean Top Command Bar; Mobile drawer always available */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenSos={() => setIsSosOpen(true)}
        hideDesktopRail={true}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          onOpenSos={() => setIsSosOpen(true)}
          onToggleSidebar={() => setIsMobileMenuOpen((prev) => !prev)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <main className={isPublicStandalone ? '' : 'page-body'}>
          <Routes>
            <Route
              path="/"
              element={
                <EmergencyDashboard
                  refreshKey={refreshCount}
                  onOpenSos={() => setIsSosOpen(true)}
                  onOpenIncident={() => setIsIncidentOpen(true)}
                />
              }
            />
            <Route path="/landing" element={<LandingPage onOpenSos={() => setIsSosOpen(true)} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <EmergencyDashboard
                  refreshKey={refreshCount}
                  onOpenSos={() => setIsSosOpen(true)}
                  onOpenIncident={() => setIsIncidentOpen(true)}
                />
              }
            />
            <Route
              path="/sos"
              element={
                <SosPage
                  refreshKey={refreshCount}
                  onOpenSos={() => setIsSosOpen(true)}
                />
              }
            />
            <Route path="/shelters" element={<SheltersPage />} />
            <Route path="/affected-areas" element={<AffectedAreasPage />} />
            <Route path="/map" element={<AffectedAreasPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/guides" element={<DisasterGuidesPage />} />
            <Route path="/preparedness" element={<DisasterGuidesPage />} />
            <Route path="/incidents" element={<IncidentReportsPage onOpenIncident={() => setIsIncidentOpen(true)} />} />
            <Route path="/my-reports" element={<MyReportsPage />} />
            <Route path="/resources" element={<EmergencyResourcesPage />} />
            <Route path="/donations" element={<DonationsPage />} />
            <Route path="/resource-tracking" element={<ResourceTrackingPage />} />
            <Route path="/transparency" element={<TransparencyLedgerPage />} />
            <Route path="/offline" element={<OfflineEmergencyPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/weather-gpt" element={<WeatherGPTPage />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </main>

        {/* Shared Global Application Footer (Suppressed on full-viewport intelligence desk) */}
        {location.pathname !== '/weather-gpt' && <Footer />}
      </div>

      {/* Persistent Mobile Emergency Bottom Navigation (Phase 13) */}
      <MobileEmergencyNav
        onOpenSos={() => setIsSosOpen(true)}
        onOpenIncident={() => setIsIncidentOpen(true)}
        onToggleSidebar={() => setIsMobileMenuOpen((prev) => !prev)}
      />


      {/* Global Modals */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        onSosSubmitted={() => setRefreshCount((c) => c + 1)}
      />

      <IncidentModal
        isOpen={isIncidentOpen}
        onClose={() => setIsIncidentOpen(false)}
        onIncidentSubmitted={() => setRefreshCount((c) => c + 1)}
      />

      {/* Global Command Palette */}
      <GlobalCommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        onOpenSos={() => setIsSosOpen(true)}
        onOpenIncident={() => setIsIncidentOpen(true)}
      />

      {/* PWA Mobile Installation Prompt & Service Worker Update Alert */}
      {location.pathname !== '/weather-gpt' && <PWAInstallPrompt />}
      <PWAUpdateToast />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <PWAProvider>
        <LanguageProvider>
          <AuthProvider>
            <Router>
              <AppLayout />
            </Router>
          </AuthProvider>
        </LanguageProvider>
      </PWAProvider>
    </ErrorBoundary>
  );
}

export default App;
