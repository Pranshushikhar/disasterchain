import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface OfflineBannerProps {
  isOffline: boolean;
  isStale?: boolean;
  lastSyncTime?: string | null;
  onRetry?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  isStale,
  lastSyncTime,
  onRetry,
}) => {
  if (!isOffline && !isStale) return null;

  return (
    <View
      style={[
        styles.container,
        isOffline ? styles.offlineBg : styles.staleBg,
      ]}
      accessibilityRole="alert"
    >
      <View style={styles.textRow}>
        <View style={[styles.dot, isOffline ? styles.dotOffline : styles.dotStale]} />
        <Text style={styles.title}>
          {isOffline ? 'OFFLINE EMERGENCY MODE' : 'STALE TELEMETRY'}
        </Text>
      </View>

      <Text style={styles.subtext}>
        {lastSyncTime
          ? `Last synchronized: ${lastSyncTime}. Displaying cached civil safety data.`
          : 'Operating from secure device cache until connection is restored.'}
      </Text>

      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={styles.retryButton}
          accessibilityRole="button"
          accessibilityLabel="Retry connection"
        >
          <Text style={styles.retryText}>RETRY SYNC</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: 'column',
    gap: 4,
  },
  offlineBg: {
    backgroundColor: '#1E1B17',
    borderBottomColor: '#3A3228',
  },
  staleBg: {
    backgroundColor: '#191A16',
    borderBottomColor: '#2C2E27',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotOffline: {
    backgroundColor: colors.staleAmber,
  },
  dotStale: {
    backgroundColor: colors.textMuted,
  },
  title: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.paper,
  },
  subtext: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  retryButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 3,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  retryText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.terracotta,
    letterSpacing: 1,
  },
});
