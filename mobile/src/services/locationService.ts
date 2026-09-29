import * as Location from 'expo-location';
import { storageService } from './storageService';

export interface LocationState {
  latitude: number;
  longitude: number;
  localityName: string;
  accuracy: 'precise' | 'approximate' | 'fallback' | 'manual';
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  isManual: boolean;
}

export const KNOWN_LOCALITIES = [
  { name: 'Chandigarh', latitude: 30.7333, longitude: 76.7794, district: 'Chandigarh' },
  { name: 'Sector 17, Chandigarh', latitude: 30.7414, longitude: 76.7849, district: 'Chandigarh' },
  { name: 'Panchkula', latitude: 30.6942, longitude: 76.8606, district: 'Panchkula' },
  { name: 'Mohali / SAS Nagar', latitude: 30.7046, longitude: 76.7179, district: 'Mohali' },
  { name: 'Shimla', latitude: 31.1048, longitude: 77.1734, district: 'Shimla' },
  { name: 'Delhi NCR', latitude: 28.6139, longitude: 77.209, district: 'Central Delhi' },
  { name: 'Mumbai', latitude: 19.076, longitude: 72.8777, district: 'Mumbai' },
  { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, district: 'Bengaluru Urban' },
];

export const locationService = {
  getPermissionRationale(): string {
    return 'DisasterChain requires your location to determine active flood risks, show the nearest open civil shelters, center the crisis map, and attach accurate coordinates to SOS dispatches.';
  },

  async checkPermission(): Promise<Location.PermissionStatus> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status;
    } catch {
      return Location.PermissionStatus.UNDETERMINED;
    }
  },

  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === Location.PermissionStatus.GRANTED;
    } catch {
      return false;
    }
  },

  async getCurrentLocation(): Promise<LocationState> {
    // 1. Check existing permission
    const currentStatus = await this.checkPermission();

    if (currentStatus !== Location.PermissionStatus.GRANTED) {
      // Try cached location
      const cached = await storageService.getLastLocation();
      if (cached) {
        return {
          latitude: cached.latitude,
          longitude: cached.longitude,
          localityName: cached.name,
          accuracy: 'fallback',
          permissionStatus: currentStatus === Location.PermissionStatus.DENIED ? 'denied' : 'undetermined',
          isManual: false,
        };
      }

      // Default safe locality
      const defaultLoc = KNOWN_LOCALITIES[0];
      return {
        latitude: defaultLoc.latitude,
        longitude: defaultLoc.longitude,
        localityName: defaultLoc.name,
        accuracy: 'fallback',
        permissionStatus: currentStatus === Location.PermissionStatus.DENIED ? 'denied' : 'undetermined',
        isManual: false,
      };
    }

    try {
      // Try last known first for instantaneous UI
      const lastKnown = await Location.getLastKnownPositionAsync();
      let lat = lastKnown?.coords.latitude || KNOWN_LOCALITIES[0].latitude;
      let lon = lastKnown?.coords.longitude || KNOWN_LOCALITIES[0].longitude;
      let accuracy: 'precise' | 'approximate' = 'approximate';

      // Then obtain fresh location with balanced accuracy to avoid draining battery
      const fresh = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (fresh) {
        lat = fresh.coords.latitude;
        lon = fresh.coords.longitude;
        accuracy = (fresh.coords.accuracy || 100) < 50 ? 'precise' : 'approximate';
      }

      // Reverse geocode to resolve human readable locality
      let localityName = 'Chandigarh';
      try {
        const [geocode] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
        if (geocode) {
          localityName = geocode.subregion || geocode.district || geocode.city || geocode.name || 'Chandigarh';
        }
      } catch {
        localityName = 'Chandigarh';
      }

      await storageService.saveLastLocation({ latitude: lat, longitude: lon, name: localityName });

      return {
        latitude: lat,
        longitude: lon,
        localityName,
        accuracy,
        permissionStatus: 'granted',
        isManual: false,
      };
    } catch {
      const defaultLoc = KNOWN_LOCALITIES[0];
      return {
        latitude: defaultLoc.latitude,
        longitude: defaultLoc.longitude,
        localityName: defaultLoc.name,
        accuracy: 'fallback',
        permissionStatus: 'granted',
        isManual: false,
      };
    }
  },

  selectManualLocality(localityName: string): LocationState {
    const found = KNOWN_LOCALITIES.find(
      (l) => l.name.toLowerCase() === localityName.toLowerCase()
    ) || KNOWN_LOCALITIES[0];

    storageService.saveLastLocation({
      latitude: found.latitude,
      longitude: found.longitude,
      name: found.name,
    });

    return {
      latitude: found.latitude,
      longitude: found.longitude,
      localityName: found.name,
      accuracy: 'manual',
      permissionStatus: 'undetermined',
      isManual: true,
    };
  },
};
