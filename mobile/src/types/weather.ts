export interface WeatherCurrent {
  temperature: number;
  apparentTemperature?: number;
  condition: string;
  weatherCode: number;
  windSpeed: number;
  windGusts?: number;
  precipitation: number;
  humidity?: number;
  visibilityKm?: number;
  aqi?: number;
  aqiSeverity?: string;
}

export interface WeatherHourlyForecast {
  time: string;
  hour: string;
  temperature: number;
  precipitationMm: number;
  precipitationProbability: number;
  windSpeed: number;
  condition: string;
}

export interface WeatherImpactChain {
  currentCondition: string;
  primaryMechanism: string;
  groundImpact: string;
  roadDisruptionRisk: string;
}

export interface WeatherGPTStructuredResponse {
  answer: string;
  why: string;
  actionableDirective: string;
  dataUsed: string[];
  confidence: 'HIGH' | 'MODERATE' | 'PRELIMINARY';
  riskLevel: 'CRITICAL' | 'ELEVATED' | 'ADVISORY' | 'NORMAL';
  locationName: string;
  timestamp: string;
}
