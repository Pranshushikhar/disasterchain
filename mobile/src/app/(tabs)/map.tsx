import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Share,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { StatusBadge } from '../../components/StatusBadge';
import { dataService } from '../../services/dataService';
import { locationService } from '../../services/locationService';
import { ShelterItem } from '../../types/shelter';
import { haptics } from '../../utils/haptics';

interface MapMarker {
  id: string;
  title: string;
  type: 'HAZARD' | 'SHELTER' | 'SOS' | 'ROAD_BLOCK';
  risk: 'CRITICAL' | 'ELEVATED' | 'ADVISORY' | 'NORMAL';
  locationName: string;
  reportSummary: string;
  timestamp: string;
  nearestShelter: string;
  nearestDistance: string;
  xPct: number; // For clean canvas/cartographic grid placement
  yPct: number;
}

const CRISIS_MARKERS: MapMarker[] = [
  {
    id: 'm1',
    title: 'Dakshin Marg Underpass',
    type: 'HAZARD',
    risk: 'CRITICAL',
    locationName: 'SECTOR 17 & 22 JUNCTION',
    reportSummary: 'Waterlogging depth reached 0.6m; underpass closed by civil police.',
    timestamp: '12 min ago',
    nearestShelter: 'Civil Relief Center #2',
    nearestDistance: '1.4 km',
    xPct: 45,
    yPct: 38,
  },
  {
    id: 'm2',
    title: 'Sector 17 Multi-Level Shelter',
    type: 'SHELTER',
    risk: 'NORMAL',
    locationName: 'SECTOR 17 BRIDGE MARKET',
    reportSummary: 'Operational civil shelter. Dry hall, food packets, medical triage active.',
    timestamp: '18 min ago',
    nearestShelter: 'This facility',
    nearestDistance: '0 km',
    xPct: 62,
    yPct: 32,
  },
  {
    id: 'm3',
    title: 'Submerged Vehicle Assist',
    type: 'SOS',
    risk: 'CRITICAL',
    locationName: 'MADHYA MARG ROTARY',
    reportSummary: 'Civil responder team dispatched. 2 persons assisted to high ground.',
    timestamp: '24 min ago',
    nearestShelter: 'Sector 18 Community Centre',
    nearestDistance: '0.9 km',
    xPct: 75,
    yPct: 52,
  },
  {
    id: 'm4',
    title: 'Fallen Tree Road Blockage',
    type: 'ROAD_BLOCK',
    risk: 'ELEVATED',
    locationName: 'SECTOR 23 INNER ROAD',
    reportSummary: 'Single lane open; horticulture cleanup crew operating.',
    timestamp: '41 min ago',
    nearestShelter: 'Sector 22 Government School',
    nearestDistance: '1.1 km',
    xPct: 30,
    yPct: 64,
  },
];

