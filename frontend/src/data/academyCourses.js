/**
 * DisasterChain Academy - 15 Authoritative Disaster & Safety Courses
 * 
 * Based on official safety protocols from NDMA, FEMA, Red Cross, and WHO.
 * Designed for interactive, scenario-based emergency education.
 */

export const ACADEMY_CATEGORIES = [
  { id: 'all', label: 'All Courses', icon: 'BookOpen' },
  { id: 'natural', label: 'Natural Disasters', icon: 'CloudLightning' },
  { id: 'urban', label: 'Urban & Industrial', icon: 'Flame' },
  { id: 'first_aid', label: 'First Aid & Medical', icon: 'HeartPulse' },
  { id: 'preparedness', label: 'Preparedness & Survival', icon: 'ShieldCheck' },
];

export const ACADEMY_COURSES = [
  // =========================================================================
  // 1. EARTHQUAKE SAFETY
  // =========================================================================
  {
    id: 'earthquake-safety',
    title: 'Earthquake Safety & Structural Survival',
    category: 'natural',
    duration: '25 min',
    difficulty: 'Essential',
    points: 150,
    badge: {
      id: 'badge-earthquake-master',
      title: 'Earthquake Survivor',
      icon: 'Activity',
      description: 'Mastered Drop, Cover, Hold On and post-tremor building evacuation.'
    },
    description: 'Learn rapid reaction protocols for seismic tremors, indoor structural protection, avoiding structural crush zones, and aftershock safety.',
    learningObjectives: [
      'Master the Drop, Cover, and Hold On technique within 3 seconds of shaking.',
      'Identify interior structural safe zones vs hazard zones (windows, unanchored furniture).',
      'Execute safe evacuation and aftershock mitigation without panic.',
      'Perform rapid post-earthquake gas and electrical safety checks.'
    ],
    lessons: [
      {
        id: 'eq-l1',
        title: 'Before an Earthquake: Securing Your Space',
        duration: '5 min',
        content: `Earthquakes strike without warning. Preparedness focuses on mitigating structural and non-structural hazards inside your home or workplace before tremors occur.
        
More than 70% of injuries in moderate earthquakes are caused by falling objects, shattering glass, and toppling heavy furniture, rather than building collapses.`,
        practicalSteps: [
          'Anchor heavy bookcases, water heaters, and television monitors securely to wall studs with L-brackets.',
          'Store heavy and breakable objects on lower shelves rather than overhead cabinets.',
          'Locate and label your main gas shutoff valve and electrical circuit breaker; keep a wrench accessible.',
          'Keep sturdy shoes and a battery-powered flashlight right beside your bed.'
        ],
        diagram: {
          type: 'anchor_hazards',
          title: 'Indoor Seismic Hazard Mitigation',
          caption: 'Secure wall studs, anchor top-heavy furniture, and keep egress paths clear.'
        },
        checkpoint: {
          question: 'What causes the majority of non-fatal injuries during moderate earthquakes?',
          options: [
            'Total structural collapse',
            'Falling furniture, unanchored objects, and shattered glass',
            'Lightning strikes',
            'Sinkholes opening under buildings'
          ],
          correctAnswerIndex: 1,
          explanation: 'Over 70% of earthquake injuries result from falling objects, shattered glass, and toppling furniture that can be prevented through anchoring.'
        }
      },
      {
        id: 'eq-l2',
        title: 'During an Earthquake: Drop, Cover, and Hold On',
        duration: '6 min',
        content: `When the ground shakes, never attempt to run outside. Ground acceleration can easily knock you down, and exterior building facades, glass, and bricks fall directly onto sidewalks.
        
The globally accepted protocol is: **DROP** to your hands and knees, **COVER** your head and neck under sturdy furniture, and **HOLD ON** until the shaking stops.`,
        practicalSteps: [
          'DROP down immediately onto your hands and knees to prevent being thrown down.',
          'COVER your head and neck with one arm. If a sturdy desk or table is nearby, crawl beneath it.',
          'HOLD ON to your shelter with one hand and stay prepared to move with it as it shifts.',
          'If no shelter is available, drop low near an interior wall away from windows and protect your head with both arms.'
        ],
        diagram: {
          type: 'drop_cover_hold',
          title: 'The 3-Step Survival Technique',
          caption: '1. DROP to knees  |  2. COVER under sturdy table  |  3. HOLD ON until shaking ceases.'
        },
        checkpoint: {
          question: 'If you are indoors when shaking begins, what should you do first?',
          options: [
            'Sprint down the stairwell to the street immediately',
            'Stand in an open doorway or run to the elevator',
            'Drop to your hands and knees, cover head/neck, and hold onto sturdy shelter',
            'Open all windows to equalize air pressure'
          ],
          correctAnswerIndex: 2,
          explanation: 'Running during ground movement risks severe falls and exposure to falling debris. Drop, Cover, and Hold On is the proven protocol.'
        }
      },
      {
        id: 'eq-l3',
        title: 'Special Environments: High-Rises, Vehicles & Outdoors',
        duration: '7 min',
        content: `Actions must adapt to your immediate surroundings when a tremor occurs:
        
**In High-Rise Buildings:** Fire alarms and sprinkler systems will likely activate. Do NOT rush to elevators; stairwells may jam. Drop, Cover, and Hold On.
**In Vehicles:** Pull safely over to the side of the road away from overpasses, bridges, and power lines. Set the parking brake and remain inside.
**Outdoors:** Move quickly to an open clearing away from buildings, utility poles, streetlights, and overhanging trees.`,
        practicalSteps: [
          'If driving: Decelerate smoothly, pull away from bridges and overhead wires, stay buckled.',
          'In high-rise: Expect sway and alarms; shelter away from exterior glass walls.',
          'In bed: Stay there, curl face-down, and protect your head with a pillow unless under a heavy ceiling fixture.',
          'In transit: Hold firmly to handrails and crouch low.'
        ],
        diagram: {
          type: 'special_locations',
          title: 'Seismic Reaction by Location',
          caption: 'Vehicle: Pull over. High-Rise: Shelter in place. Outdoors: Open space clearing.'
        },
        checkpoint: {
          question: 'If you are driving on a highway when a strong earthquake hits, what is the safest response?',
          options: [
            'Speed up to cross the nearest bridge quickly',
            'Pull over safely away from overpasses and power lines, set brake, stay inside',
            'Abandon the car immediately in the center lane and run',
            'Stop directly underneath an overpass for overhead cover'
          ],
          correctAnswerIndex: 1,
          explanation: 'Pulling over away from overhead hazards like bridges and cables keeps you protected inside the structural shell of the vehicle.'
        }
      },
      {
        id: 'eq-l4',
        title: 'Aftershocks, Evacuation & Utility Hazards',
        duration: '7 min',
        content: `Secondary hazards frequently follow earthquakes: severe aftershocks, severed gas lines, damaged electrical wires, and fires.
        
After shaking stops, survey your immediate surroundings for injuries and hazards before moving. If you smell gas, open windows, evacuate immediately, and do NOT switch on any lights or matches.`,
        practicalSteps: [
          'Wear sturdy shoes immediately to protect feet against shattered glass and nails.',
          'Check for gas leaks: If you smell sulfur or hear hissing, turn off main valve and evacuate immediately.',
          'Never use elevators to evacuate; take stairs and check for structural cracks.',
          'Prepare for aftershocks: Each aftershock can damage already weakened buildings.'
        ],
        diagram: {
          type: 'aftershock_checks',
          title: 'Post-Tremor 4-Point Safety Sweep',
          caption: '1. Put on shoes  2. Check for gas leaks  3. Evacuate via stairs  4. Monitor aftershocks.'
        },
        checkpoint: {
          question: 'Why must you avoid using light switches if you smell gas after an earthquake?',
          options: [
            'It will short-circuit your neighbor’s electricity',
            'The electrical contact spark can ignite accumulated gas and trigger an explosion',
            'Light switches do not function after tremors',
            'It interferes with search and rescue radio frequencies'
          ],
          correctAnswerIndex: 1,
          explanation: 'Flipping an electrical switch creates an internal contact arc that can instantly ignite escaping gas.'
        }
      }
    ],
    quiz: [
      {
        question: 'What is the universally recommended action when earthquake shaking begins while indoors?',
        options: [
          'Run as fast as possible to the exterior street',
          'Drop, Cover, and Hold On beneath a sturdy desk or interior wall',
          'Climb onto the roof of the building',
          'Stand in the middle of a doorway'
        ],
        correctAnswerIndex: 1,
        explanation: 'Drop, Cover, and Hold On protects your vital organs from falling debris, the primary cause of injury.'
      },
      {
        question: 'When evacuating a multi-story building following an earthquake, which route is mandatory?',
        options: [
          'Express elevator',
          'Exterior window descent',
          'Interior stairs after checking for stability',
          'Service freight elevator'
        ],
        correctAnswerIndex: 2,
        explanation: 'Elevators can lose power or jam in deformed shafts. Always utilize structural stairwells.'
      },
      {
        question: 'Which item is most critical to put on immediately after shaking stops in your bedroom?',
        options: [
          'Sturdy closed-toe shoes or work boots',
          'Warm wool coat',
          'Headphones',
          'Gloves'
        ],
        correctAnswerIndex: 0,
        explanation: 'Floor surfaces are often covered in invisible glass shards and debris; sturdy shoes prevent puncture injuries.'
      },
      {
        question: 'How should you prepare for aftershocks following a major earthquake?',
        options: [
          'Assume the danger has completely passed and return to sleep',
          'Stay in damaged buildings to guard valuables',
          'Treat each aftershock with the same Drop, Cover, Hold protocol and avoid weakened structures',
          'Turn on gas burners to test utility pressure'
        ],
        correctAnswerIndex: 2,
        explanation: 'Aftershocks can occur hours, days, or weeks later and can collapse already compromised structures.'
      }
    ]
  },

  // =========================================================================
  // 2. FLOOD SAFETY
  // =========================================================================
  {
    id: 'flood-safety',
    title: 'Flood Safety & Swiftwater Survival',
    category: 'natural',
    duration: '22 min',
    difficulty: 'Essential',
    points: 150,
    badge: {
      id: 'badge-flood-defender',
      title: 'Flood Defender',
      icon: 'Droplets',
      description: 'Mastered swiftwater hazards, the 6-inch rule, and electrical flood safety.'
    },
    description: 'Understand flood dynamics, flash flood warnings, safe high-ground evacuation, and the lethal dangers of walking or driving through moving water.',
    learningObjectives: [
      'Apply the "Turn Around, Don’t Drown" principle in vehicles and on foot.',
      'Recognize flash flood indicators and rapid water level escalation.',
      'De-energize electrical mains safely before water enters structures.',
      'Avoid biological and chemical contaminants in standing floodwater.'
    ],
    lessons: [
      {
        id: 'fl-l1',
        title: 'The Physics of Moving Water: The 6-Inch Rule',
        duration: '5 min',
        content: `Water is deceptively powerful. Just **6 inches (15 cm)** of rapidly moving floodwater can sweep a grown adult off their feet.
        
**12 inches (30 cm)** of moving water exerts enough lateral force to float a typical passenger sedan or small SUV. **24 inches (60 cm)** can sweep away heavy vehicles and trucks. In addition, floodwater conceals missing manhole covers, deep sinkholes, downed live wires, and sharp metal debris.`,
        practicalSteps: [
          'NEVER walk or wade through moving floodwaters of any depth.',
          'Use a sturdy walking stick to check ground depth and firm footing if wading is unavoidable.',
          'Keep children and vulnerable individuals away from storm drains, culverts, and creek banks.',
          'Never drive around road closure barricades; the road beneath may have collapsed.'
        ],
        diagram: {
          type: 'water_depth_physics',
          title: 'The Lethal Water Depth Scale',
          caption: '6" knocks adult down | 12" floats passenger cars | 24" sweeps trucks & SUVs away.'
        },
        checkpoint: {
          question: 'How deep does rapidly moving water need to be to sweep an adult off their feet?',
          options: [
            'At least 3 feet (90 cm)',
            '6 inches (15 cm)',
            'Up to waist height',
            'Water cannot knock an adult down'
          ],
          correctAnswerIndex: 1,
          explanation: 'Only 6 inches of swift-moving water generates enough hydraulic force to overcome human balance.'
        }
      },
      {
        id: 'fl-l2',
        title: 'Turn Around, Don\'t Drown: Vehicle Safety',
        duration: '5 min',
        content: `Over half of all flood-related drownings occur in vehicles. Drivers routinely underestimate water depth and stream velocity.
        
When a car enters water, the tires act as buoyancy floats, lifting the vehicle off the roadbed and causing loss of steering and traction. Water can also stall the engine and trap passengers inside due to exterior water pressure on doors.`,
        practicalSteps: [
          'If you encounter a flooded road or washed-out bridge, TURN AROUND immediately.',
          'If water begins rising rapidly around your stalled vehicle, unbuckle, open windows, and abandon it for higher ground immediately.',
          'If the vehicle plunges into deep water, roll down or break a side window before electrical systems fail.',
          'Climb onto the roof of your vehicle if swept into deep water so rescuers can see you.'
        ],
        diagram: {
          type: 'vehicle_buoyancy',
          title: 'Vehicle Flood Dynamics',
          caption: 'Tire displacement creates buoyancy, lifting the car off the pavement into the current.'
        },
        checkpoint: {
          question: 'If water rises rapidly around your car on a flooded street, what should you do?',
          options: [
            'Stay inside with doors locked and rev the engine',
            'Immediately abandon the vehicle and move to higher ground',
            'Wait until the water reaches the steering wheel before opening the door',
            'Call a tow truck and wait inside'
          ],
          correctAnswerIndex: 1,
          explanation: 'Vehicles can become floating deathtraps within minutes; moving to higher ground immediately is essential.'
        }
      },
      {
        id: 'fl-l3',
        title: 'Structural Protection & Electrical Hazards',
        duration: '6 min',
        content: `Water and electricity create immediate electrocution hazards. If floodwater is predicted to enter your home:
        
Shut off the main electrical breaker ONLY if the electrical panel is completely dry and you are standing on dry ground. If the panel is already submerged or wet, leave it alone and contact the utility company.`,
        practicalSteps: [
          'Move valuable electronics, vital documents, and essential supplies to the upper floors.',
          'Disconnect ground-floor electrical appliances before water enters.',
          'Never touch submerged electrical outlets, cables, or devices.',
          'If trapped inside a flooded building, move to the highest level, but NEVER climb into a closed attic without an exterior roof exit.'
        ],
        diagram: {
          type: 'electrical_flood',
          title: 'Flood Electrical Safety Protocol',
          caption: 'Disconnect mains only if dry. Never trap yourself in a closed attic without roof egress.'
        },
        checkpoint: {
          question: 'Why should you avoid retreating into a closed attic during extreme flooding?',
          options: [
            'Attics have poor cellular reception',
            'Rising water can trap you against the ceiling with no escape route unless you have roof access tools',
            'Attics attract lightning during storms',
            'Attic air contains toxic flood gases'
          ],
          correctAnswerIndex: 1,
          explanation: 'Trapped flood victims have drowned in sealed attics. Only access roofs if you have a roof hatch or tools to cut through.'
        }
      },
      {
        id: 'fl-l4',
        title: 'Post-Flood Contamination & Safe Return',
        duration: '6 min',
        content: `Floodwater is raw, contaminated sewage mixed with industrial chemicals, agricultural runoff, oil, and dead animals.
        
Never drink tap water after a flood until authorities issue a safe water notice. Discard all food that has touched floodwater, including canned items if seams are compromised.`,
        practicalSteps: [
          'Boil tap water vigorously for at least 1 full minute before consumption or teeth brushing.',
          'Wear rubber boots and heavy duty waterproof gloves during clean-up operations.',
          'Disinfect all walls and floors with a bleach-water solution to prevent toxic mold colonization.',
          'Watch for snakes and venomous creatures seeking shelter on dry ledges.'
        ],
        diagram: {
          type: 'water_purification',
          title: 'Flood Hygiene & Sanitization',
          caption: 'Boil drinking water for 1 min. Disinfect surfaces. Wear protective gloves and boots.'
        },
        checkpoint: {
          question: 'How long must flood-affected municipal tap water be vigorously boiled before it is safe for drinking?',
          options: [
            '10 seconds',
            'At least 1 full minute (3 minutes at high altitudes)',
            '30 seconds is enough',
            'Boiling does not kill flood pathogens'
          ],
          correctAnswerIndex: 1,
          explanation: 'Vigorous boiling for at least 1 full minute eliminates biological bacteria, viruses, and parasites.'
        }
      }
    ],
    quiz: [
      {
        question: 'What is the minimum depth of fast-moving water capable of sweeping a standard car off the road?',
        options: [
          '6 inches (15 cm)',
          '12 inches (30 cm)',
          '36 inches (90 cm)',
          '48 inches (120 cm)'
        ],
        correctAnswerIndex: 1,
        explanation: '12 inches of flowing water can lift and carry away most passenger sedans.'
      },
      {
        question: 'What is the primary message of the "Turn Around, Don’t Drown" campaign?',
        options: [
          'Drive as fast as possible through standing water',
          'Never walk or drive into flooded roads; take an alternative route',
          'Always carry life vests in your glove box',
          'Only commercial trucks can cross flooded roads'
        ],
        correctAnswerIndex: 1,
        explanation: 'Barricades and standing water hide road washouts and current dangers; turning around saves lives.'
      },
      {
        question: 'When should you attempt to shut off your main home electrical breaker during a flood?',
        options: [
          'While standing in ankle-deep water',
          'Only if the panel and the floor beneath your feet are completely dry',
          'Never under any circumstances',
          'Only after the water reaches the breaker panel'
        ],
        correctAnswerIndex: 1,
        explanation: 'Touching an electrical panel while wet or standing in water poses an immediate risk of fatal electrocution.'
      },
      {
        question: 'What should be done with fresh food that came into direct contact with floodwater?',
        options: [
          'Rinse with cold water and consume immediately',
          'Freeze it to kill bacteria',
          'Discard it immediately due to sewage and chemical contamination',
          'Microwave for 20 seconds'
        ],
        correctAnswerIndex: 2,
        explanation: 'Floodwater contains bio-hazards and industrial runoff that penetrate food packaging.'
      }
    ]
  },

  // =========================================================================
  // 3. FIRE SAFETY
  // =========================================================================
  {
    id: 'fire-safety',
    title: 'Fire Safety & Smoke Survival',
    category: 'urban',
    duration: '20 min',
    difficulty: 'Essential',
    points: 150,
    badge: {
      id: 'badge-fire-marshall',
      title: 'Fire Safety Marshall',
      icon: 'Flame',
      description: 'Mastered the PASS extinguisher technique, smoke crawling, and two-route exit plans.'
    },
    description: 'Learn rapid response to residential and commercial fires, the PASS fire extinguisher technique, crawl-low smoke escape, and burning clothing protocols.',
    learningObjectives: [
      'Operate a fire extinguisher using the standard PASS protocol.',
      'Navigate smoke-filled environments safely by crawling beneath thermal layers.',
      'Execute the Stop, Drop, and Roll protocol for clothing fires.',
      'Formulate and test a 2-way home fire evacuation escape plan.'
    ],
    lessons: [
      {
        id: 'fr-l1',
        title: 'Smoke Inhalation: The Silent Killer',
        duration: '5 min',
        content: `In a fire, toxic gases and superheated smoke kill far more people than actual flames. Smoke contains carbon monoxide, hydrogen cyanide, and burning plastics.
        
Superheated smoke rises towards the ceiling, creating an expanding toxic layer that descends. The coolest, cleanest breathable air is located **12 to 24 inches (30 to 60 cm)** off the floor.`,
        practicalSteps: [
          'If smoke is present, immediately DROP to your hands and knees and crawl towards the nearest exit.',
          'Keep your head 12 to 24 inches above the floor in the breathable safety cushion.',
          'Cover your mouth and nose with a damp cloth if available to filter coarse particulates.',
          'Feel closed interior doors with the back of your hand before turning the knob; if warm, DO NOT OPEN.'
        ],
        diagram: {
          type: 'smoke_layer_crawl',
          title: 'The Thermal Layer & Crawl Zone',
          caption: 'Hot toxic smoke collects at the ceiling. The cleanest air is 12-24 inches above the floor.'
        },
        checkpoint: {
          question: 'Where is the cleanest, most breathable air located in a smoke-filled room?',
          options: [
            'Directly near the ceiling',
            'In the center of the room at standing eye level',
            '12 to 24 inches (30 to 60 cm) above the floor',
            'Near the heat source'
          ],
          correctAnswerIndex: 2,
          explanation: 'Heat and toxic fumes rise rapidly; the breathable thermal cushion is closest to the floor.'
        }
      },
      {
        id: 'fr-l2',
        title: 'Using an Extinguisher: The P.A.S.S. Technique',
        duration: '5 min',
        content: `Portable fire extinguishers are designed ONLY for small, contained incipient-stage fires (e.g. a small trash bin). Never fight a fire that is spreading rapidly or blocking your exit path.
        
Remember the four-step acronym **P.A.S.S.**:
• **P** — Pull the safety pin breaking the plastic tamper seal.
• **A** — Aim low, pointing the nozzle at the base of the fire.
• **S** — Squeeze the trigger lever steadily.
• **S** — Sweep the nozzle from side to side across the base until extinguished.`,
        practicalSteps: [
          'Always keep an unblocked exit path behind your back before discharging the extinguisher.',
          'PULL the safety pin and inspect the pressure gauge (needle in green zone).',
          'AIM the nozzle at the BASE of the fuel source, not at the upper flames.',
          'SQUEEZE the handle and SWEEP side-to-side across the base of the flames.'
        ],
        diagram: {
          type: 'pass_technique',
          title: 'The P.A.S.S. Fire Extinguisher Protocol',
          caption: 'P: Pull pin  |  A: Aim at base  |  S: Squeeze handle  |  S: Sweep side to side.'
        },
        checkpoint: {
          question: 'Where should you aim a fire extinguisher nozzle when tackling an incipient fire?',
          options: [
            'At the topmost tips of the flames',
            'At the base of the fire where the fuel is burning',
            'Into the surrounding air above the fire',
            'At the smoke cloud'
          ],
          correctAnswerIndex: 1,
          explanation: 'Aiming at the base smothers the fuel source. Aiming at upper flames wastes extinguishing agent.'
        }
      },
      {
        id: 'fr-l3',
        title: 'Stop, Drop, and Roll: Clothing on Fire',
        duration: '5 min',
        content: `If your clothing catches fire, PANIC AND RUNNING IS FATAL. Running fanned air supplies oxygen to the flames, causing them to spread upward toward your face, eyes, and lungs.
        
Instantly execute: **STOP, DROP, and ROLL**. Cover your face with your hands to protect eyes and airway.`,
        practicalSteps: [
          'STOP immediately where you are—do not run.',
          'DROP down to the ground or floor.',
          'Cover your face and mouth with both hands to prevent inhalation of flames.',
          'ROLL over and over repeatedly back and forth until the flames are smothered.',
          'If someone else is on fire, knock them down gently and wrap them tightly in a wool blanket or heavy coat.'
        ],
        diagram: {
          type: 'stop_drop_roll',
          title: 'Clothing Fire Smothering Technique',
          caption: 'STOP running  |  DROP to ground  |  ROLL continuously to extinguish flames.'
        },
        checkpoint: {
          question: 'Why is running extremely dangerous if your clothing catches fire?',
          options: [
            'It makes it harder for firefighters to hear you',
            'The airflow fans the flames with oxygen, accelerating fire spread toward your face and lungs',
            'It will trigger building sprinkler systems prematurely',
            'It ruins your shoes'
          ],
          correctAnswerIndex: 1,
          explanation: 'Running feeds fresh oxygen to the flames, causing them to flare up directly into the victim’s airway.'
        }
      },
      {
        id: 'fr-l4',
        title: 'Evacuation Plans & Closed-Door Testing',
        duration: '5 min',
        content: `Once outside a burning building, NEVER RE-ENTER UNDER ANY CIRCUMSTANCES for pets or possessions.
        
Every residence must establish two escape routes from each room and designate a clear outdoor family meeting location (e.g. a specific tree or mailbox across the street).`,
        practicalSteps: [
          'Feel doors with the back of your hand; if hot, do not open—use your second escape path (window).',
          'If escaping through a window from upper floors, use an emergency escape ladder.',
          'Close interior doors behind you as you exit to starve the fire of oxygen and slow fire spread.',
          'Meet at your designated outdoor rendezvous point and dial 112 or 101 immediately.'
        ],
        diagram: {
          type: 'escape_plan',
          title: 'Two-Route Home Evacuation Plan',
          caption: 'Primary route: Hallway & front door. Secondary route: Window escape ladder.'
        },
        checkpoint: {
          question: 'Once you have safely evacuated a burning structure, when may you re-enter to retrieve pets or valuables?',
          options: [
            'If the flames appear small',
            'If you cover your mouth with a wet towel',
            'NEVER—only professional firefighters equipped with SCBA respirators may enter',
            'Within the first 2 minutes of exiting'
          ],
          correctAnswerIndex: 2,
          explanation: 'Never re-enter a burning structure. Flashover and toxic smoke can incapacitate an unprotected person in seconds.'
        }
      }
    ],
    quiz: [
      {
        question: 'What does the acronym P.A.S.S. stand for regarding fire extinguishers?',
        options: [
          'Push, Alert, Spray, Stop',
          'Pull, Aim, Squeeze, Sweep',
          'Protect, Assess, Secure, Shelter',
          'Position, Activate, Step back, Squeeze'
        ],
        correctAnswerIndex: 1,
        explanation: 'P.A.S.S.: Pull pin, Aim at base, Squeeze handle, Sweep side-to-side.'
      },
      {
        question: 'How should you test a closed door before opening it during a suspected fire?',
        options: [
          'Kick it open quickly',
          'Touch the handle and door surface with the back of your hand',
          'Peek through the keyhole',
          'Open it slightly with your face pressed forward'
        ],
        correctAnswerIndex: 1,
        explanation: 'The back of your hand is sensitive to heat; if hot, fire is directly on the other side.'
      },
      {
        question: 'What is the primary danger when trapped in a building fire?',
        options: [
          'Superheated toxic smoke and gas inhalation',
          'Structural concrete melting',
          'Sudden freezing',
          'Water pressure loss'
        ],
        correctAnswerIndex: 0,
        explanation: 'Smoke inhalation causes over 75% of fire fatalities before flames ever reach victims.'
      },
      {
        question: 'Why should you close doors behind you as you evacuate a burning home?',
        options: [
          'To lock out intruders',
          'To restrict oxygen flow, containing the fire and giving occupants more time to escape',
          'To keep water inside',
          'To prevent smoke alarms from ringing in other rooms'
        ],
        correctAnswerIndex: 1,
        explanation: 'Closed doors compartmentalize fires by cutting off oxygen supply lines.'
      }
    ]
  },

  // =========================================================================
  // 4. CYCLONE & HURRICANE PREPAREDNESS
  // =========================================================================
  {
    id: 'cyclone-safety',
    title: 'Cyclone & Hurricane Preparedness',
    category: 'natural',
    duration: '22 min',
    difficulty: 'Intermediate',
    points: 150,
    badge: {
      id: 'badge-cyclone-guardian',
      title: 'Cyclone Guardian',
      icon: 'Wind',
      description: 'Mastered eye-of-the-storm awareness, storm surge survival, and windproofing.'
    },
    description: 'Learn storm track monitoring, shuttering and structural wind mitigation, surviving the deceptive calm of the storm eye, and storm surge evacuation.',
    learningObjectives: [
      'Recognize the deceptive calm inside the eye of a tropical cyclone.',
      'Prepare residential properties against hurricane-force winds and projectiles.',
      'Identify coastal storm surge evacuation trigger points.',
      'Maintain reliable emergency radio communications during power grid loss.'
    ],
    lessons: [
      {
        id: 'cy-l1',
        title: 'Storm Anatomy & The Eye Deception',
        duration: '5 min',
        content: `A tropical cyclone consists of the outer rainbands, the destructive eyewall, and the central **eye**.
        
The eye is a calm circular zone (20 to 50 km wide) with clear skies and zero wind. **DO NOT GO OUTSIDE.** As the eye passes over, the eyewall will abruptly strike from the *opposite direction* with maximum catastrophic winds.`,
        practicalSteps: [
          'Monitor emergency weather alerts on a hand-crank or battery-powered radio.',
          'When winds abruptly cease, stay inside your reinforced shelter room; the reverse winds are imminent.',
          'Stay away from all exterior windows and glass doors, even if covered.',
          'Shelter in an interior room on the lowest floor, such as an interior bathroom or reinforced hallway.'
        ],
        diagram: {
          type: 'cyclone_anatomy',
          title: 'Cyclone Cross Section & The Eye',
          caption: 'Eyewall: Maximum winds. Eye: Deceptive calm. Opposite eyewall strikes abruptly.'
        },
        checkpoint: {
          question: 'If strong cyclone winds suddenly stop and the sky clears, what has likely occurred?',
          options: [
            'The storm has permanently dissolved',
            'You are inside the eye of the storm; extreme winds will return shortly from the opposite direction',
            'A cold front has deflected the hurricane away',
            'It is safe to inspect outdoor damage'
          ],
          correctAnswerIndex: 1,
          explanation: 'The eye of the storm brings temporary calm before the second half of the violent eyewall strikes.'
        }
      },
      {
        id: 'cy-l2',
        title: 'Securing Property & Shuttering',
        duration: '6 min',
        content: `Wind pressures can peel off roofs if wind breaches building openings. Taping an "X" on glass windows is a dangerous myth—it provides ZERO structural reinforcement and creates large, lethal glass shards.
        
Install certified storm shutters or 5/8-inch marine-grade plywood anchored directly into masonry or wall frames.`,
        practicalSteps: [
          'Clear yards of all loose items: patio furniture, trash bins, potted plants, and tools become lethal missiles in 150 km/h winds.',
          'Trim large tree branches hanging over rooflines or power cables.',
          'Reinforce or brace overhead garage doors; garage door failure is the leading cause of roof loss.',
          'Fill bathtubs and clean containers with fresh water for sanitization and hygiene backup.'
        ],
        diagram: {
          type: 'shutter_reinforce',
          title: 'Storm Shutter vs Taping Myth',
          caption: 'Window tape is ineffective. Anchor 5/8" plywood or hurricane-rated metal storm shutters.'
        },
        checkpoint: {
          question: 'Why is taping an "X" on glass windows with duct tape dangerous during a cyclone?',
          options: [
            'It attracts lightning',
            'It does not prevent breakage and causes the window to shatter into larger, lethal glass projectiles',
            'It obstructs emergency rescue signals',
            'It prevents thermal expansion'
          ],
          correctAnswerIndex: 1,
          explanation: 'Tape does not increase structural wind resistance; it merely holds large sharp shards together that fly inward.'
        }
      },
      {
        id: 'cy-l3',
        title: 'Storm Surge & Coastal Evacuation',
        duration: '6 min',
        content: `Storm surge—the rapid rise of sea level pushed inland by hurricane winds—is the deadliest element of tropical cyclones.
        
Surges can rise 5 to 9 meters above normal sea level in a matter of minutes, wiping out coastal roads. If local authorities issue an evacuation order for your zone, EVACUATE IMMEDIATELY.`,
        practicalSteps: [
          'Know your zone: Check if your residence is in a low-lying storm surge inundation sector.',
          'Follow mandatory evacuation orders without delay; do not wait until roads are submerged.',
          'Turn off main gas, water, and electrical supply breakers before leaving.',
          'Bring your 72-hour emergency Go-Bag, medications, and waterproof copies of identification.'
        ],
        diagram: {
          type: 'storm_surge',
          title: 'Storm Surge Inundation Dynamics',
          caption: 'Wind stress and low pressure push seawater miles inland, destroying road access.'
        },
        checkpoint: {
          question: 'What is the single deadliest hazard associated with coastal cyclones?',
          options: [
            'Thunder and lightning strikes',
            'Storm surge seawater inundation',
            'Hail stones',
            'Falling temperatures'
          ],
          correctAnswerIndex: 1,
          explanation: 'Storm surge accounts for nearly 90% of all cyclone-related deaths historically.'
        }
      },
      {
        id: 'cy-l4',
        title: 'Post-Storm Hazards: Downed Lines & Generators',
        duration: '5 min',
        content: `Many cyclone fatalities occur after the storm has passed. Downed power lines hidden in debris can electrify fences and puddles.
        
Additionally, running portable fuel generators indoors or inside garages causes lethal carbon monoxide poisoning within minutes. Generators must ALWAYS be run outdoors, at least 20 feet (6 meters) away from windows.`,
        practicalSteps: [
          'Assume all fallen electrical cables are LIVE and lethal; keep at least 35 feet (10 meters) distance.',
          'Never operate a fuel-powered generator inside a home, garage, or near air vents.',
          'Wear heavy-duty boots and gloves when handling yard debris and broken branches.',
          'Avoid drinking municipal water until utility clearance is declared.'
        ],
        diagram: {
          type: 'generator_safety',
          title: 'Generator Carbon Monoxide Safety',
          caption: 'Place generators outdoors at least 20 feet away from doors, windows, and ventilation louvers.'
        },
        checkpoint: {
          question: 'Where is the only safe location to operate a gasoline emergency generator?',
          options: [
            'Inside an attached garage with the door cracked open',
            'In a basement with a window fan',
            'Outdoors at least 20 feet away from any windows, doors, or vents',
            'In an interior hallway'
          ],
          correctAnswerIndex: 2,
          explanation: 'Gasoline generators produce odorless, lethal carbon monoxide that easily infiltrates homes from garages.'
        }
      }
    ],
    quiz: [
      {
        question: 'What should you do if the wind suddenly dies down and the sky clears during a tropical cyclone?',
        options: [
          'Go outside and begin repairing your roof',
          'Drive to the grocery store for fresh supplies',
          'Stay in your safe room; you are in the eye and severe winds will resume shortly',
          'Assume the storm has ended completely'
        ],
        correctAnswerIndex: 2,
        explanation: 'The eye of the storm provides temporary calm before the opposite eyewall hits with maximum fury.'
      },
      {
        question: 'What is the recommended minimum distance for operating a backup generator away from a house?',
        options: [
          '3 feet (1 meter)',
          '5 feet (1.5 meters)',
          '20 feet (6 meters)',
          'Generators can be safely run indoors'
        ],
        correctAnswerIndex: 2,
        explanation: 'Generators must be at least 20 feet away from all openings to avoid carbon monoxide asphyxiation.'
      },
      {
        question: 'Which action provides effective protection for windows against hurricane projectiles?',
        options: [
          'Criss-crossing duct tape on the glass',
          'Anchoring certified storm shutters or heavy 5/8" plywood panels',
          'Opening windows 2 inches to balance pressure',
          'Painting the glass with latex sealant'
        ],
        correctAnswerIndex: 1,
        explanation: 'Only physical barrier protection like engineered shutters or anchored plywood resists projectile impacts.'
      },
      {
        question: 'When an official mandatory evacuation is issued for coastal storm surge, you should:',
        options: [
          'Ride out the storm in an upper attic',
          'Evacuate immediately via designated routes to higher ground',
          'Wait until water reaches the doorstep before leaving',
          'Park your car under a nearby highway bridge'
        ],
        correctAnswerIndex: 1,
        explanation: 'Storm surge arrives rapidly and cuts off escape routes; early evacuation is mandatory.'
      }
    ]
  },

  // =========================================================================
  // 5. LANDSLIDE & DEBRIS FLOW SAFETY
  // =========================================================================
  {
    id: 'landslide-safety',
    title: 'Landslide & Debris Flow Safety',
    category: 'natural',
    duration: '20 min',
    difficulty: 'Intermediate',
    points: 150,
    badge: {
      id: 'badge-terrain-scout',
      title: 'Terrain Scout',
      icon: 'Mountain',
      description: 'Mastered geological warning signs, mudflow escape routes, and drainage hazards.'
    },
    description: 'Recognize early geological indicators of slope instability, mudflow sounds, rapid drainage anomalies, and high-velocity debris escape paths.',
    learningObjectives: [
      'Identify visual and acoustic warning signs of an impending slope failure.',
      'Understand the trigger relationship between intense rainfall and mudflows.',
      'Execute perpendicular lateral escape routes when caught in mudflow channels.',
      'Implement hillside property drainage and soil stabilization precautions.'
    ],
    lessons: [
      {
        id: 'ls-l1',
        title: 'Geological Indicators & Warning Signs',
        duration: '5 min',
        content: `Landslides and debris flows occur when gravity overcomes the shear strength of saturated soil, rock, and vegetation on sloping terrain.
        
Prior to a catastrophic slide, nature almost always provides early indicators: doors or windows sticking in frames, new cracks appearing in plaster or foundation concrete, leaning utility poles, and tilted trees (known as "pistol-butt trees").`,
        practicalSteps: [
          'Inspect hillside retaining walls and slopes after prolonged torrential rains for bulges.',
          'Notice if doors or window frames suddenly jam or stop latching properly.',
          'Look for expanding ground fissures on slopes, driveways, and sidewalks.',
          'Listen for unusual rumbling sounds, trees cracking, or boulders colliding uphill.'
        ],
        diagram: {
          type: 'slope_instability',
          title: 'Slope Instability Indicators',
          caption: 'Tilted utility poles, foundation cracks, bulging retaining walls, and jamming doors.'
        },
        checkpoint: {
          question: 'Which of the following is a classic indicator of subtle ground movement before a landslide?',
          options: [
            'Doors and windows suddenly sticking or failing to latch properly',
            'Strong sudden drop in atmospheric humidity',
            'Sudden radio static on all frequencies',
            'Increased solar brightness'
          ],
          correctAnswerIndex: 0,
          explanation: 'Subtle ground shift twists building frames, causing doors and window casings to bind.'
        }
      },
      {
        id: 'ls-l2',
        title: 'Stream Behavior: The Mudflow Warning',
        duration: '5 min',
        content: `A sudden, dramatic change in water flow in mountain creeks and gullies is an urgent warning of an active debris flow upstream.
        
If a clear mountain stream suddenly turns murky brown, drops to a trickle, or suddenly surges with floating logs and mud, a temporary debris dam has formed or failed upstream.`,
        practicalSteps: [
          'If a stream suddenly drops dramatically during heavy rain, a dam has formed upstream—evacuate immediately.',
          'Listen for a deep, freight-train-like roar: debris flows carry boulders that grind together.',
          'Never camp or rest in dry creek beds, ravines, or natural drainage gullies during rainstorms.',
          'Stay alert during nighttime heavy rain; most landslide victims are caught asleep.'
        ],
        diagram: {
          type: 'stream_damming',
          title: 'Upstream Debris Damming Cycle',
          caption: 'Stream trickles as debris dams flow -> Dam collapses -> Catastrophic mudflow surge.'
        },
        checkpoint: {
          question: 'If a hillside stream suddenly drops to a trickle during torrential rainfall, what does this indicate?',
          options: [
            'The rain has stopped upstream',
            'A debris dam has formed upstream, which can collapse violently and trigger a mudflow',
            'The soil has fully absorbed all surface water',
            'It is now safe to build along the creek bed'
          ],
          correctAnswerIndex: 1,
          explanation: 'Temporary debris dams block water until the accumulated pressure causes a catastrophic sudden mudflow.'
        }
      },
      {
        id: 'ls-l3',
        title: 'Immediate Escape: Running Perpendicular',
        duration: '5 min',
        content: `Debris flows can travel at speeds exceeding 50 to 80 km/h, carrying cars, boulders, and trees. You cannot outrun a debris flow downhill along its path.
        
Your only survival strategy is to **RUN PERPENDICULAR** (at a 90-degree angle) away from the path of the flow, heading toward higher, stable lateral ridges.`,
        practicalSteps: [
          'Never run straight downhill in the direction the slide is traveling.',
          'Move quickly sideways (perpendicular) up onto higher lateral ground.',
          'If escape is impossible and you are indoors, curl into a tight ball and protect your head under heavy furniture.',
          'Be alert when driving: Watch for collapsed pavement, mud on the road, and falling rocks.'
        ],
        diagram: {
          type: 'perpendicular_escape',
          title: 'Perpendicular Escape Path',
          caption: 'Never run downhill ahead of the slide. Move 90° sideways to high lateral ground.'
        },
        checkpoint: {
          question: 'What is the correct evacuation direction if you see a debris flow approaching downhill?',
          options: [
            'Run straight downhill along the natural channel',
            'Run sideways, perpendicular to the flow path, up onto high, stable lateral ground',
            'Climb onto the roof of the nearest single-story garage',
            'Lie flat in the lowest gully'
          ],
          correctAnswerIndex: 1,
          explanation: 'Debris flows follow low ravines; moving laterally sideways up higher ground gets you out of the velocity path.'
        }
      },
      {
        id: 'ls-l4',
        title: 'Post-Slide Precautions: Secondary Failures',
        duration: '5 min',
        content: `The immediate area of a landslide remains geologically unstable long after the initial event. Secondary slides frequently occur, especially as rainwater continues to seep into exposed slip planes.
        
Stay away from the slide area until geotechnical engineers have declared it safe. Inspect utility lines immediately from a safe perimeter.`,
        practicalSteps: [
          'Do not enter the slide zone; shifting debris and unstable scarps can collapse without warning.',
          'Report severed gas, water, and power lines to utility providers immediately.',
          'Check surrounding structures for tilted foundations or severed support pilings.',
          'Replant damaged slopes with deep-rooted native vegetation to stabilize topsoil.'
        ],
        diagram: {
          type: 'secondary_scarp',
          title: 'Post-Slide Scarp Instability',
          caption: 'The head scarp and lateral flanks remain highly vulnerable to immediate secondary collapses.'
        },
        checkpoint: {
          question: 'Why should you avoid re-entering a landslide area immediately after the movement stops?',
          options: [
            'It interferes with satellite imaging',
            'The exposed slope and head scarp are prone to immediate secondary collapses',
            'The mud cools too rapidly',
            'Air pressure drops sharply in the slide scar'
          ],
          correctAnswerIndex: 1,
          explanation: 'Initial slides shear soil resistance, leaving neighboring slope sections dangerously primed for secondary failures.'
        }
      }
    ],
    quiz: [
      {
        question: 'What should you do if an approaching debris flow makes escape impossible while inside a building?',
        options: [
          'Run into the basement',
          'Curl into a tight ball, cover your head, and seek shelter under a sturdy table or on the upper floor',
          'Open all exterior doors',
          'Jump out of a window into the mud'
        ],
        correctAnswerIndex: 1,
        explanation: 'Protecting your vital organs and staying on upper floors reduces crush impact from penetrating mud.'
      },
      {
        question: 'Which sound is typically described by survivors immediately before a debris flow strikes?',
        options: [
          'A high-pitched whistle',
          'A deep, roaring sound like a freight train accompanied by cracking trees and grinding boulders',
          'A rhythmic clicking',
          'Complete silence'
        ],
        correctAnswerIndex: 1,
        explanation: 'Debris flows churn boulders, soil, and splintering timber, generating a low-frequency ground roar.'
      },
      {
        question: 'What is the most effective direction to escape when caught in the path of a moving hillside slide?',
        options: [
          'Sprint straight downhill ahead of the slide',
          'Run sideways (perpendicular) to the path toward higher, stable lateral terrain',
          'Take shelter under an overhanging cliff',
          'Lie down in a drainage ditch'
        ],
        correctAnswerIndex: 1,
        explanation: 'Perpendicular movement gets you out of the channelized path of the high-speed debris.'
      },
      {
        question: 'Which weather condition presents the highest risk for triggering deadly debris flows?',
        options: [
          'Light morning fog',
          'Prolonged heavy rainfall or intense cloudbursts on steep terrain',
          'High summer winds with zero rain',
          'A mild temperature inversion'
        ],
        correctAnswerIndex: 1,
        explanation: 'Extreme rainfall saturates soil pore pressure, causing catastrophic structural shear failure.'
      }
    ]
  },

  // =========================================================================
  // 6. HEATWAVE PROTECTION
  // =========================================================================
  {
    id: 'heatwave-protection',
    title: 'Extreme Heatwave Protection & Wet-Bulb Safety',
    category: 'natural',
    duration: '18 min',
    difficulty: 'Essential',
    points: 150,
    badge: {
      id: 'badge-thermal-shield',
      title: 'Thermal Shield',
      icon: 'Sun',
      description: 'Mastered heat exhaustion vs stroke diagnosis, hydration electrolytes, and wet-bulb awareness.'
    },
    description: 'Learn physiological thermal limits, recognizing heat exhaustion vs life-threatening heat stroke, critical electrolyte replenishment, and cooling shelter protocols.',
    learningObjectives: [
      'Differentiate between heat exhaustion and fatal medical heat stroke.',
      'Understand the dangerous threshold of 35°C wet-bulb temperature.',
      'Administer rapid evaporative and conductive cooling emergency first aid.',
      'Manage residential indoor temperatures during urban heat island spikes.'
    ],
    lessons: [
      {
        id: 'hw-l1',
        title: 'Heat Exhaustion vs. Life-Threatening Heat Stroke',
        duration: '5 min',
        content: `Extreme heat kills silently through core hyperthermia. You must recognize the critical difference between heat exhaustion and heat stroke:
        
**Heat Exhaustion:** Heavy sweating, paleness, muscle cramps, dizziness, nausea, and cool/clammy skin.
**Heat Stroke (MEDICAL EMERGENCY):** Core temperature over 40°C (104°F), **hot dry or heavily sweating skin**, confusion, slurred speech, loss of consciousness, and seizures. Call 112 immediately.`,
        practicalSteps: [
          'If a person exhibits confusion, altered mental state, or fainting in the heat, treat as HEAT STROKE.',
          'Call 112 immediately for emergency medical transport.',
          'Move the victim into shaded air conditioning immediately.',
          'Immerse in a cold-water bath or apply ice packs to neck, armpits, and groin while awaiting medics.'
        ],
        diagram: {
          type: 'heat_exhaustion_stroke',
          title: 'Heat Exhaustion vs Heat Stroke Symptoms',
          caption: 'Exhaustion: Sweating, dizziness, clammy skin. Stroke: Confusion, hot red skin, loss of consciousness.'
        },
        checkpoint: {
          question: 'What symptom differentiates life-threatening heat stroke from milder heat exhaustion?',
          options: [
            'Mild muscle fatigue',
            'Altered mental state, confusion, seizures, or loss of consciousness',
            'Slight thirst',
            'Normal speech'
          ],
          correctAnswerIndex: 1,
          explanation: 'Neurological breakdown (confusion, delirium, seizures) signifies core brain hyperthermia in heat stroke.'
        }
      },
      {
        id: 'hw-l2',
        title: 'The Wet-Bulb Temperature Threshold',
        duration: '4 min',
        content: `The human body cools itself primarily through the evaporation of sweat. When relative humidity reaches 100%, sweat cannot evaporate into the saturated air.
        
The **Wet-Bulb Temperature (WBT)** measures heat plus humidity. At **35°C (95°F) WBT**, even a healthy young person resting in the shade with unlimited water will overheat and perish within 6 hours because metabolic heat cannot dissipate.`,
        practicalSteps: [
          'Monitor the Heat Index and Wet-Bulb temperature, not just raw dry temperature.',
          'When humidity is high, electric fans blowing hot air above 37°C actually *accelerate* heat gain.',
          'Use damp towels and misting with cool water to facilitate artificial evaporative cooling.',
          'Seek designated public cooling centers or air-conditioned shelters during extreme heat alerts.'
        ],
        diagram: {
          type: 'wet_bulb_gauge',
          title: 'The 35°C Wet-Bulb Evaporative Limit',
          caption: 'High humidity stops sweat evaporation. Air fans above 37°C accelerate body heating without moisture.'
        },
        checkpoint: {
          question: 'Why does an electric fan fail to cool the human body when ambient temperature exceeds 37°C (99°F) in dry air?',
          options: [
            'Fans deplete oxygen in the room',
            'The fan blows air hotter than skin temperature, acting like a convection oven',
            'Fans reverse the direction of blood flow',
            'It short-circuits skin sweat glands'
          ],
          correctAnswerIndex: 1,
          explanation: 'When air is hotter than human skin (approx 35-37°C), moving hot air increases convective heat gain.'
        }
      },
      {
        id: 'hw-l3',
        title: 'Hydration Science & Electrolyte Balance',
        duration: '5 min',
        content: `Drinking pure distilled water alone during heavy sweating can dilute blood sodium, triggering a dangerous condition called **hyponatremia** (water intoxication).
        
Hydration during heatwaves requires replenishing electrolytes—sodium, potassium, and magnesium. Drink small amounts of fluids frequently throughout the day rather than chugging large volumes occasionally.`,
        practicalSteps: [
          'Drink water before feeling thirsty; thirst indicates you are already 2% dehydrated.',
          'Include Oral Rehydration Salts (ORS), coconut water, or diluted citrus juices with a pinch of salt.',
          'Avoid alcohol, caffeinated energy drinks, and heavily sugared sodas that promote fluid excretion.',
          'Check urine color: Pale straw indicates proper hydration; dark amber warns of dehydration.'
        ],
        diagram: {
          type: 'hydration_chart',
          title: 'Urine Hydration Color Scale',
          caption: 'Clear/Pale Straw: Well hydrated. Dark Yellow/Amber: Dehydration warning. Brown: Medical danger.'
        },
        checkpoint: {
          question: 'Why is drinking Oral Rehydration Salts (ORS) or electrolyte solutions superior to plain water during profuse sweating?',
          options: [
            'It gives you instant adrenaline',
            'It replaces vital sodium and minerals lost in sweat, preventing hyponatremia and cramps',
            'It eliminates the need to drink water for 24 hours',
            'It lowers air temperature around you'
          ],
          correctAnswerIndex: 1,
          explanation: 'Profuse sweating depletes blood sodium; ORS restores osmotic cellular balance and prevents collapse.'
        }
      },
      {
        id: 'hw-l4',
        title: 'Indoor Cooling Without Air Conditioning',
        duration: '4 min',
        content: `During power blackouts or in homes without AC, adopt passive thermal management:
        
Keep windows and curtains tightly closed during the hottest daylight hours (10 AM to 6 PM) to trap cool overnight air inside. Open windows across opposite sides of the building only after sunset to create cross-ventilation.`,
        practicalSteps: [
          'Cover exterior sun-facing windows with reflective aluminum foil, bamboo blinds, or light curtains.',
          'Hang a damp sheet in front of open evening windows to create an evaporative breeze.',
          'Sleep on the lowest floor of the home (heat rises).',
          'Check on elderly neighbors twice daily; seniors are disproportionately vulnerable due to reduced sweat response.'
        ],
        diagram: {
          type: 'passive_cooling',
          title: 'Day vs Night Indoor Thermal Cycle',
          caption: 'Day: Close blinds, block solar radiation. Night: Open opposite windows for cross-draft.'
        },
        checkpoint: {
          question: 'What is the most effective passive cooling technique for windows during peak afternoon sun?',
          options: [
            'Keep windows wide open to let heat circulate',
            'Close windows and blinds, reflecting sunlight before it enters the glass',
            'Turn on high-wattage incandescent lamps',
            'Spray warm water on the window panes'
          ],
          correctAnswerIndex: 1,
          explanation: 'Blocking and reflecting solar radiation outside or directly behind glass prevents radiant heat accumulation.'
        }
      }
    ],
    quiz: [
      {
        question: 'What is the immediate first-aid priority for someone suspected of suffering from heat stroke?',
        options: [
          'Give them a heavy hot meal',
          'Call emergency services (112) and rapidly cool their body with cold water, ice packs, and fanning',
          'Tell them to walk it off in the sun',
          'Give them hot tea'
        ],
        correctAnswerIndex: 1,
        explanation: 'Rapid physical cooling and professional emergency medical care are essential to prevent permanent brain damage.'
      },
      {
        question: 'Which population group is at the highest physiological risk of heat-related mortality?',
        options: [
          'Athletic teenagers',
          'Elderly adults (65+) and infants under 4 years old',
          'Middle-aged office workers',
          'Young adults'
        ],
        correctAnswerIndex: 1,
        explanation: 'Elderly individuals have reduced thermoregulatory sweat efficiency; infants cannot regulate temperature effectively.'
      },
      {
        question: 'What does a urine color of dark amber or brown signify during a heatwave?',
        options: [
          'Over-hydration',
          'Severe dehydration requiring immediate fluid and electrolyte intake',
          'Excess vitamin intake only',
          'Normal athletic performance'
        ],
        correctAnswerIndex: 1,
        explanation: 'Dark concentrated urine indicates high kidney conservation of fluids due to systemic dehydration.'
      },
      {
        question: 'What makes a 35°C wet-bulb temperature lethal to humans even in the shade?',
        options: [
          'High carbon dioxide in the air',
          '100% relative humidity prevents sweat from evaporating, stopping internal cooling',
          'It causes instant frostbite',
          'It drains electrical energy from phones'
        ],
        correctAnswerIndex: 1,
        explanation: 'When humidity saturates air at body temperature, human evaporative sweating fails entirely.'
      }
    ]
  },

  // =========================================================================
  // 7. LIGHTNING SAFETY
  // =========================================================================
  {
    id: 'lightning-safety',
    title: 'Lightning Safety & Thunderstorm Survival',
    category: 'natural',
    duration: '18 min',
    difficulty: 'Essential',
    points: 150,
    badge: {
      id: 'badge-storm-sentinel',
      title: 'Storm Sentinel',
      icon: 'Zap',
      description: 'Mastered the 30/30 safety rule, the lightning crouch, and indoor utility isolation.'
    },
    description: 'Learn the 30/30 rule, the physics of ground current strikes, why trees are deadly conductors, and emergency crouch positioning when stranded outdoors.',
    learningObjectives: [
      'Apply the 30/30 rule to determine thunderstorm strike danger distance.',
      'Understand how ground current causes over 50% of lightning casualties.',
      'Execute the emergency lightning crouch when stranded without shelter.',
      'Identify safe structures vs dangerous pavilions and metal sheds.'
    ],
    lessons: [
      {
        id: 'ln-l1',
        title: 'The 30/30 Rule: When Thunder Roars, Go Indoors',
        duration: '4 min',
        content: `Lightning can strike up to **10 to 15 miles (16 to 24 km)** away from a thunderstorm, well outside the rain area (known as a "Bolt from the Blue").
        
Use the **30/30 Rule**:
• Count seconds between seeing lightning and hearing thunder. If it is **30 seconds or less**, the storm is within 10 km (6 miles). Seek substantial shelter immediately!
• Wait **30 full minutes** after the very last roll of thunder before resuming outdoor activities.`,
        practicalSteps: [
          'If you hear thunder at all, you are already within striking distance of lightning.',
          'Count seconds from flash to thunder; divide by 3 for distance in kilometers (divide by 5 for miles).',
          'Do not wait for rain to start before seeking shelter.',
          'Substantial shelter means a fully enclosed building with plumbing/wiring, or a hard-topped metal vehicle.'
        ],
        diagram: {
          type: 'thirty_thirty_rule',
          title: 'The 30/30 Lightning Principle',
          caption: 'Flash-to-bang < 30 sec: Seek indoor shelter immediately. Wait 30 min after last thunder.'
        },
        checkpoint: {
          question: 'If the time between seeing lightning and hearing thunder is 15 seconds, how far away is the strike?',
          options: [
            'Approximately 5 kilometers (3 miles) away',
            '50 kilometers away',
            'Right on top of you',
            'Over 100 miles away'
          ],
          correctAnswerIndex: 0,
          explanation: 'Sound travels roughly 1 km every 3 seconds (1 mile every 5 seconds). 15 seconds / 3 = 5 km away.'
        }
      },
      {
        id: 'ln-l2',
        title: 'Dangerous Outdoor Locations & Tree Hazards',
        duration: '5 min',
        content: `Never shelter beneath an isolated tall tree, open picnic gazebo, or tent. Lightning strikes the tallest object in an area.
        
When lightning hits a tree, moisture inside the trunk boils instantly, vaporizing the bark and causing the tree to explode into flying wooden shrapnel. Furthermore, electricity leaps horizontally from the trunk to nearby people (side flash).`,
        practicalSteps: [
          'NEVER stand under an isolated tall tree or metal flagpole.',
          'Avoid elevated ridges, hilltops, and wide open sports fields.',
          'Immediately exit swimming pools, lakes, and open boats; water conducts electrical current across large distances.',
          'Drop metal golf clubs, fishing rods, and umbrellas with metal tips.'
        ],
        diagram: {
          type: 'tree_strike_hazards',
          title: 'Side Flash & Ground Current From Tree Strikes',
          caption: 'Direct strike -> Exploding bark shrapnel -> Side flash jump -> Lethal ground current.'
        },
        checkpoint: {
          question: 'Why is standing beneath an isolated tree during a thunderstorm one of the most dangerous choices?',
          options: [
            'Leaves fall too quickly',
            'The tree attracts strikes as the tallest point, producing side flashes and explosive trunk shrapnel',
            'Trees generate toxic ozone gas during storms',
            'Bird nests will fall on you'
          ],
          correctAnswerIndex: 1,
          explanation: 'Tall trees attract lightning; side flash jumps directly into nearby people and ground current radiates outward.'
        }
      },
      {
        id: 'ln-l3',
        title: 'Stranded Outdoors: The Lightning Crouch',
        duration: '5 min',
        content: `If caught in an open field with ZERO available shelter or vehicle, NEVER lie flat on the ground!
        
Over 50% of lightning injuries are caused by **ground current** radiating outward through the soil. Lying flat increases the surface area of your body touching the ground and creates a voltage differential between your head and feet, driving current through your heart.`,
        practicalSteps: [
          'Crouch low on the balls of your feet with heels pressed tightly together.',
          'Lower your head and cover your ears with both hands to protect eardrums from sonic shockwaves.',
          'Make yourself as small a target as possible while minimizing your contact points with the earth.',
          'If your hair stands on end or skin tingles, lightning is imminent—drop into the crouch immediately.'
        ],
        diagram: {
          type: 'lightning_crouch',
          title: 'The Emergency Lightning Crouch',
          caption: 'Crouch on balls of feet, heels touching. Minimize ground contact. Never lie flat!'
        },
        checkpoint: {
          question: 'Why must you NEVER lie flat on the ground during a lightning storm if caught in the open?',
          options: [
            'Mud will ruin your clothes',
            'Lying flat dramatically increases exposure to deadly ground current traveling through the soil',
            'Lightning only strikes vertical surfaces',
            'Rain will pool in your ears'
          ],
          correctAnswerIndex: 1,
          explanation: 'Lying flat maximizes the contact distance with the soil, creating a deadly voltage drop across vital organs.'
        }
      },
      {
        id: 'ln-l4',
        title: 'Indoor Lightning Safety & Direct First Aid',
        duration: '4 min',
        content: `Indoor buildings are safe because electrical wiring and plumbing pipes conduct strikes safely into the earth.
        
However, this means you must avoid touching corded phones, plumbing faucets, sinks, bathtubs, and plugged-in electrical equipment during a storm. Also, **lightning victims carry NO electrical charge**—it is completely safe to touch them and administer immediate CPR!`,
        practicalSteps: [
          'Stay away from bathtubs, sinks, and running tap water during thunderstorms.',
          'Unplug sensitive electronics before the storm arrives.',
          'Stay away from exterior concrete walls and floors that contain metal rebar reinforcement.',
          'If someone is struck, check breathing immediately and start CPR—they do not hold an electric shock.'
        ],
        diagram: {
          type: 'indoor_plumbing_safety',
          title: 'Indoor Electrical Conduit Path',
          caption: 'Plumbing and wired connections ground current. Touch victims safely—they carry no charge!'
        },
        checkpoint: {
          question: 'Is it safe to immediately touch and perform CPR on a person who was just struck by lightning?',
          options: [
            'No, they retain high voltage and will shock you',
            'Yes, the human body carries zero residual charge; immediate CPR can save their life',
            'Only if you wear thick rubber gloves',
            'Wait at least 15 minutes for them to cool down'
          ],
          correctAnswerIndex: 1,
          explanation: 'Lightning passes through in milliseconds. Victims hold no residual electricity and need immediate CPR.'
        }
      }
    ],
    quiz: [
      {
        question: 'According to the 30/30 rule, when is it safe to resume outdoor activities after a thunderstorm?',
        options: [
          'As soon as the rain stops',
          '30 minutes after hearing the very last roll of thunder',
          '10 minutes after lightning ceases',
          'Immediately when blue sky is visible overhead'
        ],
        correctAnswerIndex: 1,
        explanation: 'Wait 30 minutes after the final thunderclap because trailing storm cells can generate unexpected strikes.'
      },
      {
        question: 'Which of the following outdoor enclosures provides true protection against lightning?',
        options: [
          'An open wooden gazebo in a park',
          'A canvas camping tent with aluminum poles',
          'A fully enclosed, hard-topped metal vehicle with windows rolled up',
          'Under a concrete bridge overpass'
        ],
        correctAnswerIndex: 2,
        explanation: 'A hard-topped vehicle acts as a Faraday cage, channeling current through the metal exterior shell into the ground.'
      },
      {
        question: 'What is the primary cause of death in fatal lightning strikes?',
        options: [
          'Severe full-body bone fractures',
          'Cardiopulmonary arrest (heart stops or enters ventricular fibrillation)',
          'Loss of vision',
          'Dehydration'
        ],
        correctAnswerIndex: 1,
        explanation: 'Massive electrical shock disrupts the heart’s electrical pacemaker, requiring immediate chest compressions.'
      },
      {
        question: 'What indoor activity should be avoided during a severe electrical thunderstorm?',
        options: [
          'Reading a book on an interior couch',
          'Taking a shower or washing dishes in a sink',
          'Sleeping in an interior bedroom',
          'Using a battery-operated flashlight'
        ],
        correctAnswerIndex: 1,
        explanation: 'Plumbing metal pipes and water conduct lightning strikes directly into bathrooms and kitchens.'
      }
    ]
  },

  // =========================================================================
  // 8. ROAD AND TRANSPORTATION EMERGENCIES
  // =========================================================================
  {
    id: 'road-emergencies',
    title: 'Road & Transportation Emergencies',
    category: 'urban',
    duration: '20 min',
    difficulty: 'Intermediate',
    points: 150,
    badge: {
      id: 'badge-road-commander',
      title: 'Roadway Commander',
      icon: 'Car',
      description: 'Mastered vehicle submersion escape, brake failure management, and highway breakdowns.'
    },
    description: 'Survive vehicle water submersion, brake failure, highway multi-car pileups, tire blowouts, and electrical vehicle battery emergency protocols.',
    learningObjectives: [
      'Execute the S-W-O-C sequence to escape a sinking vehicle in deep water.',
      'Manage total hydraulic brake failure using engine deceleration and parking brake.',
      'React safely to a high-speed tire blowout without rolling over.',
      'Set up a 100-meter warning perimeter during roadside breakdowns on highways.'
    ],
    lessons: [
      {
        id: 'rd-l1',
        title: 'Sinking Vehicle: The S-W-O-C Protocol',
        duration: '5 min',
        content: `When a car plunges into deep water, you have approximately **60 to 90 seconds** before water reaches the window line and electrical power fails.
        
Do NOT attempt to open doors—water pressure will pin doors shut until the cabin is completely flooded.
Follow the universal sequence: **S-W-O-C**:
• **S** — Seatbelts off.
• **W** — Windows down or broken immediately.
• **O** — Out (children pushed out first).
• **C** — Climb onto vehicle roof and swim to safety.`,
        practicalSteps: [
          'Do NOT call emergency services while in the water—escape takes under 60 seconds.',
          'Unbuckle yourself and children immediately.',
          'Roll down windows immediately before electrical shorting occurs.',
          'If windows will not roll down, strike the corner of a tempered side window with a emergency glass breaker.'
        ],
        diagram: {
          type: 'vehicle_submersion',
          title: 'The S-W-O-C Escape Protocol',
          caption: '1. Seatbelts OFF  2. Windows OPEN/BROKEN  3. Out (Children first)  4. Climb to safety.'
        },
        checkpoint: {
          question: 'Why should you avoid trying to open the doors of a car sinking in deep water?',
          options: [
            'It will void vehicle insurance',
            'Massive outside water pressure holds the doors shut until the vehicle is fully submerged',
            'Doors lock automatically underwater and cannot be unlocked',
            'Water will immediately freeze the door hinges'
          ],
          correctAnswerIndex: 1,
          explanation: 'Exterior hydraulic pressure prevents doors from opening until water pressure equalizes, when it is too late.'
        }
      },
      {
        id: 'rd-l2',
        title: 'Total Brake Failure at High Speed',
        duration: '5 min',
        content: `If your brake pedal suddenly drops to the floor with zero resistance:
        
Do NOT turn off the engine key (this locks the steering wheel and cuts power steering). Stay calm and use mechanical and engine braking to decelerate safely.`,
        practicalSteps: [
          'Pump the brake pedal rapidly: dual-circuit systems may build residual hydraulic pressure.',
          'Downshift progressively to lower gears (e.g. 5th -> 4th -> 3rd -> 2nd) to let engine compression slow the vehicle.',
          'Gently apply the emergency/parking brake while holding the release latch to avoid locking rear tires.',
          'If on an incline, steer into uphill runaway truck ramps, soft bushes, or scrape tires along a guardrail.'
        ],
        diagram: {
          type: 'brake_failure_steps',
          title: 'Deceleration Flow on Brake Failure',
          caption: 'Pump pedal -> Downshift gears -> Modulate parking brake -> Steer into soft friction zones.'
        },
        checkpoint: {
          question: 'Why must you NEVER turn off the vehicle ignition key if your brakes fail while driving?',
          options: [
            'It will drain the battery',
            'Turning off the ignition can lock the steering column, eliminating your ability to steer the vehicle',
            'The car will accelerate automatically',
            'The radio will shut off'
          ],
          correctAnswerIndex: 1,
          explanation: 'Ignition cutoff engages the mechanical anti-theft steering wheel lock, causing an uncontrollable crash.'
        }
      },
      {
        id: 'rd-l3',
        title: 'High-Speed Tire Blowout Control',
        duration: '5 min',
        content: `When a tire blows out at 100 km/h, the car will pull violently in the direction of the blown tire.
        
The natural reflex—slamming on the brakes—causes the vehicle to spin out or roll over. Instead, **MAINTAIN FORWARD MOMENTUM** by pressing slightly on the accelerator, steadying the steering wheel, and then easing off gently.`,
        practicalSteps: [
          'Grip the steering wheel firmly with both hands at 9 and 3 o’clock positions.',
          'Do NOT slam the brakes; abrupt braking transfers vehicle weight forward, causing rollover.',
          'Counter-steer smoothly to maintain your lane until the vehicle stabilizes.',
          'Allow vehicle to coast down naturally below 40 km/h, then signal and pull onto the shoulder.'
        ],
        diagram: {
          type: 'tire_blowout_physics',
          title: 'Tire Blowout Physics & Recovery',
          caption: 'Firm 2-handed grip -> Do NOT brake abruptly -> Coast down smoothly -> Pull over safely.'
        },
        checkpoint: {
          question: 'What is the most dangerous reaction to an unexpected high-speed tire blowout?',
          options: [
            'Slamming down hard on the brake pedal',
            'Holding the steering wheel firmly with both hands',
            'Engaging hazard warning lights',
            'Coasting smoothly to the shoulder'
          ],
          correctAnswerIndex: 0,
          explanation: 'Sudden hard braking destabilizes the vehicle’s asymmetric traction and causes catastrophic rollovers.'
        }
      },
      {
        id: 'rd-l4',
        title: 'Highway Breakdown & Warning Triangles',
        duration: '5 min',
        content: `Standing beside a broken-down car on a highway shoulder kills hundreds of motorists every year from secondary impacts.
        
Get all passengers out of the vehicle on the passenger (curb) side and move them behind the steel highway guardrail or up the embankment away from traffic. Place your reflective warning triangle **100 meters (300 feet)** behind the vehicle.`,
        practicalSteps: [
          'Turn on hazard warning flashers immediately.',
          'Exit through the side facing away from traffic (passenger side).',
          'Place warning triangle at least 100 meters back on high-speed highways to give oncoming traffic reaction time.',
          'Never stand between two parked vehicles or behind your rear trunk.'
        ],
        diagram: {
          type: 'highway_breakdown_safety',
          title: '100-Meter Warning Triangle Placement',
          caption: 'Place triangle 100m back. Passengers wait safely behind the metal guardrail.'
        },
        checkpoint: {
          question: 'Where should passengers wait while waiting for roadside assistance on a busy expressway?',
          options: [
            'Inside the car with seatbelts fastened',
            'Standing directly behind the rear bumper near the trunk',
            'Behind the roadside metal guardrail or up on the grass embankment away from traffic',
            'In the active breakdown lane'
          ],
          correctAnswerIndex: 2,
          explanation: 'Behind the guardrail provides physical protection against secondary high-speed vehicle impacts.'
        }
      }
    ],
    quiz: [
      {
        question: 'What does the acronym S-W-O-C stand for during vehicle water submersion?',
        options: [
          'Seatbelts, Windows, Out (Children first), Climb',
          'Steer, Water, Oxygen, Call',
          'Stop, Wait, Open, Clear',
          'Secure, Wave, Orient, Coast'
        ],
        correctAnswerIndex: 0,
        explanation: 'S-W-O-C: Seatbelts off, Windows opened/broken, Out with children first, Climb to roof.'
      },
      {
        question: 'How should you downshift when engine-braking during a brake failure?',
        options: [
          'Shift instantly into reverse',
          'Shift into neutral and turn off ignition',
          'Progressively shift down one gear at a time to allow engine compression to slow wheels',
          'Pull the steering wheel back and forth'
        ],
        correctAnswerIndex: 2,
        explanation: 'Sequential downshifting harnesses engine vacuum compression to safely decelerate momentum.'
      },
      {
        question: 'How far behind your stranded vehicle should a reflective warning triangle be placed on a highway?',
        options: [
          '5 meters',
          '15 meters',
          '100 meters (approx 300 feet)',
          'Right next to the rear tire'
        ],
        correctAnswerIndex: 2,
        explanation: 'At 100 km/h, cars travel 28 meters per second. 100 meters provides 3-4 seconds of warning.'
      },
      {
        question: 'Which window of a car should you strike with an emergency hammer to escape water?',
        options: [
          'The laminated front windshield',
          'The lower corner of a tempered side door window',
          'The rearview mirror',
          'The glass dashboard cluster'
        ],
        correctAnswerIndex: 1,
        explanation: 'Side door windows are tempered glass that shatters into blunt pebbles. Windshields are shatter-proof laminated glass.'
      }
    ]
  },

  // =========================================================================
  // 9. BUILDING COLLAPSE RESPONSE
  // =========================================================================
  {
    id: 'building-collapse',
    title: 'Building Collapse & Confined Space Survival',
    category: 'urban',
    duration: '22 min',
    difficulty: 'Advanced',
    points: 150,
    badge: {
      id: 'badge-rubble-survivor',
      title: 'Void Space Survivor',
      icon: 'HardHat',
      description: 'Mastered void space discovery, signaling rescue acoustic patterns, and dust filtration.'
    },
    description: 'Learn structural void space identification during collapses, dust inhalation survival, rhythmic acoustic signaling, and self-triage in confined debris.',
    learningObjectives: [
      'Identify survivable structural void spaces (lean-to, V-shape, cantilever).',
      'Protect lungs against suffocating pulverized concrete dust clouds.',
      'Communicate with Urban Search and Rescue (USAR) teams using 3-tap acoustic rhythm.',
      'Conserve body hydration and oxygen while awaiting heavy rescue shoring.'
    ],
    lessons: [
      {
        id: 'bc-l1',
        title: 'Structural Void Spaces: Where Survivors Live',
        duration: '6 min',
        content: `When reinforced concrete structures collapse, floors and load-bearing walls rarely compact into solid rubble. They create survivable hollow pockets known as **void spaces**.
        
Primary void types:
• **Lean-To Void:** A wall or beam falls against another wall, forming an open triangle underneath.
• **V-Shape Void:** A floor collapses in the middle while remaining anchored at exterior walls.
• **Furniture Voids:** Heavy objects like industrial desks, steel safes, and solid workbenches bridge overhead debris.`,
        practicalSteps: [
          'Shelter next to large, solid objects that do not compress completely flat.',
          'Curl into the fetal position to protect lungs, abdominal organs, and head.',
          'Avoid center floor areas under unsupported spans.',
          'Never stand beneath heavy dangling light fixtures or cracked concrete slabs.'
        ],
        diagram: {
          type: 'collapse_void_types',
          title: 'Structural Void Geometry',
          caption: 'Lean-To Void (triangle beside wall) & Furniture Void (shelter under reinforced table).'
        },
        checkpoint: {
          question: 'What is a "Lean-To Void" in structural collapse rescue terminology?',
          options: [
            'A room completely emptied of furniture',
            'A survivable triangular space formed when a floor slab or wall collapses at one end against a sturdy wall',
            'An open elevator shaft',
            'A tunnel dug by rescue dogs'
          ],
          correctAnswerIndex: 1,
          explanation: 'Lean-to collapses form structural triangles with substantial weight supported by the intact wall.'
        }
      },
      {
        id: 'bc-l2',
        title: 'Respiratory Protection in Dust Clouds',
        duration: '5 min',
        content: `The moment a building collapses, it generates an immense cloud of pulverized concrete dust, gypsum, asbestos, and silica. Inhaling this dust can cause immediate suffocation and chemical pneumonia.
        
Cover your nose and mouth immediately with cotton clothing. Inhale slowly and shallowly through your nose to conserve oxygen.`,
        practicalSteps: [
          'Pull a shirt, scarf, or cloth over your mouth and nose immediately.',
          'If possible, dampen the cloth with water to maximize fine particulate filtration.',
          'Breathe rhythmically and shallowly through your nose, not your mouth.',
          'Cover your eyes and keep eyelids closed until airborne dust settles.'
        ],
        diagram: {
          type: 'respiratory_filter',
          title: 'Emergency Dust Filtration',
          caption: 'Cotton cloth folded twice over nose and mouth filters coarse pulverized concrete particles.'
        },
        checkpoint: {
          question: 'Why is covering your nose and mouth with cloth the immediate first action after a structural collapse?',
          options: [
            'To keep warm',
            'To prevent suffocation and respiratory spasm from pulverized concrete dust clouds',
            'To block out light',
            'To prevent ear drum damage'
          ],
          correctAnswerIndex: 1,
          explanation: 'Pulverized dust coats air sacs in lungs, causing sudden asphyxiation if inhaled directly.'
        }
      },
      {
        id: 'bc-l3',
        title: 'Acoustic Signaling: The 3-Tap Rescue Rhythm',
        duration: '6 min',
        content: `Shouting continuously wastes precious oxygen, dehydrates your vocal cords, and causes you to inhale dust. Furthermore, human vocal frequencies carry poorly through dense concrete rubble.
        
USAR teams use seismic geophones and acoustic listening devices. Tap on pipes, iron rebar, or structural metal in sets of three: **TAP - TAP - TAP**. Pause for 15 seconds to listen, then repeat.`,
        practicalSteps: [
          'Find a metal pipe, piece of structural rebar, or dense concrete surface.',
          'Tap firmly three times with a stone or metal tool: TAP - TAP - TAP.',
          'Listen intently during USAR "Callout and Listening" silence periods.',
          'Only shout when you distinctly hear rescue workers directly above your position.'
        ],
        diagram: {
          type: 'acoustic_signaling',
          title: '3-Tap Acoustic Geophone Signal',
          caption: 'Three sharp taps on pipes or rebar vibrate through concrete, easily detected by USAR geophones.'
        },
        checkpoint: {
          question: 'Why is tapping on metal pipes or rebar vastly superior to shouting when trapped in rubble?',
          options: [
            'Shouting makes rescuers nervous',
            'Metal and solid concrete conduct sound waves much farther than air, and tapping saves your voice and oxygen',
            'Tapping scares away rodents',
            'Sound does not travel through pipes'
          ],
          correctAnswerIndex: 1,
          explanation: 'Dense solids conduct acoustic vibrations with high fidelity to sensitive seismic listening geophones.'
        }
      },
      {
        id: 'bc-l4',
        title: 'Survival Endurance: Managing Oxygen and Panic',
        duration: '5 min',
        content: `Survivors have been rescued alive from collapsed building voids after 100+ hours. Your psychological state dictates your physiological oxygen consumption.
        
Panic and hyperventilation consume oxygen at 3x the normal rate. Focus on slow, measured box-breathing (inhale 4 sec, hold 4 sec, exhale 4 sec, hold 4 sec) to maintain a low resting heart rate.`,
        practicalSteps: [
          'Never light matches or lighters; gas leaks are common in rubble and open flame consumes oxygen.',
          'Do not make wild digging motions that can shift unstable overhead concrete slabs.',
          'Conserve every drop of moisture; avoid sweating and unnecessary movement.',
          'Believe firmly in rescue: modern USAR teams work 24/7 with dogs, cameras, and cranes.'
        ],
        diagram: {
          type: 'box_breathing',
          title: '4-4-4-4 Box Breathing for Rubble Survival',
          caption: 'Controlled 4-second box breathing lowers heart rate and extends confined oxygen reserves.'
        },
        checkpoint: {
          question: 'Why must you NEVER light a cigarette lighter or match if trapped inside collapsed rubble?',
          options: [
            'It will blind search dogs',
            'Rubble frequently contains trapped flammable gas, and flames consume valuable oxygen',
            'Lighters are banned in disaster zones',
            'The smoke will set off sirens'
          ],
          correctAnswerIndex: 1,
          explanation: 'Severed gas lines create explosive atmospheres, and open flames quickly burn through limited oxygen reserves.'
        }
      }
    ],
    quiz: [
      {
        question: 'What is the standard acoustic pattern recommended for signaling trapped position in rubble?',
        options: [
          'Random chaotic pounding',
          'Three distinct, sharp taps on a metal pipe or structural slab with periodic pauses',
          'Singing loudly without stopping',
          'Whistling continuously for 1 hour'
        ],
        correctAnswerIndex: 1,
        explanation: 'Three sharp taps is the international distress rhythm recognized by acoustic listening teams.'
      },
      {
        question: 'Which of the following spaces is most likely to provide a survivable void space during an earthquake collapse?',
        options: [
          'Underneath an interior steel desk or beside a solid load-bearing wall',
          'Inside an elevator cab',
          'In the center of a wide open ballroom',
          'Under a fragile glass coffee table'
        ],
        correctAnswerIndex: 0,
        explanation: 'Heavy steel desks and perimeter load-bearing walls resist total structural compaction.'
      },
      {
        question: 'How does panic affect your survival time in an enclosed rubble void?',
        options: [
          'It has no biological effect',
          'Hyperventilation and racing pulse consume available oxygen up to 3 times faster',
          'Panic produces extra water in the body',
          'Panic cools body temperature'
        ],
        correctAnswerIndex: 1,
        explanation: 'Rapid breathing consumes air and depletes hydration; calm box breathing extends survival hours.'
      },
      {
        question: 'If you hear rescue dogs or heavy machinery above, when should you shout?',
        options: [
          'Never make any sound',
          'Shout during quiet listening pauses when machinery shuts down and searchers call out',
          'Continuously while heavy jackhammers are running',
          'Only after digging yourself free'
        ],
        correctAnswerIndex: 1,
        explanation: 'USAR protocols include mandatory 10-minute silence periods specifically to hear survivor voices.'
      }
    ]
  },

  // =========================================================================
  // 10. FIRST AID AND BASIC LIFE SUPPORT (BLS)
  // =========================================================================
  {
    id: 'first-aid-bls',
    title: 'First Aid & Basic Life Support (BLS)',
    category: 'first_aid',
    duration: '25 min',
    difficulty: 'Essential',
    points: 150,
    badge: {
      id: 'badge-life-saver',
      title: 'Certified Life Saver',
      icon: 'HeartPulse',
      description: 'Mastered Hands-Only CPR, arterial bleeding control, choking relief, and recovery position.'
    },
    description: 'Learn rapid cardiopulmonary resuscitation (CPR), severe hemorrhage control with direct pressure, the Heimlich maneuver, and treating shock.',
    learningObjectives: [
      'Perform high-quality adult CPR at 100-120 compressions per minute.',
      'Control severe arterial bleeding using direct focal pressure and tourniquets.',
      'Deliver abdominal thrusts (Heimlich maneuver) to clear complete airway obstructions.',
      'Place unconscious, breathing casualties into the stable recovery position.'
    ],
    lessons: [
      {
        id: 'fa-l1',
        title: 'Hands-Only CPR: Rate, Depth, and Rhythm',
        duration: '7 min',
        content: `Cardiac arrest is an electrical failure of the heart. Clinical death occurs within **4 to 6 minutes** without cerebral blood flow.
        
If an adult collapses and is unresponsive with absent or abnormal breathing (agonal gasping):
1. Call 112 immediately and request an AED.
2. Place heel of one hand in center of chest (breastbone), interlock second hand.
3. Push HARD and FAST: **2 inches (5 cm) deep** at a cadence of **100 to 120 compressions per minute** (the beat of "Stayin' Alive").`,
        practicalSteps: [
          'Lock elbows straight and position shoulders directly above the casualty’s breastbone.',
          'Compress chest to a depth of 5 to 6 cm (2 to 2.4 inches).',
          'Allow complete chest recoil between each compression; do NOT lean on the chest.',
          'Maintain compressions continuously until an AED arrives, medical personnel take over, or victim revives.'
        ],
        diagram: {
          type: 'cpr_technique',
          title: 'Hands-Only CPR Stance & Depth',
          caption: 'Heel of hand on sternum | Elbows locked straight | Depth 5 cm | Rate 100-120 bpm.'
        },
        checkpoint: {
          question: 'What is the recommended chest compression rate per minute for adult CPR?',
          options: [
            '50 to 60 compressions per minute',
            '100 to 120 compressions per minute (the beat of "Stayin’ Alive")',
            '180 to 200 compressions per minute',
            'Rate does not matter as long as you push hard'
          ],
          correctAnswerIndex: 1,
          explanation: '100 to 120 bpm maintains optimal forward coronary and cerebral perfusion pressure.'
        }
      },
      {
        id: 'fa-l2',
        title: 'Severe Bleeding: Direct Pressure & Tourniquets',
        duration: '6 min',
        content: `Severe arterial bleeding can cause fatal hypovolemic shock within **3 minutes**.
        
The immediate priority is **DIRECT, FOCAL PRESSURE**: Apply sterile gauze or clean cloth directly over the bleeding vessel and push down with full body weight. If bleeding on a limb cannot be controlled with direct pressure, apply a commercial or improvised tourniquet **2 to 3 inches above the wound** (never directly over a joint).`,
        practicalSteps: [
          'Press down directly on the exact bleeding site with heels of hands.',
          'Pack deep cavity wounds tightly with sterile gauze or clean cloth before applying pressure.',
          'If applying a tourniquet: Tighten the windlass rod until bright red bleeding STOPS completely.',
          'Mark the exact time of tourniquet application on the patient’s forehead (e.g. "T 14:30").'
        ],
        diagram: {
          type: 'tourniquet_pressure',
          title: 'Direct Pressure & Tourniquet Placement',
          caption: 'Direct focal pressure on wound. Tourniquet 2-3 inches above wound, never on a joint. Record time.'
        },
        checkpoint: {
          question: 'Where should a commercial tourniquet be placed on an arm or leg with uncontrolled arterial bleeding?',
          options: [
            'Directly over the elbow or knee joint',
            '2 to 3 inches (5-7 cm) above the wound, between the wound and the heart',
            'Directly below the wound toward the fingers/toes',
            'Around the neck'
          ],
          correctAnswerIndex: 1,
          explanation: 'Placing it 2-3 inches proximal to the wound (between wound and heart) compresses the arterial supply against bone.'
        }
      },
      {
        id: 'fa-l3',
        title: 'Choking Relief: The Heimlich Maneuver',
        duration: '6 min',
        content: `A complete airway obstruction is signaled by the universal choking sign (clutching throat), inability to speak, cough, or breathe, and turning blue (cyanosis).
        
Stand behind the casualty, wrap arms around their waist. Make a fist with one hand, thumb side against the abdomen just above the navel. Grasp fist with other hand and deliver **quick, upward abdominal thrusts**.`,
        practicalSteps: [
          'Ask: "Are you choking?" If they cannot speak or cough, act immediately.',
          'Place fist thumb-inward just above the navel and below the rib cage.',
          'Pull inward and upward sharply in a "J" motion to expel the foreign object like a cork.',
          'If the person loses consciousness, lower them gently to the floor and begin chest compressions (CPR).'
        ],
        diagram: {
          type: 'heimlich_thrust',
          title: 'Heimlich Abdominal Thrust Motion',
          caption: 'Fist above navel. Quick inward & upward thrusts create diaphragm pressure to expel object.'
        },
        checkpoint: {
          question: 'Where should your hands be placed when performing abdominal thrusts on a conscious choking adult?',
          options: [
            'Directly on the breastbone (sternum)',
            'Just above the navel and well below the lower tip of the rib cage',
            'Around the lower throat',
            'On the kidneys'
          ],
          correctAnswerIndex: 1,
          explanation: 'Placing your fist just above the navel pushes the diaphragm upward, generating airway air pressure.'
        }
      },
      {
        id: 'fa-l4',
        title: 'The Recovery Position: Protecting Airways',
        duration: '6 min',
        content: `An unconscious person lying flat on their back is at severe risk of suffocating on their own tongue or aspirating vomit into their lungs.
        
If a casualty is unconscious, breathing normally, and has no suspected spinal trauma, roll them onto their side into the **Recovery Position**. This ensures fluids drain freely and keeps the tongue from falling back into the throat.`,
        practicalSteps: [
          'Kneel beside the casualty; place their nearest arm out at a right angle.',
          'Bring their far arm across their chest, holding the back of their hand against their near cheek.',
          'Bend the far knee up at a right angle, then pull the knee toward you to roll them onto their side.',
          'Tilt head gently backward to maintain an open airway and ensure fluids drain out of the mouth.'
        ],
        diagram: {
          type: 'recovery_position',
          title: 'The Lateral Recovery Position',
          caption: 'Casualty on side. Top knee bent at 90°. Head tilted back so airway stays clear and open.'
        },
        checkpoint: {
          question: 'Why is the recovery position crucial for an unconscious person who is breathing normally?',
          options: [
            'It helps them wake up faster',
            'It prevents the tongue from blocking the airway and allows vomit/fluids to drain safely',
            'It lowers their blood pressure',
            'It straightens their spine'
          ],
          correctAnswerIndex: 1,
          explanation: 'In an unconscious state, relaxed tongue muscles can slide back into the pharynx, causing fatal airway obstruction.'
        }
      }
    ],
    quiz: [
      {
        question: 'What is the primary action when you witness a sudden adult collapse with no normal breathing?',
        options: [
          'Give them a glass of warm water',
          'Call 112 and immediately begin hard, fast chest compressions in the center of the chest',
          'Slap their cheeks to wake them up',
          'Wait 10 minutes to see if they recover on their own'
        ],
        correctAnswerIndex: 1,
        explanation: 'Immediate chest compressions maintain brain blood flow until a defibrillator can restart the heart.'
      },
      {
        question: 'How deep should adult chest compressions be during CPR?',
        options: [
          '1 cm (0.5 inch)',
          '5 to 6 cm (2 to 2.4 inches)',
          '10 cm (4 inches)',
          'Only compress until you feel ribs crack'
        ],
        correctAnswerIndex: 1,
        explanation: '5 to 6 cm compression depth is required to physically squeeze the heart between the sternum and spine.'
      },
      {
        question: 'What should you do if an initial cloth dressing over a severe bleeding wound becomes soaked through with blood?',
        options: [
          'Peel off the dressing and wipe the wound clean',
          'Leave the original dressing in place, apply additional gauze pads on top, and push down harder',
          'Pour cold water over the dressing',
          'Loosen pressure to let blood breathe'
        ],
        correctAnswerIndex: 1,
        explanation: 'Removing initial dressings tears away nascent blood clots. Always layer additional pads on top.'
      },
      {
        question: 'What is the universal sign of complete choking in an adult?',
        options: [
          'Waving arms frantically while speaking clearly',
          'Clutching both hands around the throat, unable to speak, cough, or breathe',
          'Coughing forcefully and noisily',
          'Complaining of a sore throat'
        ],
        correctAnswerIndex: 1,
        explanation: 'Hands clutched to the throat with no vocalization confirms a complete tracheal blockage requiring the Heimlich.'
      }
    ]
  },

  // =========================================================================
  // 11. EMERGENCY EVACUATION
  // =========================================================================
  {
    id: 'emergency-evacuation',
    title: 'Emergency Evacuation & Transit Protocol',
    category: 'preparedness',
    duration: '20 min',
    difficulty: 'Intermediate',
    points: 150,
    badge: {
      id: 'badge-evacuation-lead',
      title: 'Evacuation Lead',
      icon: 'Compass',
      description: 'Mastered 15-minute rapid departure, family muster points, and pet evacuation protocols.'
    },
    description: 'Learn rapid 15-minute home departure drills, establishing primary and secondary neighborhood muster points, pet transport, and gridlock transit navigation.',
    learningObjectives: [
      'Execute a 15-minute notice-to-depart rapid home evacuation.',
      'Establish primary, local, and regional family meeting points.',
      'Pack compliant pet survival crates, food, and microchip records.',
      'Navigate around civil evacuation choke points and dead-ends.'
    ],
    lessons: [
      {
        id: 'ev-l1',
        title: 'The 15-Minute Evacuation Drill',
        duration: '5 min',
        content: `Wildfires, chemical spills, and flash floods often provide less than **15 minutes** between alert issuance and arrival.
        
A successful evacuation requires a pre-packed 72-hour Go-Bag, designated family roles, and a strict departure checklist. Never spend valuable evacuation minutes searching for jewelry, photo albums, or non-essential clothing.`,
        practicalSteps: [
          'Store your pre-packed Go-Bags in an easily accessible front coat closet or trunk.',
          'Assign designated family roles: Parent 1 secures pets & car keys, Parent 2 grabs Go-Bags & documents.',
          'Wear long pants, long-sleeved cotton shirts, and sturdy hiking or work boots.',
          'Lock all exterior doors and windows, and leave outdoor porch lights ON so emergency teams see occupancy.'
        ],
        diagram: {
          type: 'fifteen_min_drill',
          title: 'The 15-Minute Departure Timeline',
          caption: 'Min 0-3: Gear on | Min 4-8: Bags & pets in car | Min 9-12: Utility shutoff | Min 13-15: Depart.'
        },
        checkpoint: {
          question: 'What clothing should you wear when evacuating an area threatened by wildfire or urban disaster?',
          options: [
            'Shorts and sandals for comfort',
            'Heavy synthetic nylon tracksuit',
            'Long pants, long-sleeved 100% cotton/wool clothing, and sturdy closed-toe leather boots',
            'Raincoat only'
          ],
          correctAnswerIndex: 2,
          explanation: 'Cotton and wool do not melt against skin like synthetics; long sleeves and sturdy boots shield from embers.'
        }
      },
      {
        id: 'ev-l2',
        title: 'The 3-Tier Family Meeting Points',
        duration: '5 min',
        content: `Disasters strike when family members are at work, school, or in transit. Local mobile cellular networks quickly become jammed.
        
Establish **Three Tiers of Meeting Points**:
1. **Tier 1 (Immediate):** Right outside your home (e.g. a specific tree or streetlight).
2. **Tier 2 (Neighborhood):** A known landmark outside your immediate street (e.g. neighborhood library or park).
3. **Tier 3 (Regional):** A designated relative’s home or town hall in an adjacent city beyond the disaster perimeter.`,
        practicalSteps: [
          'Every family member must memorize all three locations and their physical street addresses.',
          'Designate an **out-of-state/out-of-area contact person** everyone texts; long-distance lines work when local lines jam.',
          'Write down addresses on physical laminated contact cards in children’s backpacks.',
          'Instruct children never to leave school unless picked up by designated emergency guardians.'
        ],
        diagram: {
          type: 'three_tier_points',
          title: 'Three-Tier Reunion Architecture',
          caption: 'Tier 1: Home front tree | Tier 2: Community park | Tier 3: Out-of-county relative.'
        },
        checkpoint: {
          question: 'Why is designating an "out-of-area" emergency family contact person more reliable than local calling?',
          options: [
            'Out-of-area calls are cheaper',
            'Local cell towers become overwhelmed with local traffic, but long-distance text routing often succeeds',
            'Out-of-area relatives can fly over immediately',
            'Local phone numbers expire during disasters'
          ],
          correctAnswerIndex: 1,
          explanation: 'Local switching circuits jam during disasters; trunk lines out-of-region remain open for short SMS data packets.'
        }
      },
      {
        id: 'ev-l3',
        title: 'Pet and Companion Animal Evacuation',
        duration: '5 min',
        content: `Never leave pets behind when evacuating. If conditions are unsafe for you, they are lethal for your animals.
        
Many public emergency shelters cannot accept pets due to health regulations. Pre-identify pet-friendly evacuation shelters, veterinary boarding facilities, or pet-friendly hotels along your evacuation route.`,
        practicalSteps: [
          'Keep sturdy pet carriers, leashes, and muzzles near your primary exit.',
          'Pack a 7-day pet emergency kit: dry food, bottled water, medications, bowls, and litter box.',
          'Ensure dogs and cats wear collars with up-to-date phone numbers and registered microchips.',
          'Carry digital and printed photos of your pets to prove ownership if separated.'
        ],
        diagram: {
          type: 'pet_evacuation_kit',
          title: 'Companion Animal Evacuation Crate & Kit',
          caption: 'Rigid pet carrier, 7-day food supply, medical records, leash, and recent photo.'
        },
        checkpoint: {
          question: 'Why should you include a recent photo of yourself with your pet in your evacuation documents?',
          options: [
            'To show shelter workers for decoration',
            'To verify proof of ownership if your pet is recovered by an emergency rescue shelter',
            'Pets like looking at pictures of their owners',
            'It is required by traffic police'
          ],
          correctAnswerIndex: 1,
          explanation: 'In the chaos of pet reunification shelters, photographic proof with your animal expedites reclaiming.'
        }
      },
      {
        id: 'ev-l4',
        title: 'Route Selection & Avoiding Gridlock',
        duration: '5 min',
        content: `During mass evacuations, primary highway corridors turn into motionless parking lots within hours. A stalled car with an empty fuel tank can block thousands behind it.
        
Always maintain a minimum **half-tank of fuel** in vehicles during disaster warning seasons. Pre-scout at least two alternate secondary rural routes that bypass major freeway choke points.`,
        practicalSteps: [
          'Keep an updated paper road atlas in your glove box (cellular GPS maps fail during grid outages).',
          'Keep vehicle fuel tanks at or above half full at all times during storm/fire season.',
          'Do NOT drive along shoulders or medians unless instructed by highway patrol.',
          'Listen to official local radio stations for dynamic contraflow (reverse-lane) highway announcements.'
        ],
        diagram: {
          type: 'contraflow_evacuation',
          title: 'Contraflow Highway Evacuation Geometry',
          caption: 'All highway lanes reversed outbound. Maintain half-tank minimum fuel reserve.'
        },
        checkpoint: {
          question: 'Why is keeping a physical paper road atlas in your car crucial for disaster evacuations?',
          options: [
            'Paper maps never tear',
            'Cellular towers frequently fail, leaving digital navigation apps unable to load maps or routes',
            'Paper maps show live traffic updates',
            'Police require paper maps at checkpoints'
          ],
          correctAnswerIndex: 1,
          explanation: 'Digital phone apps rely on live cell towers and GPS data servers that crash during large-scale grid blackouts.'
        }
      }
    ],
    quiz: [
      {
        question: 'What is the recommended minimum fuel level to maintain in your personal vehicle during disaster seasons?',
        options: [
          'Just above empty',
          'At least half a tank at all times',
          'Full tank every single day without exception',
          'One gallon is enough'
        ],
        correctAnswerIndex: 1,
        explanation: 'Maintaining at least half a tank ensures you can evacuate 200+ km without joining gridlocked gas station lines.'
      },
      {
        question: 'Which of the following describes the Tier 2 family meeting point?',
        options: [
          'The front porch of your house',
          'A specific landmark in your neighborhood, such as a school or library, outside your immediate street',
          'A hotel in another country',
          'An online chat room'
        ],
        correctAnswerIndex: 1,
        explanation: 'Tier 2 is within the neighborhood for when your immediate street or block is cordoned off.'
      },
      {
        question: 'What should you do with your pets if you are ordered to evacuate immediately?',
        options: [
          'Leave them inside the bathroom with a bowl of water',
          'Take them with you in secure carriers with food, water, and identification',
          'Release them outdoors to fend for themselves',
          'Tie them to a tree outside'
        ],
        correctAnswerIndex: 1,
        explanation: 'Animals left behind rarely survive floods, fires, or structural collapse. Always evacuate with pets.'
      },
      {
        question: 'Why is packing long-sleeved 100% cotton or wool clothing essential in your evacuation bag?',
        options: [
          'It is lighter to carry',
          'Natural fibers do not melt into skin under radiant heat, unlike polyester and nylon synthetics',
          'It repels water completely',
          'It is cheaper'
        ],
        correctAnswerIndex: 1,
        explanation: 'Synthetic materials melt directly into skin burns when exposed to radiant fire heat or sparks.'
      }
    ]
  },

  // =========================================================================
  // 12. EMERGENCY KIT PREPARATION (THE 72-HOUR GO-BAG)
  // =========================================================================
  {
    id: 'emergency-kit',
    title: 'Emergency Kit & 72-Hour Go-Bag Essentials',
    category: 'preparedness',
    duration: '22 min',
    difficulty: 'Essential',
    points: 150,
    badge: {
      id: 'badge-kit-specialist',
      title: 'Survival Kit Specialist',
      icon: 'Briefcase',
      description: 'Mastered the 72-hour survival loadout, water ratios, and waterproof document cache.'
    },
    description: 'Build a modular 72-hour survival kit, calculate water rations (3L/person/day), pack non-perishable high-calorie nutrition, and assemble emergency communications.',
    learningObjectives: [
      'Calculate family water requirements: 3 liters (1 gallon) per person per day.',
      'Assemble a rugged, weather-sealed 72-hour survival backpack (Go-Bag).',
      'Create an encrypted, waterproof USB and physical vital document vault.',
      'Select multi-power emergency radios (hand-crank, solar, battery backup).'
    ],
    lessons: [
      {
        id: 'ek-l1',
        title: 'Water: The First Rule of Survival',
        duration: '5 min',
        content: `The human body cannot survive more than **3 to 4 days** without clean water.
        
The minimum baseline standard for emergency preparedness is **3 liters (approx 1 gallon) per person per day** for at least 3 days (72 hours):
• 2 liters for direct biological consumption and hydration.
• 1 liter for essential food rehydration and minimal sanitation.
Double this calculation for pregnant mothers, nursing infants, elderly, and hot climates!`,
        practicalSteps: [
          'Store commercially sealed water containers away from direct sunlight and chemicals.',
          'Rotate stored municipal tap water bottles every 6 months.',
          'Include compact emergency water purification tablets (Aquatabs / iodine) or a 0.1-micron hollow-fiber filter.',
          'Never drink pool water or radiator water; high chemical concentrations destroy kidney function.'
        ],
        diagram: {
          type: 'water_rations',
          title: 'The 3L / Person / Day Standard',
          caption: '2 Liters Drinking + 1 Liter Sanitation x 3 Days = 9 Liters (2.4 gal) per person minimum.'
        },
        checkpoint: {
          question: 'What is the official minimum water supply required for a family of 4 for a 72-hour emergency?',
          options: [
            '4 liters total',
            '12 liters total',
            '36 liters (approx 9 to 10 gallons)',
            '100 liters'
          ],
          correctAnswerIndex: 2,
          explanation: '4 people x 3 liters/day x 3 days = 36 liters minimum for drinking and sanitation.'
        }
      },
      {
        id: 'ek-l2',
        title: 'Emergency Nutrition & Calorie Density',
        duration: '5 min',
        content: `During a disaster, stress, cold, and physical exertion increase daily caloric demands to 2,000 - 2,500 kcal per adult.
        
Emergency food supplies must:
1. Require ZERO refrigeration, cooking, or clean water preparation.
2. Have a verified shelf-life of 3 to 5 years.
3. Be high in protein, healthy fats, and complex carbohydrates.`,
        practicalSteps: [
          'Pack ready-to-eat foods: canned tuna, chicken, beans, peanut butter, dried fruit, and high-energy survival bars.',
          'Include a manual hand-crank can opener (electric openers are useless in blackouts).',
          'Include comfort food (hard candies, chocolate) to boost morale and comfort children.',
          'Check expiration dates annually on your birthday or daylight saving time switch.'
        ],
        diagram: {
          type: 'food_shelf_life',
          title: 'Emergency Food Tier Selection',
          caption: 'High-calorie survival rations, canned proteins, dried fruits. Manual can opener is mandatory!'
        },
        checkpoint: {
          question: 'Which tool is most commonly forgotten but completely critical when packing canned survival food?',
          options: [
            'A microwave',
            'A manual non-electric can opener',
            'Silverware polish',
            'A chef’s knife'
          ],
          correctAnswerIndex: 1,
          explanation: 'Standard canned foods cannot be accessed easily without a manual hand-operated can opener.'
        }
      },
      {
        id: 'ek-l3',
        title: 'Power, Light, and Communications',
        duration: '6 min',
        content: `When the regional electrical grid collapses, smartphones lose power within 24 hours and cellular base stations exhaust backup generator fuel.
        
Your kit must include:
• A **multi-powered emergency radio** (NOAA / All-India Radio) equipped with hand-crank, solar panel, and backup battery.
• A 20,000 mAh rugged power bank kept charged at 100%.
• LED headlamps (leaves hands free for first aid and navigation).`,
        practicalSteps: [
          'Store headlamps with batteries removed or plastic insulator tabs in place to prevent parasitic drain.',
          'Choose a headlamp with a red-light mode to preserve nighttime vision and avoid signaling intruders.',
          'Keep extra AA and AAA lithium batteries (lithium batteries work in extreme cold unlike alkalines).',
          'Store a loud emergency pea-less whistle (whistles carry up to 1 km and require minimal breath).'
        ],
        diagram: {
          type: 'emergency_power_kit',
          title: 'Emergency Communications Trio',
          caption: 'Hand-crank emergency radio + 20,000 mAh power bank + LED headlamp with red night mode.'
        },
        checkpoint: {
          question: 'Why are LED headlamps superior to handheld flashlights during an emergency evacuation?',
          options: [
            'They are brighter than any flashlight',
            'They keep both hands free to carry children, hold handrails, and administer first aid',
            'They never run out of battery',
            'They are immune to water'
          ],
          correctAnswerIndex: 1,
          explanation: 'Hands-free illumination allows you to navigate stairwells, carry gear, and hold children safely.'
        }
      },
      {
        id: 'ek-l4',
        title: 'The Waterproof Vital Document Vault',
        duration: '6 min',
        content: `After a disaster, recovering insurance, claiming federal relief, and accessing bank accounts requires proof of identity and property ownership.
        
Store copies of all critical documents in:
1. A waterproof, fireproof physical document pouch inside your Go-Bag.
2. A password-protected, encrypted 256-bit AES USB flash drive.`,
        practicalSteps: [
          'Include copies of: Passports, Government IDs, Birth Certificates, Marriage Licenses.',
          'Include: Home/Health/Auto insurance policies, deed of property ownership, and vehicle titles.',
          'Include: A list of prescription medications and medical device serial numbers.',
          'Carry physical emergency cash in small denominations (₹100, ₹500 / $10, $20 bills); ATMs do not work without power.'
        ],
        diagram: {
          type: 'waterproof_doc_pouch',
          title: 'The Waterproof Document Vault',
          caption: 'Fireproof pouch + Encrypted USB + Small denomination cash reserves.'
        },
        checkpoint: {
          question: 'Why should you include physical cash in small bills in your emergency kit?',
          options: [
            'Coins are too heavy',
            'Credit card machines and ATMs will not function during grid outages, and merchants cannot make change for large bills',
            'Banks close permanently during disasters',
            'Paper cash is waterproof'
          ],
          correctAnswerIndex: 1,
          explanation: 'Grid collapses disable electronic point-of-sale systems. Small bills allow buying food and fuel without change issues.'
        }
      }
    ],
    quiz: [
      {
        question: 'What is the minimum recommended duration that a personal Go-Bag should sustain an individual without outside aid?',
        options: [
          '12 hours',
          '24 hours',
          '72 hours (3 full days)',
          '1 month'
        ],
        correctAnswerIndex: 2,
        explanation: '72 hours bridges the window before national disaster logistics and relief centers can fully deploy.'
      },
      {
        question: 'How much water should you pack per person per day in an emergency kit?',
        options: [
          '500 ml',
          '1 liter',
          '3 liters (approx 1 gallon)',
          '10 liters'
        ],
        correctAnswerIndex: 2,
        explanation: '3 liters supplies 2 liters for internal hydration and 1 liter for food preparation and hygiene.'
      },
      {
        question: 'Which type of emergency radio is most reliable when power lines are down and batteries are exhausted?',
        options: [
          'A digital Bluetooth speaker',
          'A multi-powered hand-crank and solar emergency radio with analog tuner',
          'A car satellite dish',
          'A WiFi router'
        ],
        correctAnswerIndex: 1,
        explanation: 'Hand-crank dynamos and solar cells generate continuous power independently of utility lines.'
      },
      {
        question: 'Why should batteries be stored outside flashlights or with plastic pull-tabs in place inside survival bags?',
        options: [
          'To save weight',
          'To prevent parasitic electronic drain and battery acid leakage over years of storage',
          'Flashlight bulbs burn out in backpacks',
          'Batteries produce too much heat'
        ],
        correctAnswerIndex: 1,
        explanation: 'Batteries left inside devices experience parasitic circuit drain and eventual corrosive chemical leakage.'
      }
    ]
  },

  // =========================================================================
  // 13. WATER AND FOOD SAFETY
  // =========================================================================
  {
    id: 'water-food-safety',
    title: 'Water Purification & Post-Disaster Food Safety',
    category: 'preparedness',
    duration: '20 min',
    difficulty: 'Intermediate',
    points: 150,
    badge: {
      id: 'badge-water-purifier',
      title: 'Water Purification Specialist',
      icon: 'Droplet',
      description: 'Mastered boiling protocols, bleach chlorine disinfection, and food spoil triage.'
    },
    description: 'Master emergency water purification (boiling, chlorination, filtration, SODIS), identify spoiled perishable foods, and avoid foodborne toxins in blackouts.',
    learningObjectives: [
      'Execute the three primary water purification methods: boiling, chemical chlorination, and filtration.',
      'Apply household unscented bleach ratio (8 drops per gallon) for emergency disinfection.',
      'Manage refrigerator food spoilage timelines during prolonged electrical outages.',
      'Identify compromised canned goods (bulging, dented, hissing lids).'
    ],
    lessons: [
      {
        id: 'wf-l1',
        title: 'Boiling: The Gold Standard of Water Purification',
        duration: '5 min',
        content: `Boiling is the most reliable method to kill disease-causing microorganisms, including viruses, bacteria, and parasites (e.g. Cryptosporidium and Giardia).
        
Bring water to a **rolling boil for at least 1 full minute** (at altitudes above 2,000 meters / 6,500 feet, boil for 3 full minutes). Let the water cool naturally before drinking.`,
        practicalSteps: [
          'If water is cloudy, filter it first through a clean cloth, coffee filter, or paper towel before boiling.',
          'Bring to a vigorous rolling boil for 1 minute.',
          'To improve the flat taste of boiled water, pour it back and forth between two clean containers to re-aerate it.',
          'Store in clean, sanitized, sealed food-grade containers.'
        ],
        diagram: {
          type: 'rolling_boil',
          title: 'The Rolling Boil Protocol',
          caption: 'Cloudy water -> Pre-filter with cloth -> 1 full minute rolling boil -> Cool and store.'
        },
        checkpoint: {
          question: 'How long must water be at a full rolling boil to destroy biological pathogens at sea level?',
          options: [
            '5 seconds',
            'At least 1 full minute',
            '15 minutes',
            '1 hour'
          ],
          correctAnswerIndex: 1,
          explanation: 'One full minute of rolling boil exceeds the thermal death point of all biological waterborne pathogens.'
        }
      },
      {
        id: 'wf-l2',
        title: 'Emergency Chemical Disinfection: Household Bleach',
        duration: '5 min',
        content: `If you cannot boil water, common household unscented liquid chlorine bleach (5% to 6% sodium hypochlorite) can disinfect drinking water.
        
**Dosage:** Add **8 drops (approx 1/8 teaspoon)** of unscented bleach per 1 gallon (3.8 liters) of clear water.
Stir and let stand for **30 full minutes**. The water should have a slight chlorine scent. If it does not, repeat the dose and wait another 15 minutes.`,
        practicalSteps: [
          'Use ONLY regular, unscented household bleach; NEVER use scented, splash-less, or color-safe bleaches.',
          'Clear water: 8 drops per gallon (2 drops per liter).',
          'Cloudy water: 16 drops per gallon (4 drops per liter) after straining.',
          'Wait 30 minutes before drinking to allow chlorine contact time to kill pathogens.'
        ],
        diagram: {
          type: 'bleach_chlorination',
          title: 'Household Bleach Disinfection Ratio',
          caption: '8 drops unscented bleach per gallon of clear water. Wait 30 minutes before consuming.'
        },
        checkpoint: {
          question: 'What type of household bleach is safe for emergency water disinfection?',
          options: [
            'Lemon-scented laundry bleach',
            'Plain, unscented liquid chlorine bleach (5% to 6% sodium hypochlorite)',
            'Color-safe oxygen bleach powder',
            'Industrial splash-less bleach'
          ],
          correctAnswerIndex: 1,
          explanation: 'Only plain unscented chlorine bleach contains no toxic perfumes, surfactants, or thickeners.'
        }
      },
      {
        id: 'wf-l3',
        title: 'Refrigerator & Freezer Food Timelines in Blackouts',
        duration: '5 min',
        content: `When electrical power fails, an unopened refrigerator keeps food safely cold for approximately **4 hours**.
        
A fully packed unopened chest freezer will maintain safe freezing temperatures for **48 hours** (24 hours if half-full).
Keep doors tightly closed! Every time you open the door, cold air spills out and accelerates microbial growth.`,
        practicalSteps: [
          'Keep refrigerator and freezer doors closed as much as possible.',
          'Discard meat, poultry, fish, eggs, and leftovers if refrigerator temperature exceeds 4°C (40°F) for over 2 hours.',
          'Food with ice crystals or below 4°C may be safely refrozen or cooked.',
          'Never taste food to determine safety; dangerous bacterial toxins have no odor or taste!'
        ],
        diagram: {
          type: 'fridge_temperature_timer',
          title: 'Cold Storage Blackout Clock',
          caption: 'Refrigerator: 4 hours unopened | Full Freezer: 48 hours unopened | Discard above 4°C after 2h.'
        },
        checkpoint: {
          question: 'How long will an unopened refrigerator keep food cold and safe during an electrical outage?',
          options: [
            '30 minutes',
            'Approximately 4 hours',
            '24 hours',
            '5 days'
          ],
          correctAnswerIndex: 1,
          explanation: 'An unopened standard refrigerator warms above the safe 4°C (40°F) threshold after roughly 4 hours.'
        }
      },
      {
        id: 'wf-l4',
        title: 'Canned Goods Safety: Detecting Botulism',
        duration: '5 min',
        content: `Clostridium botulinum produces botulinum neurotoxin—one of the most lethal biological substances on Earth. It thrives in low-oxygen, improperly sealed cans.
        
**NEVER consume canned food if:**
• The can is bulging, swollen, or has expanded rounded ends.
• The can has deep dents along the top or side seam.
• Liquid or foam spurts out violently when punctured.
• The food smells foul or discolored.`,
        practicalSteps: [
          'Inspect can seams: Dents along the seam break the hermetic seal, allowing bacterial ingress.',
          'Swollen or bulging cans contain bacterial gas—dispose of them safely without tasting.',
          'Wipe can tops with clean disinfectant before opening to prevent surface contamination.',
          'Never boil a sealed, unopened can directly over fire; pressure will cause an explosion.'
        ],
        diagram: {
          type: 'canned_food_inspection',
          title: 'Can Integrity Checklist',
          caption: 'Reject bulging lids, rusted seams, deep dented edges, or hissing gas releases.'
        },
        checkpoint: {
          question: 'What does a bulging or swollen lid on a food can indicate?',
          options: [
            'Extra vitamins have been added',
            'Bacterial fermentation (such as botulism) has generated gas inside the sealed container',
            'The food has been vacuum-packed extra tightly',
            'The can was exposed to cold air'
          ],
          correctAnswerIndex: 1,
          explanation: 'Bacterial colonies like Clostridium botulinum release gas as they multiply, bulging the can walls.'
        }
      }
    ],
    quiz: [
      {
        question: 'What is the correct dosage of plain unscented 5% household bleach to disinfect 1 gallon of clear water?',
        options: [
          '1 drop',
          '8 drops (approx 1/8 teaspoon)',
          '1 cup',
          '1 tablespoon'
        ],
        correctAnswerIndex: 1,
        explanation: '8 drops per gallon produces roughly 2 ppm chlorine residual, enough to kill bacteria in 30 minutes.'
      },
      {
        question: 'How long will a fully packed, unopened chest freezer maintain frozen food temperatures during a blackout?',
        options: [
          '6 hours',
          '12 hours',
          'Up to 48 hours',
          '1 week'
        ],
        correctAnswerIndex: 2,
        explanation: 'A fully packed freezer acts as a solid thermal ice block, retaining cold for up to 48 hours.'
      },
      {
        question: 'Why should you never taste suspected food to see if it has spoiled after a power outage?',
        options: [
          'It will make you thirsty',
          'Lethal bacterial toxins (like staphylococcal toxin or botulinum) can be odorless, tasteless, and fatal in tiny amounts',
          'Food tastes different in the dark',
          'It ruins your appetite'
        ],
        correctAnswerIndex: 1,
        explanation: 'Food poisoning bacteria often produce zero sour taste or odor; "When in doubt, throw it out."'
      },
      {
        question: 'Can chemical chlorine bleach tablets destroy the Cryptosporidium parasite in turbid floodwater?',
        options: [
          'Yes, immediately',
          'No, Cryptosporidium has an outer protective shell resistant to chlorine; boiling or 0.1-micron filtration is required',
          'Only if mixed with alcohol',
          'Bleach kills nothing'
        ],
        correctAnswerIndex: 1,
        explanation: 'Cryptosporidium oocysts are highly resistant to chemical chlorine; vigorous boiling is the only absolute method.'
      }
    ]
  },

  // =========================================================================
  // 14. FAMILY EMERGENCY PLANNING
  // =========================================================================
  {
    id: 'family-planning',
    title: 'Family Emergency Planning & Special Needs Protocols',
    category: 'preparedness',
    duration: '22 min',
    difficulty: 'Intermediate',
    points: 150,
    badge: {
      id: 'badge-family-protector',
      title: 'Family Protector',
      icon: 'Users',
      description: 'Mastered family communication trees, elderly mobility plans, and medical reserve caching.'
    },
    description: 'Design comprehensive family emergency plans, communication trees, safeguarding elderly relatives and infants, and medical dependent continuity.',
    learningObjectives: [
      'Create an emergency communication tree with designated out-of-state relay points.',
      'Formulate continuity care plans for family members with mobility impairments.',
      'Manage prescription medication reserves and cold-chain insulin storage.',
      'Conduct bi-annual family emergency evacuation walkthrough drills.'
    ],
    lessons: [
      {
        id: 'fp-l1',
        title: 'Building a Family Emergency Communication Tree',
        duration: '5 min',
        content: `During a catastrophe, family members may be scattered across schools, offices, and transit systems. If local cell phone calls fail due to circuit congestion:
        
**TEXT, DON'T TALK.** Text messages (SMS) require vastly less bandwidth than voice calls and will queue automatically on carrier servers to transmit as soon as a cell tower burst becomes available.`,
        practicalSteps: [
          'Designate a single out-of-town contact person (e.g. Aunt in Bangalore) whom all family members text.',
          'Keep text messages short and standardized: "I AM SAFE. AT SCHOOL GYM. WILL CHECK IN AT 4PM."',
          'Program In Case of Emergency (ICE) numbers into all family mobile phones.',
          'Establish pre-scheduled check-in times (e.g. at the top of every 2nd hour) to preserve battery life.'
        ],
        diagram: {
          type: 'comm_tree',
          title: 'Family Communication Tree Architecture',
          caption: 'Family members -> Text single out-of-area contact -> Centralized status updates.'
        },
        checkpoint: {
          question: 'Why should you send SMS text messages instead of attempting voice calls during disaster network overload?',
          options: [
            'Voice calls cost more',
            'Text messages use minimal bandwidth and can slip through microsecond network openings when voice calls fail',
            'Text messages transmit faster than the speed of light',
            'Cell companies disable all voice capability'
          ],
          correctAnswerIndex: 1,
          explanation: 'Short SMS packets take milliseconds to route and will automatically retry in the background.'
        }
      },
      {
        id: 'fp-l2',
        title: 'Safeguarding Elderly & Mobility-Impaired Relatives',
        duration: '6 min',
        content: `Family members with limited mobility, sensory impairments, or cognitive conditions (e.g. dementia) face unique life-safety challenges during evacuations.
        
Establish a **Personal Support Network** of at least three trusted neighbors or coworkers who have duplicate keys and agreed-upon evacuation assignments.`,
        practicalSteps: [
          'Keep mobility aids (walkers, wheelchairs, cane, spare glasses, hearing aid batteries) right beside their bed.',
          'Store an emergency "Go-Bag" attached directly to the wheelchair frame.',
          'Post a clear medical sheet on the refrigerator listing: diagnoses, allergies, and emergency contacts.',
          'Register with the local emergency dispatch or fire department’s Vulnerable Persons Registry.'
        ],
        diagram: {
          type: 'mobility_support',
          title: 'Mobility Continuity Protocol',
          caption: 'Bedside mobility aids + Wheelchair emergency pack + Refrigerator medical information.'
        },
        checkpoint: {
          question: 'What is a "Vulnerable Persons Registry" maintained by local emergency services?',
          options: [
            'A database of tax records',
            'An official registry where individuals with special medical or mobility needs register for priority evacuation',
            'A list of hospital doctors',
            'A retirement community directory'
          ],
          correctAnswerIndex: 1,
          explanation: 'Registries notify first responders of citizens requiring power for oxygen or physical evacuation assistance.'
        }
      },
      {
        id: 'fp-l3',
        title: 'Prescription Medication Reserves & Cold-Chain Storage',
        duration: '5 min',
        content: `Disruptions to pharmacy supply chains can take weeks to restore.
        
Maintain a rolling **14 to 30-day reserve** of all essential daily prescription medications (heart medications, inhalers, seizure drugs, psychiatric medications).
For temperature-sensitive medications like **insulin**: store in a dedicated insulated travel pouch with reusable frozen gel packs.`,
        practicalSteps: [
          'Rotate prescription reserves continuously: use the oldest medication and restock with the new monthly refill.',
          'Keep paper copies of all active prescriptions and physician contact numbers in your waterproof pouch.',
          'For insulin: Do not freeze! Keep between 2°C and 8°C (36°F to 46°F); once opened, insulin lasts 28 days at room temp (below 30°C).',
          'Pack manual blood glucose monitors with spare batteries.'
        ],
        diagram: {
          type: 'insulin_cold_pack',
          title: 'Cold-Chain Medication Transport',
          caption: 'Insulated medical pouch with ice gel packs maintains 2-8°C without freezing insulin vials.'
        },
        checkpoint: {
          question: 'How should a family maintain a 30-day emergency supply of daily prescription medications?',
          options: [
            'Buy expired medicines from the internet',
            'Rotate stock by taking medications from the emergency reserve and replacing them with fresh monthly refills',
            'Stop taking medications during winter',
            'Double the daily dose'
          ],
          correctAnswerIndex: 1,
          explanation: 'Rolling rotation ensures the emergency medication reserve never expires.'
        }
      },
      {
        id: 'fp-l4',
        title: 'Conducting Bi-Annual Family Drills',
        duration: '6 min',
        content: `A plan written on paper that has never been practiced will fail under real emergency stress.
        
Conduct realistic, unannounced family drills twice a year (e.g. spring and autumn):
1. Test your smoke alarms and practice crawl-low escape.
2. Execute a simulated 15-minute car evacuation drill.
3. Verify children know how to dial 112 and state their home address clearly.`,
        practicalSteps: [
          'Test all home smoke alarms and carbon monoxide detectors on the first of every month.',
          'Practice blindfolded or in the dark to simulate smoke-filled rooms.',
          'Teach children how to recite their full name, parents’ names, home address, and primary phone number.',
          'Review utility shutoff valves (gas, water, electricity) with all teenagers and adults.'
        ],
        diagram: {
          type: 'drill_schedule',
          title: 'Bi-Annual Family Readiness Cycle',
          caption: 'Spring: Wildfire/Flood drill + smoke alarm test. Autumn: Earthquake drill + Go-bag rotation.'
        },
        checkpoint: {
          question: 'What critical personal information should every school-aged child be able to recite without a phone?',
          options: [
            'Their favorite movie title',
            'Their full name, parent’s full name, home street address, and emergency phone number',
            'The name of their pet',
            'Their social media handle'
          ],
          correctAnswerIndex: 1,
          explanation: 'First responders and relief shelters require exact child identification and parental contact to reunite families.'
        }
      }
    ],
    quiz: [
      {
        question: 'When should family members communicate via voice calls vs SMS text messages during a disaster?',
        options: [
          'Always use voice calls',
          'Use SMS text messages because they use minimal network bandwidth and queue automatically',
          'Never use phones at all',
          'Only communicate via social media livestreams'
        ],
        correctAnswerIndex: 1,
        explanation: 'SMS text packets slip through congested cell towers when voice circuits are totally overwhelmed.'
      },
      {
        question: 'How long can un-refrigerated opened insulin typically remain safe if kept away from extreme heat (below 30°C)?',
        options: [
          '1 hour',
          'Up to 28 days',
          '6 months',
          'Insulin spoils within 5 minutes outside a fridge'
        ],
        correctAnswerIndex: 1,
        explanation: 'Opened insulin remains chemically stable at moderate room temperatures for up to 28 days.'
      },
      {
        question: 'How often should a family review and physically practice their evacuation escape plan?',
        options: [
          'Once every 10 years',
          'At least twice a year (bi-annually)',
          'Only after a disaster has already struck',
          'Never'
        ],
        correctAnswerIndex: 1,
        explanation: 'Practicing twice yearly builds muscle memory so actions are automatic under panic and adrenaline.'
      },
      {
        question: 'What does programming an "ICE" contact in a smartphone provide?',
        options: [
          'Cooling system controls',
          'Designates an "In Case of Emergency" contact easily identifiable by first responders even on locked phones',
          'Freezes fraudulent credit cards',
          'Connects to the weather radar'
        ],
        correctAnswerIndex: 1,
        explanation: 'Paramedics look for ICE contacts to identify incapacitated casualties and notify immediate kin.'
      }
    ]
  },

  // =========================================================================
  // 15. RESCUE AND SURVIVAL BASICS
  // =========================================================================
  {
    id: 'rescue-survival-basics',
    title: 'Search, Rescue & Wilderness Survival Basics',
    category: 'first_aid',
    duration: '22 min',
    difficulty: 'Advanced',
    points: 150,
    badge: {
      id: 'badge-wilderness-survivor',
      title: 'Wilderness Survival Pioneer',
      icon: 'ShieldAlert',
      description: 'Mastered signaling mirror flashes, 3-whistle distress codes, emergency shelters, and survival knots.'
    },
    description: 'Learn wilderness survival priorities, optical and acoustic rescue signaling, debris hut construction, thermal insulation, and fundamental rescue knots.',
    learningObjectives: [
      'Apply the "Rule of Threes" for human survival prioritization.',
      'Signal rescue aircraft using 3-whistle blasts, ground markers, and signal mirrors.',
      'Construct a thermal debris survival shelter against hypothermia.',
      'Tie essential rescue and securing knots (bowline, figure-eight, taut-line hitch).'
    ],
    lessons: [
      {
        id: 'rs-l1',
        title: 'The Rule of Threes: Survival Prioritization',
        duration: '5 min',
        content: `Survival psychology requires ruthless prioritization under extreme stress.
        
Remember the universal **Rule of Threes**:
• **3 Minutes** without oxygen (or in freezing water).
• **3 Hours** without thermal shelter in harsh environmental extremes (hypothermia/hyperthermia).
• **3 Days** without clean drinking water.
• **3 Weeks** without caloric food.
Always prioritize shelter and thermal regulation before searching for food!`,
        practicalSteps: [
          'Prioritize: Air -> Thermal Shelter -> Clean Water -> Food.',
          'Never spend energy hunting for food during the first 24 hours of being stranded.',
          'Prevent hypothermia: stay dry and insulate your body from cold ground contact.',
          'Conserve energy and stay with your vehicle or marked crash site whenever possible.'
        ],
        diagram: {
          type: 'rule_of_threes',
          title: 'The Survival Rule of Threes',
          caption: '3 Min (Oxygen) -> 3 Hours (Shelter) -> 3 Days (Water) -> 3 Weeks (Food).'
        },
        checkpoint: {
          question: 'According to the Rule of Threes, which of the following is the most urgent priority in cold wilderness conditions?',
          options: [
            'Hunting for wild animals to eat',
            'Finding thermal shelter to prevent lethal hypothermia within 3 hours',
            'Searching for berries',
            'Digging for deep roots'
          ],
          correctAnswerIndex: 1,
          explanation: 'Hypothermia kills within 3 hours in wet, cold environments; shelter takes priority over water and food.'
        }
      },
      {
        id: 'rs-l2',
        title: 'Emergency Signaling: Acoustic & Optical Techniques',
        duration: '6 min',
        content: `Search and Rescue (SAR) aircraft and ground teams search vast geographical grids. You must make yourself noticeable across long distances.
        
• **The Universal Distress Code is THREE of anything:** 3 whistle blasts, 3 fires in a triangle, or 3 mirror flashes.
• **Signal Mirror (Heliograph):** Can be seen by aircraft pilots over **30 km (20 miles)** away on sunny days! Aim by looking through the center sight-hole at your outstretched target fingers.`,
        practicalSteps: [
          'Whistle: Blow 3 sharp blasts, pause for 10 seconds, repeat. (Human whistles carry 3x farther than human shouts).',
          'Signal Mirror: Catch sunlight on the mirror face, reflect beam onto your hand, sweep across horizon.',
          'Ground-to-Air Signals: Create large "X" (unable to proceed) or "V" (require assistance) with logs or stones (minimum 3 meters long).',
          'Night signaling: Use strobe lights or flashlights in groups of three pulses.'
        ],
        diagram: {
          type: 'heliograph_signaling',
          title: 'Signal Mirror & Ground-to-Air "V" and "X"',
          caption: 'Aim mirror through sight hole. "X" on ground = Unable to proceed; "V" = Require assistance.'
        },
        checkpoint: {
          question: 'What is the international emergency distress signal when using an emergency whistle?',
          options: [
            'One long continuous blast until out of breath',
            'Three short, sharp blasts with a periodic pause',
            'Ten rapid chirps',
            'Two long whistles'
          ],
          correctAnswerIndex: 1,
          explanation: 'Any group of THREE repeating signals (blasts, flashes, fires) is universally recognized as distress.'
        }
      },
      {
        id: 'rs-l3',
        title: 'Emergency Shelter: The Debris Hut',
        duration: '6 min',
        content: `When stranded without a tent, the **Debris Hut** provides critical survival insulation. The earth beneath you absorbs body heat through conductive cooling faster than the surrounding air.
        
A debris hut consists of a sturdy ridgepole, rib sticks along the sides, and at least **2 to 3 feet (1 meter)** of dry leaves, pine needles, or moss piled over the frame to trap insulating dead-air spaces.`,
        practicalSteps: [
          'Build an insulating ground mattress at least 1 foot thick of dry leaves and pine needles before building walls.',
          'Prop a sturdy ridgepole on a tree stump or sturdy tripod.',
          'Lean rib sticks along the ridgepole at a 45-degree angle.',
          'Pile thick layers of dry debris (leaves, moss) over the frame until daylight cannot penetrate.',
          'Plug the entrance with a bag of leaves once you crawl inside.'
        ],
        diagram: {
          type: 'debris_hut',
          title: 'The Debris Survival Hut',
          caption: 'Ridgepole + 45° ribbing + 1m of dry leaf insulation. Crucial: 30cm ground bed mattress.'
        },
        checkpoint: {
          question: 'What is the most critical component of an emergency debris survival shelter in cold weather?',
          options: [
            'A wide open window',
            'A thick ground mattress of dry leaves/twigs to insulate your body against conductive ground heat loss',
            'A high chimney',
            'A decorated doorway'
          ],
          correctAnswerIndex: 1,
          explanation: 'The cold ground conducts heat away from the human body rapidly; ground insulation prevents hypothermia.'
        }
      },
      {
        id: 'rs-l4',
        title: 'Essential Survival Knots: Bowline and Figure-Eight',
        duration: '5 min',
        content: `Knowing how to tie three reliable knots allows you to secure tarps, hoist gear, and create rescue lifelines:
        
1. **Bowline ("King of Knots"):** Creates a secure, non-slip loop at the end of a rope that will never jam under heavy load and is easily untied after rescue.
2. **Figure-Eight on a Bight:** The standard rock-climbing and rescue anchor knot.
3. **Taut-Line Hitch:** An adjustable friction hitch that allows tightening or loosening tent guy-lines.`,
        practicalSteps: [
          'Practice tying the Bowline: "The rabbit comes out of the hole, goes around the tree, and back down the hole."',
          'Always tie an "overhand safety stopper knot" at the working tail of life-safety knots.',
          'Inspect ropes regularly for fraying, mildew, and chemical degradation.',
          'Never use climbing ropes for towing vehicles or lifting heavy machinery.'
        ],
        diagram: {
          type: 'rescue_knots',
          title: 'The Bowline & Figure-Eight Knot',
          caption: 'Bowline: Non-slip loop for rescue lines. Figure-Eight: High-strength anchor loop.'
        },
        checkpoint: {
          question: 'Why is the Bowline knot widely known as the "King of Knots" for rescue operations?',
          options: [
            'It was invented by royalty',
            'It creates a secure loop that does not slip or tighten around a person, and will not jam under heavy loads',
            'It can only be untied with a sharp knife',
            'It glows in the dark'
          ],
          correctAnswerIndex: 1,
          explanation: 'The bowline maintains loop diameter under extreme tension without jamming or tightening on a casualty.'
        }
      }
    ],
    quiz: [
      {
        question: 'What does the Rule of Threes state regarding human survival without water in average conditions?',
        options: [
          '3 minutes',
          '3 hours',
          'Approximately 3 days',
          '3 weeks'
        ],
        correctAnswerIndex: 2,
        explanation: 'Dehydration causes delirium and organ failure after roughly 3 to 4 days without water.'
      },
      {
        question: 'How far away can a properly aimed glass signaling mirror be spotted by an aircraft pilot on a clear day?',
        options: [
          '500 meters',
          '2 kilometers',
          'Over 30 kilometers (20 miles)',
          'Only from 50 feet away'
        ],
        correctAnswerIndex: 2,
        explanation: 'The intense, concentrated optical flash of a heliograph signal mirror is visible over 30+ km away.'
      },
      {
        question: 'What does a large ground-to-air "V" symbol constructed of stones or branches indicate to search aircraft?',
        options: [
          'Victory',
          'Require assistance / Help needed',
          'All is well',
          'Landing zone confirmed'
        ],
        correctAnswerIndex: 1,
        explanation: 'In international search and rescue ground-to-air codes, "V" signifies "Require Assistance".'
      },
      {
        question: 'Which knot is universally recommended for creating an unyielding, non-jamming rescue loop around an individual?',
        options: [
          'Granny knot',
          'Shoelace knot',
          'Bowline',
          'Overhand slip knot'
        ],
        correctAnswerIndex: 2,
        explanation: 'The bowline creates a strong loop that will not constrict around a victim’s chest or jam under load.'
      }
    ]
  }
];

