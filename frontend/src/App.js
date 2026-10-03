import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './i18n/i18n';
import { PWAProvider } from './context/PWAContext';
import { WeatherGPTProvider, useWeatherGPT } from './context/WeatherGPTContext';
import { initNativeApp, registerBackButtonHandler } from './services/nativeService';

// Modern Redesigned Core Components
import CinematicIntro from './components/CinematicIntro';
import ModernNav from './components/ModernNav';
import ModernHomePage from './pages/ModernHomePage';
import ModernWeatherPage from './pages/ModernWeatherPage';
import ModernMapPage from './pages/ModernMapPage';
import ModernIncidentsPage from './pages/ModernIncidentsPage';
import ModernSafetyPage from './pages/ModernSafetyPage';
import ModernWeatherGPT from './components/ModernWeatherGPT';
import ModernSosModal from './components/ModernSosModal';

// Existing Secondary Pages & Modals (Preserved functionality)
import SheltersPage from './pages/SheltersPage';
import DisasterGuidesPage from './pages/DisasterGuidesPage';
import DonationsPage from './pages/DonationsPage';
import TransparencyLedgerPage from './pages/TransparencyLedgerPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AdminDashboard from './pages/AdminDashboard';
import IncidentModal from './components/IncidentModal';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PWAUpdateToast from './components/PWAUpdateToast';
import DesktopAppDownloadModal from './components/DesktopAppDownloadModal';

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Cinematic Intro State
  const [showIntro, setShowIntro] = useState(() => {
    try {
      if (window.location.search.includes('skip_intro=1') || (window.location.pathname !== '/' && window.location.pathname !== '')) {
        return false;
      }
      const seen = sessionStorage.getItem('disasterchain_intro_seen') || localStorage.getItem('disasterchain_intro_seen');
      return !seen;
    } catch (e) {
      return false;
    }
  });
  const [isReplay, setIsReplay] = useState(false);

  // Global Modals State
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isIncidentOpen, setIsIncidentOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Initialize native status bar and splash screen
  useEffect(() => {
    initNativeApp();
  }, []);

  // Hardware Back-Button hierarchy for native / Android
  useEffect(() => {
    const unregister = registerBackButtonHandler({
      isDrawerOpen: () => false,
      closeDrawer: () => {},
      isAiOpen: () => false,
      closeAi: () => {},
      isModalOpen: () => isSosOpen || isIncidentOpen || isAppModalOpen,
      closeModal: () => {
        setIsSosOpen(false);
        setIsIncidentOpen(false);
        setIsAppModalOpen(false);
      },
      navigateBack: () => navigate(-1),
      canGoBack: () => window.history.length > 1 && location.pathname !== '/' && location.pathname !== '/dashboard',
    });

    return () => unregister();
  }, [isSosOpen, isIncidentOpen, isAppModalOpen, location.pathname, navigate]);

  const handleReplayIntro = () => {
    setIsReplay(true);
    setShowIntro(true);
  };

  const isPublicStandalone =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password' ||
    location.pathname === '/verify-email';

  return (
    <div className="dc-app-layout">
      {/* 1. CINEMATIC FIRST-OPEN INTRO (Plays once per session, smooth shared exit) */}
      {showIntro && (
        <CinematicIntro
          onEnter={() => setShowIntro(false)}
          isReplay={isReplay}
        />
      )}

      {/* 2. PRIMARY NAVIGATION (Top on desktop, bottom on mobile) */}
      <ModernNav
        onOpenSos={() => setIsSosOpen(true)}
        onReplayIntro={handleReplayIntro}
        onOpenAppModal={() => setIsAppModalOpen(true)}
      />

      {/* 3. MAIN APPLICATION VIEWPORT WITH SMOOTH PAGE TRANSITIONS */}
      <main className="dc-main-viewport">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Primary Command Hub */}
            <Route
              path="/"
              element={
                <ModernHomePage
                  onOpenSos={() => setIsSosOpen(true)}
                  onOpenIncident={() => setIsIncidentOpen(true)}
                  refreshKey={refreshCount}
                />
              }
            />
            <Route
              path="/dashboard"
              element={
                <ModernHomePage
                  onOpenSos={() => setIsSosOpen(true)}
                  onOpenIncident={() => setIsIncidentOpen(true)}
                  refreshKey={refreshCount}
                />
              }
            />

            {/* Weather */}
            <Route path="/weather" element={<ModernWeatherPage />} />
            <Route path="/weather-gpt" element={<WeatherGPTRedirect />} />
            <Route path="/weathergpt" element={<WeatherGPTRedirect />} />

            {/* Map */}
            <Route path="/map" element={<ModernMapPage />} />
            <Route path="/affected-areas" element={<ModernMapPage />} />

            {/* Incidents */}
            <Route
              path="/incidents"
              element={
                <ModernIncidentsPage
                  onOpenIncident={() => setIsIncidentOpen(true)}
                />
              }
            />

            {/* Safety & SOS */}
            <Route
              path="/safety"
              element={<ModernSafetyPage onOpenSos={() => setIsSosOpen(true)} />}
            />
            <Route
              path="/sos"
              element={<ModernSafetyPage onOpenSos={() => setIsSosOpen(true)} />}
            />

            {/* Secondary Operations & Resources */}
            <Route path="/shelters" element={<SheltersPage />} />
            <Route path="/guides" element={<DisasterGuidesPage />} />
            <Route path="/preparedness" element={<DisasterGuidesPage />} />
            <Route path="/donations" element={<DonationsPage />} />
            <Route path="/transparency" element={<TransparencyLedgerPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Public Standalone Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* 4. PERSISTENT WEATHERGPT FLOATING ASSISTANT */}
      {!isPublicStandalone && <ModernWeatherGPT />}

      {/* 5. PERSISTENT EMERGENCY SOS MODAL */}
      <ModernSosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        onSosSubmitted={() => setRefreshCount((c) => c + 1)}
      />

      {/* 6. MODALS FOR FIELD REPORTING & DESKTOP APP DOWNLOAD */}
      <IncidentModal
        isOpen={isIncidentOpen}
        onClose={() => setIsIncidentOpen(false)}
        onIncidentSubmitted={() => setRefreshCount((c) => c + 1)}
      />

      <DesktopAppDownloadModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
      />

      {/* 7. PWA INSTALL & UPDATE PROMPTS */}
      <PWAInstallPrompt />
      <PWAUpdateToast />
    </div>
  );
};

// WeatherGPT Redirect Helper
const WeatherGPTRedirect = () => {
  const { openWeatherGPT } = useWeatherGPT();
  const navigate = useNavigate();
  useEffect(() => {
    openWeatherGPT();
    navigate('/weather', { replace: true });
  }, [openWeatherGPT, navigate]);
  return null;
};

export default function App() {
  return (
    <ErrorBoundary>
      <PWAProvider>
        <LanguageProvider>
          <AuthProvider>
            <Router>
              <WeatherGPTProvider>
                <AppLayout />
              </WeatherGPTProvider>
            </Router>
          </AuthProvider>
        </LanguageProvider>
      </PWAProvider>
    </ErrorBoundary>
  );
}
