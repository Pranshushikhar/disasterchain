import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { reverseGeocode, searchLocations } from '../services/weatherApi';

const COORDS_STORAGE_KEY = 'disasterchain_user_coords';
const LOCATION_STORAGE_KEY = 'disasterchain_user_location';
const DETAILS_STORAGE_KEY = 'disasterchain_location_details';

// Neutral default location when GPS has not been granted yet and no cache exists
const DEFAULT_LOCATION = {
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  displayName: 'Mumbai, Maharashtra, India',
  lat: 19.076,
  lon: 72.8777,
};

// Top preset Indian cities for instant 1-click selection
export const POPULAR_INDIAN_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', displayName: 'Mumbai, Maharashtra, India', lat: 19.076, lon: 72.8777 },
  { city: 'New Delhi', state: 'Delhi', country: 'India', displayName: 'New Delhi, Delhi, India', lat: 28.6139, lon: 77.209 },
  { city: 'Bengaluru', state: 'Karnataka', country: 'India', displayName: 'Bengaluru, Karnataka, India', lat: 12.9716, lon: 77.5946 },
  { city: 'Kolkata', state: 'West Bengal', country: 'India', displayName: 'Kolkata, West Bengal, India', lat: 22.5726, lon: 88.3639 },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', displayName: 'Chennai, Tamil Nadu, India', lat: 13.0827, lon: 80.2707 },
  { city: 'Hyderabad', state: 'Telangana', country: 'India', displayName: 'Hyderabad, Telangana, India', lat: 17.385, lon: 78.4867 },
  { city: 'Chandigarh', state: 'Punjab', country: 'India', displayName: 'Chandigarh, Punjab, India', lat: 30.7333, lon: 76.7794 },
  { city: 'Kharar', state: 'Punjab', country: 'India', displayName: 'Kharar, Punjab, India', lat: 30.7499, lon: 76.6411 },
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

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  // Read saved coordinates or fallback
  const [coords, setCoords] = useState(() => {
    try {
      const saved = localStorage.getItem(COORDS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lat != null && parsed.lon != null) return parsed;
      }
    } catch (e) {}
    return { lat: DEFAULT_LOCATION.lat, lon: DEFAULT_LOCATION.lon };
  });

  // Read saved location display name
  const [locationName, setLocationName] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved && saved.trim()) return saved.trim();
    } catch (e) {}
    return DEFAULT_LOCATION.displayName;
  });

  // Detailed structured location info
  const [locationDetails, setLocationDetails] = useState(() => {
    try {
      const saved = localStorage.getItem(DETAILS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_LOCATION;
  });

  const [isGpsLocked, setIsGpsLocked] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  // Save changes to localStorage whenever location updates
  const persistLocation = useCallback((newCoords, name, details) => {
    try {
      localStorage.setItem(COORDS_STORAGE_KEY, JSON.stringify(newCoords));
      localStorage.setItem(LOCATION_STORAGE_KEY, name);
      if (details) {
        localStorage.setItem(DETAILS_STORAGE_KEY, JSON.stringify(details));
      }
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
        setCoords(newCoords);
        setIsGpsLocked(true);
        setIsLocating(false);

        try {
          const rev = await reverseGeocode(newCoords.lat, newCoords.lon);
          const city = rev?.city || 'Current Location';
          const state = rev?.state || rev?.region || '';
          const country = rev?.country || 'India';
          const displayName = rev?.displayName || (state ? `${city}, ${state}` : `${city}, ${country}`);

          const details = {
            city,
            state,
            country,
            displayName,
            lat: newCoords.lat,
            lon: newCoords.lon,
          };

          setLocationName(displayName);
          setLocationDetails(details);
          persistLocation(newCoords, displayName, details);
          setLastUpdated(new Date());
        } catch (err) {
          const fallbackName = `${newCoords.lat.toFixed(2)}°N, ${newCoords.lon.toFixed(2)}°E`;
          setLocationName(fallbackName);
          persistLocation(newCoords, fallbackName, { ...DEFAULT_LOCATION, ...newCoords, displayName: fallbackName });
          setLastUpdated(new Date());
        }
      },
      (err) => {
        setIsLocating(false);
        setIsGpsLocked(false);
        if (err.code === 1) {
          // PERMISSION_DENIED
          setPermissionDenied(true);
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [persistLocation]);

  // Try GPS on mount if not already saved
  useEffect(() => {
    const hasSaved = localStorage.getItem(COORDS_STORAGE_KEY);
    if (!hasSaved) {
      requestGpsLocation();
    }
  }, [requestGpsLocation]);

  // Set location manually from selector
  const setManualLocation = useCallback(
    (loc) => {
      if (!loc || loc.lat == null || loc.lon == null) return;
      const newCoords = { lat: Number(loc.lat), lon: Number(loc.lon) };
      const city = loc.city || loc.name || 'Selected City';
      const state = loc.state || loc.admin1 || loc.region || '';
      const country = loc.country || 'India';
      const displayName = loc.displayName || (state ? `${city}, ${state}` : `${city}, ${country}`);

      const details = {
        city,
        state,
        country,
        displayName,
        lat: newCoords.lat,
        lon: newCoords.lon,
      };

      setCoords(newCoords);
      setLocationName(displayName);
      setLocationDetails(details);
      setIsGpsLocked(false);
      setPermissionDenied(false);
      persistLocation(newCoords, displayName, details);
      setLastUpdated(new Date());
      setIsCitySelectorOpen(false);
    },
    [persistLocation]
  );

  const openCitySelector = useCallback(() => setIsCitySelectorOpen(true), []);
  const closeCitySelector = useCallback(() => setIsCitySelectorOpen(false), []);

  const value = useMemo(
    () => ({
      coords,
      locationName,
      locationDetails,
      city: locationDetails.city || locationName.split(',')[0].trim() || 'Selected Area',
      state: locationDetails.state || '',
      country: locationDetails.country || 'India',
      isGpsLocked,
      isLocating,
      permissionDenied,
      lastUpdated,
      requestGpsLocation,
      setManualLocation,
      searchCities: searchLocations,
      isCitySelectorOpen,
      openCitySelector,
      closeCitySelector,
      popularCities: POPULAR_INDIAN_CITIES,
    }),
    [
      coords,
      locationName,
      locationDetails,
      isGpsLocked,
      isLocating,
      permissionDenied,
      lastUpdated,
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
