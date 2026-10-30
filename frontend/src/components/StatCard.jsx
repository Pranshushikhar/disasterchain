import React from 'react';
import Icon from './Icons';

const StatCard = ({ title, value, subtitle, icon, color = 'cyan', badge }) => {
  const colorMap = {
    red: {
      text: '#EF5350',
      bg: 'rgba(239, 83, 80, 0.12)',
      border: 'rgba(239, 83, 80, 0.35)',
      badgeClass: 'badge-critical',
    },
    amber: {
      text: '#F2A541',
      bg: 'rgba(242, 165, 65, 0.12)',
      border: 'rgba(242, 165, 65, 0.35)',
      badgeClass: 'badge-warning',
    },
    green: {
      text: '#55C98A',
      bg: 'rgba(85, 201, 138, 0.12)',
      border: 'rgba(85, 201, 138, 0.35)',
      badgeClass: 'badge-success',
    },
    mint: {
      text: '#55C98A',
      bg: 'rgba(85, 201, 138, 0.12)',
      border: 'rgba(85, 201, 138, 0.35)',
      badgeClass: 'badge-success',
    },
    indigo: {
      text: '#818CF8',
      bg: 'rgba(129, 140, 248, 0.12)',
      border: 'rgba(129, 140, 248, 0.35)',
      badgeClass: 'badge-blockchain',
    },
    cyan: {
      text: '#38BDF8',
      bg: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.35)',
      badgeClass: 'badge-info',
    },
  };

  const theme = colorMap[color] || colorMap.cyan;

  const renderIcon = () => {
    if (!icon) return <Icon name="activity" size={18} color={theme.text} />;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'string' && /\p{Extended_Pictographic}/u.test(icon)) {
      return <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{icon}</span>;
    }
    return <Icon name={icon} size={18} color={theme.text} />;
  };

  return (
    <div
      className="dc-stat-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1.25rem 1.4rem',
        background: '#1B272D',
        border: '1px solid #2C393E',
        borderLeft: `4px solid ${theme.text}`,
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        minHeight: '136px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#AAB6B2',
            lineHeight: 1.3,
          }}
        >
          {title}
        </span>
        <div
          style={{
            width: '36px',
            height: '36px',
            minWidth: '36px',
            borderRadius: '8px',
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {renderIcon()}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '1.9rem',
            fontWeight: 800,
            color: '#F5F7F5',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </span>
        {badge && (
          <span className={`badge ${theme.badgeClass}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <div style={{ fontSize: '0.78rem', color: '#7E8C87', lineHeight: 1.4, marginTop: 'auto' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;
