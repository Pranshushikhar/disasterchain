import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { reverseGeocode, searchLocations } from '../services/weatherApi';

const ACTIVE_LOCATION_STORAGE_KEY = 'disasterchain_active_location';
const COORDS_STORAGE_KEY = 'disasterchain_user_coords';
const LOCATION_STORAGE_KEY = 'disasterchain_user_location';
const DETAILS_STORAGE_KEY = 'disasterchain_location_details';

// Top preset Indian cities for instant 1-click selection
export const POPULAR_INDIAN_CITIES = [
  { city: 'Kharar', state: 'Punjab', country: 'India', displayName: 'Kharar, Punjab, India', lat: 30.7499, lon: 76.6411 },
  { city: 'Chandigarh', state: 'Punjab', country: 'India', displayName: 'Chandigarh, Punjab, India', lat: 30.7333, lon: 76.7794 },
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', displayName: 'Mumbai, Maharashtra, India', lat: 19.076, lon: 72.8777 },
  { city: 'New Delhi', state: 'Delhi', country: 'India', displayName: 'New Delhi, Delhi, India', lat: 28.6139, lon: 77.209 },
  { city: 'Bengaluru', state: 'Karnataka', country: 'India', displayName: 'Bengaluru, Karnataka, India', lat: 12.9716, lon: 77.5946 },
  { city: 'Kolkata', state: 'West Bengal', country: 'India', displayName: 'Kolkata, West Bengal, India', lat: 22.5726, lon: 88.3639 },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', displayName: 'Chennai, Tamil Nadu, India', lat: 13.0827, lon: 80.2707 },
  { city: 'Hyderabad', state: 'Telangana', country: 'India', displayName: 'Hyderabad, Telangana, India', lat: 17.385, lon: 78.4867 },
  { city: 'Pune', state: 'Maharashtra', country: 'India', displayName: 'Pune, Maharashtra, India', lat: 18.5204, lon: 73.8567 },
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India', displayName: 'Ahmedabad, Gujarat, India', lat: 23.0225, lon: 72.5714 },
  { city: 'Jaipur', state: 'Rajasthan', country: 'India', displayName: 'Jaipur, Rajasthan, India', lat: 26.9124, lon: 75.7873 },
  { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India', displayName: 'Lucknow, Uttar Pradesh, India', lat: 26.8467, lon: 80.9462 },
  { city: 'Kochi', state: 'Kerala', country: 'India', displayName: 'Kochi, Kerala, India', lat: 9.9312, lon: 76.2673 },
  { city: 'Guwahati', state: 'Assam', country: 'India', displayName: 'Guwahati, Assam, India', lat: 26.1445, lon: 91.7362 },
  { city: 'Srinagar', state: 'Jammu and Kashmir', country: 'India', displayName: 'Srinagar, Jammu and Kashmir, India', lat: 34.0837, lon: 74.7973 },
  { city: 'Patna', state: 'Bihar', country: 'India', displayName: 'Patna, Bihar, India', lat: 25.6093, lon: 85.1235 },
  { city: 'Bhopal', state: 'Madhya Pradesh', country: 'India', displayName: 'Bhopal, Madhya Pradesh, India', lat: 23.2599, lon: 77.4126 },
  { city: 'Bhubaneswar', state: 'Odisha', country: 'India', displayName: 'Bhubaneswar, Odisha, India', lat: 20.2961, lon: 85.8245 },
];

/**
 * Authoritative helper to extract clean, consistent city name
 * Ensures city name ALWAYS matches the primary place in displayName.
 */
export function extractCityName(displayName, explicitCity) {
  if (explicitCity && typeof explicitCity === 'string' && explicitCity.trim()) {
    const trimmed = explicitCity.trim();
    if (
      trimmed !== 'Current Location' &&
      trimmed !== 'Selected City' &&
      trimmed !== 'Selected Area' &&
      trimmed !== 'Your Sector'
    ) {
      if (!displayName || displayName.toLowerCase().includes(trimmed.toLowerCase())) {
        return trimmed;
      }
    }
  }

  if (displayName && typeof displayName === 'string' && displayName.trim()) {
    const firstPart = displayName.split(',')[0].trim();
    if (firstPart && !firstPart.includes('°N') && !firstPart.includes('°S')) {
      return firstPart;
    }
  }

  return 'Your Sector';
}

/**
 * Hydrate authoritative active location on startup
 */
function getInitialLocation() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return POPULAR_INDIAN_CITIES[0];
  }

  // 1. Authoritative unified storage record
  try {
    const raw = localStorage.getItem(ACTIVE_LOCATION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.lat != null && parsed.lon != null) {
        const city = extractCityName(parsed.displayName, parsed.city);
        return {
          city,
          state: parsed.state || '',
          country: parsed.country || 'India',
          displayName: parsed.displayName || `${city}, India`,
          lat: Number(parsed.lat),
          lon: Number(parsed.lon),
          source: parsed.source || 'manual',
          updatedAt: parsed.updatedAt || Date.now(),
        };
      }
    }
  } catch (e) {}

  // 2. Legacy storage keys with strict consistency validation
  try {
    const legacyName = localStorage.getItem(LOCATION_STORAGE_KEY);
    const legacyCoordsRaw = localStorage.getItem(COORDS_STORAGE_KEY);
    const legacyDetailsRaw = localStorage.getItem(DETAILS_STORAGE_KEY);

    let legacyCoords = null;
    if (legacyCoordsRaw) {
      try { legacyCoords = JSON.parse(legacyCoordsRaw); } catch (e) {}
    }

    let legacyDetails = null;
    if (legacyDetailsRaw) {
      try { legacyDetails = JSON.parse(legacyDetailsRaw); } catch (e) {}
    }

    if (legacyName && legacyName.trim()) {
      const displayName = legacyName.trim();
      const city = extractCityName(displayName, legacyDetails?.city);
      const lat = legacyCoords?.lat ?? legacyDetails?.lat ?? POPULAR_INDIAN_CITIES[0].lat;
      const lon = legacyCoords?.lon ?? legacyDetails?.lon ?? POPULAR_INDIAN_CITIES[0].lon;
      return {
        city,
        state: legacyDetails?.state || '',
        country: legacyDetails?.country || 'India',
        displayName,
        lat: Number(lat),
        lon: Number(lon),
        source: 'manual',
        updatedAt: Date.now(),
      };
    }
  } catch (e) {}

  // 3. Fallback to default preset
  return POPULAR_INDIAN_CITIES[0];
}

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  // Single Authoritative Active Location State
  const [locationState, setLocationState] = useState(() => getInitialLocation());

  const [isLocating, setIsLocating] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false);

  // Synchronize location across storage keys
  const persistLocation = useCallback((activeLoc) => {
    if (!activeLoc) return;
    try {
      localStorage.setItem(ACTIVE_LOCATION_STORAGE_KEY, JSON.stringify(activeLoc));
      localStorage.setItem(COORDS_STORAGE_KEY, JSON.stringify({ lat: activeLoc.lat, lon: activeLoc.lon }));
      localStorage.setItem(LOCATION_STORAGE_KEY, activeLoc.displayName);
      localStorage.setItem(DETAILS_STORAGE_KEY, JSON.stringify(activeLoc));
    } catch (e) {}
  }, []);

  // Request live browser GPS location
  const requestGpsLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setPermissionDenied(true);
      return;
    }

    setIsLocating(true);
    setPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newCoords = {
          lat: Number(pos.coords.latitude.toFixed(4)),
          lon: Number(pos.coords.longitude.toFixed(4)),
        };

        try {
          const rev = await reverseGeocode(newCoords.lat, newCoords.lon);
          const rawCity = rev?.city || '';
          const state = rev?.state || rev?.region || '';
          const country = rev?.country || 'India';
          const displayName = rev?.displayName || (state ? `${rawCity || 'Current Location'}, ${state}` : `${rawCity || 'Current Location'}, ${country}`);
          const city = extractCityName(displayName, rawCity);

          const activeLoc = {
            city,
            state,
            country,
            displayName,
            lat: newCoords.lat,
            lon: newCoords.lon,
            source: 'gps',
            updatedAt: Date.now(),
          };

          setLocationState(activeLoc);
          setIsLocating(false);
          persistLocation(activeLoc);
        } catch (err) {
          const fallbackName = `${newCoords.lat.toFixed(2)}°N, ${newCoords.lon.toFixed(2)}°E`;
          const activeLoc = {
            city: 'Current Location',
            state: '',
            country: 'India',
            displayName: fallbackName,
            lat: newCoords.lat,
            lon: newCoords.lon,
            source: 'gps',
            updatedAt: Date.now(),
          };
          setLocationState(activeLoc);
          setIsLocating(false);
          persistLocation(activeLoc);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          // PERMISSION_DENIED
          setPermissionDenied(true);
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [persistLocation]);

  // On mount, only attempt GPS if user has not explicitly chosen a manual location
  useEffect(() => {
    try {
      const activeRaw = localStorage.getItem(ACTIVE_LOCATION_STORAGE_KEY);
      if (activeRaw) {
        const parsed = JSON.parse(activeRaw);
        if (parsed?.source === 'manual') {
          return;
        }
      }
      const legacyName = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (legacyName && legacyName.trim()) {
        return;
      }
    } catch (e) {}

    requestGpsLocation();
  }, [requestGpsLocation]);

  // Set location manually from selector modal
  const setManualLocation = useCallback(
    (loc) => {
      if (!loc || loc.lat == null || loc.lon == null) return;
      const newCoords = { lat: Number(loc.lat), lon: Number(loc.lon) };
      const rawCity = loc.city || loc.name || '';
      const state = loc.state || loc.admin1 || loc.region || '';
      const country = loc.country || 'India';
      const displayName = loc.displayName || (state ? `${rawCity || loc.name}, ${state}` : `${rawCity || loc.name}, ${country}`);
      const city = extractCityName(displayName, rawCity);

      const activeLoc = {
        city,
        state,
        country,
        displayName,
        lat: newCoords.lat,
        lon: newCoords.lon,
        source: 'manual',
        updatedAt: Date.now(),
      };

      setLocationState(activeLoc);
      setIsLocating(false);
      setPermissionDenied(false);
      persistLocation(activeLoc);
      setIsCitySelectorOpen(false);
    },
    [persistLocation]
  );

  const openCitySelector = useCallback(() => setIsCitySelectorOpen(true), []);
  const closeCitySelector = useCallback(() => setIsCitySelectorOpen(false), []);

  const value = useMemo(
    () => ({
      coords: { lat: locationState.lat, lon: locationState.lon },
      locationName: locationState.displayName,
      locationDetails: locationState,
      city: locationState.city,
      state: locationState.state,
      country: locationState.country,
      source: locationState.source,
      isGpsLocked: locationState.source === 'gps',
      isLocating,
      permissionDenied,
      lastUpdated: new Date(locationState.updatedAt || Date.now()),
      requestGpsLocation,
      setManualLocation,
      searchCities: searchLocations,
      isCitySelectorOpen,
      openCitySelector,
      closeCitySelector,
      popularCities: POPULAR_INDIAN_CITIES,
    }),
    [
      locationState,
      isLocating,
      permissionDenied,
      requestGpsLocation,
      setManualLocation,
      isCitySelectorOpen,
      openCitySelector,
      closeCitySelector,
    ]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useDCLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useDCLocation must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;
