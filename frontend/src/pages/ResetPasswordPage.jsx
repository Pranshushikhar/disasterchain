import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/i18n';
import Icon from '../components/Icons';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialToken = (searchParams.get('token') || searchParams.get('code') || '').trim();

  const [recoveryCode, setRecoveryCode] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialToken) {
      setRecoveryCode(initialToken);
    }
  }, [initialToken]);

  const { resetPassword } = useAuth();

  const passwordCriteria = useMemo(() => {
    return {
      hasLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    return Object.values(passwordCriteria).filter(Boolean).length;
  }, [passwordCriteria]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedCode = recoveryCode.trim();
    if (!trimmedCode) {
      return setError('Please enter the recovery authorization code provided by your administrator.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match. Please re-enter both passwords.');
    }

    if (passwordScore < 5) {
      return setError('Password must meet all security requirements listed below.');
    }

    setLoading(true);
    const res = await resetPassword({ token: trimmedCode, password, confirmPassword });
    setLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.message || 'Password reset failed. The code may be invalid, expired, or already used.');
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
              background: 'rgba(73, 107, 90, 0.12)',
              color: 'var(--dc-forest, #263F35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.85rem',
            }}
          >
            <Icon name="key" size={24} color="var(--dc-forest, #263F35)" />
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
            CREDENTIAL RESET
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
            Set New Password
          </h1>
          <p style={{ color: 'var(--dc-text-secondary, #65706B)', fontSize: '0.86rem', lineHeight: 1.45 }}>
            Enter your verification recovery code and define your new secure account password.
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

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
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
              Password Reset Successfully
            </div>
            <p style={{ color: 'var(--dc-text-secondary, #65706B)', fontSize: '0.86rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Your credentials have been updated and synchronized with the security grid. You can now log in.
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
              Proceed to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.15rem' }}>
              <label
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--dc-text, #1E2725)',
                  marginBottom: '0.35rem',
                }}
              >
                <span>Recovery Authorization Code</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--dc-warning, #C38A35)', fontWeight: 600 }}>Valid for 15 min</span>
              </label>
              <input
                type="text"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm, 8px)',
                  border: '1px solid var(--border-medium, rgba(30, 39, 37, 0.14))',
                  backgroundColor: 'var(--dc-surface, #F8F5EE)',
                  color: 'var(--dc-text, #1E2725)',
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                placeholder="RCVR-XXXX-XXXX-XXXX"
              />
            </div>

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
                New Password
              </label>
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
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            </div>

            {/* Criteria Checklist */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.35rem',
                marginBottom: '1rem',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono, monospace)',
                backgroundColor: 'var(--dc-surface-2, #EFE9DC)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm, 8px)',
              }}
            >
              <span style={{ color: passwordCriteria.hasLength ? 'var(--dc-safe, #4F8060)' : 'var(--dc-text-muted, #8C938E)', fontWeight: 600 }}>
                {passwordCriteria.hasLength ? '✓' : '○'} 8+ Characters
              </span>
              <span style={{ color: passwordCriteria.hasUpper ? 'var(--dc-safe, #4F8060)' : 'var(--dc-text-muted, #8C938E)', fontWeight: 600 }}>
                {passwordCriteria.hasUpper ? '✓' : '○'} Uppercase (A-Z)
              </span>
              <span style={{ color: passwordCriteria.hasLower ? 'var(--dc-safe, #4F8060)' : 'var(--dc-text-muted, #8C938E)', fontWeight: 600 }}>
                {passwordCriteria.hasLower ? '✓' : '○'} Lowercase (a-z)
              </span>
              <span style={{ color: passwordCriteria.hasNumber ? 'var(--dc-safe, #4F8060)' : 'var(--dc-text-muted, #8C938E)', fontWeight: 600 }}>
                {passwordCriteria.hasNumber ? '✓' : '○'} Number (0-9)
              </span>
              <span style={{ color: passwordCriteria.hasSpecial ? 'var(--dc-safe, #4F8060)' : 'var(--dc-text-muted, #8C938E)', fontWeight: 600 }}>
                {passwordCriteria.hasSpecial ? '✓' : '○'} Special (!@#...)
              </span>
            </div>

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
                Confirm New Password
              </label>
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
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {loading ? 'Updating Credentials...' : 'Update Password'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--dc-text-secondary, #65706B)' }}>
          Don't have a recovery code yet?{' '}
          <Link to="/forgot-password" style={{ color: 'var(--dc-earth-green, #496B5A)', fontWeight: 700, textDecoration: 'none' }}>
            Request Recovery
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
