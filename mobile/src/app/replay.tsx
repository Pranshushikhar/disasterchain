import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { StatusBadge } from '../components/StatusBadge';
import { haptics } from '../utils/haptics';

interface ReplayFrame {
  offsetHours: number;
  label: string;
  timeFormatted: string;
  rainfallMm: number;
  riskLevel: 'NORMAL' | 'ADVISORY' | 'ELEVATED' | 'CRITICAL';
  activeIncidents: number;
  affectedCorridor: string;
  directive: string;
  isSimulatedFuture: boolean;
}

const REPLAY_FRAMES: ReplayFrame[] = [
  {
    offsetHours: -6,
    label: 'T-6H',
    timeFormatted: '03:00 AM',
    rainfallMm: 4,
    riskLevel: 'NORMAL',
    activeIncidents: 0,
    affectedCorridor: 'Catchment nominal · Dry roads',
    directive: 'No restrictions on transit.',
    isSimulatedFuture: false,
  },
  {
    offsetHours: -4,
    label: 'T-4H',
    timeFormatted: '05:00 AM',
    rainfallMm: 12,
    riskLevel: 'NORMAL',
    activeIncidents: 1,
    affectedCorridor: 'Initial drainage saturation',
    directive: 'Precautionary monitoring initiated.',
    isSimulatedFuture: false,
  },
  {
    offsetHours: -2,
    label: 'T-2H',
    timeFormatted: '07:00 AM',
    rainfallMm: 28,
    riskLevel: 'ADVISORY',
    activeIncidents: 3,
    affectedCorridor: 'Sector 17 underpass water accumulating',
    directive: 'Caution advised around drainage grates.',
    isSimulatedFuture: false,
  },
  {
    offsetHours: 0,
    label: 'NOW',
    timeFormatted: '09:00 AM',
    rainfallMm: 42,
    riskLevel: 'ELEVATED',
    activeIncidents: 7,
    affectedCorridor: 'Dakshin Marg underpass inundated (0.6m)',
    directive: 'Avoid low-lying underpasses. Divert to ridge routes.',
    isSimulatedFuture: false,
  },
  {
    offsetHours: 2,
    label: '+2H',
    timeFormatted: '11:00 AM',
    rainfallMm: 26,
    riskLevel: 'ELEVATED',
    activeIncidents: 5,
    affectedCorridor: 'Drainage receding; debris obstruction',
    directive: 'Horticulture & municipal clearance active.',
    isSimulatedFuture: true,
  },
  {
    offsetHours: 4,
    label: '+4H',
    timeFormatted: '01:00 PM',
    rainfallMm: 10,
    riskLevel: 'ADVISORY',
    activeIncidents: 3,
    affectedCorridor: 'Partial lane reopenings expected',
    directive: 'Proceed with low vehicle speed.',
    isSimulatedFuture: true,
  },
  {
    offsetHours: 6,
    label: '+6H',
    timeFormatted: '03:00 PM',
    rainfallMm: 3,
    riskLevel: 'NORMAL',
    activeIncidents: 1,
    affectedCorridor: 'Corridor stabilized',
    directive: 'Standard civil operations restored.',
    isSimulatedFuture: true,
  },
];

