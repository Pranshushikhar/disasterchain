/**
 * DisasterChain - Offline Emergency Mode Storage & Safety Guidance Service
 * 
 * Handles:
 * 1. Pre-cached disaster safety guides (versioned).
 * 2. Verified national and state emergency hotlines with direct tel: links.
 * 3. Local-only sensitive personal emergency data (with explicit consent toggle).
 * 4. Interactive emergency kit & evacuation checklists.
 * 5. Offline shelter & saved location caching.
 * 6. Honest offline status & transmission disclaimers.
 */

export const OFFLINE_GUIDES_VERSION = '2026.10-v3.0.0-earth-intel';

// 1. Verified Official Emergency Hotlines (India & Universal)
export const EMERGENCY_HOTLINES = [
  {
    id: 'dispatch-112',
    name: 'National Emergency Dispatch',
    number: '112',
    service: 'Police, Fire, Medical, Disaster (Unified)',
    hours: '24/7 Priority Toll-Free',
    type: 'universal'
  },
  {
    id: 'ndrf-1078',
    name: 'NDRF Disaster Helpline',
    number: '1078',
    service: 'National Disaster Response Force Command Cell',
    hours: '24/7 Disaster Operations',
    type: 'disaster'
  },
  {
    id: 'ambulance-108',
    name: 'Emergency Medical & Ambulance',
    number: '108',
    service: 'Trauma Paramedics & Hospital Dispatch',
    hours: '24/7 Toll-Free',
    type: 'medical'
  },
  {
    id: 'fire-101',
    name: 'Fire & Rescue Service',
    number: '101',
    service: 'Structural Fires, Hazardous Chemical Spills',
    hours: '24/7 Toll-Free',
    type: 'fire'
  },
  {
    id: 'police-100',
    name: 'Police Control Room',
    number: '100',
    service: 'Citizen Protection & Law Enforcement',
    hours: '24/7 Toll-Free',
    type: 'police'
  },
  {
    id: 'state-1070',
    name: 'State Disaster Control Room',
    number: '1070',
    service: 'State Relief & District Administration Coordination',
    hours: '24/7 Emergency Cell',
    type: 'disaster'
  },
  {
    id: 'women-1091',
    name: 'Women in Distress Helpline',
    number: '1091',
    service: 'Immediate Protection & Counseling',
    hours: '24/7 Dedicated Support',
    type: 'support'
  },
  {
    id: 'child-1098',
    name: 'Childline Emergency Service',
    number: '1098',
    service: 'Children in Distress or Separated from Family',
    hours: '24/7 Nationwide',
    type: 'support'
  }
];

