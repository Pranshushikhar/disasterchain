import React, { useState, useEffect, useMemo } from 'react';
import { fetchAlerts } from '../services/api';
import AlertDetailModal from '../components/AlertDetailModal';
import { useTranslation } from '../i18n/i18n';

const AlertsPage = () => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);

  const loadAlerts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAlerts({ activeOnly: 'false' });
      setAlerts(data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Unable to load emergency broadcasts from telemetry server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const isAlertExpired = (a) => {
    if (!a.active) return true;
    if (a.expiresAt && new Date(a.expiresAt) < new Date()) return true;
    return false;
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (filterSeverity !== 'ALL') {
        const sev = (a.severity || '').toLowerCase();
        if (filterSeverity === 'CRITICAL' && !['critical', 'danger', 'emergency'].includes(sev)) return false;
        if (filterSeverity === 'WARNING' && sev !== 'warning') return false;
        if (filterSeverity === 'ADVISORY' && !['info', 'advisory', 'general'].includes(sev)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = a.title?.toLowerCase().includes(q);
        const matchesMsg = a.message?.toLowerCase().includes(q);
        const matchesLoc = a.location?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMsg && !matchesLoc) return false;
      }

      return true;
    });
  }, [alerts, filterSeverity, searchQuery]);

  return (
    <div
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* 1. Header (Editorial Senior Discipline) */}
      <div
        style={{
          borderBottom: '1px solid rgba(242, 238, 231, 0.08)',
          paddingBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1.25rem',
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
            INCIDENT TIMELINE
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
            Emergency Advisories
          </h1>
          <p style={{ color: '#9B958B', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
            Chronological incident timeline of meteorological advisories and civic warnings.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
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
            aria-label="Filter Severity"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical & Danger</option>
            <option value="WARNING">Warning</option>
            <option value="ADVISORY">Advisory</option>
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by sector or title..."
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

          <button
            type="button"
            onClick={loadAlerts}
            style={{
              minHeight: '40px',
              padding: '0 0.85rem',
              background: '#191714',
              border: '1px solid rgba(242, 238, 231, 0.12)',
              borderRadius: '3px',
              color: '#D4CDC3',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
            title="Refresh incident timeline"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* 2. Loading / Error / Empty States */}
      {loading && (
        <div style={{ padding: '3rem 0', textAlign: 'center', color: '#9B958B', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.88rem' }}>
          Synchronizing incident timeline...
        </div>
      )}

      {error && !loading && (
        <div
          style={{
            padding: '1rem',
            background: 'rgba(201, 66, 53, 0.1)',
            borderLeft: '3px solid #C94235',
            color: '#F2EEE7',
            fontSize: '0.88rem',
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && filteredAlerts.length === 0 && (
        <div
          style={{
            padding: '4rem 1rem',
            textAlign: 'center',
            border: '1px solid rgba(242, 238, 231, 0.08)',
            borderRadius: '4px',
            background: '#191714',
          }}
        >
          <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif, "Newsreader", Georgia, serif)', color: '#F2EEE7', marginBottom: '0.35rem' }}>
            No Active Emergency Advisories
          </div>
          <p style={{ color: '#9B958B', fontSize: '0.88rem', margin: 0 }}>
            Atmospheric conditions across monitored sectors are stable.
          </p>
        </div>
      )}

      {/* 3. Simple Incident Timeline (Section 11) */}
      {!loading && filteredAlerts.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {filteredAlerts.map((alt, idx) => {
            const isCritical = ['critical', 'danger', 'emergency'].includes((alt.severity || '').toLowerCase());
            const isWarning = (alt.severity || '').toLowerCase() === 'warning';
            const expired = isAlertExpired(alt);

            const timeStr = alt.createdAt
              ? new Date(alt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '12:00 PM';

            const indicatorColor = isCritical ? '#C94235' : isWarning ? '#C49A45' : '#628B63';

            return (
              <div
                key={alt._id || idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: '1.5rem',
                  padding: '1.5rem 0',
                  borderBottom: '1px solid rgba(242, 238, 231, 0.08)',
                  opacity: expired ? 0.6 : 1,
                  alignItems: 'baseline',
                }}
                className="alerts-timeline-row"
              >
                {/* Left Gutter: Timestamp & Status Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: indicatorColor,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.82rem',
                      color: '#9B958B',
                    }}
                  >
                    {timeStr}
                  </span>
                </div>

                {/* Right Body: Headline, Summary, Location, Source, Action */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <div
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      color: isCritical ? '#FFFFFF' : '#F2EEE7',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {alt.title}
                  </div>

                  <div
                    style={{
                      fontSize: '0.92rem',
                      color: '#D4CDC3',
                      lineHeight: 1.55,
                    }}
                  >
                    {alt.message}
                  </div>

                  {/* Metadata line: Location & Source */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      marginTop: '0.35rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {alt.location && (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          textTransform: 'uppercase',
                          color: '#9B958B',
                          letterSpacing: '0.06em',
                        }}
                      >
                        SECTOR: {alt.location}
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: '#7A746B',
                      }}
                    >
                      Source: {alt.source || 'Open-Meteo · GDACS Civic Network'}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedAlert(alt)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#D96B35',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        padding: 0,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        textUnderlineOffset: '3px',
                      }}
                    >
                      [View details]
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertDetailModal
          isOpen={Boolean(selectedAlert)}
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}

      {/* Responsive layout breakpoint */}
      <style>{`
        @media (max-width: 640px) {
          .alerts-timeline-row {
            grid-template-columns: 1fr !important;
            gap: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AlertsPage;
