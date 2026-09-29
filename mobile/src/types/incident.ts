export type IncidentCategory =
  | 'Flooding'
  | 'Road blockage'
  | 'Fire'
  | 'Structural damage'
  | 'Power outage'
  | 'Medical emergency'
  | 'Other';

export type IncidentReportStatus = 'IDLE' | 'UPLOADING' | 'VERIFYING' | 'SUBMITTED' | 'FAILED_RETRY';

export interface IncidentReportPayload {
  category: IncidentCategory;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  locationName: string;
  latitude: number;
  longitude: number;
  photoUri?: string;
  timestamp: string;
}

export interface IncidentItem {
  id: string;
  _id?: string;
  title: string;
  category: IncidentCategory;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  verificationSource?: string;
  status: 'Reported' | 'Verified' | 'Investigating' | 'Resolved';
  reportedAt: string;
  photoUrl?: string;
}