export const ACADEMY_ACHIEVEMENTS = [
  {
    id: 'badge-first-lesson',
    title: 'First Responder Novice',
    icon: 'Award',
    description: 'Completed your first interactive lesson in DisasterChain Academy.',
    category: 'starter'
  },
  {
    id: 'badge-streak-3',
    title: 'Preparedness Momentum',
    icon: 'Flame',
    description: 'Maintained a 3-day learning streak in disaster readiness.',
    category: 'streak'
  },
  {
    id: 'badge-streak-7',
    title: 'Emergency Resilient',
    icon: 'Zap',
    description: 'Completed a 7-day daily learning streak in safety training.',
    category: 'streak'
  },
  {
    id: 'badge-quiz-ace',
    title: 'Master Evaluator',
    icon: 'CheckCircle',
    description: 'Achieved a perfect 100% score on any course final quiz.',
    category: 'quiz'
  },
  {
    id: 'badge-natural-guardian',
    title: 'Forces of Nature Veteran',
    icon: 'ShieldAlert',
    description: 'Mastered Earthquake, Flood, and Cyclone safety courses.',
    category: 'category_completion'
  },
  {
    id: 'badge-life-saver',
    title: 'Certified Life Saver',
    icon: 'HeartPulse',
    description: 'Mastered Hands-Only CPR, bleeding control, and recovery position.',
    category: 'course'
  },
  {
    id: 'badge-fire-marshall',
    title: 'Fire Safety Marshall',
    icon: 'Flame',
    description: 'Mastered the PASS extinguisher technique and crawl-low smoke safety.',
    category: 'course'
  },
  {
    id: 'badge-flood-defender',
    title: 'Flood Defender',
    icon: 'Droplets',
    description: 'Mastered swiftwater hazards, the 6-inch rule, and electrical flood safety.',
    category: 'course'
  },
  {
    id: 'badge-earthquake-master',
    title: 'Earthquake Survivor',
    icon: 'Activity',
    description: 'Mastered Drop, Cover, Hold On and post-tremor building evacuation.',
    category: 'course'
  },
  {
    id: 'badge-academy-graduate',
    title: 'Academy Grand Scholar',
    icon: 'GraduationCap',
    description: 'Completed 10 or more comprehensive disaster safety courses.',
    category: 'mastery'
  }
];
