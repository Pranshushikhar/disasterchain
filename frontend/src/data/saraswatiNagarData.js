/**
 * DISASTERCHAIN 2.0 — SARASWATI NAGAR DISTRICT SIMULATION DATA
 * Fictional District Dataset for Live Command, 3D Digital Twin,
 * Satellite Eye, Rescue Routing, and Resource Coordination.
 * 
 * NOTE: All data herein is explicitly designated as SIMULATED for training and demonstration.
 */

export const DISTRICT_META = {
  name: 'Saraswati Nagar',
  state: 'State of Northern Terran',
  country: 'India',
  center: [28.6139, 77.2090], // Lat, Lng
  zoom: 14,
  areaKm2: 42.5,
  population: 184500,
  riverName: 'Saraswati River',
  isSimulated: true,
  disclaimer: 'TRAINING & DEMONSTRATION SIMULATION ONLY • NOT LIVE EMERGENCY DISPATCH'
};

export const SECTORS = [
  {
    id: 'sec-1',
    name: 'Sector 1: Historic Old Quarter',
    type: 'High-Density Residential & Heritage Market',
    elevationMeters: 214,
    vulnerability: 'High',
    population: 48000,
    center: [28.6185, 77.2020],
    bounds: [[28.6230, 77.1960], [28.6140, 77.2080]],
    riskFactors: ['Aging masonry structures', 'Narrow alleyways', 'Prone to structural tremors']
  },
  {
    id: 'sec-2',
    name: 'Sector 2: Riverfront Promenade & Barrage',
    type: 'Lowland Commercial & Embankment',
    elevationMeters: 206,
    vulnerability: 'Extreme',
    population: 26000,
    center: [28.6110, 77.2050],
    bounds: [[28.6160, 77.1990], [28.6060, 77.2110]],
    riskFactors: ['Immediate river floodplain', 'Barrage overflow risk', 'High runoff pooling']
  },
  {
    id: 'sec-3',
    name: 'Sector 3: Cyber Heights Tech Park',
    type: 'Commercial & Multi-Story Corporate',
    elevationMeters: 228,
    vulnerability: 'Moderate',
    population: 32000,
    center: [28.6220, 77.2180],
    bounds: [[28.6280, 77.2120], [28.6160, 77.2240]],
    riskFactors: ['High-rise glass facade hazards', 'Underground parking flooding', 'Elevator entrapment']
  },
  {
    id: 'sec-4',
    name: 'Sector 4: Medical Enclave & Civic Centre',
    type: 'Critical Infrastructure & Government',
    elevationMeters: 222,
    vulnerability: 'Critical Protection Priority',
    population: 18500,
    center: [28.6130, 77.2200],
    bounds: [[28.6180, 77.2140], [28.6080, 77.2260]],
    riskFactors: ['Critical hospital road accessibility', 'Oxygen depot power dependence']
  },
  {
    id: 'sec-5',
    name: 'Sector 5: Shanti Nagar Residential Ward',
    type: 'Suburban Residential & Schools',
    elevationMeters: 219,
    vulnerability: 'Moderate',
    population: 41000,
    center: [28.6040, 77.2010],
    bounds: [[28.6090, 77.1950], [28.5990, 77.2070]],
    riskFactors: ['Drainage culvert blockages', 'High concentration of elderly & school children']
  },
  {
    id: 'sec-6',
    name: 'Sector 6: Udyog Vihar Industrial Estate',
    type: 'Heavy Industrial & Chemical Warehouses',
    elevationMeters: 216,
    vulnerability: 'High Chemical Hazard',
    population: 19000,
    center: [28.6030, 77.2190],
    bounds: [[28.6080, 77.2130], [28.5980, 77.2250]],
    riskFactors: ['Petroleum & chemical storage tanks', 'Toxic runoff into floodwaters', 'Industrial fire flare']
  }
];

