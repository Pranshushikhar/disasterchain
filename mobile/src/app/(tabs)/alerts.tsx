import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { StatusBadge } from '../../components/StatusBadge';
import { dataService } from '../../services/dataService';
import { AlertItem } from '../../types/alert';
import { haptics } from '../../utils/haptics';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WEATHER' | 'SHELTER'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const loadAlerts = useCallback(async () => {
    const list = await dataService.getAlerts();
    setAlerts(list);
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const onRefresh = async () => {
    setRefreshing(true);
    haptics.lightQuiet();
    await loadAlerts();
    setRefreshing(false);
  };

  const handleShareAlert = async (alert: AlertItem) => {
    haptics.mediumOperational();
    try {
      await Share.share({
        message: `🚨 [DISASTERCHAIN EMERGENCY ALERT]\n${alert.title}\nSeverity: ${alert.severity}\nLocation: ${alert.location}\nAction: ${alert.recommendedAction}`,
      });
    } catch {}
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'CRITICAL') return a.isCritical || a.severity === 'CRITICAL';
    if (filter === 'WEATHER') return a.category === 'WEATHER' || a.category === 'FLOOD';
    if (filter === 'SHELTER') return a.category === 'SHELTER';
    return true;
  });

  const renderAlertItem = ({ item }: { item: AlertItem }) => {
    const isCrit = item.isCritical || item.severity === 'CRITICAL';

    return (
      <View style={[styles.alertCard, isCrit && styles.alertCardCritical]}>
        {/* TOP STATUS AND TIME */}
        <View style={styles.cardHeader}>
          <StatusBadge level={item.severity} size="sm" />
          <Text style={styles.timestampText}>{item.freshness || item.timestamp}</Text>
        </View>

        {/* TITLE & LOCATION */}
        <Text style={[styles.alertTitle, isCrit && styles.alertTitleCritical]}>
          {item.title}
        </Text>
        <Text style={styles.locationText}>📍 {item.location}</Text>

        {/* WHAT HAPPENED */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>WHAT HAPPENED</Text>
          <Text style={styles.fieldValue}>{item.whatHappened}</Text>
        </View>

        {/* WHY IT MATTERS */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>WHY IT MATTERS</Text>
          <Text style={styles.fieldValue}>{item.whyItMatters}</Text>
        </View>

        {/* RECOMMENDED ACTION */}
        <View style={[styles.actionBlock, isCrit && styles.actionBlockCritical]}>
          <Text style={styles.actionBlockLabel}>RECOMMENDED CIVIL ACTION</Text>
          <Text style={styles.actionBlockText}>{item.recommendedAction}</Text>
        </View>

        {/* FOOTER: SOURCE & ACTION BUTTONS */}
        <View style={styles.cardFooter}>
          <Text style={styles.sourceText}>Source: {item.source}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() => handleShareAlert(item)}
              accessibilityRole="button"
              accessibilityLabel="Share emergency alert"
            >
              <Text style={styles.shareBtnText}>SHARE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewSituationBtn}
              onPress={() => {
                haptics.mediumOperational();
                router.push('/(tabs)');
              }}
              accessibilityRole="button"
              accessibilityLabel="View full operational situation"
            >
              <Text style={styles.viewSituationBtnText}>VIEW SITUATION →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.screenHeader}>
        <Text style={styles.headerOverline}>CIVIL DISPATCHES</Text>
        <Text style={styles.headerTitle}>ACTIVE EMERGENCY ALERTS</Text>

        {/* FILTER BAR */}
        <View style={styles.filterRow}>
          {(['ALL', 'CRITICAL', 'WEATHER', 'SHELTER'] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterTab, filter === cat && styles.filterTabActive]}
              onPress={() => {
                haptics.lightQuiet();
                setFilter(cat);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Filter: ${cat}`}
            >
              <Text style={[styles.filterTabText, filter === cat && styles.filterTabTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlertItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.terracotta}
            colors={[colors.terracotta]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>NO ACTIVE THREATS IN SECTOR</Text>
            <Text style={styles.emptySub}>
              All monitored telemetry metrics remain within standard civil thresholds.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.background,
  },
  headerOverline: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.terracotta,
  },
  headerTitle: {
    fontFamily: typography.sans,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.paper,
    marginTop: 2,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 3,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  filterTabActive: {
    backgroundColor: colors.terracottaDark,
    borderColor: colors.terracotta,
  },
  filterTabText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.paper,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  alertCard: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
  },
  alertCardCritical: {
    borderColor: colors.criticalBorder,
    borderLeftWidth: 4,
    borderLeftColor: colors.critical,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestampText: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  alertTitle: {
    fontFamily: typography.sans,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    color: colors.paper,
    marginBottom: 4,
  },
  alertTitleCritical: {
    color: '#FF6E60',
  },
  locationText: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  fieldBlock: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 2,
  },
  fieldValue: {
    fontFamily: typography.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.paper,
  },
  actionBlock: {
    backgroundColor: colors.surfaceHighlight,
    padding: 10,
    borderRadius: 4,
    marginVertical: 4,
    borderLeftWidth: 2,
    borderLeftColor: colors.borderStrong,
  },
  actionBlockCritical: {
    borderLeftColor: colors.critical,
    backgroundColor: colors.criticalBg,
  },
  actionBlockLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.terracotta,
    marginBottom: 3,
  },
  actionBlockText: {
    fontFamily: typography.sans,
    fontSize: 13,
    fontWeight: '600',
    color: colors.paper,
    lineHeight: 18,
  },
  cardFooter: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    flexDirection: 'column',
    gap: 10,
  },
  sourceText: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  shareBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 3,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  shareBtnText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  viewSituationBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 3,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.terracottaDark,
  },
  viewSituationBtnText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.terracotta,
    letterSpacing: 0.8,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: typography.mono,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 18,
  },
});
