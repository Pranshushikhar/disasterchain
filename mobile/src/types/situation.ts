export type RiskLevel = 'CRITICAL' | 'ELEVATED' | 'ADVISORY' | 'NORMAL';

export interface WhyReason {
  id: string;
  metric: string;
  value: string;
  threshold: string;
  status: 'exceeded' | 'approaching' | 'normal';
}

export interface WhatChangedEvent {
  id: string;
  time: string;
  title: string;
  detail: string;
  severity: RiskLevel;
}

export interface ImpactNode {
  trigger: string;
  mechanism: string;
  consequence: string;
  operationalDirective: string;
}

export interface TelemetryData {
  rainfallMm: number;
  drainageCapacityPct: number;
  waterLevelMeters: number;
  activeIncidentsCount: number;
  shelterAvailabilityCount: number;
}

export interface LocalityContext {
  id: string;
  name: string;
  district: string;
  state: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  lastUpdated: string;
  isStale: boolean;
  isOffline: boolean;
}

export interface SituationData {
  locality: LocalityContext;
  headline: string;
  summary: string;
  currentRisk: RiskLevel;
  primaryDirective: string;
  why: WhyReason[];
  whatChanged: WhatChangedEvent[];
  impactChain: ImpactNode;
  telemetry: TelemetryData;
  sourceAttribution: string;
}
