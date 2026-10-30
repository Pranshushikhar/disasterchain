const fs = require('fs');
const path = require('path');

const modernPages = [
  'ModernHomePage.jsx',
  'ModernWeatherPage.jsx',
  'ModernMapPage.jsx',
  'ModernIncidentsPage.jsx',
  'ModernSafetyPage.jsx',
  'OfflineEmergencyPage.jsx',
  'SheltersPage.jsx',
  'MyReportsPage.jsx',
  'EmergencyResourcesPage.jsx',
  'ResourceTrackingPage.jsx',
  'DonationsPage.jsx',
  'TransparencyLedgerPage.jsx',
  'DisasterGuidesPage.jsx',
  'LoginPage.jsx',
  'ProfilePage.jsx',
  'AdminDashboard.jsx',
];

const dir = path.resolve(__dirname, '../frontend/src/pages');
modernPages.forEach((p) => {
  const content = fs.readFileSync(path.join(dir, p), 'utf-8');
  const count = (content.match(/\bt\s*\(\s*['"][a-zA-Z0-9_.-]+['"]/g) || []).length;
  console.log(`${p}: ${count} t() calls (has useTranslation: ${content.includes('useTranslation')})`);
});
