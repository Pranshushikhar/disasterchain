import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RiskLevel } from '../types/situation';

interface StatusBadgeProps {
  level: RiskLevel | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ level, size = 'md' }) => {
  const normLevel = (level || 'NORMAL').toUpperCase() as RiskLevel;

  let bg = colors.safeBg;
  let border = colors.safeBorder;
  let text = colors.safe;
  let symbol = '✓ NORMAL';

  switch (normLevel) {
    case 'CRITICAL':
      bg = colors.criticalBg;
      border = colors.criticalBorder;
      text = colors.critical;
      symbol = '▲ CRITICAL';
      break;
    case 'ELEVATED':
      bg = colors.elevatedBg;
      border = colors.elevatedBorder;
      text = colors.elevated;
      symbol = '▲ ELEVATED';
      break;
    case 'ADVISORY':
      bg = colors.advisoryBg;
      border = colors.advisoryBorder;
      text = colors.advisory;
      symbol = 'ℹ ADVISORY';
      break;
    case 'NORMAL':
    default:
      bg = colors.safeBg;
      border = colors.safeBorder;
      text = colors.safe;
      symbol = '✓ NORMAL';
      break;
  }

  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: border },
        isLg && styles.badgeLg,
        isSm && styles.badgeSm,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Risk severity: ${normLevel}`}
    >
      <Text
        style={[
          styles.text,
          { color: text },
          isLg && styles.textLg,
          isSm && styles.textSm,
        ]}
      >
        {symbol}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeLg: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  textSm: {
    fontSize: 9,
  },
  textLg: {
    fontSize: 13,
  },
});
