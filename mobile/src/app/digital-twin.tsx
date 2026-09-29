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

interface CatchmentSector {
  id: string;
  name: string;
  elevationMeters: number;
  inundationRiskPct: number;
  drainageRateLps: number;
  status: 'SATURATED' | 'HIGH_STRESS' | 'MODERATE' | 'NOMINAL';
  directive: string;
}

const CATCHMENT_SECTORS: CatchmentSector[] = [
  {
    id: 'sec-17',
    name: 'Sector 17 Commercial Basin',
    elevationMeters: 304,
    inundationRiskPct: 88,
    drainageRateLps: 140,
    status: 'SATURATED',
    directive: 'Halt vehicle access to basement lots & underpass.',
  },
  {
    id: 'sec-22',
    name: 'Sector 22 Residential Slope',
    elevationMeters: 312,
    inundationRiskPct: 62,
    drainageRateLps: 280,
    status: 'HIGH_STRESS',
    directive: 'Storm mains at capacity; localized surface pooling.',
  },
  {
    id: 'sukhna',
    name: 'Sukhna Choe Discharge Canal',
    elevationMeters: 298,
    inundationRiskPct: 94,
    drainageRateLps: 620,
    status: 'SATURATED',
    directive: 'Flood gates calibrated; buffer margin: 0.4m.',
  },
  {
    id: 'madhya',
    name: 'Madhya Marg Ridge Corridor',
    elevationMeters: 326,
    inundationRiskPct: 15,
    drainageRateLps: 450,
    status: 'NOMINAL',
    directive: 'Recommended safe vehicular detour route.',
  },
];