export default function ReplayScreen() {
  const [selectedIndex, setSelectedIndex] = useState(3); // Defaults to NOW
  const currentFrame = REPLAY_FRAMES[selectedIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← RETURN</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerOverline}>TEMPORAL SCRUB</Text>
          <Text style={styles.headerTitle}>CRISIS REPLAY</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* SIMULATION WARNING BANNER */}
      <View style={styles.simBanner}>
        <Text style={styles.simBadge}>SIMULATION / HISTORICAL REPLAY</Text>
        <Text style={styles.simText}>
          {currentFrame.isSimulatedFuture
            ? 'PROGNOSTIC PROJECTION: Data points past "NOW" are predictive hydrological models and do not represent verified current state.'
            : 'HISTORICAL REPLAY: Past telemetry records reconstructed for civil forensic review.'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* CURRENT SCRUB FRAME DETAIL */}
        <View style={styles.frameCard}>
          <View style={styles.frameHeader}>
            <View>
              <Text style={styles.frameLabel}>{currentFrame.label} FRAME</Text>
              <Text style={styles.frameTime}>{currentFrame.timeFormatted}</Text>
            </View>
            <StatusBadge level={currentFrame.riskLevel} size="md" />
          </View>

          {/* TELEMETRY GAUGES */}
          <View style={styles.gaugesRow}>
            <View style={styles.gaugeBox}>
              <Text style={styles.gaugeLabel}>RAINFALL</Text>
              <Text style={styles.gaugeValue}>{currentFrame.rainfallMm} mm/h</Text>
            </View>
            <View style={styles.gaugeBox}>
              <Text style={styles.gaugeLabel}>ACTIVE INCIDENTS</Text>
              <Text style={styles.gaugeValue}>{currentFrame.activeIncidents}</Text>
            </View>
          </View>

          {/* CORRIDOR CONTEXT */}
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>CORRIDOR STATE</Text>
            <Text style={styles.detailText}>{currentFrame.affectedCorridor}</Text>
          </View>

          {/* DIRECTIVE */}
          <View style={styles.directiveBlock}>
            <Text style={styles.directiveLabel}>PROGNOSTIC DIRECTIVE</Text>
            <Text style={styles.directiveText}>{currentFrame.directive}</Text>
          </View>
        </View>

        {/* THUMB SCRUBBER BAR */}
        <View style={styles.scrubberContainer}>
          <Text style={styles.scrubberTitle}>THUMB TIMELINE SCRUBBER</Text>
          <View style={styles.scrubTrack}>
            {REPLAY_FRAMES.map((frame, index) => {
              const isSelected = selectedIndex === index;
              const isNow = frame.label === 'NOW';
              return (
                <TouchableOpacity
                  key={frame.label}
                  style={[
                    styles.scrubStep,
                    isSelected && styles.scrubStepSelected,
                    isNow && styles.scrubStepNow,
                  ]}
                  onPress={() => {
                    haptics.lightQuiet();
                    setSelectedIndex(index);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Scrub to ${frame.label}`}
                >
                  <Text style={[styles.scrubStepText, isSelected && styles.scrubStepTextSelected]}>
                    {frame.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backBtnText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.terracotta,
    letterSpacing: 1,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerOverline: {
    fontFamily: typography.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.textMuted,
  },
  headerTitle: {
    fontFamily: typography.sans,
    fontSize: 16,
    fontWeight: '700',
    color: colors.paper,
  },
  simBanner: {
    padding: 12,
    backgroundColor: '#1E1914',
    borderBottomWidth: 1,
    borderBottomColor: '#3A2E20',
    gap: 4,
  },
  simBadge: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.staleAmber,
    letterSpacing: 1.2,
  },
  simText: {
    fontFamily: typography.sans,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  contentContainer: {
    padding: 16,
    gap: 20,
  },
  frameCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    gap: 14,
  },
  frameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  frameLabel: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.terracotta,
  },
  frameTime: {
    fontFamily: typography.serif,
    fontSize: 22,
    fontWeight: '600',
    color: colors.paper,
    marginTop: 2,
  },
  gaugesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gaugeBox: {
    flex: 1,
    backgroundColor: colors.surfaceHighlight,
    padding: 10,
    borderRadius: 4,
  },
  gaugeLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  gaugeValue: {
    fontFamily: typography.mono,
    fontSize: 15,
    fontWeight: '700',
    color: colors.paper,
    marginTop: 2,
  },
  detailBlock: {
    backgroundColor: colors.surfaceHighlight,
    padding: 10,
    borderRadius: 4,
  },
  detailLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  detailText: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.paper,
    marginTop: 2,
  },
  directiveBlock: {
    backgroundColor: colors.surfaceHighlight,
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.terracotta,
  },
  directiveLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.terracotta,
  },
  directiveText: {
    fontFamily: typography.sans,
    fontSize: 13,
    fontWeight: '600',
    color: colors.paper,
    marginTop: 2,
  },
  scrubberContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 12,
  },
  scrubberTitle: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  scrubTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 4,
    padding: 4,
  },
  scrubStep: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 3,
  },
  scrubStepSelected: {
    backgroundColor: colors.terracotta,
  },
  scrubStepNow: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  scrubStepText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  scrubStepTextSelected: {
    color: '#FFF',
  },
});
