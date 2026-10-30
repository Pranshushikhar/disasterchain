import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icons';
import { useTranslation } from '../i18n/i18n';

const RegisterPage = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  const { register, resendVerification } = useAuth();

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

    if (password !== confirmPassword) {
      return setError('Passwords do not match. Please re-enter both passwords.');
    }

    if (passwordScore < 5) {
      return setError('Password does not meet all security requirements listed below.');
    }

    setLoading(true);
    const result = await register({
      name,
      email,
      password,
      confirmPassword,
      role,
    });
    setLoading(false);

    if (result.success) {
      setRegisteredSuccess(true);
      setRegisteredEmail(email);
    } else {
      setError(result.message || 'Registration failed. Please verify submitted parameters.');
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendStatus('');
    const res = await resendVerification(registeredEmail);
    setResending(false);
    setResendStatus(res.message);
  };

  if (registeredSuccess) {
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
              marginBottom: '1.25rem',
            }}
          >
            <Icon name="check-circle" size={32} color="var(--dc-safe, #4F8060)" />
          </div>

          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--dc-text, #1E2725)',
              marginBottom: '0.5rem',
            }}
          >
            Account Created
          </h2>

          <p
            style={{
              color: 'var(--dc-text-secondary, #65706B)',
              fontSize: '0.88rem',
              lineHeight: 1.5,
              marginBottom: '1.5rem',
            }}
          >
            A verification link was dispatched to <strong>{registeredEmail}</strong>. Please check your inbox to activate your account.
          </p>

          {resendStatus && (
            <div
              style={{
                background: 'rgba(79, 128, 96, 0.1)',
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-sm, 8px)',
                border: '1px solid var(--border-medium, rgba(30, 39, 37, 0.14))',
                backgroundColor: 'var(--dc-surface, #F8F5EE)',
                color: 'var(--dc-text, #1E2725)',
                fontWeight: 600,
                cursor: resending ? 'not-allowed' : 'pointer',
              }}
            >
              {resending ? 'Dispatching...' : 'Resend Verification Link'}
            </button>

            <Link
              to="/login"
              style={{
                width: '100%',
                display: 'block',
                boxSizing: 'border-box',
                padding: '10px',
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
        </div>
      </div>
    );
  }

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
          maxWidth: '500px',
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
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.70rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--dc-earth-green, #496B5A)',
              marginBottom: '0.25rem',
            }}
          >
            CITIZEN & RESPONDER ENROLLMENT
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
            Create DisasterChain Account
          </h1>
          <p style={{ color: 'var(--dc-text-secondary, #65706B)', fontSize: '0.86rem', lineHeight: 1.45 }}>
            Register to submit verified hazard reports, access emergency shelter reserves, and coordinate local community relief.
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

        <form onSubmit={handleSubmit}>
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
              Full Name
            </label>
            <input
              type="text"
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Captain Shikhar Sharma"
            />
          </div>

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
              Email Address
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@disasterchain.org"
            />
          </div>

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
              Community Role
            </label>
            <select
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
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="citizen">Citizen (General Access & Safety Updates)</option>
              <option value="volunteer">Volunteer (On-ground Community Aid)</option>
              <option value="ngo">NGO / Relief Organization</option>
              <option value="responder">First Responder (Official Dispatch Team)</option>
            </select>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--dc-text, #1E2725)',
                marginBottom: '0.35rem',
              }}
            >
              Password
            </label>
            <input
              type="password"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />
          </div>

          {/* Password Security Criteria */}
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
              {passwordCriteria.hasUpper ? '✓' : '○'} Uppercase Letter
            </span>
            <span style={{ color: passwordCriteria.hasLower ? 'var(--dc-safe, #4F8060)' : 'var(--dc-text-muted, #8C938E)', fontWeight: 600 }}>
              {passwordCriteria.hasLower ? '✓' : '○'} Lowercase Letter
            </span>
            <span style={{ color: passwordCriteria.hasNumber ? 'var(--dc-safe, #4F8060)' : 'var(--dc-text-muted, #8C938E)', fontWeight: 600 }}>
              {passwordCriteria.hasNumber ? '✓' : '○'} Number (0-9)
            </span>
            <span style={{ color: passwordCriteria.hasSpecial ? 'var(--dc-safe, #4F8060)' : 'var(--dc-text-muted, #8C938E)', fontWeight: 600 }}>
              {passwordCriteria.hasSpecial ? '✓' : '○'} Special Symbol (!@#$)
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
              Confirm Password
            </label>
            <input
              type="password"
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
              transition: 'background-color 0.15s ease',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--dc-text-secondary, #65706B)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--dc-earth-green, #496B5A)', fontWeight: 700, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
