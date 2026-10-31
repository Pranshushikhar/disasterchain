const fs = require('fs');
const path = require('path');

const targetFiles = [
  'frontend/src/pages/ModernHomePage.jsx',
  'frontend/src/pages/ModernWeatherPage.jsx',
  'frontend/src/pages/ModernMapPage.jsx',
  'frontend/src/pages/ModernIncidentsPage.jsx',
  'frontend/src/pages/ModernSafetyPage.jsx',
  'frontend/src/pages/ModernAcademyPage.jsx',
  'frontend/src/pages/AcademyCoursePage.jsx',
  'frontend/src/pages/AcademySimulationsPage.jsx',
  'frontend/src/pages/ModernOfflineEmergencyPage.jsx',
  'frontend/src/pages/SheltersPage.jsx',
  'frontend/src/pages/DisasterGuidesPage.jsx',
  'frontend/src/pages/DonationsPage.jsx',
  'frontend/src/pages/TransparencyLedgerPage.jsx',
  'frontend/src/pages/ProfilePage.jsx',
  'frontend/src/pages/AdminDashboard.jsx',
  'frontend/src/pages/LoginPage.jsx',
  'frontend/src/pages/RegisterPage.jsx',
  'frontend/src/pages/ForgotPasswordPage.jsx',
  'frontend/src/pages/ResetPasswordPage.jsx',
  'frontend/src/pages/VerifyEmailPage.jsx',
  'frontend/src/components/ModernNav.jsx',
  'frontend/src/components/CinematicIntro.jsx',
  'frontend/src/components/OnboardingTour.jsx',
  'frontend/src/components/ModernSosModal.jsx',
  'frontend/src/components/IncidentModal.jsx',
  'frontend/src/components/CitySelectorModal.jsx',
  'frontend/src/components/DesktopAppDownloadModal.jsx',
  'frontend/src/components/GlobalVoiceAssistant.jsx',
  'frontend/src/components/ModernWeatherGPT.jsx',
  'frontend/src/components/OfflineDetectionBanner.jsx',
  'frontend/src/components/LivingEnvironment.jsx',
  'frontend/src/components/Footer.jsx',
  'frontend/src/components/AdminIncidentVerificationDashboard.jsx',
  'frontend/src/components/IncidentDetailModal.jsx',
  'frontend/src/components/PWAInstallPrompt.jsx',
  'frontend/src/components/PWAUpdateToast.jsx',
  'frontend/src/components/DisasterCommandMap.jsx',
];

for (const rel of targetFiles) {
  const p = path.join(__dirname, '..', rel);
  if (!fs.existsSync(p)) {
    console.log(`MISSING FILE: ${rel}`);
    continue;
  }
  const content = fs.readFileSync(p, 'utf8');
  const hasUseTranslation = content.includes('useTranslation');
  const tCount = (content.match(/\bt\s*\(/g) || []).length;
  console.log(`${rel}: useTranslation=${hasUseTranslation}, t() count=${tCount}`);
}

