import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

/**
 * DISASTERCHAIN LIVING ENVIRONMENT THEME SYSTEM
 * 
 * Centralized environmental state powering atmospheric rendering,
 * color grading, tactile sound synthesis, and real-time environmental context.
 * 
 * Supported Environments:
 * - CALM: Earth & paper aesthetic, warm sunlight, tranquil dust motes, gentle breeze.
 * - RAIN: Cool overcast, multi-depth rain streaks, wet surfaces, muted tones.
 * - STORM: Dark storm clouds, heavy wind, rare distant horizon lightning.
 * - NIGHT: Deep navy/charcoal nocturne, moonlight highlights, subtle stars.
 * - SNOW: Cool frost-slate, multi-scale fluttering snowflakes, depth-of-field mist.
 * - FOG: Volumetric rolling fog bands, ethereal low contrast, sepia-sage haze.
 */

const EnvironmentContext = createContext(null);

const STORAGE_KEY = 'disasterchain_environment_theme';
const SOUND_KEY = 'disasterchain_ambient_sound_enabled';

export const ENVIRONMENTS = [
  {
    id: 'calm',
    label: 'Calm Earth',
    shortLabel: 'Calm',
    iconName: 'sun',
    color: '#D8B98A',
    description: 'Tranquil parchment atmosphere, warm ambient sunlight and gentle wind.',
  },
  {
    id: 'rain',
    label: 'Precipitation',
    shortLabel: 'Rain',
    iconName: 'cloud-rain',
    color: '#5D8990',
    description: 'Multi-layer rainfall, wet reflective surfaces, overcast slate grading.',
  },
  {
    id: 'storm',
    label: 'Severe Storm',
    shortLabel: 'Storm',
    iconName: 'cloud-lightning',
    color: '#8A9BA8',
    description: 'Dark atmospheric clouds, driving wind, rare distant horizon lightning.',
  },
  {
    id: 'night',
    label: 'Nocturnal',
    shortLabel: 'Night',
    iconName: 'moon',
    color: '#7B96B2',
    description: 'Deep navy/charcoal darkness, moonlight highlights, clear night sky.',
  },
  {
    id: 'snow',
    label: 'Alpine Snow',
    shortLabel: 'Snow',
    iconName: 'cloud-snow',
    color: '#A8C5D8',
    description: 'Crisp frosted air, floating depth snowflakes, cool crystalline haze.',
  },
  {
    id: 'fog',
    label: 'Coastal Fog',
    shortLabel: 'Fog',
    iconName: 'cloud',
    color: '#A39B8B',
    description: 'Volumetric rolling mist, low contrast atmospheric perspective.',
  },
];

export const EnvironmentProvider = ({ children }) => {
  const [environment, setEnvironmentState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && ENVIRONMENTS.some((e) => e.id === saved)) {
        return saved;
      }
    } catch (e) {}
    return 'calm';
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(1);
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem(SOUND_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  const audioCtxRef = useRef(null);
  const audioNodesRef = useRef({ masterGain: null, noiseNode: null, filterNode: null });

  // Update HTML data-environment attribute when environment changes
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-environment', environment);
      localStorage.setItem(STORAGE_KEY, environment);
    } catch (e) {}
  }, [environment]);

  // Set environment with smooth 1.5s visual transition
  const setEnvironment = useCallback(
    (newEnv) => {
      if (!ENVIRONMENTS.some((e) => e.id === newEnv) || newEnv === environment) {
        return;
      }
      setIsTransitioning(true);
      setTransitionProgress(0);

      const startTime = performance.now();
      const duration = 1400;

      const animateTransition = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        setTransitionProgress(progress);

        if (progress < 1) {
          requestAnimationFrame(animateTransition);
        } else {
          setEnvironmentState(newEnv);
          setIsTransitioning(false);
          setTransitionProgress(1);
        }
      };

      // Set target immediately so CSS can start transitioning variables
      setEnvironmentState(newEnv);
      requestAnimationFrame(animateTransition);
    },
    [environment]
  );

  // Procedural Web Audio Ambient Sound (0 external files, 100% browser compliant, default OFF)
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master Gain
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, ctx.currentTime);
      master.connect(ctx.destination);
      audioNodesRef.current.masterGain = master;

      // Pink Noise Generator for atmospheric wind / rain / rumble
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Bandpass / Lowpass filter for smooth organic air
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(master);
      noiseSource.start();

      audioNodesRef.current.noiseNode = noiseSource;
      audioNodesRef.current.filterNode = filter;
    } catch (e) {
      console.warn('[DisasterChain Audio] Web Audio not initialized:', e);
    }
  }, []);

  // Update audio filter according to environment
  useEffect(() => {
    const ctx = audioCtxRef.current;
    const { masterGain, filterNode } = audioNodesRef.current;
    if (!ctx || !masterGain || !filterNode) return;

    if (!isSoundEnabled) {
      masterGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4);
      return;
    }

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Adapt sound texture per environment
    if (environment === 'rain') {
      filterNode.type = 'bandpass';
      filterNode.frequency.setTargetAtTime(950, ctx.currentTime, 0.6);
      masterGain.gain.setTargetAtTime(0.07, ctx.currentTime, 0.6);
    } else if (environment === 'storm') {
      filterNode.type = 'lowpass';
      filterNode.frequency.setTargetAtTime(450, ctx.currentTime, 0.6);
      masterGain.gain.setTargetAtTime(0.12, ctx.currentTime, 0.6);
    } else if (environment === 'fog') {
      filterNode.type = 'lowpass';
      filterNode.frequency.setTargetAtTime(220, ctx.currentTime, 0.6);
      masterGain.gain.setTargetAtTime(0.04, ctx.currentTime, 0.6);
    } else if (environment === 'night') {
      filterNode.type = 'lowpass';
      filterNode.frequency.setTargetAtTime(180, ctx.currentTime, 0.6);
      masterGain.gain.setTargetAtTime(0.025, ctx.currentTime, 0.6);
    } else if (environment === 'snow') {
      filterNode.type = 'highpass';
      filterNode.frequency.setTargetAtTime(1200, ctx.currentTime, 0.6);
      masterGain.gain.setTargetAtTime(0.02, ctx.currentTime, 0.6);
    } else {
      // Calm
      filterNode.type = 'lowpass';
      filterNode.frequency.setTargetAtTime(280, ctx.currentTime, 0.6);
      masterGain.gain.setTargetAtTime(0.03, ctx.currentTime, 0.6);
    }
  }, [environment, isSoundEnabled]);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_KEY, String(next));
      } catch (e) {}
      if (next) {
        initAudio();
      }
      return next;
    });
  }, [initAudio]);

  const currentMeta = ENVIRONMENTS.find((e) => e.id === environment) || ENVIRONMENTS[0];

  const value = {
    environment,
    setEnvironment,
    environments: ENVIRONMENTS,
    currentMeta,
    isTransitioning,
    transitionProgress,
    isSoundEnabled,
    toggleSound,
    initAudio,
  };

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};

export default EnvironmentContext;