export const BRIDGES_AND_ROADS = [
  {
    id: 'road-art-1',
    name: 'Mahatma Gandhi Marg (Main Artery)',
    type: 'Primary Arterial 4-Lane',
    fromSector: 'sec-1',
    toSector: 'sec-4',
    lengthKm: 2.8,
    elevationMeters: 215,
    isBridge: false,
    capacityPerHour: 4500,
    status: 'Open',
    hazardRisk: 'Low'
  },
  {
    id: 'bridge-1',
    name: 'Saraswati Central Bridge (Old Bridge)',
    type: 'Masonry Arch Bridge',
    fromSector: 'sec-1',
    toSector: 'sec-2',
    lengthKm: 0.65,
    elevationMeters: 209,
    isBridge: true,
    capacityPerHour: 1800,
    status: 'Vulnerable',
    hazardRisk: 'Critical Flooding & Structural Fatigue',
    submersionThresholdMeters: 2.2
  },
  {
    id: 'bridge-2',
    name: 'North Saraswati Elevated Flyover (Bypass)',
    type: 'Prestressed Concrete Expressway',
    fromSector: 'sec-3',
    toSector: 'sec-4',
    lengthKm: 1.4,
    elevationMeters: 232,
    isBridge: true,
    capacityPerHour: 6200,
    status: 'Open',
    hazardRisk: 'Safe High-Clearance Corridor',
    submersionThresholdMeters: 8.5
  },
  {
    id: 'road-riverbank',
    name: 'Promenade Riverbank Road',
    type: 'Secondary 2-Lane Waterfront',
    fromSector: 'sec-2',
    toSector: 'sec-5',
    lengthKm: 3.2,
    elevationMeters: 207,
    isBridge: false,
    capacityPerHour: 1200,
    status: 'Flooded',
    hazardRisk: 'Submerged under 1.4m flowing water'
  },
  {
    id: 'road-outer-ring',
    name: 'National Highway 44 Bypass (Outer Ring)',
    type: 'Elevated High-Speed Highway',
    fromSector: 'sec-5',
    toSector: 'sec-6',
    lengthKm: 4.6,
    elevationMeters: 228,
    isBridge: false,
    capacityPerHour: 8000,
    status: 'Open',
    hazardRisk: 'Safe All-Weather Evacuation Route'
  }
];

export const CRITICAL_FACILITIES = [
  {
    id: 'fac-hosp-1',
    name: 'Saraswati District Civil Hospital',
    type: 'Hospital',
    category: 'Tertiary Medical & Trauma',
    sector: 'sec-4',
    coordinates: [28.6142, 77.2215],
    coords3D: { x: 35, y: 0, z: -15 },
    totalBeds: 450,
    availableBeds: 62,
    icuBedsTotal: 40,
    icuBedsAvailable: 8,
    generatorBackupHours: 72,
    floodRiskLevel: 'Low',
    hasHelipad: true,
    status: 'Operational'
  },
  {
    id: 'fac-hosp-2',
    name: 'LifeLine Metro Trauma Clinic',
    type: 'Hospital',
    category: 'Acute Trauma Care',
    sector: 'sec-1',
    coordinates: [28.6178, 77.2035],
    coords3D: { x: -40, y: 0, z: 25 },
    totalBeds: 120,
    availableBeds: 14,
    icuBedsTotal: 12,
    icuBedsAvailable: 2,
    generatorBackupHours: 24,
    floodRiskLevel: 'Moderate',
    hasHelipad: false,
    status: 'Operational - Nearing Capacity'
  },
  {
    id: 'fac-shltr-1',
    name: 'Saraswati Indoor Sports Stadium Shelter',
    type: 'Shelter',
    category: 'Designated Primary Relief Center',
    sector: 'sec-4',
    coordinates: [28.6118, 77.2230],
    coords3D: { x: 42, y: 0, z: -30 },
    capacityTotal: 1800,
    currentOccupancy: 420,
    hasMedicalPost: true,
    potableWaterDays: 5,
    floodSafeElevation: true,
    status: 'Active'
  },
  {
    id: 'fac-shltr-2',
    name: 'Government Model Senior School Hall',
    type: 'Shelter',
    category: 'Secondary Community Shelter',
    sector: 'sec-5',
    coordinates: [28.6052, 77.2025],
    coords3D: { x: -30, y: 0, z: -45 },
    capacityTotal: 650,
    currentOccupancy: 380,
    hasMedicalPost: true,
    potableWaterDays: 3,
    floodSafeElevation: true,
    status: 'Active'
  },
  {
    id: 'fac-shltr-3',
    name: 'Old Mandi Community Hall',
    type: 'Shelter',
    category: 'Emergency Shelter',
    sector: 'sec-2',
    coordinates: [28.6095, 77.2070],
    coords3D: { x: -10, y: 0, z: 10 },
    capacityTotal: 400,
    currentOccupancy: 290,
    hasMedicalPost: false,
    potableWaterDays: 1,
    floodSafeElevation: false,
    status: 'At Risk - Evacuation Recommended'
  }
];

