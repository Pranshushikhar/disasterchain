import React from 'react';
import {
  Shield,
  Flame,
  Droplets,
  Activity,
  HeartPulse,
  Wind,
  Zap,
  CheckCircle,
  AlertTriangle,
  Compass
} from 'lucide-react';

export default function AcademyDiagram({ diagram }) {
  if (!diagram) return null;

  const renderVisualContent = () => {
    switch (diagram.type) {
      // 1. DROP COVER HOLD
      case 'drop_cover_hold':
        return (
          <div className="dc-diagram-stages">
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box drop">
                <Activity size={24} />
                <span className="dc-stage-badge">STEP 1</span>
              </div>
              <h4 className="dc-stage-title">DROP</h4>
              <p className="dc-stage-desc">Drop down onto hands and knees immediately before ground motion throws you.</p>
            </div>

            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box cover">
                <Shield size={24} />
                <span className="dc-stage-badge">STEP 2</span>
              </div>
              <h4 className="dc-stage-title">COVER</h4>
              <p className="dc-stage-desc">Cover head and neck under a sturdy table or desk away from windows.</p>
            </div>

            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box hold">
                <CheckCircle size={24} />
                <span className="dc-stage-badge">STEP 3</span>
              </div>
              <h4 className="dc-stage-title">HOLD ON</h4>
              <p className="dc-stage-desc">Hold firmly to shelter leg with one hand; be prepared to move with it.</p>
            </div>
          </div>
        );

      // 2. PASS FIRE EXTINGUISHER
      case 'pass_technique':
        return (
          <div className="dc-diagram-stages grid-4">
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box fire">
                <span className="dc-pass-letter">P</span>
              </div>
              <h4 className="dc-stage-title">PULL</h4>
              <p className="dc-stage-desc">Pull the safety pin to break the tamper inspection seal.</p>
            </div>
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box fire">
                <span className="dc-pass-letter">A</span>
              </div>
              <h4 className="dc-stage-title">AIM LOW</h4>
              <p className="dc-stage-desc">Aim the nozzle directly at the base of the fuel flames.</p>
            </div>
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box fire">
                <span className="dc-pass-letter">S</span>
              </div>
              <h4 className="dc-stage-title">SQUEEZE</h4>
              <p className="dc-stage-desc">Squeeze the operating lever steadily to release agent.</p>
            </div>
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box fire">
                <span className="dc-pass-letter">S</span>
              </div>
              <h4 className="dc-stage-title">SWEEP</h4>
              <p className="dc-stage-desc">Sweep the nozzle side-to-side across the burning base.</p>
            </div>
          </div>
        );

      // 3. CPR BLS TECHNIQUE
      case 'cpr_technique':
        return (
          <div className="dc-diagram-stages">
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box medical">
                <HeartPulse size={24} />
                <span className="dc-stage-badge">RATE</span>
              </div>
              <h4 className="dc-stage-title">100 - 120 BPM</h4>
              <p className="dc-stage-desc">Compress to the steady rhythm of "Stayin' Alive" without pauses.</p>
            </div>
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box medical">
                <Activity size={24} />
                <span className="dc-stage-badge">DEPTH</span>
              </div>
              <h4 className="dc-stage-title">5 to 6 CM</h4>
              <p className="dc-stage-desc">Push hard 2 inches deep in the center of the breastbone.</p>
            </div>
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box medical">
                <CheckCircle size={24} />
                <span className="dc-stage-badge">RECOIL</span>
              </div>
              <h4 className="dc-stage-title">100% RECOIL</h4>
              <p className="dc-stage-desc">Allow chest to return completely to resting height between pushes.</p>
            </div>
          </div>
        );

      // 4. WATER DEPTH DANGER
      case 'water_depth_physics':
        return (
          <div className="dc-diagram-stages">
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box water">
                <Droplets size={24} />
                <span className="dc-stage-badge">6 INCHES</span>
              </div>
              <h4 className="dc-stage-title">Knocks Adult Down</h4>
              <p className="dc-stage-desc">Swiftwater generates sufficient lateral force to sweep grown adults off their feet.</p>
            </div>
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box water danger">
                <AlertTriangle size={24} />
                <span className="dc-stage-badge">12 INCHES</span>
              </div>
              <h4 className="dc-stage-title">Floats Small Cars</h4>
              <p className="dc-stage-desc">Tire buoyancy lifts passenger vehicles off pavement, causing loss of steering.</p>
            </div>
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box water severe">
                <Droplets size={24} />
                <span className="dc-stage-badge">24 INCHES</span>
              </div>
              <h4 className="dc-stage-title">Sweeps Trucks & SUVs</h4>
              <p className="dc-stage-desc">High volume current sweeps heavy trucks and large SUVs into drainage canals.</p>
            </div>
          </div>
        );

      // 5. SMOKE THERMAL LAYER
      case 'smoke_layer_crawl':
        return (
          <div className="dc-diagram-smoke-visual">
            <div className="dc-smoke-top-zone">
              <Flame size={20} className="dc-smoke-icon" />
              <div className="dc-smoke-zone-text">
                <span className="dc-smoke-title">DANGER ZONE: SUPERHEATED TOXIC SMOKE</span>
                <span className="dc-smoke-detail">Carbon monoxide & hydrogen cyanide collect at ceiling (&gt; 350°C)</span>
              </div>
            </div>
            <div className="dc-smoke-middle-boundary">
              <span className="dc-thermal-line">Descending Thermal Layer Interface</span>
            </div>
            <div className="dc-smoke-bottom-safe">
              <Shield size={20} className="dc-safe-icon" />
              <div className="dc-smoke-zone-text">
                <span className="dc-smoke-title-safe">SAFE CRAWL ZONE (12 to 24 inches off floor)</span>
                <span className="dc-smoke-detail-safe">Coolest, cleanest breathable air with highest oxygen concentration</span>
              </div>
            </div>
          </div>
        );

      // 6. THIRTY THIRTY RULE
      case 'thirty_thirty_rule':
        return (
          <div className="dc-diagram-stages">
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box lightning">
                <Zap size={24} />
                <span className="dc-stage-badge">&lt; 30 SEC</span>
              </div>
              <h4 className="dc-stage-title">FLASH TO BANG</h4>
              <p className="dc-stage-desc">If thunder sounds within 30 seconds of lightning flash, seek enclosed shelter immediately.</p>
            </div>
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box lightning">
                <Shield size={24} />
                <span className="dc-stage-badge">30 MIN</span>
              </div>
              <h4 className="dc-stage-title">WAITING WINDOW</h4>
              <p className="dc-stage-desc">Remain inside for 30 full minutes after the very last roll of thunder before heading out.</p>
            </div>
          </div>
        );

      // 7. RULE OF THREES
      case 'rule_of_threes':
        return (
          <div className="dc-diagram-stages grid-4">
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box survival">
                <Wind size={22} />
                <span className="dc-stage-badge">3 MIN</span>
              </div>
              <h4 className="dc-stage-title">OXYGEN</h4>
              <p className="dc-stage-desc">Air supply or submerged rescue.</p>
            </div>
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box survival">
                <Shield size={22} />
                <span className="dc-stage-badge">3 HOURS</span>
              </div>
              <h4 className="dc-stage-title">SHELTER</h4>
              <p className="dc-stage-desc">Thermal protection from hypothermia.</p>
            </div>
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box survival">
                <Droplets size={22} />
                <span className="dc-stage-badge">3 DAYS</span>
              </div>
              <h4 className="dc-stage-title">WATER</h4>
              <p className="dc-stage-desc">Hydration and electrolyte balance.</p>
            </div>
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box survival">
                <Activity size={22} />
                <span className="dc-stage-badge">3 WEEKS</span>
              </div>
              <h4 className="dc-stage-title">FOOD</h4>
              <p className="dc-stage-desc">Caloric survival intake.</p>
            </div>
          </div>
        );

      // 8. SINKING VEHICLE SWOC
      case 'vehicle_submersion':
        return (
          <div className="dc-diagram-stages grid-4">
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box water">
                <span className="dc-pass-letter">S</span>
              </div>
              <h4 className="dc-stage-title">SEATBELTS</h4>
              <p className="dc-stage-desc">Unbuckle yourself and children immediately.</p>
            </div>
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box water">
                <span className="dc-pass-letter">W</span>
              </div>
              <h4 className="dc-stage-title">WINDOWS</h4>
              <p className="dc-stage-desc">Open or shatter side window before power cuts.</p>
            </div>
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box water">
                <span className="dc-pass-letter">O</span>
              </div>
              <h4 className="dc-stage-title">OUT</h4>
              <p className="dc-stage-desc">Exit immediately; push children out first.</p>
            </div>
            <div className="dc-diagram-stage">
              <div className="dc-stage-icon-box water">
                <span className="dc-pass-letter">C</span>
              </div>
              <h4 className="dc-stage-title">CLIMB</h4>
              <p className="dc-stage-desc">Climb to vehicle roof and await rescue.</p>
            </div>
          </div>
        );

      // DEFAULT DIAGRAM SCHEMATIC
      default:
        return (
          <div className="dc-diagram-default-schematic">
            <div className="dc-schematic-header">
              <Compass size={22} className="dc-schematic-icon" />
              <span>Safety Procedure Reference Model</span>
            </div>
            <div className="dc-schematic-body">
              <p>{diagram.caption || 'Follow authoritative safety sequence systematically.'}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dc-academy-diagram-container" role="region" aria-label={diagram.title || 'Safety Diagram'}>
      <div className="dc-diagram-header">
        <span className="dc-diagram-tag">ILLUSTRATED SAFETY PROTOCOL</span>
        <h3 className="dc-diagram-title">{diagram.title}</h3>
      </div>
      <div className="dc-diagram-body">
        {renderVisualContent()}
      </div>
      {diagram.caption && (
        <div className="dc-diagram-caption">
          <span className="dc-caption-bullet">ℹ️</span>
          <span>{diagram.caption}</span>
        </div>
      )}
    </div>
  );
}
