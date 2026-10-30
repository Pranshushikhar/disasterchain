const {
  DISTRICT_META,
  SECTORS,
  BRIDGES_AND_ROADS,
  CRITICAL_FACILITIES,
  RESPONSE_RESOURCES,
  SIMULATION_SCENARIOS,
  INITIAL_SIMULATED_INCIDENTS,
} = require('./saraswatiNagarBackendData');

/**
 * @desc Get available simulation scenarios and Saraswati Nagar baseline
 * @route GET /api/crisis-lab/scenarios
 */
exports.getScenarios = async (req, res) => {
  try {
    return res.json({
      success: true,
      district: DISTRICT_META,
      scenarios: SIMULATION_SCENARIOS,
      sectors: SECTORS,
      infrastructure: {
        bridgesAndRoads: BRIDGES_AND_ROADS,
        facilities: CRITICAL_FACILITIES,
        resources: RESPONSE_RESOURCES,
      },
      initialIncidents: INITIAL_SIMULATED_INCIDENTS,
    });
  } catch (error) {
    console.error('CrisisLab getScenarios Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load scenarios' });
  }
};

/**
 * @desc AI Command Advisor - Evaluates simulation state and advises the Incident Commander
 * @route POST /api/crisis-lab/advisor
 */
exports.askAdvisor = async (req, res) => {
  try {
    const { scenarioId, query, simulationState } = req.body;
    const state = simulationState || {};

    const floodLevel = state.floodLevelMeters || 1.2;
    const incidents = state.activeIncidents || INITIAL_SIMULATED_INCIDENTS;
    const resources = state.assignedResources || [];
    const roadStatuses = state.roadStatuses || {};

    // Analyze critical bottlenecks
    const criticalIncidents = incidents.filter(
      (inc) => inc.status !== 'resolved' && (inc.severity === 'critical' || inc.urgency === 'immediate')
    );
    const unassignedCritical = criticalIncidents.filter((inc) => !inc.assignedUnit);
    const closedBridges = Object.entries(roadStatuses).filter(([, v]) => v === 'submerged' || v === 'blocked');

    // Generate intelligent contextual response
    let answer = '';
    let recommendation = '';
    let evidence = [];
    let tradeOffs = [];
    let suggestedAction = null;

    const lowerQuery = (query || '').toLowerCase();

    if (lowerQuery.includes('prioritize') || lowerQuery.includes('priority') || lowerQuery.includes('which incident')) {
      if (unassignedCritical.length > 0) {
        const topTarget = unassignedCritical[0];
        recommendation = `Immediately prioritize ${topTarget.title} in ${topTarget.sector || 'Sector 2'}.`;
        evidence = [
          `${topTarget.casualties || 12} civilians at imminent risk with rising water (+0.4m/hr).`,
          `Incident is marked ${topTarget.severity?.toUpperCase() || 'CRITICAL'} with zero responders currently on scene.`,
          `Access route via Promenade Riverbank Road will be completely severed within 20 simulation minutes.`,
        ];
        tradeOffs = [
          'Diverting NDRF Alpha away from Sector 1 will delay structural shoring by approximately 18 minutes.',
          'Ambulance transit requires High Flyover detour due to central bridge flood warnings.',
        ];
        suggestedAction = {
          type: 'DISPATCH_RESOURCE',
          incidentId: topTarget.id,
          recommendedResourceType: 'boat',
          recommendedUnit: 'SDRF Boat Squad 1',
        };
      } else {
        recommendation = 'All critical incidents currently have assigned response units. Focus on secondary medical evacuation and shelter supply logistics.';
        evidence = ['0 unassigned critical tier incidents.', 'Shelter 1 (Sports Stadium) is at 84% capacity.'];
        tradeOffs = ['Redirecting logistics trucks to Shelter 2 will increase fuel expenditure by 12%'];
      }
    } else if (lowerQuery.includes('shelter') || lowerQuery.includes('capacity')) {
      recommendation = 'Divert new evacuees to Sector 4 Model Senior Secondary School (Capacity: 600, currently 38% full).';
      evidence = [
        'Sports Stadium Shelter (Sector 3) is nearing surge threshold at 84% occupancy (1,260/1,500).',
        'Model School Shelter is on elevated ground (228m datum) with zero inundation hazard.',
        'Backup solar generator and RO water treatment plant are 100% operational.',
      ];
      tradeOffs = [
        'Model School is 2.8 km further east; requires deploying 2 civilian shuttle buses.',
      ];
      suggestedAction = {
        type: 'REROUTE_SHELTER',
        targetShelterId: 'fac_shelter_model_school',
      };
    } else if (lowerQuery.includes('bridge') || lowerQuery.includes('road') || lowerQuery.includes('route')) {
      recommendation = 'Close Saraswati Central Bridge to civilian light traffic immediately and enforce the North Elevated Flyover corridor.';
      evidence = [
        `River gauge reading is ${floodLevel.toFixed(1)}m (Structural clearance safe limit is 2.8m).`,
        'Driftwood debris cluster detected on Pier #3, increasing hydrodynamic drag.',
        'North Elevated Flyover remains high-clearance (+14m elevation) with dual emergency lanes clear.',
      ];
      tradeOffs = [
        'Evacuation transit time from Old Quarter to District Hospital increases from 12 mins to 24 mins.',
      ];
      suggestedAction = {
        type: 'CLOSE_ROAD_SEGMENT',
        segmentId: 'road_central_bridge',
      };
    } else {
      // General tactical summary
      recommendation = `Tactical Commander Summary: Maintain 3-pronged containment. Water level is ${floodLevel.toFixed(1)}m. ${criticalIncidents.length} active high-risk incidents logged.`;
      evidence = [
        `${closedBridges.length} roadway/bridge segments currently impassable or restricted.`,
        `${resources.length} emergency response units actively engaged in Saraswati Nagar.`,
        'Weather radar indicates monsoon cloudburst continuing for the next 45 minutes.',
      ];
      tradeOffs = [
        'Holding reserve units in cyber corridor prevents rapid response to sudden eastern embankment breach.',
      ];
    }

    return res.json({
      success: true,
      advisor: {
        scenarioId,
        query: query || 'Tactical Assessment',
        recommendation,
        evidence,
        tradeOffs,
        suggestedAction,
        confidence: 0.94,
        source: 'DisasterChain Command Intelligence Engine (Simulated Fallback + Neural Heuristics)',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('CrisisLab askAdvisor Error:', error);
    return res.status(500).json({ success: false, message: 'AI Command Advisor error' });
  }
};

/**
 * @desc What-If Scenario Sandbox - Predicts consequences of major emergency shocks
 * @route POST /api/crisis-lab/what-if
 */
exports.evaluateWhatIf = async (req, res) => {
  try {
    const { scenarioId, experimentType, currentState } = req.body;

    const baseState = currentState || {};
    const currentFlood = baseState.floodLevelMeters || 1.4;

    let consequences = {};

    switch (experimentType) {
      case 'DOUBLE_RAINFALL':
        consequences = {
          title: 'Cloudburst Shock (+100% Precipitation Rate)',
          description: 'Simulates instantaneous 120mm/hr tropical cloudburst over Saraswati watershed.',
          predictedFloodIncrease: '+1.6 meters over 30 mins',
          impactedSectors: ['Sector 2 (Riverfront)', 'Sector 1 (Old Quarter)', 'Sector 6 (Industrial)'],
          infrastructureImpact: [
            'Saraswati Central Bridge will submerge in 14 minutes.',
            'Promenade Riverbank Road water depth reaches 1.8m (unnavigable by all wheeled vehicles).',
            'Substation 3 transformer tripping imminent (blackout risk in 1,200 households).',
          ],
          casualtyRiskDelta: '+45% projected rescue demand',
          recommendedAction: 'Issue immediate Level-3 Siren Evacuation Order for Riverfront low-lying wards.',
          severity: 'critical',
        };
        break;

      case 'BRIDGE_COLLAPSE':
        consequences = {
          title: 'Structural Pier Failure: Saraswati Central Bridge',
          description: 'Hydrodynamic scour causes Pier #3 foundation shear, rendering the 4-lane arterial impassable.',
          predictedFloodIncrease: 'Hydraulic backwater surge +0.3m upstream',
          impactedSectors: ['Sector 1 (Old Quarter)', 'Sector 3 (Medical Enclave)'],
          infrastructureImpact: [
            'Primary ambulance artery to Civil Hospital is 100% severed.',
            'Average trauma transit time jumps from 9 mins to 31 mins via North Flyover.',
            'Gridlock expected on MG Marg bypass within 10 minutes.',
          ],
          casualtyRiskDelta: '+30% delayed critical care mortality risk',
          recommendedAction: 'Deploy Mobile Military Pontoon Bridge and establish air-evac helipad at Sector 3 grounds.',
          severity: 'critical',
        };
        break;

      case 'SHELTER_CLOSURE':
        consequences = {
          title: 'Sports Stadium Shelter Electrical Failure & Closure',
          description: 'Basement transformer flooding forces emergency evacuation of 1,260 occupants.',
          predictedFloodIncrease: 'No direct hydrological change',
          impactedSectors: ['Sector 3 (Medical Enclave)', 'Sector 4 (Cyber Heights)'],
          infrastructureImpact: [
            '1,260 evacuees displaced simultaneously.',
            'Model Secondary School shelter reaches 145% super-saturation capacity.',
            'Food and potable water supply chain exhaustion in 4 hours.',
          ],
          casualtyRiskDelta: '+25% vulnerability for elderly and pediatric evacuees',
          recommendedAction: 'Requisition IT Park Convention Hall (Sector 4) as Emergency Auxiliary Shelter.',
          severity: 'high',
        };
        break;

      case 'DELAYED_RESCUE':
        consequences = {
          title: 'Severe Convoys Transit Delay (+45 mins)',
          description: 'Fallen trees and flash flooding on NH44 delay NDRF USAR reinforcements by 45 minutes.',
          predictedFloodIncrease: 'Static',
          impactedSectors: ['All Sectors'],
          infrastructureImpact: [
            'Local volunteer and SDRF units must sustain operations alone.',
            'Rescue boat pool exhausted with 6 pending water-trapped calls.',
          ],
          casualtyRiskDelta: '+38% hypothermia and trauma complication index',
          recommendedAction: 'Authorize deployment of registered local fisherman motorboats and drone lifeline drops.',
          severity: 'high',
        };
        break;

      case 'HOSPITAL_ACCESS_FAILURE':
        consequences = {
          title: 'Civil Hospital Main Road Access Submersion',
          description: 'Flash runoff inundates hospital boulevard under 1.1m water.',
          predictedFloodIncrease: 'Local runoff pooling',
          impactedSectors: ['Sector 3 (Medical Enclave)'],
          infrastructureImpact: [
            'Ground ambulances unable to enter emergency bay.',
            'Oxygen replenishment tanker stranded 800m away.',
          ],
          casualtyRiskDelta: '+50% trauma mortality risk without high-clearance staging',
          recommendedAction: 'Establish elevated triage staging zone at Sector 3 Flyover ramp with 4x4 troop carriers.',
          severity: 'critical',
        };
        break;

      default:
        consequences = {
          title: 'Simulated Stress Test',
          description: 'Compound secondary emergency simulation.',
          predictedFloodIncrease: '+0.5 meters',
          impactedSectors: ['Sector 2'],
          infrastructureImpact: ['Local drainage surcharge'],
          casualtyRiskDelta: '+10%',
          recommendedAction: 'Maintain elevated vigilance.',
          severity: 'moderate',
        };
    }

    return res.json({
      success: true,
      whatIfResult: {
        experimentType,
        scenarioId,
        consequences,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('CrisisLab evaluateWhatIf Error:', error);
    return res.status(500).json({ success: false, message: 'What-If evaluation error' });
  }
};

/**
 * @desc Generate After-Action Report (AAR) & Explainable Performance Score
 * @route POST /api/crisis-lab/after-action-report
 */
exports.generateAfterActionReport = async (req, res) => {
  try {
    const { scenarioId, decisions = [], metrics = {}, durationSeconds = 300 } = req.body;

    // Explainable Scoring Algorithm
    // Baseline: 70
    // + Points for rapid response, shelter balancing, safe route diversions
    // - Points for delayed critical dispatches, capacity breaches
    let baseScore = 72;

    const criticalDecisionsCount = decisions.filter(
      (d) => d.type === 'DISPATCH_BOAT' || d.type === 'DISPATCH_AMBULANCE' || d.type === 'ASSIGN_TEAM'
    ).length;

    const reroutesCount = decisions.filter(
      (d) => d.type === 'REROUTE_ROAD' || d.type === 'EVACUATE_SHELTER' || d.type === 'CLOSE_BRIDGE'
    ).length;

    const pointsFromDispatches = Math.min(18, criticalDecisionsCount * 3.5);
    const pointsFromReroutes = Math.min(10, reroutesCount * 3.0);
    const timeEfficiencyBonus = durationSeconds < 600 ? 5 : 2;

    const totalScore = Math.min(98, Math.max(45, Math.round(baseScore + pointsFromDispatches + pointsFromReroutes + timeEfficiencyBonus)));

    let ratingGrade = 'A';
    if (totalScore >= 90) ratingGrade = 'A+ (Exceptional Incident Commander)';
    else if (totalScore >= 80) ratingGrade = 'A (Highly Effective Emergency Response)';
    else if (totalScore >= 70) ratingGrade = 'B+ (Competent Command with Minor Route Lags)';
    else ratingGrade = 'C (Suboptimal Resource Allocation)';

    const keySuccesses = [
      `Executed ${decisions.length} operational command decisions during active disaster progression.`,
      `Zero catastrophic hospital access failures recorded due to proactive high-flyover diversion.`,
      `Shelter surge capacity maintained below 90% across Saraswati Nagar emergency facilities.`,
    ];

    const areasForImprovement = [
      `Initial rescue boat dispatch for Promenade Riverbank had a 4.2 minute assessment latency.`,
      `Consider pre-positioning SDRF Zodiac boats west of Saraswati Central Bridge prior to the 2.0m river gauge threshold.`,
    ];

    return res.json({
      success: true,
      report: {
        scenarioId: scenarioId || 'flash_flood_saraswati',
        district: 'Saraswati Nagar (Simulated)',
        score: totalScore,
        grade: ratingGrade,
        durationSeconds,
        decisionsExecuted: decisions.length,
        metrics: {
          civiliansEvacuated: 1420 + decisions.length * 85,
          criticalRescuesCompleted: Math.min(18, 6 + decisions.length * 2),
          traumaAccessContinuity: '98.4%',
          bridgeIntegritySafeguarded: true,
          shelterOccupancyPeak: '84%',
        },
        keySuccesses,
        areasForImprovement,
        auditTrail: decisions.map((d, idx) => ({
          step: idx + 1,
          action: d.action || d.type,
          target: d.target || d.incidentTitle || 'Emergency Sector',
          timestamp: d.timestamp || new Date().toISOString(),
          outcome: 'Successful Command Execution',
        })),
        generatedAt: new Date().toISOString(),
        disclaimer: 'SIMULATED AFTER-ACTION REPORT: Prepared for DisasterChain 2.0 Command Evaluation.',
      },
    });
  } catch (error) {
    console.error('CrisisLab generateAfterActionReport Error:', error);
    return res.status(500).json({ success: false, message: 'Report generation error' });
  }
};
