/**
 * DISASTERCHAIN NATIVE APP CONFIGURATION
 * Single source of truth for the native Android build artifact, deep links,
 * versioning, and distribution capabilities.
 */

export const NATIVE_APP_CONFIG = {
  appName: 'DisasterChain',
  platform: 'Android',
  version: '1.2.0',
  versionCode: 1,
  buildProfile: 'preview',
  packageName: 'com.disasterchain.mobile',
  scheme: 'disasterchain://',
  
  // Official EAS signed build APK artifact
  apkUrl: 'https://expo.dev/artifacts/eas/HVgCqZyniuqolipIDS0AChD56j7bKaWjML3CWHDhoFo.apk',
  
  // Storage key for remembering dismissal of the full-screen prompt
  storageKeyDismissed: 'disasterchain_native_app_prompt_dismissed',
  
  // Emergency Capabilities
  capabilities: [
    { id: 'situation', label: 'LIVE SITUATION', icon: 'activity' },
    { id: 'maps', label: 'TACTICAL MAPS', icon: 'map' },
    { id: 'alerts', label: 'EMERGENCY ALERTS', icon: 'bell' },
    { id: 'weather', label: 'WEATHER INTELLIGENCE', icon: 'cloud-rain' },
    { id: 'shelters', label: 'SHELTERS', icon: 'home' },
    { id: 'sos', label: 'SOS + 112', icon: 'alert-circle' },
    { id: 'offline', label: 'OFFLINE ACCESS', icon: 'wifi-off' },
  ],

  // Preview screenshots
  previewImage: '/assets/native-app-situation.png',
  launchImage: '/assets/native-app-launch.png',
};

export default NATIVE_APP_CONFIG;
