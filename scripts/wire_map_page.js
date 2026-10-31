const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, '../frontend/src/pages/ModernMapPage.jsx');
let map = fs.readFileSync(mapPath, 'utf8');

map = map.replace(
  '<strong>Your Approximate Location</strong>',
  "<strong>{t('map.userLocation', 'Your Approximate Location')}</strong>"
);

fs.writeFileSync(mapPath, map, 'utf8');
console.log('ModernMapPage.jsx updated');

