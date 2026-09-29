import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { StatusBadge } from '../../components/StatusBadge';
import { OfflineBanner } from '../../components/OfflineBanner';
import { ImpactChainView } from '../../components/ImpactChainView';
import { LocalityModal } from '../../components/LocalityModal';
import { Emergency112Modal } from '../../components/Emergency112Modal';
import { dataService } from '../../services/dataService';
import { locationService } from '../../services/locationService';
import { storageService } from '../../services/storageService';
import { SituationData } from '../../types/situation';
import { ShelterItem } from '../../types/shelter';
import { haptics } from '../../utils/haptics';

export default function SituationScreen() {
  const [situation, setSituation] = useState<SituationData | null>(null);
  const [nearestShelter, setNearestShelter] = useState<ShelterItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [localityModalVisible, setLocalityModalVisible] = useState(false);
  const [emergency112Visible, setEmergency112Visible] = useState(false);
  const [localityName, setLocalityName] = useState('Chandigarh');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const loadData = useCallback(async (loc: string) => {
    try {
      const [sitData, sheltersList, sync] = await Promise.all([
        dataService.getSituation(loc),
        dataService.getShelters(),
        storageService.getLastSyncTime(),
      ]);

      setSituation(sitData);
      if (sheltersList.length > 0) {
        setNearestShelter(sheltersList[0]);
      }
      setLastSyncTime(sync || sitData.locality.lastUpdated);
    } catch (err) {
      console.warn('Failed loading situation data:', err);
    }
  }, []);

  useEffect(() => {
    loadData(localityName);
  }, [localityName, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    haptics.lightQuiet();
    await loadData(localityName);
    setRefreshing(false);
  };

  const handleSelectLocality = (name: string) => {
    setLocalityName(name);
    loadData(name);
  };

  const handleRequestGps = async () => {
    const granted = await locationService.requestPermission();
    if (granted) {
      const state = await locationService.getCurrentLocation();
      setLocalityName(state.localityName);
      loadData(state.localityName);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <Header
        localityName={situation?.locality.name || localityName}
        lastUpdated={situation?.locality.lastUpdated ? `Updated ${situation.locality.lastUpdated}` : 'Live'}
        isLive={!situation?.locality.isOffline && !situation?.locality.isStale}
        onSelectLocality={() => setLocalityModalVisible(true)}
        onCall112={() => setEmergency112Visible(true)}
      />

      <OfflineBanner
        isOffline={Boolean(situation?.locality.isOffline)}
        isStale={Boolean(situation?.locality.isStale)}
        lastSyncTime={lastSyncTime}
        onRetry={onRefresh}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.terracotta}
            colors={[colors.terracotta]}
          />
        }
      >
        {/* OPERATIONAL POSTURE */}
        <View style={styles.heroSection}>
          <Text style={styles.sectionOverline}>CURRENT SITUATION</Text>
          <Text style={styles.dominantHeadline}>
            {situation?.headline || 'Heavy rainfall is increasing waterlogging risk in low-lying areas.'}
          </Text>

          <View style={styles.riskRow}>
            <View style={styles.riskColumn}>
              <Text style={styles.riskMetaLabel}>CURRENT RISK</Text>
              <StatusBadge level={situation?.currentRisk || 'ELEVATED'} size="lg" />
            </View>

            <View style={styles.directiveColumn}>
              <Text style={styles.riskMetaLabel}>ACTION DIRECTIVE</Text>
              <Text style={styles.directiveText}>
                {situation?.primaryDirective || 'Avoid low-lying underpasses and watercourses.'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* WHY SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WHY</Text>
          <Text style={styles.sectionSubtitle}>Operational threshold analysis</Text>

          <View style={styles.whyList}>
            {(situation?.why || []).map((w) => (
              <View key={w.id} style={styles.whyItem}>
                <View style={styles.whyBullet} />
                <View style={styles.whyContent}>
                  <Text style={styles.whyMetric}>{w.metric.toUpperCase()}</Text>
                  <Text style={styles.whyValue}>
                    {w.value} <Text style={styles.whyThreshold}>({w.threshold})</Text>
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* WHAT CHANGED SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WHAT CHANGED</Text>
          <Text style={styles.sectionSubtitle}>Chronological telemetry developments</Text>

          <View style={styles.timelineList}>
            {(situation?.whatChanged || []).map((c) => (
              <View key={c.id} style={styles.timelineItem}>
                <Text style={styles.timelineTime}>{c.time}</Text>
                <View style={styles.timelineBody}>
                  <Text style={styles.timelineTitle}>{c.title}</Text>
                  <Text style={styles.timelineDetail}>{c.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* WEATHER -> IMPACT PIPELINE */}
        {situation?.impactChain && (
          <View style={styles.section}>
            <ImpactChainView impact={situation.impactChain} />
          </View>
        )}

        <View style={styles.divider} />

        {/* NEAREST RELIEF */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>NEAREST RELIEF</Text>
              <Text style={styles.sectionSubtitle}>Civil shelter verified capacity</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/shelters' as any)}
              accessibilityRole="button"
            >
              <Text style={styles.viewAllText}>ALL SHELTERS →</Text>
            </TouchableOpacity>
          </View>

          {nearestShelter && (
            <View style={styles.shelterCard}>
              <View style={styles.shelterHeader}>
                <Text style={styles.shelterName}>{nearestShelter.name}</Text>
                <Text style={styles.shelterDist}>{nearestShelter.distanceKm} km</Text>
              </View>
              <Text style={styles.shelterLocation}>{nearestShelter.location}</Text>

              <View style={styles.shelterStats}>
                <Text style={styles.shelterOccupancy}>
                  Capacity: {nearestShelter.currentOccupancy}/{nearestShelter.capacity} occupied
                </Text>
                <Text style={styles.shelterSource}>· {nearestShelter.source}</Text>
              </View>

              <View style={styles.shelterActions}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => {
                    haptics.mediumOperational();
                    router.push(`/shelters?id=${nearestShelter.id}` as any);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Navigate to ${nearestShelter.name}`}
                >
                  <Text style={styles.navButtonText}>NAVIGATE TO SHELTER</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* ASK DISASTERCHAIN (WEATHERGPT CONSOLE ENTRY) */}
        <View style={styles.intelligenceBanner}>
          <View style={styles.intelligenceHeader}>
            <Text style={styles.intelligenceBadge}>INTELLIGENCE CONSOLE</Text>
            <Text style={styles.intelligenceAttribution}>WEATHERGPT 2.0</Text>
          </View>

          <Text style={styles.intelligencePrompt}>
            Need situational clarification on roads, flooded sectors, or safe travel routes?
          </Text>

          <TouchableOpacity
            style={styles.askButton}
            onPress={() => {
              haptics.mediumOperational();
              router.push('/weathergpt' as any);
            }}
            accessibilityRole="button"
            accessibilityLabel="Open Ask DisasterChain weather intelligence console"
          >
            <Text style={styles.askButtonText}>ASK DISASTERCHAIN →</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER ATTRIBUTION */}
        <View style={styles.footerSection}>
          <Text style={styles.footerAttribution}>
            {situation?.sourceAttribution || 'DisasterChain Crisis Grid · Verified Field Observers'}
          </Text>
          <Text style={styles.footerGovDisclaimer}>
            Civil intelligence network. For government life-safety rescue dispatch, call 112.
          </Text>
        </View>
      </ScrollView>

      {/* MODALS */}
      <LocalityModal
        visible={localityModalVisible}
        currentLocality={localityName}
        onSelectLocality={handleSelectLocality}
        onRequestGps={handleRequestGps}
        onClose={() => setLocalityModalVisible(false)}
      />

      <Emergency112Modal
        visible={emergency112Visible}
        onClose={() => setEmergency112Visible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionOverline: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.terracotta,
    marginBottom: 8,
  },
  dominantHeadline: {
    fontFamily: typography.serif,
    fontSize: 26,
    lineHeight: 33,
    fontWeight: '500',
    color: colors.paper,
    letterSpacing: -0.3,
    marginBottom: 20,
  },
  riskRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  riskColumn: {
    flex: 1,
  },
  directiveColumn: {
    flex: 2,
  },
  riskMetaLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginBottom: 6,
  },
  directiveText: {
    fontFamily: typography.sans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: colors.paper,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: 16,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: typography.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: colors.paper,
  },
  sectionSubtitle: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  viewAllText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.terracotta,
  },
  whyList: {
    gap: 12,
  },
  whyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  whyBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.terracotta,
    marginTop: 5,
  },
  whyContent: {
    flex: 1,
  },
  whyMetric: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.textMuted,
  },
  whyValue: {
    fontFamily: typography.sans,
    fontSize: 14,
    fontWeight: '500',
    color: colors.paper,
    marginTop: 1,
  },
  whyThreshold: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.textMuted,
  },
  timelineList: {
    gap: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  timelineTime: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    color: colors.terracotta,
    letterSpacing: 0.5,
    width: 44,
  },
  timelineBody: {
    flex: 1,
  },
  timelineTitle: {
    fontFamily: typography.sans,
    fontSize: 14,
    fontWeight: '600',
    color: colors.paper,
  },
  timelineDetail: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  shelterCard: {
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  shelterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  shelterName: {
    fontFamily: typography.sans,
    fontSize: 15,
    fontWeight: '600',
    color: colors.paper,
    flex: 1,
  },
  shelterDist: {
    fontFamily: typography.mono,
    fontSize: 12,
    fontWeight: '700',
    color: colors.terracotta,
  },
  shelterLocation: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  shelterStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  shelterOccupancy: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.safe,
  },
  shelterSource: {
    fontFamily: typography.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  shelterActions: {
    marginTop: 12,
  },
  navButton: {
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  navButtonText: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.paper,
  },
  intelligenceBanner: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  intelligenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  intelligenceBadge: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.terracotta,
  },
  intelligenceAttribution: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.textMuted,
  },
  intelligencePrompt: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  askButton: {
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.terracottaDark,
  },
  askButtonText: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.terracotta,
  },
  footerSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    alignItems: 'center',
    gap: 4,
  },
  footerAttribution: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footerGovDisclaimer: {
    fontFamily: typography.sans,
    fontSize: 11,
    color: colors.textDim,
    textAlign: 'center',
  },
});
