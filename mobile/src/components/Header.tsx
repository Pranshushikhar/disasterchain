import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { haptics } from '../utils/haptics';

interface HeaderProps {
  localityName: string;
  lastUpdated?: string;
  isLive?: boolean;
  onSelectLocality?: () => void;
  onCall112?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  localityName,
  lastUpdated = 'Live',
  isLive = true,
  onSelectLocality,
  onCall112,
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <Text style={styles.brandTitle}>DISASTERCHAIN</Text>
          <View style={styles.brandSeparator} />
          <View style={styles.statusPill}>
            <View style={[styles.pulseDot, isLive ? styles.pulseGreen : styles.pulseAmber]} />
            <Text style={styles.statusText}>{isLive ? 'LIVE' : 'CACHED'}</Text>
          </View>
        </View>

        {onCall112 && (
          <TouchableOpacity
            style={styles.sosQuickBtn}
            onPress={() => {
              haptics.heavyEmergency();
              onCall112();
            }}
            accessibilityRole="button"
            accessibilityLabel="Emergency assistance call 112"
          >
            <Text style={styles.sosQuickText}>112</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.localityRow}
        onPress={() => {
          if (onSelectLocality) {
            haptics.lightQuiet();
            onSelectLocality();
          }
        }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Current locality: ${localityName}. Tap to change.`}
      >
        <Text style={styles.localityName}>{localityName.toUpperCase()}</Text>
        <Text style={styles.localityMeta}>· {lastUpdated}</Text>
        <Text style={styles.localityChevron}>▾</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontFamily: typography.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.terracotta,
  },
  brandSeparator: {
    width: 1,
    height: 10,
    backgroundColor: colors.borderStrong,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pulseGreen: {
    backgroundColor: colors.liveGreen,
  },
  pulseAmber: {
    backgroundColor: colors.staleAmber,
  },
  statusText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  sosQuickBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    backgroundColor: colors.criticalBg,
    borderWidth: 1,
    borderColor: colors.criticalBorder,
  },
  sosQuickText: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    color: colors.critical,
    letterSpacing: 1,
  },
  localityRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  localityName: {
    fontFamily: typography.sans,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.paper,
  },
  localityMeta: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  localityChevron: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
