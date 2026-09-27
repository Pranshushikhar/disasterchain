import React, { useState, useEffect, useMemo } from 'react';
import { fetchAlerts } from '../services/api';
import SourceBadge from '../components/SourceBadge';
import { useTranslation } from '../i18n/i18n';

/**
 * DISASTERCHAIN EMERGENCY ALERT CENTER (/alerts)
 * Semantic public safety warning dispatch with strict provenance attribution
 * (OFFICIAL EXTERNAL FEED vs DISASTERCHAIN ASSESSMENT).
 */
export default function AlertsPage() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadAlerts = async () => {
      try {
        const data = await fetchAlerts();
        if (isMounted) {
          setAlerts(data || []);
          if (data && data.length > 0) setSelectedAlert(data[0]);
        }
      } catch (err) {
        console.error('Failed to load alerts:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadAlerts();
    return () => {
      isMounted = false;
    };
  }, []);

  const getAlertLevel = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
      case 'danger':
      case 'emergency':
        return { label: 'CRITICAL WARNING', color: '#C84A3A', bg: 'rgba(200, 74, 58, 0.1)', border: '#C84A3A' };
      case 'high':
      case 'warning':
        return { label: 'ELEVATED ADVISORY', color: '#D66A35', bg: 'rgba(214, 106, 53, 0.1)', border: '#D66A35' };
      case 'medium':
        return { label: 'MODERATE WATCH', color: '#C69A3A', bg: 'rgba(198, 154, 58, 0.08)', border: '#C69A3A' };
      default:
        return { label: 'CIVIL NOTICE', color: '#5E8B68', bg: 'rgba(94, 139, 104, 0.08)', border: '#5E8B68' };
    }
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (filterSeverity !== 'ALL') {
        const sev = (a.severity || '').toLowerCase();
        if (filterSeverity === 'CRITICAL' && !['critical', 'danger', 'emergency'].includes(sev)) return false;
        if (filterSeverity === 'WARNING' && !['high', 'warning'].includes(sev)) return false;
        if (filterSeverity === 'MODERATE' && !['medium', 'advisory'].includes(sev)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const tMatch = (a.title || '').toLowerCase().includes(q);
        const mMatch = (a.message || '').toLowerCase().includes(q);
        const lMatch = (a.location || '').toLowerCase().includes(q);
        return tMatch || mMatch || lMatch;
      }
      return true;
    });
  }, [alerts, filterSeverity, searchQuery]);

  return (
    <div className="dc-alerts-page-root" role="region" aria-label="DisasterChain Alert Center">
      {/* Header */}
      <div className="dc-alerts-header">
        <div>
          <div className="alerts-super-row">
            <span className="alerts-super">EMERGENCY BROADCAST DISPATCH</span>
            <SourceBadge
              source="DisasterChain Dispatch · Threshold Reference (IMD/NDMA)"
              confidence="High"
              updatedAt="Active"
              isOfficial={false}
              compact={true}
            />
          </div>
          <h1 className="alerts-title">Public Warning & Advisory Center</h1>
          <p className="alerts-desc">
            Direct dissemination of urgent civilian advisories, localized meteorological watches, and evacuation bulletins.
          </p>
        </div>

        {/* Audio Mute & Notification Preferences */}
        <div className="alerts-prefs-row">
          <button
            type="button"
            className={`pref-btn ${isAudioMuted ? 'muted' : ''}`}
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            title="Toggle emergency audio alerts"
          >
            <span>{isAudioMuted ? '🔇 Audio Muted' : '🔔 Audio Active'}</span>
          </button>
        </div>
      </div>

      {/* Filter Track */}
      <div className="dc-alerts-filter-bar">
        <div className="sev-filter-pills" role="tablist">
          {['ALL', 'CRITICAL', 'WARNING', 'MODERATE'].map((sev) => (
            <button
              key={sev}
              type="button"
              className={`sev-pill ${filterSeverity === sev ? 'active' : ''}`}
              onClick={() => setFilterSeverity(sev)}
            >
              {sev}
            </button>
          ))}
        </div>

        <input
          type="text"
          className="alerts-search-box"
          placeholder="Search alerts, locations, keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main Alerts List */}
      <div className="dc-alerts-stream">
        {loading ? (
          <div className="alerts-empty-state">
            <span>SYNCING EMERGENCY BROADCASTS...</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="alerts-empty-state">
            <span style={{ color: '#5E8B68' }}>✓ NO ACTIVE EMERGENCY ADVISORIES</span>
            <p>All regional warning sectors are currently operating under baseline conditions.</p>
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const level = getAlertLevel(alt.severity);
            const isRefSource = alt.source?.toLowerCase().includes('imd') || alt.source?.toLowerCase().includes('ndma') || alt.source?.toLowerCase().includes('cwc');

            return (
              <div
                key={alt._id}
                className="dc-alert-card"
                style={{ borderLeftColor: level.border }}
              >
                <div className="alert-card-top">
                  <div className="level-badge-row">
                    <span
                      className="alert-level-pill font-mono"
                      style={{ color: level.color, borderColor: level.color, backgroundColor: level.bg }}
                    >
                      {level.label}
                    </span>
                    <span className="alert-validity font-mono">
                      VALID: {alt.expiresAt ? `Until ${new Date(alt.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Until Further Notice'}
                    </span>
                  </div>

                  <SourceBadge
                    source={isRefSource ? `Reference Guidance (${alt.source})` : (alt.source || 'DisasterChain Advisory')}
                    confidence="High"
                    updatedAt={new Date(alt.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    isOfficial={false}
                    isDemo={alt.isDemo || false}
                    compact={true}
                  />
                </div>

                <h3 className="alert-card-title">{alt.title}</h3>

                <p className="alert-card-msg">{alt.message}</p>

                <div className="alert-action-box">
                  <span className="action-box-lbl font-mono">CIVILIAN ACTION REQUIRED:</span>
                  <p className="action-box-text">
                    {alt.action || 'Stay indoors. Avoid low-lying underpasses. Prepare backup cellular power.'}
                  </p>
                </div>

                <div className="alert-card-footer font-mono">
                  <span>SECTOR: {alt.location}</span>
                  <span>·</span>
                  <span>ISSUED: {new Date(alt.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .dc-alerts-page-root {
          max-width: 960px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 4rem 1.5rem;
          color: #E9E5DC;
          font-family: var(--font-sans, -apple-system, sans-serif);
        }

        .dc-alerts-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.25rem;
          border-bottom: 1px solid rgba(242, 238, 231, 0.08);
          padding-bottom: 1.25rem;
          margin-bottom: 1.15rem;
        }

        .alerts-super-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 0.25rem;
        }

        .alerts-super {
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #D66A35;
        }

        .alerts-title {
          font-size: 1.85rem;
          font-weight: 600;
          color: #F7F4ED;
          margin: 0 0 0.35rem 0;
          letter-spacing: -0.01em;
        }

        .alerts-desc {
          font-size: 0.85rem;
          line-height: 1.45;
          color: #A49F93;
          margin: 0;
          max-width: 720px;
        }

        .pref-btn {
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.14);
          color: #E9E5DC;
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          padding: 0.35rem 0.65rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .pref-btn:hover {
          border-color: #D66A35;
        }

        .pref-btn.muted {
          color: #7A756D;
          border-color: rgba(242, 238, 231, 0.08);
        }

        /* Filter Bar */
        .dc-alerts-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.85rem;
          background: #121413;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-radius: 3px;
          padding: 0.55rem 0.85rem;
          margin-bottom: 1.25rem;
        }

        .sev-filter-pills {
          display: flex;
          gap: 0.35rem;
        }

        .sev-pill {
          background: transparent;
          border: 1px solid rgba(242, 238, 231, 0.1);
          color: #A49F93;
          font-family: var(--font-mono, monospace);
          font-size: 0.62rem;
          padding: 0.2rem 0.5rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .sev-pill:hover {
          color: #F7F4ED;
          border-color: rgba(242, 238, 231, 0.25);
        }

        .sev-pill.active {
          background: rgba(214, 106, 53, 0.15);
          color: #D66A35;
          border-color: #D66A35;
          font-weight: 700;
        }

        .alerts-search-box {
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.12);
          color: #F7F4ED;
          font-size: 0.78rem;
          padding: 0.3rem 0.65rem;
          border-radius: 2px;
          width: 220px;
          outline: none;
        }

        .alerts-search-box:focus {
          border-color: #D66A35;
        }

        /* Stream */
        .dc-alerts-stream {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .dc-alert-card {
          background: #121413;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-left: 3px solid #D66A35;
          border-radius: 3px;
          padding: 1.25rem;
        }

        .alert-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.65rem;
        }

        .level-badge-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .alert-level-pill {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 0.15rem 0.45rem;
          border: 1px solid;
          border-radius: 2px;
        }

        .alert-validity {
          font-size: 0.65rem;
          color: #7A756D;
        }

        .alert-card-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: #F7F4ED;
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
        }

        .alert-card-msg {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #E9E5DC;
          margin: 0 0 0.85rem 0;
        }

        .alert-action-box {
          background: #181A18;
          border: 1px solid rgba(242, 238, 231, 0.06);
          border-radius: 2px;
          padding: 0.75rem 0.85rem;
          margin-bottom: 0.85rem;
        }

        .action-box-lbl {
          display: block;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #D66A35;
          margin-bottom: 0.25rem;
        }

        .action-box-text {
          font-size: 0.8rem;
          color: #F7F4ED;
          margin: 0;
          line-height: 1.4;
        }

        .alert-card-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.65rem;
          color: #7A756D;
          border-top: 1px solid rgba(242, 238, 231, 0.06);
          padding-top: 0.55rem;
        }

        .alerts-empty-state {
          background: #121413;
          border: 1px solid rgba(242, 238, 231, 0.08);
          border-radius: 4px;
          padding: 3.5rem 1.5rem;
          text-align: center;
          font-family: var(--font-mono, monospace);
        }

        .alerts-empty-state span {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          margin-bottom: 0.35rem;
        }

        .alerts-empty-state p {
          font-size: 0.8rem;
          color: #A49F93;
          margin: 0;
          font-family: var(--font-sans, sans-serif);
        }
      `}</style>
    </div>
  );
}
