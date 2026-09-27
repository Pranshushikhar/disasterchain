import { NATIVE_APP_CONFIG } from '../config/nativeApp';

/**
 * Device and Platform Detection utilities for DisasterChain
 */

export const isAndroid = () => {
  if (typeof window === 'undefined' || !window.navigator) return false;
  const ua = window.navigator.userAgent || window.navigator.vendor || '';
  return /android/i.test(ua);
};

export const isIOS = () => {
  if (typeof window === 'undefined' || !window.navigator) return false;
  const ua = window.navigator.userAgent || window.navigator.vendor || '';
  const isIosUa = /iPad|iPhone|iPod/.test(ua);
  const isIpadOs = window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
  return isIosUa || isIpadOs;
};

export const isMobileDevice = () => {
  if (typeof window === 'undefined' || !window.navigator) return false;
  return isAndroid() || isIOS() || /Mobi|Android|iPhone/i.test(window.navigator.userAgent);
};

/**
 * Storage helpers for native app prompt dismissal
 */
export const hasDismissedNativeAppPrompt = () => {
  try {
    return localStorage.getItem(NATIVE_APP_CONFIG.storageKeyDismissed) === 'true';
  } catch (e) {
    return false;
  }
};

export const dismissNativeAppPrompt = () => {
  try {
    localStorage.setItem(NATIVE_APP_CONFIG.storageKeyDismissed, 'true');
  } catch (e) {
    console.warn('Unable to persist native app dismissal:', e);
  }
};

export const resetNativeAppPrompt = () => {
  try {
    localStorage.removeItem(NATIVE_APP_CONFIG.storageKeyDismissed);
  } catch (e) {
    console.warn('Unable to clear native app dismissal:', e);
  }
};

/**
 * Attempt deep link launch with safe fallback
 */
export const attemptNativeAppLaunch = (fallbackUrl) => {
  const scheme = NATIVE_APP_CONFIG.scheme;
  const start = Date.now();
  
  // Set up blur listener to see if app opened
  let hasBlurred = false;
  const onBlur = () => {
    hasBlurred = true;
    window.removeEventListener('blur', onBlur);
  };
  window.addEventListener('blur', onBlur);

  // Trigger custom URI scheme
  window.location.href = scheme;

  // Fallback to download if still in browser and not blurred after 2.5s
  setTimeout(() => {
    window.removeEventListener('blur', onBlur);
    if (!hasBlurred && (Date.now() - start < 3500)) {
      if (fallbackUrl) {
        window.location.href = fallbackUrl;
      }
    }
  }, 2500);
};
