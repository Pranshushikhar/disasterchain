import AsyncStorage from '@react-native-async-storage/async-storage';
import { SituationData } from '../types/situation';
import { AlertItem } from '../types/alert';
import { ShelterItem } from '../types/shelter';
import { SosRecord } from '../types/sos';
import { UserSafetyProfile } from '../types/user';

const KEYS = {
  SITUATION: 'disasterchain_cached_situation',
  ALERTS: 'disasterchain_cached_alerts',
  SHELTERS: 'disasterchain_cached_shelters',
  LAST_SYNC: 'disasterchain_last_sync_timestamp',
  PENDING_SOS: 'disasterchain_pending_sos_queue',
  PENDING_REPORTS: 'disasterchain_pending_reports_queue',
  USER_PROFILE: 'disasterchain_user_profile',
  LAST_LOCATION: 'disasterchain_last_known_location',
};

export const storageService = {
  async saveSituation(data: SituationData): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SITUATION, JSON.stringify(data));
      await AsyncStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.warn('Failed to cache situation:', e);
    }
  },

  async getCachedSituation(): Promise<SituationData | null> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.SITUATION);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async saveAlerts(alerts: AlertItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Failed to cache alerts:', e);
    }
  },

  async getCachedAlerts(): Promise<AlertItem[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.ALERTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async saveShelters(shelters: ShelterItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SHELTERS, JSON.stringify(shelters));
    } catch (e) {
      console.warn('Failed to cache shelters:', e);
    }
  },

  async getCachedShelters(): Promise<ShelterItem[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.SHELTERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async getLastSyncTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.LAST_SYNC);
    } catch {
      return null;
    }
  },

  async savePendingSos(sos: SosRecord): Promise<void> {
    try {
      const existing = await this.getPendingSosQueue();
      const updated = [sos, ...existing.filter((s) => s.requestId !== sos.requestId)];
      await AsyncStorage.setItem(KEYS.PENDING_SOS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to queue offline SOS:', e);
    }
  },

  async getPendingSosQueue(): Promise<SosRecord[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.PENDING_SOS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async clearPendingSos(requestId: string): Promise<void> {
    try {
      const existing = await this.getPendingSosQueue();
      const filtered = existing.filter((s) => s.requestId !== requestId);
      await AsyncStorage.setItem(KEYS.PENDING_SOS, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to remove pending SOS:', e);
    }
  },

  async saveUserProfile(profile: UserSafetyProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile:', e);
    }
  },

  async getUserProfile(): Promise<UserSafetyProfile | null> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async saveLastLocation(location: { latitude: number; longitude: number; name: string }): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.LAST_LOCATION, JSON.stringify(location));
    } catch (e) {
      console.warn('Failed to save last location:', e);
    }
  },

  async getLastLocation(): Promise<{ latitude: number; longitude: number; name: string } | null> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.LAST_LOCATION);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
};
