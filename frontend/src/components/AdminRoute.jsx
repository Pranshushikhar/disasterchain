import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          {t('adminRoute.validatingCredentials', 'Validating Administrator Credentials...')}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          {t('adminRoute.verifyingAuthority', 'Verifying multi-sig disaster management authority')}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="page-body" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '2.5rem 2rem', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️⛔</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', marginBottom: '0.5rem' }}>
            {t('adminRoute.accessRestricted', 'Administrator Access Restricted')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {t('adminRoute.accessRestrictedDesc', 'You are signed in as a standard citizen / student account. Administrator privileges are required to modify disaster relief queues, configure shelters, or trigger ledger distributions.')}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <a href="/dashboard" className="btn btn-primary">
              {t('adminRoute.returnDashboard', 'Return to Dashboard')}
            </a>
            <a href="/profile" className="btn btn-outline">
              {t('adminRoute.viewAccount', 'View My Account')}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