// 2. Ten Authoritative Pre-Cached Offline Safety Guides
export const OFFLINE_SAFETY_GUIDES = [
  {
    id: 'guide-earthquake',
    disaster: 'Earthquake',
    title: 'Earthquake Survival Protocol',
    version: OFFLINE_GUIDES_VERSION,
    lastVerified: 'October 2026',
    immediateActions: [
      'DROP down onto your hands and knees immediately.',
      'COVER your head and neck under a sturdy table or desk.',
      'HOLD ON to your shelter until all shaking ceases completely.',
      'If in bed, stay there and protect your head with a pillow.'
    ],
    thingsToAvoid: [
      'DO NOT run outside while the ground is shaking (falling facades and glass kill).',
      'DO NOT stand in doorways; modern doorways are not reinforced and offer zero falling debris protection.',
      'DO NOT use elevators under any circumstances.',
      'DO NOT use matches, lighters, or electrical switches if you smell gas.'
    ],
    safetyPrecautions: [
      'Put on sturdy shoes immediately to avoid puncture wounds from broken glass.',
      'Check for natural gas leaks: If smelling sulfur or hearing hissing, shut the main valve and evacuate.',
      'Be prepared for strong aftershocks that can compromise already stressed structures.'
    ],
    whenToEvacuate: 'Evacuate once shaking stops if the building shows structural shear cracks, if you detect gas leaks, or if fire breaks out.',
    whenToContactServices: 'Call 112 if people are trapped under debris, if a fire cannot be extinguished, or if someone has a severe life-threatening injury.'
  },
  {
    id: 'guide-flood',
    disaster: 'Flood & Swiftwater',
    title: 'Flood & Swiftwater Survival Protocol',
    version: OFFLINE_GUIDES_VERSION,
    lastVerified: 'October 2026',
    immediateActions: [
      'Move immediately to higher ground away from rivers, streams, and storm drains.',
      'Remember: "Turn Around, Don’t Drown." Never walk or drive through moving water.',
      'De-energize main electrical breakers ONLY if the panel is completely dry.'
    ],
    thingsToAvoid: [
      'DO NOT drive into water of unknown depth; just 12 inches (30 cm) floats most passenger cars.',
      'DO NOT walk through moving water; 6 inches (15 cm) sweeps an adult off their feet.',
      'DO NOT touch submerged electrical appliances or wiring.',
      'DO NOT retreat into a closed attic without a roof escape hatch.'
    ],
    safetyPrecautions: [
      'Assume all floodwater is contaminated with sewage, chemicals, and live electrical current.',
      'Boil tap water vigorously for 1 full minute before drinking or cooking.',
      'Watch for snakes and venomous creatures displaced onto dry ledges.'
    ],
    whenToEvacuate: 'Evacuate immediately when flood warnings are issued for your zone, or when water begins rising near your foundation.',
    whenToContactServices: 'Call 112 / 1078 if trapped on a roof or upper floor with rapidly rising water.'
  },
  {
    id: 'guide-fire',
    disaster: 'Structure & Wildfire',
    title: 'Fire & Smoke Survival Protocol',
    version: OFFLINE_GUIDES_VERSION,
    lastVerified: 'October 2026',
    immediateActions: [
      'DROP to hands and knees and CRAWL low under smoke towards the nearest exit.',
      'Feel closed doors with the back of your hand; if hot, do NOT open.',
      'Close doors behind you as you evacuate to compartmentalize the fire.',
      'Once outside, STAY OUT. Never re-enter a burning structure.'
    ],
    thingsToAvoid: [
      'DO NOT breathe air at standing head-height; toxic smoke and carbon monoxide rise to the ceiling.',
      'DO NOT stop to pack laptops, clothes, or valuables.',
      'DO NOT use elevators.',
      'DO NOT run if your clothes catch fire; STOP, DROP, and ROLL immediately.'
    ],
    safetyPrecautions: [
      'The cleanest, coolest breathable air is 12 to 24 inches (30 to 60 cm) above the floor.',
      'Cover your nose and mouth with a damp cloth if available.',
      'Operate small fire extinguishers using P.A.S.S. (Pull, Aim low, Squeeze, Sweep).'
    ],
    whenToEvacuate: 'Evacuate instantly upon hearing a smoke alarm, smelling smoke, or seeing flames.',
    whenToContactServices: 'Call 112 or 101 immediately from your designated outdoor assembly meeting point.'
  },
  {
    id: 'guide-cyclone',
    disaster: 'Cyclone & Hurricane',
    title: 'Tropical Cyclone & Storm Surge Protocol',
    version: OFFLINE_GUIDES_VERSION,
    lastVerified: 'October 2026',
    immediateActions: [
      'Shelter in an interior room on the lowest floor without windows (e.g. bathroom or hallway).',
      'Monitor battery-powered or hand-crank emergency radio for storm tracking.',
      'Anchor storm shutters or 5/8" plywood over glass windows.'
    ],
    thingsToAvoid: [
      'DO NOT go outside when the calm eye of the storm passes over; extreme reverse winds return abruptly.',
      'DO NOT criss-cross tape on windows; it provides zero wind protection and creates lethal flying glass shards.',
      'DO NOT operate gasoline generators indoors or in garages (deadly carbon monoxide).'
    ],
    safetyPrecautions: [
      'Store at least 3 liters of drinking water per person per day for at least 72 hours.',
      'Clear yards of loose outdoor furniture, corrugated sheets, and tools.',
      'Assume all downed power cables are energized and lethal; keep at least 35 feet away.'
    ],
    whenToEvacuate: 'Evacuate immediately if you reside in a low-lying coastal zone subject to mandatory storm surge orders.',
    whenToContactServices: 'Call 112 / 1078 if storm surge breaches your shelter or a roof fails.'
  },
  {
    id: 'guide-landslide',
    disaster: 'Landslide & Debris Flow',
    title: 'Landslide & Mudflow Survival Protocol',
    version: OFFLINE_GUIDES_VERSION,
    lastVerified: 'October 2026',
    immediateActions: [
      'RUN PERPENDICULAR (at a 90-degree angle) away from the path of the slide towards higher, stable lateral ground.',
      'If escape is impossible, curl into a tight ball and cover your head under sturdy furniture.',
      'Listen for deep rumbling sounds, cracking trees, or sudden changes in stream water clarity.'
    ],
    thingsToAvoid: [
      'DO NOT run straight downhill in the direction the slide is traveling.',
      'DO NOT camp or shelter in dry creek beds or natural hillside ravines during heavy rains.',
      'DO NOT re-enter a slide area immediately; secondary failures are frequent.'
    ],
    safetyPrecautions: [
      'Watch for warning signs: doors sticking in frames, leaning fences, new foundation cracks.',
      'Stay awake during intense nighttime rainstorms on steep terrain.'
    ],
    whenToEvacuate: 'Evacuate when you notice sudden drops in stream flow (upstream debris damming) or unusual ground rumblings.',
    whenToContactServices: 'Call 112 / 1078 to report trapped individuals or blocked roadways.'
  },
  {
    id: 'guide-heatwave',
    disaster: 'Extreme Heatwave',
    title: 'Extreme Heat & Heat Stroke Protocol',
    version: OFFLINE_GUIDES_VERSION,
    lastVerified: 'October 2026',
    immediateActions: [
      'Move victims into shaded, air-conditioned rooms or cool water baths.',
      'Drink fluids containing electrolytes (ORS, coconut water, salted lemon water).',
      'Apply ice packs or cold wet towels to neck, armpits, and groin.'
    ],
    thingsToAvoid: [
      'DO NOT ignore altered mental state, slurred speech, or confusion (signs of deadly Heat Stroke).',
      'DO NOT drink alcohol, heavy coffee, or sugary sodas that promote dehydration.',
      'DO NOT use dry fans blowing air hotter than 37°C without misting (acts like a convection oven).'
    ],
    safetyPrecautions: [
      'Keep curtains and windows closed during peak afternoon sun (10 AM to 5 PM).',
      'Check on elderly neighbors twice daily; seniors have reduced sweat response.'
    ],
    whenToEvacuate: 'Seek designated air-conditioned public cooling centers if indoor temperatures exceed 40°C.',
    whenToContactServices: 'Call 112 immediately if a person collapses, loses consciousness, or stops sweating with hot skin.'
  },
  {
    id: 'guide-lightning',
    disaster: 'Lightning & Thunderstorm',
    title: 'Lightning & Severe Storm Protocol',
    version: OFFLINE_GUIDES_VERSION,
    lastVerified: 'October 2026',
    immediateActions: [
      'Follow the 30/30 Rule: If flash-to-bang is 30 seconds or less, seek substantial indoor shelter.',
      'Wait 30 minutes after the last roll of thunder before heading back outside.',
      'If stranded in an open field, adopt the LIGHTNING CROUCH: crouch low on balls of feet with heels touching.'
    ],
    thingsToAvoid: [
      'DO NOT stand under tall, isolated trees or open gazebos (side flash and explosive bark shrapnel).',
      'DO NOT lie flat on the ground (maximizes lethal ground current exposure).',
      'DO NOT touch plumbing faucets, corded landlines, or shower during thunderstorms.'
    ],
    safetyPrecautions: [
      'Hard-topped metal vehicles with windows rolled up provide safe shelter (Faraday cage effect).',
      'Lightning victims hold NO electrical charge; it is completely safe to touch them and administer immediate CPR.'
    ],
    whenToEvacuate: 'Move indoors as soon as thunder is heard, even if rain has not started.',
    whenToContactServices: 'Call 112 immediately if someone is struck; start CPR without delay.'
  },
  {
    id: 'guide-collapse',
    disaster: 'Building Collapse',
    title: 'Structural Collapse & Rubble Protocol',
    version: OFFLINE_GUIDES_VERSION,
    lastVerified: 'October 2026',
    immediateActions: [
      'Cover your nose and mouth with cotton cloth to filter pulverized concrete dust.',
      'Curl near heavy, solid furniture forming a triangular void space (Lean-to void).',
      'Signal searchers with 3 distinct taps on a pipe or rebar: TAP - TAP - TAP.'
    ],
    thingsToAvoid: [
      'DO NOT light matches or lighters (open flames ignite gas leaks and consume oxygen).',
      'DO NOT shout continuously (inhales dust, dehydrates vocal cords, and wastes oxygen).',
      'DO NOT make violent digging motions that destabilize overhead rubble.'
    ],
    safetyPrecautions: [
      'Practice 4-second box breathing to maintain low heart rate and conserve confined air.',
      'Shout only during dedicated search silence periods when heavy machinery shuts down.'
    ],
    whenToEvacuate: 'Exit carefully only if an obvious stable escape path is immediately clear.',
    whenToContactServices: 'Acoustic geophones listen for your 3-tap pattern; call out when dogs or voices are directly overhead.'
  },
  {
    id: 'guide-medical',
    disaster: 'Medical Emergencies',
    title: 'Emergency First Aid & CPR Protocol',
    version: OFFLINE_GUIDES_VERSION,
    lastVerified: 'October 2026',
    immediateActions: [
      'If unresponsive with no normal breathing: Start Hands-Only CPR at 100-120 bpm (2 inches deep).',
      'Severe bleeding: Apply DIRECT, FOCAL PRESSURE on wound with clean cloth and body weight.',
      'Choking: Administer inward and upward abdominal thrusts (Heimlich maneuver) just above the navel.',
      'Unconscious and breathing: Place in the lateral Recovery Position to maintain an open airway.'
    ],
    thingsToAvoid: [
      'DO NOT give liquids or food to an unconscious or drowsy casualty.',
      'DO NOT remove an initial blood-soaked gauze pad; layer fresh pads on top and push harder.',
      'DO NOT move an injured person if spinal trauma is suspected unless immediate danger threatens.'
    ],
    safetyPrecautions: [
      'Wear gloves or use a plastic barrier when handling blood.',
      'Mark the application time on a patient’s forehead if a tourniquet is applied.'
    ],
    whenToEvacuate: 'Transport immediately if severe arterial bleeding, head trauma, or respiratory distress occurs.',
    whenToContactServices: 'Call 108 or 112 immediately for trauma paramedic ambulance dispatch.'
  },
  {
    id: 'guide-evacuation',
    disaster: 'Emergency Evacuation',
    title: 'Rapid Evacuation & Go-Bag Protocol',
    version: OFFLINE_GUIDES_VERSION,
    lastVerified: 'October 2026',
    immediateActions: [
      'Grab your pre-packed 72-hour Go-Bag, essential medications, and waterproof document pouch.',
      'Wear long cotton/wool pants, sturdy hiking boots, and a long-sleeved shirt.',
      'Secure pets in carriers with collars, ID tags, and a 7-day food supply.',
      'Shut off main water, gas, and electrical switches if time permits.'
    ],
    thingsToAvoid: [
      'DO NOT delay departure to pack jewelry, televisions, or photo albums.',
      'DO NOT leave pets tied up or trapped inside homes.',
      'DO NOT drive through road barricades or flooded bridges.'
    ],
    safetyPrecautions: [
      'Keep fuel tank at least half full during disaster seasons.',
      'Keep a physical paper road atlas in your vehicle (cellular maps fail during blackouts).',
      'Text your designated out-of-town family contact: "EVACUATING TO REGIONAL SHELTER."'
    ],
    whenToEvacuate: 'Leave IMMEDIATELY when an official evacuation order is broadcast; do not wait until roads are engulfed.',
    whenToContactServices: 'Call 112 / 1078 if you have mobility needs requiring emergency transport.'
  }
];