export default function CrisisMapScreen() {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker>(CRISIS_MARKERS[0]);
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'HAZARDS' | 'SHELTERS' | 'SOS'>('ALL');
  const [shelters, setShelters] = useState<ShelterItem[]>([]);
  const [userLocality, setUserLocality] = useState('Sector 17, Chandigarh');

  useEffect(() => {
    dataService.getShelters().then(setShelters).catch(() => {});
    locationService.getCurrentLocation().then((loc) => {
      setUserLocality(loc.localityName);
    });
  }, []);

  const handleShare = async () => {
    haptics.mediumOperational();
    try {
      await Share.share({
        message: `DisasterChain Crisis Alert: ${selectedMarker.title} at ${selectedMarker.locationName}. Risk: ${selectedMarker.risk}. ${selectedMarker.reportSummary}`,
      });
    } catch {}
  };

  const filteredMarkers = CRISIS_MARKERS.filter((m) => {
    if (activeLayer === 'HAZARDS') return m.type === 'HAZARD' || m.type === 'ROAD_BLOCK';
    if (activeLayer === 'SHELTERS') return m.type === 'SHELTER';
    if (activeLayer === 'SOS') return m.type === 'SOS';
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* TOP CONTROLS & SECTOR CONTEXT */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.overline}>CRISIS CARTOGRAPHY</Text>
          <Text style={styles.localityTitle}>{userLocality.toUpperCase()}</Text>
        </View>

        {/* THUMB-REACHABLE LAYER FILTER */}
        <View style={styles.layerPills}>
          {(['ALL', 'HAZARDS', 'SHELTERS', 'SOS'] as const).map((layer) => (
            <TouchableOpacity
              key={layer}
              style={[styles.pill, activeLayer === layer && styles.pillActive]}
              onPress={() => {
                haptics.lightQuiet();
                setActiveLayer(layer);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Filter layer: ${layer}`}
            >
              <Text style={[styles.pillText, activeLayer === layer && styles.pillTextActive]}>
                {layer}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* TACTICAL MAP CANVAS VIEWPORT */}
      <View style={styles.mapViewport}>
        {/* Cartographic Grid Background */}
        <View style={styles.gridOverlay}>
          <View style={styles.gridHorizontal} />
          <View style={[styles.gridHorizontal, { top: '33%' }]} />
          <View style={[styles.gridHorizontal, { top: '66%' }]} />
          <View style={styles.gridVertical} />
          <View style={[styles.gridVertical, { left: '33%' }]} />
          <View style={[styles.gridVertical, { left: '66%' }]} />
        </View>

        {/* Tactical Sector Contours */}
        <View style={styles.contourZone}>
          <Text style={styles.contourLabel}>SUKHNA BASIN ELEVATED CORRIDOR</Text>
        </View>

        <View style={styles.floodRiskZone}>
          <Text style={styles.floodRiskLabel}>FLOOD RISK ZONE · DAKSHIN MARG</Text>
        </View>

        {/* Current Location User Reticle */}
        <View style={[styles.userLocationDot, { left: '50%', top: '48%' }]}>
          <View style={styles.userPulseRing} />
          <View style={styles.userCenterDot} />
        </View>

        {/* Map Markers */}
        {filteredMarkers.map((marker) => {
          const isSelected = selectedMarker?.id === marker.id;
          let markerBg = colors.surfaceHighlight;
          let markerBorder = colors.borderStrong;
          let markerChar = '▲';

          if (marker.type === 'SHELTER') {
            markerBg = colors.safeBg;
            markerBorder = colors.safe;
            markerChar = '⌂';
          } else if (marker.type === 'SOS') {
            markerBg = colors.criticalBg;
            markerBorder = colors.critical;
            markerChar = '●';
          } else if (marker.risk === 'CRITICAL') {
            markerBg = colors.criticalBg;
            markerBorder = colors.critical;
            markerChar = '▲';
          } else if (marker.risk === 'ELEVATED') {
            markerBg = colors.elevatedBg;
            markerBorder = colors.elevated;
            markerChar = '▲';
          }

          return (
            <TouchableOpacity
              key={marker.id}
              style={[
                styles.mapMarkerPin,
                {
                  left: `${marker.xPct}%`,
                  top: `${marker.yPct}%`,
                  backgroundColor: markerBg,
                  borderColor: isSelected ? colors.paper : markerBorder,
                  transform: [{ scale: isSelected ? 1.25 : 1.0 }],
                },
              ]}
              onPress={() => {
                haptics.mediumOperational();
                setSelectedMarker(marker);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${marker.type}: ${marker.title}`}
            >
              <Text style={[styles.markerIconChar, { color: isSelected ? colors.paper : markerBorder }]}>
                {markerChar}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Map Telemetry Scale Badge */}
        <View style={styles.scaleBadge}>
          <Text style={styles.scaleText}>GRID: 500m · SATELLITE RADAR OVERLAY</Text>
        </View>
      </View>

      {/* NATIVE BOTTOM SHEET (SELECTED OBJECT DETAIL) */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />

        <View style={styles.sheetHeader}>
          <View style={styles.sheetHeaderLeft}>
            <Text style={styles.sheetOverline}>SELECTED LOCATION</Text>
            <Text style={styles.sheetTitle}>{selectedMarker.locationName}</Text>
          </View>
          <StatusBadge level={selectedMarker.risk} size="md" />
        </View>

        <View style={styles.sheetBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>LATEST REPORT</Text>
            <Text style={styles.infoValue}>
              {selectedMarker.reportSummary}{' '}
              <Text style={styles.infoTimestamp}>({selectedMarker.timestamp})</Text>
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NEAREST SHELTER</Text>
            <Text style={styles.infoValue}>
              {selectedMarker.nearestShelter} · {selectedMarker.nearestDistance}
            </Text>
          </View>
        </View>

        {/* ACTIONS: NAVIGATE, REPORT, SHARE */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={() => {
              haptics.mediumOperational();
              router.push('/shelters' as any);
            }}
            accessibilityRole="button"
            accessibilityLabel="Navigate to nearest safe shelter"
          >
            <Text style={styles.actionBtnPrimaryText}>NAVIGATE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={() => {
              haptics.lightQuiet();
              router.push('/report-incident' as any);
            }}
            accessibilityRole="button"
            accessibilityLabel="Report incident at this location"
          >
            <Text style={styles.actionBtnSecondaryText}>REPORT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share hazard alert"
          >
            <Text style={styles.actionBtnSecondaryText}>SHARE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  overline: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.terracotta,
  },
  localityTitle: {
    fontFamily: typography.sans,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.paper,
    marginTop: 2,
    marginBottom: 8,
  },
  layerPills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 3,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  pillActive: {
    backgroundColor: colors.terracottaDark,
    borderColor: colors.terracotta,
  },
  pillText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.paper,
  },
  mapViewport: {
    flex: 1,
    backgroundColor: '#0F110F',
    position: 'relative',
    overflow: 'hidden',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
  },
  gridHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  gridVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  contourZone: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    right: '25%',
    height: 120,
    borderWidth: 1,
    borderColor: 'rgba(79, 158, 108, 0.2)',
    backgroundColor: 'rgba(79, 158, 108, 0.03)',
    borderRadius: 8,
    padding: 8,
  },
  contourLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: 'rgba(79, 158, 108, 0.6)',
    letterSpacing: 0.5,
  },
  floodRiskZone: {
    position: 'absolute',
    top: '35%',
    left: '30%',
    width: 220,
    height: 130,
    borderWidth: 1,
    borderColor: 'rgba(217, 67, 50, 0.3)',
    backgroundColor: 'rgba(217, 67, 50, 0.06)',
    borderRadius: 6,
    padding: 8,
  },
  floodRiskLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: 'rgba(217, 67, 50, 0.8)',
    letterSpacing: 0.5,
  },
  userLocationDot: {
    position: 'absolute',
    width: 24,
    height: 24,
    marginLeft: -12,
    marginTop: -12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userPulseRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(69, 182, 111, 0.25)',
  },
  userCenterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.liveGreen,
    borderWidth: 1.5,
    borderColor: colors.paper,
  },
  mapMarkerPin: {
    position: 'absolute',
    width: 32,
    height: 32,
    marginLeft: -16,
    marginTop: -16,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  markerIconChar: {
    fontSize: 14,
    fontWeight: '700',
  },
  scaleBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(13, 14, 13, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  scaleText: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.textMuted,
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderStrong,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sheetHeaderLeft: {
    flex: 1,
  },
  sheetOverline: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.terracotta,
  },
  sheetTitle: {
    fontFamily: typography.sans,
    fontSize: 17,
    fontWeight: '700',
    color: colors.paper,
    marginTop: 2,
  },
  sheetBody: {
    gap: 8,
    marginBottom: 14,
  },
  infoRow: {
    backgroundColor: colors.surfaceHighlight,
    padding: 10,
    borderRadius: 4,
  },
  infoLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.paper,
    lineHeight: 18,
  },
  infoTimestamp: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtnPrimary: {
    flex: 1.5,
    backgroundColor: colors.terracotta,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  actionBtnPrimaryText: {
    fontFamily: typography.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#FFFFFF',
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  actionBtnSecondaryText: {
    fontFamily: typography.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.paper,
  },
});
