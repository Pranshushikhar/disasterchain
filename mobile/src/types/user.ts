export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface NotificationPreferences {
  criticalEmergencies: boolean;
  severeWeather: boolean;
  nearbyIncidents: boolean;
  shelterChanges: boolean;
  communityUpdates: boolean;
}

export interface UserSafetyProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  homeLocality: string;
  role: 'citizen' | 'volunteer' | 'responder' | 'ngo' | 'admin';
  emergencyContacts: EmergencyContact[];
  notificationPreferences: NotificationPreferences;
  language: string;
  accessibility: {
    largeText: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    hapticFeedback: boolean;
  };
}
