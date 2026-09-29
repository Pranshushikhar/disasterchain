import { RiskLevel } from './situation';

export interface AlertItem {
  id: string;
  _id?: string;
  title: string;
  severity: RiskLevel;
  timestamp: string;
  location: string;
  affectedArea?: string;
  whatHappened: string;
  whyItMatters: string;
  recommendedAction: string;
  source: string;
  freshness: string;
  isCritical: boolean;
  category: 'WEATHER' | 'FLOOD' | 'CIVIL' | 'SHELTER' | 'INFRASTRUCTURE';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  deepLink?: string;
}