export const RESPONSE_RESOURCES = [
  {
    id: 'res-ndrf-1',
    name: 'NDRF 8th Battalion Team Alpha',
    type: 'Rescue Team',
    specialization: 'Flood Rescue & Evacuation',
    baseSector: 'sec-4',
    personnelCount: 16,
    equipment: ['3x Zodiac Motorized Inflatable Boats', '18x Life Vests', '2x Satellite Comms'],
    status: 'Available',
    assignedIncidentId: null,
    coordinates: [28.6135, 77.2210]
  },
  {
    id: 'res-ndrf-2',
    name: 'NDRF Special USAR Team Bravo',
    type: 'Rescue Team',
    specialization: 'Urban Search & Structural Collapse',
    baseSector: 'sec-3',
    personnelCount: 14,
    equipment: ['Hydraulic Cutters', 'Life Detector Acoustic Sensor', 'Structural Jacks'],
    status: 'Available',
    assignedIncidentId: null,
    coordinates: [28.6210, 77.2170]
  },
  {
    id: 'res-amb-1',
    name: 'Civil Hospital ALS Ambulance #4',
    type: 'Ambulance',
    specialization: 'Advanced Life Support & Trauma Ventilator',
    baseSector: 'sec-4',
    personnelCount: 3,
    equipment: ['Portable Ventilator', 'Defibrillator', 'Oxygen Cylinders'],
    status: 'Available',
    assignedIncidentId: null,
    coordinates: [28.6140, 77.2218]
  },
  {
    id: 'res-amb-2',
    name: 'Red Cross Emergency Ambulance #2',
    type: 'Ambulance',
    specialization: 'Paramedic Patient Transport',
    baseSector: 'sec-5',
    personnelCount: 2,
    equipment: ['Basic Life Support', 'Stretcher & Spinal Board'],
    status: 'Dispatched',
    assignedIncidentId: 'sim-inc-1',
    coordinates: [28.6105, 77.2045]
  },
  {
    id: 'res-boat-1',
    name: 'SDRF River Rescue Boat Squad 1',
    type: 'Rescue Boat',
    specialization: 'High-Current Flood Navigation',
    baseSector: 'sec-2',
    personnelCount: 4,
    equipment: ['Inflatable Raft with 40HP Engine', 'Night Searchlight', 'Thermal Binoculars'],
    status: 'Available',
    assignedIncidentId: null,
    coordinates: [28.6120, 77.2065]
  },
  {
    id: 'res-truck-1',
    name: 'Civil Defense Heavy 4x4 Supply Truck',
    type: '4x4 Supply Truck',
    specialization: 'High-Clearance Wading & Rations',
    baseSector: 'sec-4',
    personnelCount: 4,
    equipment: ['800mm Wading Snorkel', '1500 Food Packets', 'Clean Water Bladder 3000L'],
    status: 'Available',
    assignedIncidentId: null,
    coordinates: [28.6125, 77.2225]
  }
];

