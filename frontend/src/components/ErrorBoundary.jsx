import React from 'react';
import Icon from './Icons';
import { useTranslation } from '../i18n';

const ErrorFallbackView = ({ inline, onReset }) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        minHeight: inline ? '240px' : '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'radial-gradient(circle at center, #1c110d 0%, #0c0705 100%)',
        color: '#ffffff',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
      }}
    >
      <div
        className="spatial-panel"
        style={{
          maxWidth: '520px',
          width: '100%',
          background: 'var(--dc-elevated, #FFFDF8)',
          border: '1px solid var(--dc-border, #DCD3C3)',
          borderRadius: 'var(--radius-md, 8px)',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(38, 63, 53, 0.12)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(201, 75, 75, 0.12)',
            border: '1px solid rgba(201, 75, 75, 0.3)',
            color: 'var(--dc-emergency, #C94B4B)',
            marginBottom: '1.25rem',
          }}
        >
          <Icon name="alert-triangle" size={28} color="var(--dc-emergency, #C94B4B)" />
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display, inherit)',
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--dc-text, #1E2725)',
            marginBottom: '0.5rem',
          }}
        >
          {t('errorBoundary.recoveryMode', 'Interface Recovery Mode')}
        </h2>

        <p
          style={{
            color: 'var(--dc-text-subtle, #65706B)',
            fontSize: '0.88rem',
            lineHeight: 1.5,
            marginBottom: '1.5rem',
          }}
        >
          {t('errorBoundary.recoveryDesc', 'A localized component encountered an unexpected rendering condition. DisasterChain emergency telemetry and network operations remain secure.')}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onReset}
            className="btn btn-primary"
            style={{
              background: 'var(--dc-forest, #263F35)',
              color: '#FFFDF8',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            ↻ {t('common.retry', 'RETRY INTERFACE')}
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="btn btn-secondary"
            style={{
              background: 'var(--dc-surface, #F8F5EE)',
              color: 'var(--dc-text, #1E2725)',
              border: '1px solid var(--dc-border, #DCD3C3)',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {t('common.returnHome', 'Return to Hub')}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Top-Level Application & Component-Level Error Boundary
 * Catches any uncaught React rendering exceptions, logs diagnostics,
 * and displays a sleek DisasterChain recovery screen rather than letting the app crash to a blank page.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[DisasterChain Recovery Engine] Uncaught UI Component Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error, this.handleReset)
          : this.props.fallback;
      }

      return <ErrorFallbackView inline={this.props.inline} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