// 3. Emergency Kit Standard Checklist Items
export const DEFAULT_KIT_CHECKLIST = [
  { id: 'kit-1', category: 'Water', label: 'Drinking water: 3 Liters per person per day (min 3 days)', checked: false },
  { id: 'kit-2', category: 'Water', label: 'Water purification tablets or 0.1-micron portable filter', checked: false },
  { id: 'kit-3', category: 'Food', label: 'Non-perishable food (canned tuna, beans, high-energy bars, dry fruit)', checked: false },
  { id: 'kit-4', category: 'Food', label: 'Manual non-electric hand-crank can opener', checked: false },
  { id: 'kit-5', category: 'Power', label: 'Hand-crank / solar emergency weather radio (NOAA / AIR)', checked: false },
  { id: 'kit-6', category: 'Power', label: '20,000 mAh charged power bank and phone charging cables', checked: false },
  { id: 'kit-7', category: 'Power', label: 'LED Headlamp & extra lithium batteries (spares outside device)', checked: false },
  { id: 'kit-8', category: 'First Aid', label: 'Complete First Aid Kit (sterile gauze, tourniquet, bandages, antiseptic)', checked: false },
  { id: 'kit-9', category: 'Medical', label: '14-30 day supply of essential prescription medications', checked: false },
  { id: 'kit-10', category: 'Tools', label: 'Multi-tool with pliers, knife, and screwdrivers', checked: false },
  { id: 'kit-11', category: 'Signaling', label: 'High-decibel emergency pea-less whistle', checked: false },
  { id: 'kit-12', category: 'Sanitation', label: 'Moist towelettes, heavy-duty garbage bags, toilet paper, hand sanitizer', checked: false },
  { id: 'kit-13', category: 'Documents', label: 'Waterproof pouch with IDs, insurance policies, medical records, and cash in small bills', checked: false },
  { id: 'kit-14', category: 'Warmth', label: 'Emergency mylar thermal space blankets and wool socks', checked: false },
  { id: 'kit-15', category: 'Pets', label: 'Pet carrier, leash, dry food, water bowl, and vaccination records', checked: false }
];

