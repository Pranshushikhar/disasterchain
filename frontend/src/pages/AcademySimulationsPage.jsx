import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Activity,
  Droplets,
  Flame,
  Wind,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Award,
  Play,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { DISASTER_SIMULATIONS } from '../data/disasterSimulations';
import { useTranslation } from '../i18n/i18n';

export default function AcademySimulationsPage() {
  const { t } = useTranslation();
  const [selectedSim, setSelectedSim] = useState(DISASTER_SIMULATIONS[0]);
  const [currentStepId, setCurrentStepId] = useState('step-1');
  const [history, setHistory] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showConsequence, setShowConsequence] = useState(false);

  const startSimulation = (sim) => {
    setSelectedSim(sim);
    setCurrentStepId(sim.initialScenario.stepId);
    setHistory([]);
    setTotalScore(0);
    setSelectedOption(null);
    setShowConsequence(false);
  };

  // Determine current active scenario step object
  const currentStep =
    currentStepId === selectedSim.initialScenario.stepId
      ? selectedSim.initialScenario
      : selectedSim.steps[currentStepId];

  const handleOptionSelect = (option) => {
    if (showConsequence) return;
    setSelectedOption(option);
    setShowConsequence(true);
    setTotalScore((prev) => prev + (option.points || 0));
    setHistory((prev) => [...prev, { stepTitle: currentStep.title, option }]);
  };

  const handleProceedNext = () => {
    if (!selectedOption) return;
    const nextId = selectedOption.nextStepId;
    setCurrentStepId(nextId);
    setSelectedOption(null);
    setShowConsequence(false);
  };

  const handleRestart = () => {
    setCurrentStepId(selectedSim.initialScenario.stepId);
    setHistory([]);
    setTotalScore(0);
    setSelectedOption(null);
    setShowConsequence(false);
  };

  const getDisasterIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'earthquake':
        return <Activity size={22} className="dc-sim-icon-earthquake" />;
      case 'flood':
        return <Droplets size={22} className="dc-sim-icon-flood" />;
      case 'fire':
        return <Flame size={22} className="dc-sim-icon-fire" />;
      case 'cyclone':
        return <Wind size={22} className="dc-sim-icon-cyclone" />;
      default:
        return <ShieldAlert size={22} />;
    }
  };

  return (
    <div className="dc-academy-sim-page">
      {/* Simulation Header */}
      <header className="dc-sim-page-header">
        <Link to="/academy" className="dc-back-link">
          <ArrowLeft size={16} />
          <span>Back to Academy Dashboard</span>
        </Link>
        <div className="dc-sim-title-group">
          <span className="dc-sim-badge-tag">INTERACTIVE BRANCHING SCENARIOS</span>
          <h1 className="dc-sim-main-heading">Disaster Decision Simulations</h1>
          <p className="dc-sim-sub-text">
            Immerse yourself in realistic emergency scenarios where every split-second choice has consequences. Learn cause-and-effect safely.
          </p>
        </div>

        {/* Explicit Educational Disclaimer Banner */}
        <div className="dc-sim-safety-disclaimer" role="alert">
          <ShieldAlert size={18} className="dc-disclaimer-icon" />
          <span>
            <strong>TRAINING SIMULATION ONLY:</strong> Scenarios below are educational exercises designed for emergency preparedness practice. They do not reflect live active disaster dispatches.
          </span>
        </div>
      </header>

      {/* Simulator Workspace */}
      <div className="dc-sim-workspace-layout">
        {/* Left Column: Scenario Selector */}
        <aside className="dc-sim-selector-panel">
          <h3 className="dc-panel-heading">Select Scenario</h3>
          <div className="dc-sim-list">
            {DISASTER_SIMULATIONS.map((sim) => {
              const isSelected = selectedSim.id === sim.id;
              return (
                <button
                  key={sim.id}
                  onClick={() => startSimulation(sim)}
                  className={`dc-sim-card-btn ${isSelected ? 'selected' : ''}`}
                >
                  <div className="dc-sim-card-icon-box">{getDisasterIcon(sim.disasterType)}</div>
                  <div className="dc-sim-card-info">
                    <span className="dc-sim-card-title">{sim.title}</span>
                    <div className="dc-sim-card-meta">
                      <span>{sim.difficulty}</span>
                      <span>•</span>
                      <span>{sim.estimatedTime}</span>
                      <span>•</span>
                      <span className="dc-sim-card-pts">+{sim.points} XP</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Column: Interactive Stage */}
        <main className="dc-sim-stage-viewport">
          <div className="dc-sim-viewport-header">
            <div className="dc-sim-active-title">
              {getDisasterIcon(selectedSim.disasterType)}
              <h2>{selectedSim.title}</h2>
            </div>
            <div className="dc-sim-score-counter">
              <Award size={16} />
              <span>Score: <strong>{totalScore} XP</strong></span>
            </div>
          </div>

          {currentStep && (
            <div className="dc-sim-step-container">
              {/* Scenario Context */}
              <div className="dc-sim-step-prompt-box">
                <span className="dc-step-counter-tag">{currentStep.title}</span>
                <p className="dc-step-scenario-text">{currentStep.scenario}</p>
              </div>

              {/* Branch Options OR Terminal Outcome */}
              {!currentStep.isTerminal ? (
                <div className="dc-sim-options-zone">
                  <h4 className="dc-options-prompt-label">What is your immediate action?</h4>
                  <div className="dc-sim-options-stack">
                    {currentStep.options?.map((opt) => {
                      const isChosen = selectedOption?.id === opt.id;
                      let btnStateClass = '';
                      if (showConsequence) {
                        if (isChosen) {
                          btnStateClass = opt.isSafe ? 'safe-chosen' : 'danger-chosen';
                        } else {
                          btnStateClass = 'dimmed';
                        }
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={showConsequence}
                          onClick={() => handleOptionSelect(opt)}
                          className={`dc-sim-action-option-btn ${btnStateClass}`}
                        >
                          <span className="dc-action-bullet">
                            <ChevronRight size={16} />
                          </span>
                          <span className="dc-action-text">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Consequence Reveal Box */}
                  <AnimatePresence>
                    {showConsequence && selectedOption && (
                      <motion.div
                        className={`dc-sim-consequence-card ${selectedOption.isSafe ? 'safe' : 'danger'}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="dc-consequence-headline">
                          {selectedOption.isSafe ? (
                            <>
                              <CheckCircle size={20} className="dc-icon-safe" />
                              <span>Safe Strategic Choice (+{selectedOption.points} XP)</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={20} className="dc-icon-danger" />
                              <span>Hazardous Action (0 XP)</span>
                            </>
                          )}
                        </div>
                        <p className="dc-consequence-details">{selectedOption.consequence}</p>

                        <button
                          type="button"
                          onClick={handleProceedNext}
                          className="dc-btn dc-btn-primary dc-proceed-btn"
                        >
                          <span>Proceed to Next Phase</span>
                          <ChevronRight size={16} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* TERMINAL OUTCOME: FAILURE OR SUCCESS */
                <div className={`dc-sim-terminal-screen ${currentStep.passed ? 'success' : 'failure'}`}>
                  <div className="dc-terminal-icon-box">
                    {currentStep.passed ? (
                      <CheckCircle size={48} className="dc-terminal-success-icon" />
                    ) : (
                      <AlertTriangle size={48} className="dc-terminal-fail-icon" />
                    )}
                  </div>

                  <h3 className="dc-terminal-headline">
                    {currentStep.passed ? 'Mission Succeeded!' : 'Simulation Failed'}
                  </h3>
                  <p className="dc-terminal-explanation">{currentStep.explanation}</p>

                  <div className="dc-terminal-score-box">
                    <span>Final Training Score:</span>
                    <strong>{totalScore} XP</strong>
                  </div>

                  <div className="dc-terminal-controls">
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="dc-btn dc-btn-primary"
                    >
                      <RotateCcw size={16} />
                      <span>Retry Scenario</span>
                    </button>
                    <Link to="/academy" className="dc-btn dc-btn-secondary">
                      Return to Courses
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