export default function DigitalTwinScreen() {
  const [selectedSector, setSelectedSector] = useState<CatchmentSector>(CATCHMENT_SECTORS[0]);
  const [viewMode, setViewMode] = useState<'2.5D_ISOMETRIC' | '2D_ELEVATION'>('2.5D_ISOMETRIC');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← RETURN</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerOverline}>SPATIAL HYDROLOGY</Text>
          <Text style={styles.headerTitle}>DIGITAL TWIN MODEL</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* MANDATORY SIMULATION LABEL */}
      <View style={styles.simWarning}>
        <Text style={styles.simWarningBadge}>● COMPUTATIONAL SIMULATION</Text>
        <Text style={styles.simWarningText}>
          Hydrological twin based on elevation DEM data and radar precipitation estimates. Not a replacement for civil police road closures.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* VIEW MODE TOGGLE */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === '2.5D_ISOMETRIC' && styles.toggleBtnActive]}
            onPress={() => {
              haptics.lightQuiet();
              setViewMode('2.5D_ISOMETRIC');
            }}
          >
            <Text style={[styles.toggleText, viewMode === '2.5D_ISOMETRIC' && styles.toggleTextActive]}>
              2.5D ISOMETRIC MESH
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === '2D_ELEVATION' && styles.toggleBtnActive]}
            onPress={() => {
              haptics.lightQuiet();
              setViewMode('2D_ELEVATION');
            }}
          >
            <Text style={[styles.toggleText, viewMode === '2D_ELEVATION' && styles.toggleTextActive]}>
              2D ELEVATION FALLBACK
            </Text>
          </TouchableOpacity>
        </View>

        {/* TACTICAL SPATIAL CANVAS */}
        <View style={styles.meshViewport}>
          <View style={styles.meshGrid}>
            {CATCHMENT_SECTORS.map((sector) => {
              const isSelected = selectedSector.id === sector.id;
              let sectorColor = colors.safe;
              if (sector.status === 'SATURATED') sectorColor = colors.critical;
              else if (sector.status === 'HIGH_STRESS') sectorColor = colors.elevated;

              return (
                <TouchableOpacity
                  key={sector.id}
                  style={[
                    styles.isometricBlock,
                    {
                      borderColor: isSelected ? colors.paper : sectorColor,
                      backgroundColor: isSelected ? 'rgba(214, 106, 53, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    },
                  ]}
                  onPress={() => {
                    haptics.mediumOperational();
                    setSelectedSector(sector);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Inspect sector ${sector.name}`}
                >
                  <Text style={styles.sectorElevText}>{sector.elevationMeters}m</Text>
                  <Text style={styles.sectorMeshName}>{sector.name}</Text>
                  <Text style={[styles.sectorRiskTag, { color: sectorColor }]}>
                    {sector.inundationRiskPct}% RISK
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.canvasHint}>TAP SECTOR TO INSPECT RUNOFF MODEL</Text>
        </View>

        {/* INSPECT DETAIL SHEET */}
        <View style={styles.inspectCard}>
          <View style={styles.inspectHeader}>
            <View>
              <Text style={styles.inspectOverline}>SIMULATED SECTOR</Text>
              <Text style={styles.inspectTitle}>{selectedSector.name}</Text>
            </View>
            <StatusBadge
              level={
                selectedSector.status === 'SATURATED'
                  ? 'CRITICAL'
                  : selectedSector.status === 'HIGH_STRESS'
                  ? 'ELEVATED'
                  : 'NORMAL'
              }
              size="md"
            />
          </View>

          <View style={styles.metricGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>ELEVATION</Text>
              <Text style={styles.metricValue}>{selectedSector.elevationMeters}m MSL</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>DRAIN DISCHARGE</Text>
              <Text style={styles.metricValue}>{selectedSector.drainageRateLps} L/s</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>SIMULATED INUNDATION</Text>
              <Text style={[styles.metricValue, { color: selectedSector.inundationRiskPct > 70 ? colors.critical : colors.paper }]}>
                {selectedSector.inundationRiskPct}%
              </Text>
            </View>
          </View>

          <View style={styles.directiveBox}>
            <Text style={styles.directiveLabel}>SIMULATION DIRECTIVE</Text>
            <Text style={styles.directiveText}>{selectedSector.directive}</Text>
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
  simWarning: {
    padding: 12,
    backgroundColor: '#1E1712',
    borderBottomWidth: 1,
    borderBottomColor: '#38281C',
    gap: 4,
  },
  simWarningBadge: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.staleAmber,
    letterSpacing: 1,
  },
  simWarningText: {
    fontFamily: typography.sans,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: colors.surfaceHighlight,
    borderColor: colors.terracotta,
  },
  toggleText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  toggleTextActive: {
    color: colors.terracotta,
  },
  meshViewport: {
    backgroundColor: '#0F120F',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 14,
    gap: 12,
  },
  meshGrid: {
    gap: 10,
  },
  isometricBlock: {
    padding: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    gap: 4,
  },
  sectorElevText: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  sectorMeshName: {
    fontFamily: typography.sans,
    fontSize: 14,
    fontWeight: '600',
    color: colors.paper,
  },
  sectorRiskTag: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
  },
  canvasHint: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.textDim,
    textAlign: 'center',
  },
  inspectCard: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    gap: 14,
  },
  inspectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  inspectOverline: {
    fontFamily: typography.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.terracotta,
  },
  inspectTitle: {
    fontFamily: typography.sans,
    fontSize: 16,
    fontWeight: '700',
    color: colors.paper,
    marginTop: 2,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.surfaceHighlight,
    padding: 8,
    borderRadius: 4,
  },
  metricLabel: {
    fontFamily: typography.mono,
    fontSize: 8,
    color: colors.textMuted,
  },
  metricValue: {
    fontFamily: typography.mono,
    fontSize: 12,
    fontWeight: '700',
    color: colors.paper,
    marginTop: 2,
  },
  directiveBox: {
    backgroundColor: colors.surfaceHighlight,
    padding: 10,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.terracotta,
  },
  directiveLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    fontWeight: '700',
    color: colors.terracotta,
    letterSpacing: 1,
  },
  directiveText: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.paper,
    marginTop: 2,
  },
});