export const DIGITAL_TWIN_BUILDINGS = [
  // Sector 1: Historic Old Quarter (Grid of dense brick masonry)
  { id: 'bld-s1-1', name: 'Old Town Clocktower Plaza', sector: 'sec-1', x: -45, z: 20, width: 8, height: 26, depth: 8, color: '#D8B98A', material: 'Masonry', occupants: 120, floodRisk: 35, seismicRisk: 85 },
  { id: 'bld-s1-2', name: 'Heritage Bazaar Commercial Complex', sector: 'sec-1', x: -35, z: 28, width: 14, height: 16, depth: 12, color: '#C8A97A', material: 'Brick & Timber', occupants: 450, floodRisk: 40, seismicRisk: 80 },
  { id: 'bld-s1-3', name: 'Shri Ram Residential Colony Block A', sector: 'sec-1', x: -50, z: 32, width: 12, height: 18, depth: 10, color: '#CDB188', material: 'Unreinforced Masonry', occupants: 320, floodRisk: 45, seismicRisk: 88 },
  { id: 'bld-s1-4', name: 'LifeLine Metro Trauma Clinic', sector: 'sec-1', x: -40, z: 12, width: 16, height: 22, depth: 14, color: '#5D8990', material: 'Reinforced Concrete', occupants: 160, floodRisk: 30, seismicRisk: 45, isCritical: true },

  // Sector 2: Riverfront Promenade (Low elevation, immediately adjacent to river)
  { id: 'bld-s2-1', name: 'Riverview Luxury Apartments', sector: 'sec-2', x: -15, z: 18, width: 14, height: 38, depth: 12, color: '#EFE9DC', material: 'Concrete Frame', occupants: 380, floodRisk: 92, seismicRisk: 50 },
  { id: 'bld-s2-2', name: 'Saraswati Embankment Warehouses', sector: 'sec-2', x: -5, z: 25, width: 22, height: 12, depth: 16, color: '#B86F52', material: 'Steel Shed', occupants: 80, floodRisk: 98, seismicRisk: 40 },
  { id: 'bld-s2-3', name: 'Promenade Waterfront Hotel & Convention', sector: 'sec-2', x: -20, z: 6, width: 18, height: 32, depth: 14, color: '#FFFDF8', material: 'Glass & Steel', occupants: 520, floodRisk: 88, seismicRisk: 55 },
  { id: 'bld-s2-4', name: 'Old Mandi Community Hall', sector: 'sec-2', x: -10, z: -5, width: 16, height: 14, depth: 12, color: '#D8B98A', material: 'Masonry', occupants: 290, floodRisk: 95, seismicRisk: 70, isCritical: true },

  // Sector 3: Cyber Heights Tech Park (Modern high-rises)
  { id: 'bld-s3-1', name: 'Cyber Heights Tower Alpha', sector: 'sec-3', x: 25, z: 35, width: 16, height: 64, depth: 16, color: '#5D8990', material: 'Steel Core / Glass', occupants: 1200, floodRisk: 15, seismicRisk: 60 },
  { id: 'bld-s3-2', name: 'CloudPeak Innovation Hub', sector: 'sec-3', x: 40, z: 30, width: 18, height: 52, depth: 18, color: '#496B5A', material: 'Reinforced Concrete', occupants: 950, floodRisk: 10, seismicRisk: 50 },
  { id: 'bld-s3-3', name: 'Digital Express Data Centre', sector: 'sec-3', x: 30, z: 45, width: 22, height: 24, depth: 20, color: '#263F35', material: 'Hardened Concrete', occupants: 140, floodRisk: 12, seismicRisk: 30, isCritical: true },

  // Sector 4: Medical Enclave & Civic Centre
  { id: 'bld-s4-1', name: 'Saraswati District Civil Hospital', sector: 'sec-4', x: 35, z: -15, width: 24, height: 30, depth: 20, color: '#4F8060', material: 'Seismic Base-Isolated Concrete', occupants: 680, floodRisk: 18, seismicRisk: 25, isCritical: true },
  { id: 'bld-s4-2', name: 'Civil Defense Command & Operations Hub', sector: 'sec-4', x: 48, z: -10, width: 16, height: 20, depth: 16, color: '#263F35', material: 'Hardened Reinforced Steel', occupants: 110, floodRisk: 15, seismicRisk: 20, isCritical: true },
  { id: 'bld-s4-3', name: 'Saraswati Indoor Sports Stadium Shelter', sector: 'sec-4', x: 42, z: -32, width: 30, height: 22, depth: 26, color: '#EFE9DC', material: 'Prestressed Truss', occupants: 420, floodRisk: 20, seismicRisk: 35, isCritical: true },

  // Sector 5: Shanti Nagar Residential Ward
  { id: 'bld-s5-1', name: 'Shanti Nagar Primary & Senior School', sector: 'sec-5', x: -30, z: -42, width: 24, height: 16, depth: 16, color: '#D8B98A', material: 'Reinforced Concrete Frame', occupants: 380, floodRisk: 38, seismicRisk: 48, isCritical: true },
  { id: 'bld-s5-2', name: 'Greenfields Cooperative Housing Block 1-4', sector: 'sec-5', x: -45, z: -35, width: 26, height: 22, depth: 18, color: '#C8A97A', material: 'Concrete Frame', occupants: 640, floodRisk: 42, seismicRisk: 52 },
  { id: 'bld-s5-3', name: 'Community Health Centre Ward 5', sector: 'sec-5', x: -20, z: -50, width: 14, height: 15, depth: 12, color: '#5D8990', material: 'Masonry', occupants: 90, floodRisk: 35, seismicRisk: 50 },

  // Sector 6: Udyog Vihar Industrial Estate
  { id: 'bld-s6-1', name: 'PetroChem Liquid Fuel Storage Depot', sector: 'sec-6', x: 25, z: -48, width: 22, height: 18, depth: 22, color: '#B86F52', material: 'Reinforced Steel Tanks', occupants: 65, floodRisk: 30, seismicRisk: 75, isHazardous: true },
  { id: 'bld-s6-2', name: 'Northern Agro-Fertilizer Chemical Silo', sector: 'sec-6', x: 38, z: -52, width: 18, height: 24, depth: 18, color: '#C38A35', material: 'Prestressed Steel Silos', occupants: 45, floodRisk: 25, seismicRisk: 70, isHazardous: true },
  { id: 'bld-s6-3', name: 'Central Logistics Dispatch Terminal', sector: 'sec-6', x: 15, z: -40, width: 32, height: 14, depth: 24, color: '#A0AEC0', material: 'Prefab Structural Steel', occupants: 180, floodRisk: 28, seismicRisk: 45 }
];

