export interface ShelterItem {
  id: string;
  _id?: string;
  name: string;
  location: string;
  district?: string;
  distanceKm?: number;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  status: 'Open' | 'Full' | 'Closed' | 'Standby';
  accessibility: {
    wheelchairAccessible: boolean;
    medicalSupport: boolean;
    foodWaterAvailable: boolean;
    powerBackup: boolean;
  };
  contactNumber?: string;
  source: string; // e.g. "Municipal Corporation Verified" or "NGO Volunteer Managed"
  lastUpdated: string;
  isOfficialGov: boolean;
}
