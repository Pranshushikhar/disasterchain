import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAffectedAreas } from '../services/api';
import DisasterMap from '../components/DisasterMap';
import AreaDetailModal from '../components/AreaDetailModal';
import { useTranslation } from '../i18n/i18n';

const AffectedAreasPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLayer, setActiveLayer] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);

  const loadAreas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAffectedAreas();
      setAreas(data || []);
    } catch (err) {
      console.error('Error fetching affected areas:', err);
      setError('Unable to load disaster zone telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  const filteredAreas = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return areas.filter((a) => {
      const matchesName = a.name?.toLowerCase().includes(q);
      const matchesType = a.disasterType?.toLowerCase().includes(q);
      const matchesDesc = a.description?.toLowerCase().includes(q);
      return matchesName || matchesType || matchesDesc;
    });
  }, [areas, searchQuery]);

  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* 1. Header (Editorial Discipline) */}
      <div
        style={{
          borderBottom: '1px solid rgba(242, 238, 231, 0.08)',
          paddingBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#9B958B',
              marginBottom: '0.35rem',
            }}
          >
            METROPOLITAN GRID
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif, "Newsreader", Georgia, serif)',
              fontSize: '2.25rem',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              color: '#F2EEE7',
              margin: '0 0 0.35rem 0',
              lineHeight: 1.15,
            }}
          >
            Hazard & Relief Infrastructure
          </h1>
          <p style={{ color: '#9B958B', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
            Geospatial tracking of monitored hazard perimeters, relief shelters, and emergency distress signals.
          </p>
        </div>

        {/* 4 Essential Controls: Map Control, Layer Selector, Search, Emergency SOS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* 1. Layer Selector */}
          <select
            value={activeLayer}
            onChange={(e) => setActiveLayer(e.target.value)}
            style={{
              minHeight: '40px',
              padding: '0 0.75rem',
              background: '#191714',
              border: '1px solid rgba(242, 238, 231, 0.12)',
              borderRadius: '3px',
              color: '#F2EEE7',
              fontSize: '0.84rem',
              cursor: 'pointer',
            }}
            aria-label="Map Layer Selection"
          >
            <option value="ALL">All Layers</option>
            <option value="AREAS">Impact Zones</option>
            <option value="SHELTERS">Relief Shelters</option>
            <option value="SOS">SOS Signals</option>
            <option value="INCIDENTS">Hazards</option>
          </select>

          {/* 2. Search Box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sector or zone..."
              style={{
                minHeight: '40px',
                width: '210px',
                padding: '0.45rem 0.75rem',
                background: '#191714',
                border: '1px solid rgba(242, 238, 231, 0.12)',
                borderRadius: '3px',
                color: '#F2EEE7',
                fontSize: '0.84rem',
              }}
            />
            {filteredAreas.length > 0 && searchQuery.trim() && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.35rem',
                  width: '280px',
                  background: '#191714',
                  border: '1px solid rgba(242, 238, 231, 0.15)',
                  borderRadius: '3px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  zIndex: 1000,
                  maxHeight: '220px',
                  overflowY: 'auto',
                }}
              >
                {filteredAreas.map((a) => (
                  <button
                    key={a._id}
                    type="button"
                    onClick={() => {
                      setSelectedArea(a);
                      setSearchQuery('');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.6rem 0.85rem',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(242, 238, 231, 0.06)',
                      color: '#F2EEE7',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{a.name}</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: a.severity === 'Critical' ? '#C94235' : '#C49A45',
                      }}
                    >
                      {a.severity}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Emergency Action (Dominant & Explicit) */}
          <button
            type="button"
            onClick={() => navigate('/sos')}
            style={{
              minHeight: '40px',
              padding: '0 1.25rem',
              background: '#C94235',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '3px',
              fontWeight: 700,
              fontSize: '0.84rem',
              letterSpacing: '0.04em',
              cursor: 'pointer',
            }}
          >
            Broadcast SOS
          </button>
        </div>
      </div>

      {/* 2. Immersive Geospatial Map (Progressive Disclosure) */}
      <div
        style={{
          background: '#191714',
          border: '1px solid rgba(242, 238, 231, 0.08)',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <DisasterMap
          height="68vh"
          initialFilter={activeLayer}
          showToolbar={false}
          showLegend={true}
          onOpenSos={() => navigate('/sos')}
        />

        {/* Loading overlay */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(17, 16, 14, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9B958B',
              fontSize: '0.88rem',
              fontFamily: 'var(--font-mono, monospace)',
              zIndex: 999,
            }}
          >
            Calibrating geospatial grid telemetry...
          </div>
        )}
      </div>

      {/* 3. Progressive Disclosure: Selected Zone Inspection Strip */}
      {selectedArea && (
        <div
          style={{
            background: '#191714',
            border: '1px solid rgba(242, 238, 231, 0.1)',
            borderLeft: `4px solid ${selectedArea.severity === 'Critical' ? '#C94235' : '#C49A45'}`,
            borderRadius: '4px',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                  color: selectedArea.severity === 'Critical' ? '#C94235' : '#C49A45',
                  textTransform: 'uppercase',
                }}
              >
                {selectedArea.severity} IMPACT ZONE
              </span>
              <span style={{ fontSize: '0.72rem', color: '#9B958B' }}>
                • {selectedArea.status || 'Active Monitoring'}
              </span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#F2EEE7' }}>
              {selectedArea.name}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#D4CDC3', marginTop: '0.25rem', maxWidth: '640px' }}>
              {selectedArea.description || `Monitored sector for ${selectedArea.disasterType || 'hazard'} activity.`}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#9B958B', textTransform: 'uppercase', fontFamily: 'var(--font-mono, monospace)' }}>
                AFFECTED POPULATION
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F2EEE7', fontFamily: 'var(--font-mono, monospace)' }}>
                {(Number(selectedArea.affectedPeople) || 0).toLocaleString()}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: '#9B958B', textTransform: 'uppercase', fontFamily: 'var(--font-mono, monospace)' }}>
                ACTIVE SOS
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#C94235', fontFamily: 'var(--font-mono, monospace)' }}>
                {selectedArea.activeSOS || 0}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedArea(null)}
              style={{
                minHeight: '36px',
                padding: '0 0.85rem',
                background: 'transparent',
                border: '1px solid rgba(242, 238, 231, 0.15)',
                borderRadius: '3px',
                color: '#9B958B',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Area Detail Modal */}
      {selectedArea && (
        <AreaDetailModal
          isOpen={Boolean(selectedArea)}
          area={selectedArea}
          onClose={() => setSelectedArea(null)}
        />
      )}
    </div>
  );
};

export default AffectedAreasPage;
