import React, { useState, useEffect, useMemo } from 'react';
import { fetchSosRequests, createSosRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/i18n';

const SosPage = ({ refreshKey }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [dispatchedReceipt, setDispatchedReceipt] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || 'Civilian in Distress',
    emergencyType: 'Medical Emergency',
    description: 'Immediate assistance requested at current location.',
    location: '',
    latitude: 28.6139,
    longitude: 77.2090,
    peopleAffected: 1,
    severity: 'Critical',
    contact: '',
  });

  const loadSos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchSosRequests();
      setSosList(data || []);
    } catch (err) {
      console.error('Error fetching SOS signals:', err);
      setError('Unable to fetch live SOS distress signals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSos();
  }, [refreshKey]);

  useEffect(() => {
    if (user?.name && (!formData.name || formData.name === 'Civilian in Distress')) {
      setFormData((prev) => ({ ...prev, name: user.name }));
    }
  }, [user]);

  // Instant One-Click SOS Broadcast (Section 12)
  const handleInstantSos = () => {
    setIsBroadcasting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(6));
          const lng = parseFloat(pos.coords.longitude.toFixed(6));
          const payload = {
            name: formData.name || user?.name || 'Civilian in Distress',
            emergencyType: 'Emergency Distress Signal',
            description: 'Urgent civilian emergency signal transmitted via DisasterChain.',
            location: `GPS Coordinates: ${lat}, ${lng}`,
            latitude: lat,
            longitude: lng,
            peopleAffected: 1,
            severity: 'Critical',
            contact: formData.contact || user?.phone || 'Field Transmit',
          };
          try {
            const res = await createSosRequest(payload);
            setDispatchedReceipt(res);
            loadSos();
          } catch (e) {
            setError(e.message || 'Distress broadcast failed.');
          } finally {
            setIsBroadcasting(false);
          }
        },
        async () => {
          // Fallback with default coordinates if GPS permission denied
          const payload = {
            name: formData.name || user?.name || 'Civilian in Distress',
            emergencyType: 'Emergency Distress Signal',
            description: 'Urgent civilian emergency signal transmitted via DisasterChain.',
            location: 'Default Sector (GPS unavailable)',
            latitude: 28.6139,
            longitude: 77.2090,
            peopleAffected: 1,
            severity: 'Critical',
            contact: formData.contact || 'Field Transmit',
          };
          try {
            const res = await createSosRequest(payload);
            setDispatchedReceipt(res);
            loadSos();
          } catch (e) {
            setError(e.message || 'Distress broadcast failed.');
          } finally {
            setIsBroadcasting(false);
          }
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    } else {
      setIsBroadcasting(false);
      setShowManualForm(true);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setIsBroadcasting(true);
    setError('');
    try {
      const payload = {
        name: formData.name.trim(),
        emergencyType: formData.emergencyType,
        description: formData.description.trim(),
        location: formData.location.trim() || 'Sector Center',
        latitude: Number(formData.latitude) || 28.6139,
        longitude: Number(formData.longitude) || 77.2090,
        peopleAffected: Number(formData.peopleAffected) || 1,
        severity: formData.severity,
        contact: formData.contact.trim() || 'Field Contact',
      };
      const res = await createSosRequest(payload);
      setDispatchedReceipt(res);
      setShowManualForm(false);
      loadSos();
    } catch (err) {
      setError(err.message || 'Broadcast failed.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '820px',
        margin: '0 auto',
        padding: '2.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
      }}
    >
      {/* 1. Header & Dominant One-Click SOS Action (Section 12) */}
      <div
        style={{
          background: '#191714',
          border: '1px solid rgba(242, 238, 231, 0.08)',
          borderRadius: '4px',
          padding: '3rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div
          style={{
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: '#9B958B',
          }}
        >
          EMERGENCY SOS
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif, "Newsreader", Georgia, serif)',
            fontSize: '2.5rem',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            color: '#F2EEE7',
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          Need immediate help?
        </h1>

        <p
          style={{
            fontSize: '0.94rem',
            color: '#9B958B',
            maxWidth: '460px',
            margin: '0 0 1rem 0',
            lineHeight: 1.5,
          }}
        >
          Transmits an encrypted distress beacon to verified disaster relief coordinators and local responders.
        </p>

        {/* The Dominant SOS Action */}
        {dispatchedReceipt ? (
          <div
            style={{
              padding: '1.25rem 2rem',
              background: 'rgba(98, 139, 99, 0.12)',
              border: '1px solid #628B63',
              borderRadius: '4px',
              maxWidth: '480px',
            }}
          >
            <div style={{ color: '#628B63', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.35rem' }}>
              DISTRESS BEACON BROADCASTED
            </div>
            <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono, monospace)', color: '#D4CDC3' }}>
              Signal Identifier: {dispatchedReceipt.requestId || dispatchedReceipt._id}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#9B958B', marginTop: '0.5rem' }}>
              Responders in your sector have been alerted. Maintain radio/phone standby.
            </div>
            <button
              type="button"
              onClick={() => setDispatchedReceipt(null)}
              style={{
                marginTop: '1rem',
                padding: '0.4rem 1rem',
                background: 'transparent',
                border: '1px solid rgba(242, 238, 231, 0.15)',
                borderRadius: '3px',
                color: '#F2EEE7',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Reset Beacon
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
            <button
              type="button"
              onClick={handleInstantSos}
              disabled={isBroadcasting}
              style={{
                minHeight: '56px',
                minWidth: '240px',
                padding: '0 2.5rem',
                background: '#C94235',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1.1rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: isBroadcasting ? 'wait' : 'pointer',
                transition: 'background 0.15s ease, transform 0.15s ease',
              }}
            >
              {isBroadcasting ? 'Broadcasting Beacon...' : 'SEND SOS'}
            </button>

            <span
              style={{
                fontSize: '0.84rem',
                color: '#9B958B',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              Your location will be shared with responders.
            </span>
          </div>
        )}

        {/* Toggle manual details */}
        {!dispatchedReceipt && (
          <button
            type="button"
            onClick={() => setShowManualForm((prev) => !prev)}
            style={{
              marginTop: '1.25rem',
              background: 'transparent',
              border: 'none',
              color: '#9B958B',
              fontSize: '0.82rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            {showManualForm ? 'Hide detailed dispatch form' : 'Specify details or manual coordinates →'}
          </button>
        )}
      </div>

      {/* 2. Optional Manual Coordinates & Situation Form */}
      {showManualForm && !dispatchedReceipt && (
        <div
          style={{
            background: '#191714',
            border: '1px solid rgba(242, 238, 231, 0.08)',
            borderRadius: '4px',
            padding: '1.75rem',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#9B958B',
              marginBottom: '1rem',
            }}
          >
            DISPATCH INFORMATION
          </div>

          <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9B958B', marginBottom: '0.35rem' }}>
                  Name / Identifier
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    minHeight: '40px',
                    background: '#11100E',
                    border: '1px solid rgba(242, 238, 231, 0.12)',
                    borderRadius: '3px',
                    color: '#F2EEE7',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9B958B', marginBottom: '0.35rem' }}>
                  Phone / Radio Frequency
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="+91 98765 43210 or VHF 14"
                  style={{
                    width: '100%',
                    minHeight: '40px',
                    background: '#11100E',
                    border: '1px solid rgba(242, 238, 231, 0.12)',
                    borderRadius: '3px',
                    color: '#F2EEE7',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.88rem',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9B958B', marginBottom: '0.35rem' }}>
                  Emergency Category
                </label>
                <select
                  value={formData.emergencyType}
                  onChange={(e) => setFormData({ ...formData, emergencyType: e.target.value })}
                  style={{
                    width: '100%',
                    minHeight: '40px',
                    background: '#11100E',
                    border: '1px solid rgba(242, 238, 231, 0.12)',
                    borderRadius: '3px',
                    color: '#F2EEE7',
                    padding: '0 0.75rem',
                    fontSize: '0.88rem',
                  }}
                >
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Trapped / Structural Collapse">Trapped / Structural Collapse</option>
                  <option value="Severe Flooding / Inundation">Severe Flooding / Inundation</option>
                  <option value="Fire / Hazardous Material">Fire / Hazardous Material</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9B958B', marginBottom: '0.35rem' }}>
                  Location / Landmark
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Science Block Floor 2 or GPS"
                  style={{
                    width: '100%',
                    minHeight: '40px',
                    background: '#11100E',
                    border: '1px solid rgba(242, 238, 231, 0.12)',
                    borderRadius: '3px',
                    color: '#F2EEE7',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.88rem',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9B958B', marginBottom: '0.35rem' }}>
                Situation Details
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Injuries, trapped individuals, water level..."
                style={{
                  width: '100%',
                  background: '#11100E',
                  border: '1px solid rgba(242, 238, 231, 0.12)',
                  borderRadius: '3px',
                  color: '#F2EEE7',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.88rem',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={isBroadcasting}
                style={{
                  minHeight: '40px',
                  padding: '0 1.5rem',
                  background: '#C94235',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '3px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Transmit Verified Details
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Restrained Log of Monitored Distress Calls */}
      <div
        style={{
          borderTop: '1px solid rgba(242, 238, 231, 0.08)',
          paddingTop: '1.5rem',
        }}
      >
        <div
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#9B958B',
            marginBottom: '0.75rem',
          }}
        >
          SECTOR DISTRESS LOG ({sosList.length})
        </div>

        {sosList.length === 0 ? (
          <div style={{ color: '#9B958B', fontSize: '0.84rem' }}>
            No active distress signals in monitored radius.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sosList.slice(0, 5).map((item, idx) => (
              <div
                key={item._id || idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid rgba(242, 238, 231, 0.05)',
                  fontSize: '0.84rem',
                }}
              >
                <div>
                  <strong style={{ color: '#F2EEE7' }}>{item.emergencyType || 'Distress Call'}</strong>
                  <span style={{ color: '#9B958B', marginLeft: '0.5rem' }}>• {item.location}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.74rem', color: '#9B958B' }}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SosPage;
