import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  DISTRICT_META,
  SECTORS,
  BRIDGES_AND_ROADS,
  CRITICAL_FACILITIES,
  RESPONSE_RESOURCES,
  DIGITAL_TWIN_BUILDINGS,
  SIMULATION_SCENARIOS,
  INITIAL_SIMULATED_INCIDENTS,
} from '../data/saraswatiNagarData';
import { API_BASE_URL } from '../services/api';

const CrisisSimulationContext = createContext(null);

export const useCrisisSimulation = () => {
  const context = useContext(CrisisSimulationContext);
  if (!context) {
    throw new Error('useCrisisSimulation must be used within a CrisisSimulationProvider');
  }
  return context;
};

export const CrisisSimulationProvider = ({ children }) => {
  // Scenario state
  const [selectedScenarioId, setSelectedScenarioId] = useState('flash-flood');
  const scenario = SIMULATION_SCENARIOS.find((s) => s.id === selectedScenarioId) || SIMULATION_SCENARIOS[0];

  // Engine state
  const [isRunning, setIsRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1); // 1x, 2x, 5x
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Dynamic Environmental & Infrastructure State
  const [floodLevelMeters, setFloodLevelMeters] = useState(1.2);
  const [rainfallRate, setRainfallRate] = useState(65); // mm/h
  const [windSpeed, setWindSpeed] = useState(25); // km/h

  // Roads & Bridges Statuses
  const [roadStatuses, setRoadStatuses] = useState(() => {
    const map = {};
    BRIDGES_AND_ROADS.forEach((r) => {
      map[r.id] = r.status.toLowerCase();
    });
    return map;
  });

  // Buildings & Facilities
  const [buildings, setBuildings] = useState(DIGITAL_TWIN_BUILDINGS);
  const [facilities, setFacilities] = useState(CRITICAL_FACILITIES);

  // Incidents & Resources
  const [incidents, setIncidents] = useState(INITIAL_SIMULATED_INCIDENTS);
  const [resources, setResources] = useState(RESPONSE_RESOURCES);

  // Event Feed & Command History
  const [eventFeed, setEventFeed] = useState([
    {
      id: 'init-evt-1',
      timeSeconds: 0,
      timestamp: new Date().toLocaleTimeString(),
      type: 'SCENARIO_LOADED',
      severity: 'info',
      title: 'Simulation Initialized: Saraswati Nagar Command Hub',
      message: 'Baseline district telemetry established. All fictional infrastructure verified.',
    },
  ]);

  const [decisions, setDecisions] = useState([]);
  const [activeWhatIfs, setActiveWhatIfs] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  // AI Advisor state
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorData, setAdvisorData] = useState(null);

  // Timer reference
  const timerRef = useRef(null);

  // Restart / Reset to Scenario Initial Conditions
  const resetSimulation = useCallback((scenarioIdToUse) => {
    const sId = scenarioIdToUse || selectedScenarioId;
    const targetScenario = SIMULATION_SCENARIOS.find((s) => s.id === sId) || SIMULATION_SCENARIOS[0];

    setIsRunning(false);
    setElapsedSeconds(0);
    setFloodLevelMeters(targetScenario.initialConditions?.riverLevelMeters || 1.2);
    setRainfallRate(targetScenario.initialConditions?.rainfallMmPerHour || 60);
    setWindSpeed(targetScenario.initialConditions?.windSpeedKmh || 20);

    // Reset road statuses
    const newRoads = {};
    BRIDGES_AND_ROADS.forEach((r) => {
      newRoads[r.id] = (targetScenario.initialConditions?.blockedRoadIds || []).includes(r.id)
        ? 'blocked'
        : r.status.toLowerCase();
    });
    setRoadStatuses(newRoads);

    // Reset buildings & facilities
    setBuildings(DIGITAL_TWIN_BUILDINGS);
    setFacilities(CRITICAL_FACILITIES);

    // Reset incidents
    setIncidents(INITIAL_SIMULATED_INCIDENTS);
    setResources(RESPONSE_RESOURCES);
    setDecisions([]);
    setActiveWhatIfs([]);
    setSelectedIncidentId(null);
    setAdvisorData(null);

    setEventFeed([
      {
        id: `reset-evt-${Date.now()}`,
        timeSeconds: 0,
        timestamp: new Date().toLocaleTimeString(),
        type: 'SYSTEM_RESET',
        severity: 'info',
        title: `Loaded Scenario: ${targetScenario.title}`,
        message: targetScenario.headline,
      },
    ]);
  }, [selectedScenarioId]);

  // Handle Scenario Selection
  const switchScenario = (scenarioId) => {
    setSelectedScenarioId(scenarioId);
    resetSimulation(scenarioId);
  };

  // Start, Pause, Resume
  const startSimulation = () => setIsRunning(true);
  const pauseSimulation = () => setIsRunning(false);
  const resumeSimulation = () => setIsRunning(true);

  // Change Speed
  const changeSpeed = (speed) => {
    if ([1, 2, 5].includes(speed)) {
      setSimSpeed(speed);
    }
  };

  // Deterministic Step Engine: Fires every 1000ms / simSpeed
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalTime = Math.max(200, 1000 / simSpeed);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const nextTime = prev + 1;

        // Dynamic Environmental Progression
        if (selectedScenarioId === 'flash-flood') {
          // Water rises gradually
          setFloodLevelMeters((curr) => {
            const delta = activeWhatIfs.includes('DOUBLE_RAINFALL') ? 0.02 : 0.008;
            const updated = Math.min(4.5, curr + delta);

            // Trigger bridge submersion when water exceeds 2.2m threshold
            if (updated >= 2.2 && roadStatuses['bridge-1'] !== 'submerged' && roadStatuses['bridge-1'] !== 'blocked') {
              setRoadStatuses((rs) => ({ ...rs, 'bridge-1': 'submerged' }));
              setEventFeed((feed) => [
                {
                  id: `evt-brg-${Date.now()}`,
                  timeSeconds: nextTime,
                  timestamp: new Date().toLocaleTimeString(),
                  type: 'BRIDGE_SUBMERGED',
                  severity: 'critical',
                  title: 'CRITICAL ALERT: Saraswati Central Bridge Submerged',
                  message: `Water gauge reached ${updated.toFixed(1)}m. Bridge deck submerged; closed to all traffic.`,
                },
                ...feed,
              ]);
            }

            return updated;
          });
        }

        // Process Timeline Events from Scenario
        if (scenario && scenario.timelineEvents) {
          const matchedEvents = scenario.timelineEvents.filter((ev) => ev.timeSeconds === nextTime);
          matchedEvents.forEach((ev) => {
            // Add to event feed
            setEventFeed((feed) => [
              {
                id: `evt-tl-${nextTime}-${ev.type}`,
                timeSeconds: nextTime,
                timestamp: new Date().toLocaleTimeString(),
                type: ev.type,
                severity: ev.type.includes('ALERT') || ev.type.includes('SOS') ? 'critical' : 'warning',
                title: ev.title,
                message: ev.description,
              },
              ...feed,
            ]);

            // If event generates new incident
            if (ev.incidentData) {
              setIncidents((currIncidents) => {
                if (currIncidents.some((i) => i.id === ev.incidentData.id)) return currIncidents;
                return [
                  ...currIncidents,
                  {
                    ...ev.incidentData,
                    status: 'Pending',
                    assignedResources: [],
                    reportedAt: new Date().toISOString(),
                  },
                ];
              });
            }

            // If event affects roads
            if (ev.impact?.newBlockedRoads) {
              setRoadStatuses((rs) => {
                const nextRs = { ...rs };
                ev.impact.newBlockedRoads.forEach((rId) => {
                  nextRs[rId] = 'blocked';
                });
                return nextRs;
              });
            }
          });
        }

        return nextTime;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, simSpeed, selectedScenarioId, activeWhatIfs, scenario, roadStatuses]);

  // Command Decision: Assign Rescue Team
  const assignResource = (incidentId, resourceId) => {
    const resource = resources.find((r) => r.id === resourceId);
    const incident = incidents.find((i) => i.id === incidentId);

    if (!resource || !incident) return;

    // Update resource state
    setResources((prev) =>
      prev.map((r) =>
        r.id === resourceId
          ? { ...r, status: 'Dispatched', assignedIncidentId: incidentId }
          : r
      )
    );

    // Update incident state
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === incidentId
          ? {
              ...i,
              status: 'In Progress',
              assignedResources: Array.from(new Set([...(i.assignedResources || []), resourceId])),
            }
          : i
      )
    );

    // Record decision audit trail
    const decisionRecord = {
      id: `dec-${Date.now()}`,
      timeSeconds: elapsedSeconds,
      timestamp: new Date().toLocaleTimeString(),
      type: 'ASSIGN_TEAM',
      action: `Dispatched ${resource.name} to ${incident.title}`,
      incidentId,
      incidentTitle: incident.title,
      resourceId,
      resourceName: resource.name,
    };

    setDecisions((prev) => [decisionRecord, ...prev]);

    // Add to event feed
    setEventFeed((feed) => [
      {
        id: `evt-dec-${Date.now()}`,
        timeSeconds: elapsedSeconds,
        timestamp: new Date().toLocaleTimeString(),
        type: 'COMMAND_DISPATCH',
        severity: 'success',
        title: `Dispatch Confirmed: ${resource.name}`,
        message: `Assigned to ${incident.title} in ${incident.sector || 'Saraswati Nagar'}. Unit en route.`,
      },
      ...feed,
    ]);
  };

  // Command Decision: Dispatch Boat
  const dispatchBoat = (incidentId) => {
    const availableBoat = resources.find(
      (r) => (r.type === 'Rescue Boat' || r.specialization?.includes('Boat')) && r.status === 'Available'
    );
    if (availableBoat) {
      assignResource(incidentId, availableBoat.id);
    } else {
      // Create alert
      setEventFeed((feed) => [
        {
          id: `evt-nobt-${Date.now()}`,
          timeSeconds: elapsedSeconds,
          timestamp: new Date().toLocaleTimeString(),
          type: 'RESOURCE_SHORTAGE',
          severity: 'warning',
          title: 'Resource Shortage: No Available Rescue Boats',
          message: 'All shallow-water rescue boats currently deployed. Reassignment required.',
        },
        ...feed,
      ]);
    }
  };

  // Command Decision: Dispatch Ambulance
  const dispatchAmbulance = (incidentId) => {
    const availableAmb = resources.find((r) => r.type === 'Ambulance' && r.status === 'Available');
    if (availableAmb) {
      assignResource(incidentId, availableAmb.id);
    } else {
      setEventFeed((feed) => [
        {
          id: `evt-noamb-${Date.now()}`,
          timeSeconds: elapsedSeconds,
          timestamp: new Date().toLocaleTimeString(),
          type: 'RESOURCE_SHORTAGE',
          severity: 'warning',
          title: 'Resource Shortage: No Ambulances Available',
          message: 'Civilian transport vans requested for urgent non-trauma evacuations.',
        },
        ...feed,
      ]);
    }
  };

  // Command Decision: Reassign Resource
  const reassignResource = (resourceId, newIncidentId) => {
    const resource = resources.find((r) => r.id === resourceId);
    const newInc = incidents.find((i) => i.id === newIncidentId);
    if (!resource || !newInc) return;

    // Remove from old incident
    setIncidents((prev) =>
      prev.map((i) => ({
        ...i,
        assignedResources: (i.assignedResources || []).filter((id) => id !== resourceId),
      }))
    );

    // Assign to new incident
    assignResource(newIncidentId, resourceId);
  };

  // Resolve Incident
  const resolveIncident = (incidentId) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === incidentId ? { ...i, status: 'Resolved' } : i))
    );

    // Free up assigned resources
    setResources((prev) =>
      prev.map((r) => (r.assignedIncidentId === incidentId ? { ...r, status: 'Available', assignedIncidentId: null } : r))
    );

    setEventFeed((feed) => [
      {
        id: `evt-res-${Date.now()}`,
        timeSeconds: elapsedSeconds,
        timestamp: new Date().toLocaleTimeString(),
        type: 'INCIDENT_RESOLVED',
        severity: 'success',
        title: 'Incident Evacuated & Resolved',
        message: `Personnel and civilians cleared from site. Resources returned to operational reserve.`,
      },
      ...feed,
    ]);
  };

  // Toggle Road / Bridge Status
  const toggleRoadStatus = (roadId, newStatus) => {
    setRoadStatuses((prev) => ({
      ...prev,
      [roadId]: newStatus,
    }));

    const road = BRIDGES_AND_ROADS.find((r) => r.id === roadId);
    setEventFeed((feed) => [
      {
        id: `evt-rd-${Date.now()}`,
        timeSeconds: elapsedSeconds,
        timestamp: new Date().toLocaleTimeString(),
        type: 'CORRIDOR_UPDATED',
        severity: newStatus === 'blocked' || newStatus === 'submerged' ? 'warning' : 'info',
        title: `Route Corridor ${newStatus.toUpperCase()}: ${road?.name || roadId}`,
        message: `Evacuation route planner will automatically divert emergency convoys.`,
      },
      ...feed,
    ]);
  };

  // What-If Sandbox Trigger
  const triggerWhatIf = async (experimentType) => {
    try {
      setActiveWhatIfs((prev) => (prev.includes(experimentType) ? prev : [...prev, experimentType]));

      if (experimentType === 'DOUBLE_RAINFALL') {
        setRainfallRate((r) => r * 2);
        setFloodLevelMeters((f) => f + 0.8);
      } else if (experimentType === 'BRIDGE_COLLAPSE') {
        toggleRoadStatus('bridge-1', 'blocked');
      } else if (experimentType === 'SHELTER_CLOSURE') {
        setFacilities((prev) =>
          prev.map((f) => (f.id === 'fac-shltr-1' ? { ...f, status: 'Closed - Structural Failure' } : f))
        );
      }

      // Record what-if decision
      const decisionRecord = {
        id: `dec-whatif-${Date.now()}`,
        timeSeconds: elapsedSeconds,
        timestamp: new Date().toLocaleTimeString(),
        type: 'WHAT_IF_EXPERIMENT',
        action: `Triggered Stress-Test: ${experimentType}`,
        experimentType,
      };
      setDecisions((prev) => [decisionRecord, ...prev]);

      // Call backend API for deep AI evaluation
      const res = await fetch(`${API_BASE_URL}/crisis-lab/what-if`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenarioId,
          experimentType,
          currentState: {
            floodLevelMeters,
            activeIncidents: incidents,
            roadStatuses,
          },
        }),
      });
      const data = await res.json();

      if (data.success && data.whatIfResult) {
        setEventFeed((feed) => [
          {
            id: `evt-wif-${Date.now()}`,
            timeSeconds: elapsedSeconds,
            timestamp: new Date().toLocaleTimeString(),
            type: 'WHAT_IF_EVALUATION',
            severity: 'critical',
            title: `What-If Analysis: ${data.whatIfResult.consequences?.title || experimentType}`,
            message: `${data.whatIfResult.consequences?.description || ''} Casualties Risk: ${data.whatIfResult.consequences?.casualtyRiskDelta || 'Elevated'}`,
          },
          ...feed,
        ]);
        return data.whatIfResult;
      }
    } catch (e) {
      console.warn('CrisisLab What-If backend unavailable, using local simulation:', e);
    }
  };

  // Query AI Command Advisor
  const askAIAdvisor = async (queryText) => {
    setAdvisorLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/crisis-lab/advisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenarioId,
          query: queryText,
          simulationState: {
            floodLevelMeters,
            activeIncidents: incidents,
            assignedResources: resources,
            roadStatuses,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.advisor) {
        setAdvisorData(data.advisor);
        setAdvisorLoading(false);
        return data.advisor;
      }
    } catch (e) {
      console.warn('AI Advisor backend offline, using heuristic fallback:', e);
    }

    // Fallback heuristic response
    const fallback = {
      query: queryText,
      recommendation: `Command Recommendation: Prioritize unassigned rescue operations in Sector 2. Water gauge is ${floodLevelMeters.toFixed(1)}m. Keep North Elevated Flyover clear.`,
      evidence: [
        `Active river gauge at ${floodLevelMeters.toFixed(1)}m.`,
        `${incidents.filter((i) => i.status !== 'Resolved').length} active incidents requiring response.`,
        'North Elevated Flyover provides all-weather 4-lane access to Civil Hospital.',
      ],
      tradeOffs: [
        'Diverting NDRF Team Alpha from Sector 1 temporarily delays masonry shoring.',
      ],
      confidence: 0.89,
      source: 'DisasterChain Autonomous Command Fallback Engine',
      timestamp: new Date().toISOString(),
    };
    setAdvisorData(fallback);
    setAdvisorLoading(false);
    return fallback;
  };

  // Explainable Score Calculation
  const calculateScore = () => {
    let score = 74;
    const resolved = incidents.filter((i) => i.status === 'Resolved').length;
    const inProgress = incidents.filter((i) => i.status === 'In Progress').length;
    score += resolved * 8;
    score += inProgress * 4;
    score += Math.min(10, decisions.length * 2);
    if (activeWhatIfs.length > 0) score += 5; // Bonus for resilience stress testing
    return Math.min(98, Math.max(50, score));
  };

  return (
    <CrisisSimulationContext.Provider
      value={{
        // District Metadata
        districtMeta: DISTRICT_META,
        sectors: SECTORS,
        allScenarios: SIMULATION_SCENARIOS,
        selectedScenarioId,
        scenario,
        switchScenario,

        // Engine State & Controls
        isRunning,
        simSpeed,
        elapsedSeconds,
        startSimulation,
        pauseSimulation,
        resumeSimulation,
        resetSimulation,
        changeSpeed,

        // Telemetry
        floodLevelMeters,
        rainfallRate,
        windSpeed,

        // Spatial & Operational State
        roads: BRIDGES_AND_ROADS,
        roadStatuses,
        buildings,
        facilities,
        incidents,
        resources,
        selectedIncidentId,
        setSelectedIncidentId,

        // Actions
        assignResource,
        dispatchBoat,
        dispatchAmbulance,
        reassignResource,
        resolveIncident,
        toggleRoadStatus,
        triggerWhatIf,
        activeWhatIfs,

        // AI Advisor
        askAIAdvisor,
        advisorData,
        advisorLoading,

        // Scoring & Logs
        eventFeed,
        decisions,
        calculateScore,
      }}
    >
      {children}
    </CrisisSimulationContext.Provider>
  );
};