export const SIMULATION_SCENARIOS = [
  {
    id: 'flash-flood',
    title: 'Flash Flood & Urban Evacuation',
    category: 'Hydrological',
    difficulty: 'High Urgency',
    headline: 'Saraswati Barrage Release & Flash Cloudburst Surge',
    description: 'Catastrophic rainfall in upper catchment (185mm in 4h) forces emergency barrage release. Saraswati River overflows embankments into Sector 2 and lowlands of Sector 1.',
    durationMinutes: 15,
    initialConditions: {
      riverLevelMeters: 1.2,
      rainfallMmPerHour: 65,
      waterFlowKnots: 4.8,
      blockedRoadIds: ['road-riverbank'],
      activeIncidentIds: ['sim-inc-1', 'sim-inc-2'],
      sosCount: 6,
      threatenedBuildingIds: ['bld-s2-1', 'bld-s2-2', 'bld-s2-3', 'bld-s2-4']
    },
    timelineEvents: [
      {
        timeSeconds: 0,
        type: 'HAZARD_ALERT',
        title: 'River Level Crosses Warning Mark (1.5m)',
        description: 'Water breaches promenade retaining wall at Sector 2 waterfront. Promenade Riverbank Road impassable.',
        impact: { floodLevelIncrease: 0.4, newBlockedRoads: ['road-riverbank'] }
      },
      {
        timeSeconds: 30,
        type: 'NEW_SOS',
        title: 'SOS-201: Stranded Family with Mobility Impairment',
        description: 'Ground floor apartment submerged in 3 feet water at Riverview Apartments. Resident requires wheelchair assistance.',
        incidentData: {
          id: 'sim-inc-3',
          type: 'Flood Evacuation',
          severity: 'Critical',
          sector: 'sec-2',
          location: 'Riverview Luxury Apartments, Ground Floor',
          peopleAffected: 4,
          needsBoat: true,
          needsWheelchair: true
        }
      },
      {
        timeSeconds: 60,
        type: 'INFRASTRUCTURE_FAILURE',
        title: 'Saraswati Central Bridge Structural Alert',
        description: 'Pounding debris and surging flow compromises bridge pier #2. Water level reaches 2.4m, triggering safety closure.',
        impact: { bridgeFailure: 'bridge-1', newBlockedRoads: ['bridge-1'] }
      },
      {
        timeSeconds: 90,
        type: 'SECONDARY_HAZARD',
        title: 'Electrical Short & Substation Trip in Sector 2',
        description: 'Water ingress into municipal transformer causes localized blackout. 4 multi-story buildings lose backup pumping.',
        impact: { powerOutageSectors: ['sec-2'], vulnerableHospitalAlert: false }
      },
      {
        timeSeconds: 120,
        type: 'SHELTER_CAPACITY',
        title: 'Old Mandi Shelter Inundation Threat',
        description: 'Floodwaters encroaching within 30 meters of Old Mandi Community Hall. 290 evacuees require relocation to Sports Stadium.',
        impact: { shelterAtRisk: 'fac-shltr-3', recommendedDestination: 'fac-shltr-1' }
      }
    ]
  },
  {
    id: 'major-earthquake',
    title: 'Major Earthquake & Structural Collapse',
    category: 'Geological',
    difficulty: 'Extreme Severity',
    headline: 'Magnitude 6.8 Strike on Saraswati Fault Corridor',
    description: 'Shallow focal depth (12km) creates severe surface shaking across Sector 1 and Sector 6. Masonry wall collapses and jammed egress doors reported.',
    durationMinutes: 15,
    initialConditions: {
      riverLevelMeters: 0.8,
      rainfallMmPerHour: 0,
      structuralRubbleZones: ['sec-1', 'sec-6'],
      blockedRoadIds: ['bridge-1'],
      activeIncidentIds: ['sim-inc-eq-1', 'sim-inc-eq-2'],
      sosCount: 12,
      threatenedBuildingIds: ['bld-s1-1', 'bld-s1-2', 'bld-s1-3', 'bld-s6-1']
    },
    timelineEvents: [
      {
        timeSeconds: 0,
        type: 'SEISMIC_EVENT',
        title: 'Initial M6.8 Shockwave',
        description: 'Widespread structural cracking. Heritage buildings in Sector 1 experience partial parapet collapse.',
        impact: { damagedBuildingIds: ['bld-s1-1', 'bld-s1-3'] }
      },
      {
        timeSeconds: 30,
        type: 'GAS_LEAK_ALERT',
        title: 'Underground Gas Pipeline Fracture in Sector 1',
        description: 'Smell of methane reported near Heritage Bazaar. Fire Department requests immediate evacuation perimeter.',
        impact: { explosionRisk: true }
      },
      {
        timeSeconds: 60,
        type: 'AFTERSHOCK',
        title: 'M5.4 Aftershock Shakes Saraswati Valley',
        description: 'Further debris fall along Mahatma Gandhi Marg. Bridge #1 closed for ultrasonic inspection.',
        impact: { newBlockedRoads: ['bridge-1'] }
      }
    ]
  },
  {
    id: 'cyclone-coastal',
    title: 'Super Cyclone & Coastal Surge',
    category: 'Meteorological',
    difficulty: 'High Urgency',
    headline: 'Category 4 Cyclone With 140 km/h Sustained Winds',
    description: 'Extreme squalls, toppled mobile towers, fallen power lines, and saltwater backflow up the Saraswati estuary.',
    durationMinutes: 15,
    initialConditions: {
      riverLevelMeters: 1.8,
      rainfallMmPerHour: 90,
      windSpeedKmh: 135,
      blockedRoadIds: ['road-riverbank'],
      activeIncidentIds: ['sim-inc-cy-1'],
      sosCount: 8,
      threatenedBuildingIds: ['bld-s2-1', 'bld-s2-3', 'bld-s3-1']
    },
    timelineEvents: [
      {
        timeSeconds: 0,
        type: 'CYCLONE_LANDFALL',
        title: 'Forward Eye-Wall Crosses Coastal Riverway',
        description: 'Sheet metal and roof tiles lofted. Trees blocking Arterial Marg near Sector 3.',
        impact: { windSpeedKmh: 145 }
      }
    ]
  },
  {
    id: 'industrial-fire',
    title: 'Industrial Chemical HazMat Explosion',
    category: 'Technological / Industrial',
    difficulty: 'Critical Toxicity',
    headline: 'Petrochemical Tank Blaze & Toxic Vapor Plume',
    description: 'PetroChem storage tank rupture sparks 3-alarm fire. Dense toxic sulfur dioxide cloud drifting northwest toward Shanti Nagar residential sector.',
    durationMinutes: 15,
    initialConditions: {
      riverLevelMeters: 0.5,
      rainfallMmPerHour: 0,
      plumeDirection: 'NW',
      windSpeedKmh: 22,
      blockedRoadIds: ['road-outer-ring'],
      activeIncidentIds: ['sim-inc-fire-1'],
      sosCount: 5,
      threatenedBuildingIds: ['bld-s6-1', 'bld-s6-2', 'bld-s5-2']
    },
    timelineEvents: [
      {
        timeSeconds: 0,
        type: 'HAZMAT_EXPLOSION',
        title: 'Storage Tank #4 Detonation',
        description: 'Secondary containment breached. 800-meter safety cordon declared around Udyog Vihar.',
        impact: { hazardousZoneRadiusMeters: 800 }
      }
    ]
  }
];

export const INITIAL_SIMULATED_INCIDENTS = [
  {
    id: 'sim-inc-1',
    title: 'Flash Inundation on Promenade Riverbank Road',
    category: 'Flood',
    severity: 'High',
    sector: 'sec-2',
    coordinates: [28.6105, 77.2045],
    description: 'Rapidly rising water has submerged 2 passenger vans. 6 occupants waiting on vehicle roofs.',
    requiredCapabilities: ['Boat Rescue', 'Water Rescue', 'Ambulance Support'],
    assignedResources: ['res-amb-2'],
    status: 'In Progress',
    reportedAt: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    id: 'sim-inc-2',
    title: 'Structural Cracks & Staircase Egress Block',
    category: 'Structural',
    severity: 'High',
    sector: 'sec-1',
    coordinates: [28.6175, 77.2018],
    description: 'Old masonry building front facade bulging. Stairwell jammed; 14 residents trapped inside.',
    requiredCapabilities: ['Urban Search & Rescue', 'Hydraulic Spreader', 'Paramedics'],
    assignedResources: [],
    status: 'Pending',
    reportedAt: new Date(Date.now() - 8 * 60000).toISOString()
  }
];
