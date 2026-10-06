import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  CloudRain,
  CloudLightning,
  Moon,
  CloudSnow,
  Cloud,
  Check,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEnvironment, ENVIRONMENTS } from '../context/EnvironmentContext';

const getEnvIcon = (id, size = 15) => {
  switch (id) {
    case 'rain':
      return <CloudRain size={size} />;
    case 'storm':
      return <CloudLightning size={size} />;
    case 'night':
      return <Moon size={size} />;
    case 'snow':
      return <CloudSnow size={size} />;
    case 'fog':
      return <Cloud size={size} />;
    default:
      return <Sun size={size} />;
  }
};

export default function EnvironmentSelector({ compact = false }) {
  const {
    environment,
    setEnvironment,
    currentMeta,
    isTransitioning,
    isSoundEnabled,
    toggleSound,
  } = useEnvironment();

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="dc-env-selector-wrap" ref={panelRef} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        type="button"
        id="dc-env-selector-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={`Living Environment: ${currentMeta.label}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: compact ? 4 : 7,
          background: 'var(--dc-surface, #F8F5EE)',
          border: '1px solid var(--border-subtle, rgba(30, 39, 37, 0.12))',
          borderRadius: 999,
          padding: compact ? '6px 10px' : '6px 14px',
          cursor: 'pointer',
          color: 'var(--dc-text, #1E2725)',
          fontSize: '0.78rem',
          fontWeight: 600,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-strong, rgba(73, 107, 90, 0.35))';
          e.currentTarget.style.backgroundColor = 'var(--dc-surface-2, #EFE9DC)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle, rgba(30, 39, 37, 0.12))';
          e.currentTarget.style.backgroundColor = 'var(--dc-surface, #F8F5EE)';
        }}
      >
        <span
          style={{
            color: currentMeta.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.3s ease',
            transform: isTransitioning ? 'scale(1.15) rotate(10deg)' : 'scale(1)',
          }}
        >
          {getEnvIcon(environment, 14)}
        </span>

        {!compact && (
          <span style={{ letterSpacing: '0.01em', textTransform: 'capitalize' }}>
            {currentMeta.shortLabel}
          </span>
        )}

        <span
          style={{
            fontSize: '0.62rem',
            color: 'var(--dc-text-muted, #8C938E)',
            marginLeft: 2,
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▼
        </span>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 290,
              maxWidth: '92vw',
              backgroundColor: 'var(--dc-elevated, #FFFDF8)',
              border: '1px solid var(--border-medium, rgba(30, 39, 37, 0.14))',
              borderRadius: 14,
              padding: '12px 8px',
              boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.18)',
              zIndex: 9999,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '4px 10px 8px 10px',
                borderBottom: '1px solid var(--border-subtle, rgba(30, 39, 37, 0.08))',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--dc-text-muted, #8C938E)',
                }}
              >
                LIVING ENVIRONMENT
              </div>
              <div
                style={{
                  fontSize: '0.64rem',
                  color: 'var(--dc-earth-green, #496B5A)',
                  fontWeight: 600,
                }}
              >
                Interactive
              </div>
            </div>

            {/* List of Environments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {ENVIRONMENTS.map((item) => {
                const isSelected = item.id === environment;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-env-id={item.id}
                    onClick={() => {
                      setEnvironment(item.id);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: 'none',
                      background: isSelected
                        ? 'var(--dc-surface-2, #EFE9DC)'
                        : 'transparent',
                      color: 'var(--dc-text, #1E2725)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor =
                          'var(--dc-surface, #F8F5EE)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        backgroundColor: isSelected ? item.color + '26' : 'var(--dc-surface, #F8F5EE)',
                        color: item.color,
                        flexShrink: 0,
                      }}
                    >
                      {getEnvIcon(item.id, 15)}
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.80rem',
                          fontWeight: isSelected ? 700 : 600,
                          color: 'var(--dc-text, #1E2725)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span>{item.label}</span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.67rem',
                          color: 'var(--dc-text-secondary, #65706B)',
                          lineHeight: 1.25,
                          marginTop: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.description}
                      </div>
                    </div>

                    {isSelected && (
                      <span style={{ color: 'var(--dc-earth-green, #496B5A)', flexShrink: 0 }}>
                        <Check size={14} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Ambient Sound Toggle */}
            <div
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: '1px solid var(--border-subtle, rgba(30, 39, 37, 0.08))',
              }}
            >
              <button
                type="button"
                onClick={toggleSound}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: isSoundEnabled
                    ? 'rgba(73, 107, 90, 0.1)'
                    : 'transparent',
                  color: 'var(--dc-text, #1E2725)',
                  cursor: 'pointer',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isSoundEnabled ? (
                    <Volume2 size={14} color="var(--dc-earth-green, #496B5A)" />
                  ) : (
                    <VolumeX size={14} color="var(--dc-text-muted, #8C938E)" />
                  )}
                  <span>Ambient Audio Synthesizer</span>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: isSoundEnabled
                      ? 'var(--dc-earth-green, #496B5A)'
                      : 'var(--dc-text-muted, #8C938E)',
                    fontWeight: 700,
                  }}
                >
                  {isSoundEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
