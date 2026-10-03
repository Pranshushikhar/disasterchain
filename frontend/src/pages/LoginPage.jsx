import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/i18n';
import Icon from '../components/Icons';

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, resendVerification, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setIsUnverified(false);
    setResendStatus('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } else {
      if (result.isUnverified) {
        setIsUnverified(true);
        setUnverifiedEmail(result.email || email);
      }
      setError(result.message || 'Authentication rejected. Verify email and credentials.');
    }
  };

  const handleFillDemo = async (role = 'student') => {
    setError('');
    setIsUnverified(false);
    setLoading(true);
    const result = await demoLogin(role);
    setLoading(false);
    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } else {
      setError(result.message || 'Demo authentication failed.');
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendStatus('');
    const res = await resendVerification(unverifiedEmail || email);
    setResending(false);
    setResendStatus(res.message);
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
          maxWidth: '440px',
          width: '100%',
          padding: '2.5rem 2.25rem',
          backgroundColor: 'var(--dc-elevated, #FFFDF8)',
          border: '1px solid var(--border-medium, rgba(30, 39, 37, 0.14))',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: 'var(--shadow-md, 0 4px 16px -2px rgba(30, 39, 37, 0.06))',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-sm, 8px)',
              background: 'rgba(73, 107, 90, 0.12)',
              color: 'var(--dc-forest, #263F35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.85rem',
            }}
          >
            <Icon name="shield-check" size={26} color="var(--dc-forest, #263F35)" />
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.70rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--dc-earth-green, #496B5A)',
              marginBottom: '0.25rem',
            }}
          >
            OPERATOR AUTHENTICATION
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
            {t('auth.loginTitle', 'Sign In to DisasterChain')}
          </h1>
          <p style={{ color: 'var(--dc-text-secondary, #65706B)', fontSize: '0.86rem', lineHeight: 1.45 }}>
            Access real-time crisis intelligence, hazard dispatch, and community safety registries.
          </p>
        </div>

        {/* Error Notice */}
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
              lineHeight: 1.4,
            }}
          >
            <div>⚠️ {error}</div>
            {isUnverified && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--dc-forest, #263F35)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.8rem',
                  marginTop: '0.4rem',
                  fontWeight: 600,
                }}
              >
                {resending ? 'Sending verification...' : 'Resend verification email'}
              </button>
            )}
          </div>
        )}

        {resendStatus && (
          <div
            style={{
              background: 'rgba(79, 128, 96, 0.1)',
              border: '1px solid rgba(79, 128, 96, 0.3)',
              color: 'var(--dc-safe, #4F8060)',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-xs, 4px)',
              fontSize: '0.8rem',
              marginBottom: '1rem',
            }}
          >
            ✓ {resendStatus}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.15rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--dc-text, #1E2725)',
                marginBottom: '0.35rem',
              }}
            >
              {t('auth.email', 'Email Address')}
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
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@disasterchain.org"
            />
          </div>

          <div style={{ marginBottom: '1.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--dc-text, #1E2725)',
                  margin: 0,
                }}
              >
                {t('auth.password', 'Password')}
              </label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--dc-earth-green, #496B5A)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                {t('auth.forgotPasswordLink', 'Forgot Password?')}
              </Link>
            </div>
            <input
              type="password"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm, 8px)',
                border: '1px solid var(--border-medium, rgba(30, 39, 37, 0.14))',
                backgroundColor: 'var(--dc-surface, #F8F5EE)',
                color: 'var(--dc-text, #1E2725)',
                fontSize: '0.88rem',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
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
              transition: 'background-color 0.15s ease, transform 0.12s ease',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {loading ? t('common.loading', 'Authenticating...') : t('auth.loginBtn', 'Sign In')}
          </button>
        </form>

        {/* Evaluation Quick Login Assistance */}
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--dc-surface-2, #EFE9DC)',
            borderRadius: 'var(--radius-sm, 8px)',
            fontSize: '0.78rem',
            color: 'var(--dc-text-secondary, #65706B)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <span>Demo Evaluation:</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleFillDemo('student')}
              disabled={loading}
              style={{
                background: 'var(--dc-elevated, #FFFDF8)',
                border: '1px solid var(--border-subtle, rgba(30, 39, 37, 0.08))',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: 'var(--dc-forest, #263F35)',
                cursor: 'pointer',
              }}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              disabled={loading}
              style={{
                background: 'var(--dc-elevated, #FFFDF8)',
                border: '1px solid var(--border-subtle, rgba(30, 39, 37, 0.08))',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: 'var(--dc-forest, #263F35)',
                cursor: 'pointer',
              }}
            >
              Admin
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--dc-text-secondary, #65706B)' }}>
          {t('auth.dontHaveAccount', "Don't have an account?")}{' '}
          <Link to="/register" style={{ color: 'var(--dc-earth-green, #496B5A)', fontWeight: 700, textDecoration: 'none' }}>
            {t('auth.registerBtn', 'Create Account')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
