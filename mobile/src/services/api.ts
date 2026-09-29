import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

/**
 * Centralized API Client Configuration
 * Supports Development, Staging, and Production without hardcoding localhost.
 */

const getApiBaseUrl = (): string => {
  // 1. Check explicit environment variable (EXPO_PUBLIC_API_URL)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Check Expo manifest extra configuration
  const extraApiUrl = Constants.expoConfig?.extra?.apiUrl;
  if (extraApiUrl) {
    return extraApiUrl;
  }

  // 3. In development on physical device or emulator, derive from debugger host if possible
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (__DEV__ && debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:5000/api`;
  }

  // 4. Default fallback: production backend or local dev server
  if (__DEV__) {
    return 'http://localhost:5000/api';
  }

  return 'https://disasterchain.vercel.app/api';
};

export const API_BASE_URL = getApiBaseUrl();

const TOKEN_KEY = 'disasterchain_jwt_token';

export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.warn('SecureStore error saving auth token:', error);
  }
}

export async function clearAuthToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.warn('SecureStore error deleting auth token:', error);
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  isOfflineCache?: boolean;
}

/**
 * Robust fetch wrapper with timeout, token injection, and safe error mapping
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 8000
): Promise<ApiResponse<T>> {
  const token = await getAuthToken();
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await response.json();
    return json;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Network request timed out. Operating in offline/cached mode.',
      };
    }

    return {
      success: false,
      message: error?.message || 'Server connection temporarily unavailable.',
    };
  }
}
