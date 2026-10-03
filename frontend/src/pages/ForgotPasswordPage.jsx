import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icons';
import { useTranslation } from '../i18n/i18n';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const res = await forgotPassword(email);
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
      setMessage(res.message || 'If an account is associated with that email, a password recovery request has been submitted.');
    } else {
      setError(res.message || 'Unable to submit recovery request right now. Please try again shortly.');
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        backgroundColor: 'var(--dc-bg, #F1EBDD)',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '2.5rem 2.25rem',
          backgroundColor: 'var(--dc-elevated, #FFFDF8)',
          border: '1px solid var(--border-medium, rgba(30, 39, 37, 0.14))',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-sm, 8px)',
              background: 'rgba(195, 138, 53, 0.15)',
              color: 'var(--dc-warning, #C38A35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.85rem',
            }}
          >
            <Icon name="key" size={24} color="var(--dc-warning, #C38A35)" />
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.70rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--dc-warning, #C38A35)',
              marginBottom: '0.25rem',
            }}
          >
            PASSWORD RECOVERY
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display, inherit)',
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--dc-text, #1E2725)',
              marginBottom: '0.35rem',
              letterSpacing: '-0.02em',
            }}
          >
            Account Recovery
          </h1>
          <p style={{ color: 'var(--dc-text-secondary, #65706B)', fontSize: '0.86rem', lineHeight: 1.45 }}>
            Submit your registered email address to verify identity and reset your authentication credentials.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(201, 75, 75, 0.08)',
              border: '1px solid rgba(201, 75, 75, 0.3)',
              borderRadius: 'var(--radius-xs, 4px)',
              padding: '0.75rem 1rem',
              color: 'var(--dc-emergency, #C94B4B)',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(79, 128, 96, 0.15)',
                color: 'var(--dc-safe, #4F8060)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Icon name="check-circle" size={32} color="var(--dc-safe, #4F8060)" />
            </div>
            <div style={{ fontWeight: 800, color: 'var(--dc-text, #1E2725)', fontSize: '1.2rem', marginBottom: '0.35rem' }}>
              Recovery Request Submitted
            </div>
            <p style={{ color: 'var(--dc-text-secondary, #65706B)', fontSize: '0.86rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {message}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to="/reset-password"
                style={{
                  width: '100%',
                  display: 'block',
                  boxSizing: 'border-box',
                  padding: '11px',
                  borderRadius: 'var(--radius-sm, 8px)',
                  backgroundColor: 'var(--dc-forest, #263F35)',
                  color: '#FFFDF8',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Enter Recovery Code →
              </Link>
              <Link
                to="/login"
                style={{
                  width: '100%',
                  display: 'block',
                  boxSizing: 'border-box',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm, 8px)',
                  border: '1px solid var(--border-medium, rgba(30, 39, 37, 0.14))',
                  backgroundColor: 'var(--dc-surface, #F8F5EE)',
                  color: 'var(--dc-text, #1E2725)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--dc-text, #1E2725)',
                  marginBottom: '0.35rem',
                }}
              >
                Registered Email Address
              </label>
              <input
                type="email"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm, 8px)',
                  border: '1px solid var(--border-medium, rgba(30, 39, 37, 0.14))',
                  backgroundColor: 'var(--dc-surface, #F8F5EE)',
                  color: 'var(--dc-text, #1E2725)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@disasterchain.org"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: 'var(--dc-forest, #263F35)',
                color: '#FFFDF8',
                border: 'none',
                borderRadius: 'var(--radius-sm, 8px)',
                padding: '11px 16px',
                fontSize: '0.90rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {loading ? 'Submitting Request...' : 'Send Recovery Instructions'}
            </button>
          </form>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle, rgba(30, 39, 37, 0.08))',
            fontSize: '0.82rem',
          }}
        >
          <Link to="/reset-password" style={{ color: 'var(--dc-earth-green, #496B5A)', fontWeight: 700, textDecoration: 'none' }}>
            Have a recovery code?
          </Link>
          <Link to="/login" style={{ color: 'var(--dc-text-secondary, #65706B)', textDecoration: 'none' }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
