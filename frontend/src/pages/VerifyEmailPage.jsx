import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/i18n';
import Icon from '../components/Icons';

const VerifyEmailPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') || '').trim();

  const [loading, setLoading] = useState(!!token);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const { verifyEmail, resendVerification } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const performVerification = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      const res = await verifyEmail(token);

      if (isMounted) {
        setLoading(false);
        if (res.success) {
          setVerified(true);
        } else {
          setError(res.message || 'Verification token is invalid or has expired.');
        }
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    setResendMessage('');
    const res = await resendVerification(resendEmail);
    setResending(false);
    setResendMessage(res.message);
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
          textAlign: 'center',
          backgroundColor: 'var(--dc-elevated, #FFFDF8)',
          border: '1px solid var(--border-medium, rgba(30, 39, 37, 0.14))',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {loading ? (
          <div>
            <div
              style={{
                width: '32px',
                height: '32px',
                margin: '0 auto 1.25rem',
                border: '3px solid var(--border-medium, rgba(30, 39, 37, 0.14))',
                borderTopColor: 'var(--dc-forest, #263F35)',
                borderRadius: '50%',
                animation: 'dcSpin 1s linear infinite',
              }}
            />
            <h2 style={{ fontFamily: 'var(--font-display, inherit)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--dc-text, #1E2725)', marginBottom: '0.4rem' }}>
              Validating Email Signature...
            </h2>
            <p style={{ color: 'var(--dc-text-secondary, #65706B)', fontSize: '0.85rem' }}>
              Confirming account registration and initializing operational clearances.
            </p>
          </div>
        ) : verified ? (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(79, 128, 96, 0.15)',
                color: 'var(--dc-safe, #4F8060)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Icon name="shield-check" size={32} color="var(--dc-safe, #4F8060)" />
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.70rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--dc-safe, #4F8060)',
                marginBottom: '0.3rem',
              }}
            >
              EMAIL VERIFIED
            </div>
            <h2 style={{ fontFamily: 'var(--font-display, inherit)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--dc-text, #1E2725)', marginBottom: '0.5rem' }}>
              Account Activated
            </h2>
            <p style={{ color: 'var(--dc-text-secondary, #65706B)', fontSize: '0.86rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
              Your email credentials have been authenticated. You now possess full active clearance on DisasterChain.
            </p>

            <Link
              to="/login"
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
              Proceed to Sign In →
            </Link>
          </div>
        ) : (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(201, 75, 75, 0.12)',
                color: 'var(--dc-emergency, #C94B4B)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Icon name="alert-circle" size={32} color="var(--dc-emergency, #C94B4B)" />
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.70rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--dc-emergency, #C94B4B)',
                marginBottom: '0.3rem',
              }}
            >
              VERIFICATION EXPIRED
            </div>
            <h2 style={{ fontFamily: 'var(--font-display, inherit)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--dc-text, #1E2725)', marginBottom: '0.5rem' }}>
              Token Invalid or Expired
            </h2>
            <p style={{ color: 'var(--dc-text-secondary, #65706B)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {error || 'This verification link is invalid or has expired. Please enter your email to request a new verification token.'}
            </p>

            {resendMessage && (
              <div
                style={{
                  background: 'rgba(79, 128, 96, 0.1)',
                  color: 'var(--dc-safe, #4F8060)',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-xs, 4px)',
                  fontSize: '0.8rem',
                  marginBottom: '1.25rem',
                }}
              >
                ✓ {resendMessage}
              </div>
            )}

            <form onSubmit={handleResend} style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--dc-text, #1E2725)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Request Fresh Verification Link
                </label>
                <input
                  type="email"
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm, 8px)',
                    border: '1px solid var(--border-medium, rgba(30, 39, 37, 0.14))',
                    backgroundColor: 'var(--dc-surface, #F8F5EE)',
                    color: 'var(--dc-text, #1E2725)',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="operator@disasterchain.org"
                />
              </div>
              <button
                type="submit"
                disabled={resending}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--dc-forest, #263F35)',
                  color: '#FFFDF8',
                  border: 'none',
                  borderRadius: 'var(--radius-sm, 8px)',
                  padding: '10px 14px',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: resending ? 'not-allowed' : 'pointer',
                }}
              >
                {resending ? 'Sending...' : 'Resend Verification Link'}
              </button>
            </form>

            <Link to="/login" style={{ color: 'var(--dc-earth-green, #496B5A)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
              Return to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
