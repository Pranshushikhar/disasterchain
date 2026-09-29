export type SosEmergencyCategory =
  | 'Flooding / Trapped Water'
  | 'Medical Emergency'
  | 'Structural Collapse'
  | 'Fire / Hazard'
  | 'Missing Person'
  | 'Other Imminent Danger';

export type SosSeverity = 'Critical' | 'High' | 'Medium';

export interface SosPayload {
  requestId: string;
  name: string;
  contact: string;
  emergencyType: SosEmergencyCategory;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  peopleAffected: number;
  severity: SosSeverity;
  clientTimestamp: string;
}

export interface SosRecord {
  requestId: string;
  status: 'QUEUED_OFFLINE' | 'DISPATCHING' | 'ACKNOWLEDGED' | 'RESOLVED';
  serverTimestamp?: string;
  clientTimestamp: string;
  location: string;
  latitude: number;
  longitude: number;
  emergencyType: SosEmergencyCategory;
  severity: SosSeverity;
  peopleAffected: number;
  networkStatus: 'ONLINE' | 'OFFLINE' | 'SYNC_PENDING';
  trackingStatus: 'BROADCAST_ACTIVE' | 'LOCAL_ONLY';
}
