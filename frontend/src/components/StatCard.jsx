import React from 'react';
import Icon from './Icons';

const StatCard = ({ title, value, subtitle, icon, color = 'cyan', badge }) => {
  const colorMap = {
    red: {
      text: 'var(--dc-emergency, #C94B4B)',
      bg: 'rgba(201, 75, 75, 0.12)',
      border: 'rgba(201, 75, 75, 0.28)',
      glow: 'none',
      badgeClass: 'badge-critical',
    },
    amber: {
      text: 'var(--dc-warning, #C38A35)',
      bg: 'rgba(195, 138, 53, 0.12)',
      border: 'rgba(195, 138, 53, 0.28)',
      glow: 'none',
      badgeClass: 'badge-warning',
    },
    green: {
      text: 'var(--dc-safe, #4F8060)',
      bg: 'rgba(79, 128, 96, 0.12)',
      border: 'rgba(79, 128, 96, 0.28)',
      glow: 'none',
      badgeClass: 'badge-success',
    },
    mint: {
      text: 'var(--dc-safe, #4F8060)',
      bg: 'rgba(79, 128, 96, 0.12)',
      border: 'rgba(79, 128, 96, 0.28)',
      glow: 'none',
      badgeClass: 'badge-success',
    },
    indigo: {
      text: 'var(--dc-forest, #263F35)',
      bg: 'var(--dc-surface-2, #EFE9DC)',
      border: 'var(--border-medium, rgba(30, 39, 37, 0.14))',
      glow: 'none',
      badgeClass: 'badge-blockchain',
    },
    cyan: {
      text: 'var(--dc-earth-green, #496B5A)',
      bg: 'rgba(73, 107, 90, 0.12)',
      border: 'rgba(73, 107, 90, 0.28)',
      glow: 'none',
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
      className="spatial-panel spatial-panel-hoverable"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1.25rem 1.4rem',
        background: 'var(--dc-elevated, #FFFDF8)',
        border: '1px solid var(--border-medium, rgba(30, 39, 37, 0.14))',
        borderLeft: `4px solid ${theme.text}`,
        borderRadius: 'var(--radius-lg, 12px)',
        minHeight: '136px',
        boxSizing: 'border-box',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span className="micro-label" style={{ color: 'var(--dc-text-secondary, #65706B)', fontWeight: 600, fontSize: '0.8rem' }}>
          {title}
        </span>
        <div
          style={{
            width: '34px',
            height: '34px',
            minWidth: '34px',
            borderRadius: 'var(--radius-xs, 6px)',
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
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--dc-forest, #263F35)', lineHeight: 1 }}>
          {value}
        </span>
        {badge && (
          <span className={`badge ${theme.badgeClass}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.78rem', color: 'var(--dc-text-muted, #8C938E)', lineHeight: 1.3 }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default StatCard;
