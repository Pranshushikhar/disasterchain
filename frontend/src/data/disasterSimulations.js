/**
 * DisasterChain Academy - Interactive Branching Disaster Simulations
 * 
 * Scenario-based decision training with consequence feedback.
 * Explicitly educational, distinguished from live emergency alerts.
 */

export const DISASTER_SIMULATIONS = [
  // =========================================================================
  // SIMULATION 1: EARTHQUAKE IN A HIGH-RISE
  // =========================================================================
  {
    id: 'sim-earthquake-highrise',
    title: 'Earthquake in a Multi-Story Office Complex',
    disasterType: 'Earthquake',
    difficulty: 'Intermediate',
    estimatedTime: '6 min',
    points: 100,
    badgeAward: 'badge-sim-earthquake',
    description: 'You are on the 7th floor of an office building when a Magnitude 6.8 seismic tremor strikes. Every second counts.',
    initialScenario: {
      stepId: 'step-1',
      title: 'Sudden Violent Shaking',
      scenario: 'You are seated at your workstation on the 7th floor. Without warning, a loud sub-audible rumble turns into violent horizontal shaking. Ceiling tiles begin buckling and books fly off shelves. Coworkers panic. What is your immediate action?',
      options: [
        {
          id: 'opt-1a',
          label: 'Sprint for the elevator banks to reach ground level before the building collapses',
          consequence: 'DANGEROUS DECISION: Elevators can instantly lose power, jam between floors, or enter emergency counterweight brake locks. You are trapped in an elevator shaft during structural shaking.',
          isSafe: false,
          points: 0,
          nextStepId: 'step-fail-elevator'
        },
        {
          id: 'opt-1b',
          label: 'Run to the nearest exterior window to see what is happening outside',
          consequence: 'DANGEROUS DECISION: Exterior glass facades shear and shatter outward and inward under ground motion. Shards of plate glass cause life-threatening lacerations.',
          isSafe: false,
          points: 0,
          nextStepId: 'step-fail-window'
        },
        {
          id: 'opt-1c',
          label: 'DROP to hands and knees, crawl under the heavy steel desk, COVER head and neck, and HOLD ON',
          consequence: 'EXCELLENT & SAFE: By dropping immediately, you prevent being thrown to the floor. The sturdy steel desk deflects falling light fixtures and concrete ceiling plaster.',
          isSafe: true,
          points: 35,
          nextStepId: 'step-2'
        }
      ]
    },
    steps: {
      'step-fail-elevator': {
        title: 'Elevator Failure',
        scenario: 'The building power flickers out, the emergency brakes engage with a violent jolt, and you are trapped in pitch blackness inside the elevator shaft between the 6th and 7th floors while aftershocks continue.',
        explanation: 'Elevators must NEVER be used during an earthquake or fire. You must always Drop, Cover, and Hold On beneath sturdy furniture.',
        isTerminal: true,
        passed: false
      },
      'step-fail-window': {
        title: 'Glass Impact Hazard',
        scenario: 'As you approach the window, the building shears laterally and the entire glass pane implodes into thousands of flying shards.',
        explanation: 'Windows and perimeter glass walls are the most dangerous areas during seismic movement. Stay in the interior core.',
        isTerminal: true,
        passed: false
      },
      'step-2': {
        title: 'Shaking Ceases: Post-Tremor Decision',
        scenario: 'After 45 seconds, the violent shaking stops. The office is filled with gypsum dust, the fire alarm is wailing, and emergency strobes are flashing. You smell a faint odor of natural gas near the breakroom. What do you do now?',
        options: [
          {
            id: 'opt-2a',
            label: 'Flip the breakroom light switch to inspect if the gas stove or pipes are broken',
            consequence: 'FATAL ERROR: Flipping an electrical switch creates an internal micro-arc spark. In an atmosphere with leaking gas, this can trigger an explosion.',
            isSafe: false,
            points: 0,
            nextStepId: 'step-fail-gas-spark'
          },
          {
            id: 'opt-2b',
            label: 'Put on sturdy shoes, grab your personal bag, warn coworkers of the gas smell, and evacuate via the stairwell',
            consequence: 'EXCELLENT: Sturdy footwear protects your feet from glass; avoiding electrical switches prevents explosions; stairwell is the designated exit route.',
            isSafe: true,
            points: 35,
            nextStepId: 'step-3'
          },
          {
            id: 'opt-2c',
            label: 'Stay under your desk and wait for emergency responders to arrive and escort you down',
            consequence: 'SUB-OPTIMAL: While staying put during shaking is correct, remaining in a building with a confirmed gas leak after shaking stops exposes you to fire, toxic fumes, or collapse from aftershocks.',
            isSafe: false,
            points: 10,
            nextStepId: 'step-fail-linger'
          }
        ]
      },
      'step-fail-gas-spark': {
        title: 'Gas Arc Explosion',
        scenario: 'The mechanical light switch sparks, igniting the natural gas pocket. A flash fire engulfs the breakroom corridor.',
        explanation: 'Never touch light switches, match flames, or electrical switches if gas leaks are suspected.',
        isTerminal: true,
        passed: false
      },
      'step-fail-linger': {
        title: 'Trapped by Secondary Hazards',
        scenario: 'As you linger under your desk, a strong Magnitude 5.9 aftershock strikes 8 minutes later, exacerbating the gas line rupture and blocking the remaining stairwell door.',
        explanation: 'Once shaking stops, evaluate immediate hazards (fire, gas, structural collapse) and evacuate calmly via stairs.',
        isTerminal: true,
        passed: false
      },
      'step-3': {
        title: 'Stairwell Evacuation & Street Hazards',
        scenario: 'You reach the 7th-floor fire exit stairwell. Coworkers are beginning to crowd into the stairs. People are hurrying. As you descend to ground level and reach the exterior lobby doors, you notice broken glass on the sidewalk and bricks falling from neighboring cornices. What do you do as you exit?',
        options: [
          {
            id: 'opt-3a',
            label: 'Stop directly under the building’s glass canopy entrance to call family on your phone',
            consequence: 'EXTREME DANGER: The perimeter directly outside high-rise facades is the "Falling Debris Kill Zone." Exterior brick facades, air conditioning units, and glass cascade straight down.',
            isSafe: false,
            points: 0,
            nextStepId: 'step-fail-killzone'
          },
          {
            id: 'opt-3b',
            label: 'Cover your head with your bag/coat and move rapidly into an open public square or wide street away from buildings and utility poles',
            consequence: 'PERFECT SURVIVAL EXECUTION: You quickly cleared the falling debris perimeter and arrived in an open clearing, safe from aftershock facade collapses.',
            isSafe: true,
            points: 30,
            nextStepId: 'step-success'
          }
        ]
      },
      'step-fail-killzone': {
        title: 'Facade Debris Strike',
        scenario: 'While standing beneath the entrance canopy, an aftershock loosens decorative granite cladding from the 12th floor, crushing the canopy.',
        explanation: 'Always clear the building exterior perimeter immediately. The area within 10 to 20 meters of building facades is the deadliest zone.',
        isTerminal: true,
        passed: false
      },
      'step-success': {
        title: 'Safe Evacuation Complete!',
        scenario: 'You have safely reached the city central park assembly point. You check in with coworkers and send a single SMS text to your family out-of-town contact indicating you are safe.',
        explanation: 'Outstanding disaster response! You dropped, covered, and held on; identified gas hazards; took the stairwell; and cleared the falling debris zone.',
        isTerminal: true,
        passed: true
      }
    }
  },

  // =========================================================================
  // SIMULATION 2: FLASH FLOOD IN A VEHICLE
  // =========================================================================
  {
    id: 'sim-flash-flood',
    title: 'Flash Flood Approaching Your Vehicle',
    disasterType: 'Flood',
    difficulty: 'Intermediate',
    estimatedTime: '5 min',
    points: 100,
    badgeAward: 'badge-sim-flood',
    description: 'You are driving home during a heavy monsoon cloudburst when you encounter moving water over the roadway.',
    initialScenario: {
      stepId: 'step-1',
      title: 'Water Across the Highway Dip',
      scenario: 'You are driving an SUV down a suburban road when you approach a low-lying dip under a railway bridge. Moving muddy water is flowing across the roadway. You can see the road surface looks about 12 to 18 inches deep, and a pickup truck ahead of you just crossed. What should you do?',
      options: [
        {
          id: 'opt-1a',
          label: 'Accelerate quickly behind the pickup truck; your SUV has good ground clearance',
          consequence: 'CRITICAL FAILURE: As you enter the dip, the water is deeper than it appeared because the road beneath has washed away. The water lifts your SUV tires off the roadbed and your engine stalls instantly.',
          isSafe: false,
          points: 0,
          nextStepId: 'step-fail-cross'
        },
        {
          id: 'opt-1b',
          label: 'Turn on hazard flashers, STOP immediately, safely execute a 3-point turn, and take an alternate high-ground route',
          consequence: 'EXCELLENT: "Turn Around, Don’t Drown." You avoid an invisible 2-foot roadbed washout that would have swept your car into the swollen drainage canal.',
          isSafe: true,
          points: 40,
          nextStepId: 'step-2'
        }
      ]
    },
    steps: {
      'step-fail-cross': {
        title: 'Vehicle Swept by Current',
        scenario: 'The current pushes the floating SUV sideways against the railway support pillar. Water begins rising up to the door windows.',
        explanation: 'Just 12 inches of moving water can float an SUV. Never attempt to cross flooded roads regardless of vehicle size.',
        isTerminal: true,
        passed: false
      },
      'step-2': {
        title: 'Detour & Rapidly Rising Creek',
        scenario: 'You take an uphill secondary road, but 5 minutes later, an upstream cloudburst causes a nearby creek to burst its banks. Muddy water sweeps across the side of the road and stalls your engine. Water is already up to the wheel hubs and rising rapidly. What is your action?',
        options: [
          {
            id: 'opt-2a',
            label: 'Stay buckled inside the car with windows rolled up tightly and wait for emergency services to locate you',
            consequence: 'DANGEROUS MISTAKE: Water pressure will soon lock the doors shut, and rising water will submerge the cabin before rescuers can reach you.',
            isSafe: false,
            points: 0,
            nextStepId: 'step-fail-stay-inside'
          },
          {
            id: 'opt-2b',
            label: 'Unbuckle immediately, roll down side windows, exit the vehicle with your emergency Go-Bag, and move up the adjacent hillside',
            consequence: 'SUPERB DECISION: S-W-O-C principle in action! You exited while windows could still open, moved to higher ground, and watched your car get swept into the drainage basin 3 minutes later.',
            isSafe: true,
            points: 60,
            nextStepId: 'step-success'
          }
        ]
      },
      'step-fail-stay-inside': {
        title: 'Trapped in Submerged Cabin',
        scenario: 'Within 4 minutes, water covers the hood and pushes against the doors with tons of force. You cannot open the doors and the electrical power shorts out.',
        explanation: 'If water is rising around a stalled vehicle, abandon it immediately for higher ground before you are trapped.',
        isTerminal: true,
        passed: false
      },
      'step-success': {
        title: 'Safe on High Ground!',
        scenario: 'You safely reach an elevated residential terrace above the flood line. You dial emergency services (112) to report the washed-out bridge and request shelter coordination.',
        explanation: 'Flawless execution! You respected the lethal power of swiftwater, avoided driving through standing water, and evacuated the vehicle before water pressure locked the doors.',
        isTerminal: true,
        passed: true
      }
    }
  },

  // =========================================================================
  // SIMULATION 3: NIGHTTIME HOUSE FIRE
  // =========================================================================
  {
    id: 'sim-house-fire',
    title: 'Nighttime Residential Fire & Smoke Escape',
    disasterType: 'Fire',
    difficulty: 'Intermediate',
    estimatedTime: '5 min',
    points: 100,
    badgeAward: 'badge-sim-fire',
    description: 'At 2:30 AM, your bedroom smoke alarm sounds shrilly. Thick gray smoke is filtering under your door.',
    initialScenario: {
      stepId: 'step-1',
      title: 'Smoke Alarm at 2:30 AM',
      scenario: 'You wake up abruptly to the high-pitched pierce of a smoke alarm. The room is hazy and you hear crackling in the hallway. You rush to your closed bedroom door. What do you do before touching the handle?',
      options: [
        {
          id: 'opt-1a',
          label: 'Fling the door open quickly to see where the fire is located in the house',
          consequence: 'FATAL MOVE: Opening a hot door can cause a backdraft or flashover, drawing a massive ball of superheated toxic smoke directly into your face and bedroom.',
          isSafe: false,
          points: 0,
          nextStepId: 'step-fail-open-door'
        },
        {
          id: 'opt-1b',
          label: 'Touch the door and metal doorknob with the back of your hand to test for heat',
          consequence: 'CORRECT & ESSENTIAL: The back of your hand is sensitive to heat. You feel the metal handle is blisteringly HOT. You now know raging fire is directly outside your hallway.',
          isSafe: true,
          points: 35,
          nextStepId: 'step-2'
        }
      ]
    },
    steps: {
      'step-fail-open-door': {
        title: 'Flashover Fire Influx',
        scenario: 'A wall of black 400°C smoke rolls into the bedroom, instantly depleting oxygen and blinding you.',
        explanation: 'Never open a door without testing it for heat first. If it is hot, your primary exit is blocked.',
        isTerminal: true,
        passed: false
      },
      'step-2': {
        title: 'Primary Exit Blocked: Secondary Escape',
        scenario: 'The hallway door is hot and smoke is curling through the jamb. Your primary hallway escape is impassable. You are on the 2nd floor with an exterior window leading to a low garage roof. What is your next move?',
        options: [
          {
            id: 'opt-2a',
            label: 'Search your closets for valuables, laptop, and photo albums before leaving',
            consequence: 'FATAL DELAY: Residential fires double in size every 30 to 60 seconds. Searching for possessions leads to smoke inhalation unconsciousness within 90 seconds.',
            isSafe: false,
            points: 0,
            nextStepId: 'step-fail-delay'
          },
          {
            id: 'opt-2b',
            label: 'Stuff a towel or blanket under the closed door gap, open the bedroom window, deploy the escape ladder, and climb onto the garage roof',
            consequence: 'EXCELLENT: Stuffing the door seals out smoke, and using your secondary escape route (window) gets you safely outside into clean air.',
            isSafe: true,
            points: 35,
            nextStepId: 'step-3'
          }
        ]
      },
      'step-fail-delay': {
        title: 'Overcome by Carbon Monoxide',
        scenario: 'While packing electronics, toxic carbon monoxide fills the upper ceiling space and causes dizziness and collapse.',
        explanation: 'Every second counts. Never stop to gather possessions during a structural fire.',
        isTerminal: true,
        passed: false
      },
      'step-3': {
        title: 'Outside & Accounting for Loved Ones',
        scenario: 'You drop safely from the garage roof to the grass lawn outside. You meet your family members at your designated meeting spot (the maple tree across the street). However, you notice your pet cat is still inside the house on the first floor. What do you do?',
        options: [
          {
            id: 'opt-3a',
            label: 'Open the front door and crawl back inside to search the living room for the cat',
            consequence: 'CRITICAL LIFE HAZARD: NEVER re-enter a burning structure under any circumstances. Over 50% of civilian fire deaths occur when residents re-enter buildings.',
            isSafe: false,
            points: 0,
            nextStepId: 'step-fail-reenter'
          },
          {
            id: 'opt-3b',
            label: 'Stay outside at your assembly point, dial 112/101, and inform arriving firefighters immediately of the exact room where the cat was last seen',
            consequence: 'PERFECT HEROIC CONDUCT: You protect human lives and give trained, oxygen-equipped firefighters precise target intelligence to conduct a rapid animal rescue.',
            isSafe: true,
            points: 30,
            nextStepId: 'step-success'
          }
        ]
      },
      'step-fail-reenter': {
        title: 'Incapacitation Inside Burning Structure',
        scenario: 'As you re-enter the front door, the stairwell ceiling collapses, trapping you inside.',
        explanation: 'Once you are out, STAY OUT! Firefighters equipped with thermal cameras and SCBA respirators are the only ones capable of interior search.',
        isTerminal: true,
        passed: false
      },
      'step-success': {
        title: 'Safe Evacuation & Fire Response!',
        scenario: 'Fire crews arrive in 4 minutes, attack the flames, and safely retrieve your pet from the ground floor. Your family is uninjured and accounted for.',
        explanation: 'Outstanding fire safety execution! You tested doors with the back of your hand, used a secondary escape route, and followed the golden rule: Once out, STAY OUT.',
        isTerminal: true,
        passed: true
      }
    }
  },

  // =========================================================================
  // SIMULATION 4: CATEGORY 4 CYCLONE APPROACHING
  // =========================================================================
  {
    id: 'sim-cyclone-prep',
    title: 'Severe Cyclone Landfall: 12-Hour Alert',
    disasterType: 'Cyclone',
    difficulty: 'Advanced',
    estimatedTime: '6 min',
    points: 100,
    badgeAward: 'badge-sim-cyclone',
    description: 'A Severe Cyclonic Storm with 180 km/h gusts is forecast to make landfall near your coastal town in 12 hours.',
    initialScenario: {
      stepId: 'step-1',
      title: 'T-Minus 12 Hours: Securing the Exterior',
      scenario: 'The meteorological department issues a Red Cyclone Alert. You live in a single-story coastal residence with a fenced yard. You have 12 hours before storm-force winds hit. What is your priority outdoor task?',
      options: [
        {
          id: 'opt-1a',
          label: 'Criss-cross wide duct tape across all glass windows in an "X" pattern to reinforce them',
          consequence: 'DANGEROUS MYTH: Window taping does NOT prevent glass from shattering and creates huge, lethal razor shards when struck by high-speed windborne debris.',
          isSafe: false,
          points: 0,
          nextStepId: 'step-fail-tape'
        },
        {
          id: 'opt-1b',
          label: 'Anchor 5/8" plywood storm shutters over all windows, clear the yard of all loose furniture/bins/tools, and park vehicles close to masonry walls',
          consequence: 'OUTSTANDING PREPARATION: Plywood shutters absorb projectile impacts, and removing loose yard objects eliminates high-velocity missiles.',
          isSafe: true,
          points: 35,
          nextStepId: 'step-2'
        }
      ]
    },
    steps: {
      'step-fail-tape': {
        title: 'Window Breach by Debris',
        scenario: 'During 140 km/h gusts, a flying branch shatters the taped window into giant sharp shards. Wind breaches the room and peels off the roof ceiling.',
        explanation: 'Tape does not protect glass from wind pressure or projectiles. Always use rigid storm shutters or anchored plywood.',
        isTerminal: true,
        passed: false
      },
      'step-2': {
        title: 'Landfall: The Deceptive Eye',
        scenario: 'The storm makes landfall at 11 PM with deafening roar and 170 km/h winds. At 1:30 AM, the wind abruptly dies down to complete silence, the rain stops, and stars become visible through the clouds. Neighbors are walking out into their gardens to inspect their roofs. What do you do?',
        options: [
          {
            id: 'opt-2a',
            label: 'Walk outside to inspect roof shingles and check on neighbors’ property',
            consequence: 'LETHAL TRAP: You are in the eye of the storm! Within 15 to 30 minutes, the second eyewall will strike from the exact OPPOSITE direction with maximum hurricane winds and zero warning.',
            isSafe: false,
            points: 0,
            nextStepId: 'step-fail-eye'
          },
          {
            id: 'opt-2b',
            label: 'Remain inside your reinforced interior shelter room; monitor the battery radio and prepare for the reverse eyewall',
            consequence: 'EXCELLENT CYCLONE AWARENESS: You recognize the eye deception. 20 minutes later, 180 km/h reverse winds slam the exterior, snapping trees that had withstood the first half of the storm.',
            isSafe: true,
            points: 35,
            nextStepId: 'step-3'
          }
        ]
      },
      'step-fail-eye': {
        title: 'Caught in the Reverse Eyewall',
        scenario: 'While examining your garden, the wind explodes from the opposite direction at 180 km/h, snapping a palm tree across the driveway.',
        explanation: 'The eye of a cyclone brings temporary calm before the opposite eyewall strikes with peak destructive fury.',
        isTerminal: true,
        passed: false
      },
      'step-3': {
        title: 'Post-Storm: Electrical Grid Failure & Generator Power',
        scenario: 'The storm has fully passed. The city grid is completely down, trees and power lines block the street, and tap water is off. You need to power your refrigerator using a portable gasoline backup generator. Where do you place and operate the generator?',
        options: [
          {
            id: 'opt-3a',
            label: 'Inside the open attached garage so it stays protected from passing rain showers',
            consequence: 'DEADLY RISK: Running a generator in an attached garage allows odorless carbon monoxide to seep through drywall and door gaps into living areas, causing asphyxiation.',
            isSafe: false,
            points: 0,
            nextStepId: 'step-fail-generator'
          },
          {
            id: 'opt-3b',
            label: 'Outdoors in the open yard at least 20 feet (6 meters) away from all doors, windows, and ventilation openings, with the exhaust pointing away',
            consequence: 'PERFECT PROTOCOL: Operating the generator outdoors at a 20-foot distance prevents deadly carbon monoxide poisoning while keeping essential food refrigerated.',
            isSafe: true,
            points: 30,
            nextStepId: 'step-success'
          }
        ]
      },
      'step-fail-generator': {
        title: 'Carbon Monoxide Infiltration',
        scenario: 'Carbon monoxide accumulates inside the house, triggering the CO detector and causing intense headaches and nausea.',
        explanation: 'Never run a combustion generator indoors, in garages, or near open windows.',
        isTerminal: true,
        passed: false
      },
      'step-success': {
        title: 'Cyclone Survival Mastered!',
        scenario: 'Your home resisted structural damage, your family remained safe throughout the eye passage, and you avoided deadly post-storm carbon monoxide hazards.',
        explanation: 'Masterful preparedness! You shuttered windows properly, identified the eye-of-the-storm calm, and safely operated backup power.',
        isTerminal: true,
        passed: true
      }
    }
  }
];