// 4. Evacuation Preparation Checklist Items
export const DEFAULT_EVAC_CHECKLIST = [
  { id: 'evac-1', label: 'Confirm destination shelter or regional family muster point address', checked: false },
  { id: 'evac-2', label: 'Vehicle fuel tank checked and at least half full', checked: false },
  { id: 'evac-3', label: 'Main gas shutoff valve turned off if instructed by authorities', checked: false },
  { id: 'evac-4', label: 'Main electrical breaker turned off if home is dry', checked: false },
  { id: 'evac-5', label: 'All windows and exterior doors closed and locked', checked: false },
  { id: 'evac-6', label: 'Emergency Go-Bags and vital document pouch loaded in vehicle', checked: false },
  { id: 'evac-7', label: 'Pets securely crated with collars, tags, and food kit', checked: false },
  { id: 'evac-8', label: 'Sent single SMS status text to designated out-of-town contact', checked: false },
  { id: 'evac-9', label: 'Leave outdoor porch light ON so emergency crews see evacuation status', checked: false }
];

// 5. Local Storage Keys (Strictly local on client browser)
const STORAGE_KEYS = {
  PERSONAL_CONTACTS: 'disasterchain_offline_contacts',
  PERSONAL_PLAN: 'disasterchain_offline_plan',
  MEDICAL_CONSENT: 'disasterchain_offline_medical_consent',
  MEDICAL_INFO: 'disasterchain_offline_medical_info',
  SAVED_LOCATIONS: 'disasterchain_offline_saved_locations',
  KIT_CHECKLIST: 'disasterchain_offline_kit_checklist',
  EVAC_CHECKLIST: 'disasterchain_offline_evac_checklist',
  LAST_CACHE_TIME: 'disasterchain_offline_last_sync'
};

/**
 * Offline Emergency Storage Controller
 */
export const offlineEmergencyStorage = {
  // Check if browser is currently online
  isOnline() {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },

  // Record a sync timestamp whenever data is refreshed online
  recordSyncTimestamp() {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_CACHE_TIME, new Date().toISOString());
    } catch (e) {}
  },

  // Get last recorded cache update time
  getLastSyncTimestamp() {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_CACHE_TIME) || null;
    } catch (e) {
      return null;
    }
  },

  // -------------------------------------------------------------
  // Personal Emergency Contacts
  // -------------------------------------------------------------
  getContacts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERSONAL_CONTACTS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [
      { id: 'c-1', name: 'Primary Family Member', relation: 'Spouse / Parent', phone: '', priority: 'Primary' },
      { id: 'c-2', name: 'Out-of-Area Emergency Contact', relation: 'Relative', phone: '', priority: 'Out-of-State' }
    ];
  },

  saveContacts(contacts) {
    try {
      localStorage.setItem(STORAGE_KEYS.PERSONAL_CONTACTS, JSON.stringify(contacts));
      return true;
    } catch (e) {
      console.error('Failed to save personal emergency contacts:', e);
      return false;
    }
  },

  // -------------------------------------------------------------
  // Personal Emergency Plan
  // -------------------------------------------------------------
  getPlan() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERSONAL_PLAN);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return {
      homeAddress: '',
      tier1MeetingPoint: 'Tree outside front gate',
      tier2NeighborhoodPoint: 'Community Park / Public Library',
      tier3RegionalPoint: 'Relative Residence (Out of County)',
      outOfAreaRelayPerson: 'Aunt / Uncle (Out of State)',
      specialInstructions: 'Shut off water valve on rear wall; grab pet crate in closet.'
    };
  },

  savePlan(plan) {
    try {
      localStorage.setItem(STORAGE_KEYS.PERSONAL_PLAN, JSON.stringify(plan));
      return true;
    } catch (e) {
      return false;
    }
  },

  // -------------------------------------------------------------
  // Sensitive Medical Information (Protected by Explicit Consent)
  // -------------------------------------------------------------
  hasMedicalConsent() {
    try {
      return localStorage.getItem(STORAGE_KEYS.MEDICAL_CONSENT) === 'true';
    } catch (e) {
      return false;
    }
  },

  setMedicalConsent(consentGiven) {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDICAL_CONSENT, consentGiven ? 'true' : 'false');
      if (!consentGiven) {
        // Clear medical data if consent is revoked
        localStorage.removeItem(STORAGE_KEYS.MEDICAL_INFO);
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  getMedicalInfo() {
    if (!this.hasMedicalConsent()) {
      return null;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDICAL_INFO);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return {
      bloodType: 'Unknown',
      allergies: '',
      criticalConditions: '',
      medications: '',
      physicianPhone: ''
    };
  },

  saveMedicalInfo(info) {
    if (!this.hasMedicalConsent()) {
      return false;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.MEDICAL_INFO, JSON.stringify(info));
      return true;
    } catch (e) {
      return false;
    }
  },

  // -------------------------------------------------------------
  // Saved Locations & Shelters Cache
  // -------------------------------------------------------------
  getSavedLocations() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_LOCATIONS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [
      {
        id: 'loc-home',
        name: 'Home Base',
        address: 'Primary Residence',
        isDefault: true,
        lastUpdated: new Date().toLocaleDateString()
      },
      {
        id: 'loc-shelter-1',
        name: 'District Multi-Purpose Cyclone Shelter',
        address: 'Sector 12 Community Complex',
        capacityNote: 'Cached location (Verify capacity upon arrival)',
        lastUpdated: new Date().toLocaleDateString()
      }
    ];
  },

  saveLocations(locations) {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_LOCATIONS, JSON.stringify(locations));
      return true;
    } catch (e) {
      return false;
    }
  },

  // -------------------------------------------------------------
  // Emergency Checklists
  // -------------------------------------------------------------
  getKitChecklist() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KIT_CHECKLIST);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return DEFAULT_KIT_CHECKLIST;
  },

  saveKitChecklist(items) {
    try {
      localStorage.setItem(STORAGE_KEYS.KIT_CHECKLIST, JSON.stringify(items));
      return true;
    } catch (e) {
      return false;
    }
  },

  getEvacChecklist() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVAC_CHECKLIST);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return DEFAULT_EVAC_CHECKLIST;
  },

  saveEvacChecklist(items) {
    try {
      localStorage.setItem(STORAGE_KEYS.EVAC_CHECKLIST, JSON.stringify(items));
      return true;
    } catch (e) {
      return false;
    }
  },

  // -------------------------------------------------------------
  // Data Purge & Export Controls
  // -------------------------------------------------------------
  purgeAllPersonalOfflineData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.PERSONAL_CONTACTS);
      localStorage.removeItem(STORAGE_KEYS.PERSONAL_PLAN);
      localStorage.removeItem(STORAGE_KEYS.MEDICAL_CONSENT);
      localStorage.removeItem(STORAGE_KEYS.MEDICAL_INFO);
      localStorage.removeItem(STORAGE_KEYS.SAVED_LOCATIONS);
      localStorage.removeItem(STORAGE_KEYS.KIT_CHECKLIST);
      localStorage.removeItem(STORAGE_KEYS.EVAC_CHECKLIST);
      return true;
    } catch (e) {
      return false;
    }
  },

  exportPersonalOfflineData() {
    return {
      exportedAt: new Date().toISOString(),
      disasterChainVersion: OFFLINE_GUIDES_VERSION,
      contacts: this.getContacts(),
      plan: this.getPlan(),
      medicalConsent: this.hasMedicalConsent(),
      medicalInfo: this.getMedicalInfo(),
      savedLocations: this.getSavedLocations(),
      kitChecklist: this.getKitChecklist(),
      evacChecklist: this.getEvacChecklist()
    };
  }
};
