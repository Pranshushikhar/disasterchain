import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { dataService } from '../services/dataService';
import { ShelterItem } from '../types/shelter';
import { haptics } from '../utils/haptics';

export default function SheltersScreen() {
  const [shelters, setShelters] = useState<ShelterItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'OPEN' | 'ACCESSIBLE'>('ALL');

  useEffect(() => {
    dataService.getShelters().then(setShelters);
  }, []);

  const handleNavigate = (shelter: ShelterItem) => {
    haptics.mediumOperational();
    const url = Platform.select({
      ios: `maps:0,0?q=${shelter.name}@${shelter.latitude},${shelter.longitude}`,
      android: `geo:0,0?q=${shelter.latitude},${shelter.longitude}(${encodeURIComponent(shelter.name)})`,
      default: `https://www.google.com/maps/search/?api=1&query=${shelter.latitude},${shelter.longitude}`,
    });

    Linking.openURL(url!).catch(() => {
      console.warn('Unable to launch native navigation mapping application.');
    });
  };

  const filtered = shelters.filter((s) => {
    if (selectedFilter === 'OPEN') return s.status === 'Open';
    if (selectedFilter === 'ACCESSIBLE') return s.accessibility.wheelchairAccessible;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back to operations"
        >
          <Text style={styles.backBtnText}>← RETURN</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerOverline}>CIVIL LOGISTICS</Text>
          <Text style={styles.headerTitle}>RELIEF SHELTERS</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* DISCLAIMER BANNER */}
      <View style={styles.disclaimerBanner}>
        <Text style={styles.disclaimerText}>
          Shelter information is maintained by municipal observers and registered civil volunteers. For mandatory government evacuation directives, follow official district radio broadcasts.
        </Text>
      </View>

      {/* FILTER TABS */}
      <View style={styles.filterRow}>
        {(['ALL', 'OPEN', 'ACCESSIBLE'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, selectedFilter === filter && styles.filterTabActive]}
            onPress={() => {
              haptics.lightQuiet();
              setSelectedFilter(filter);
            }}
          >
            <Text style={[styles.filterTabText, selectedFilter === filter && styles.filterTabTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const occupancyPct = Math.round((item.currentOccupancy / item.capacity) * 100);
          const isFull = occupancyPct >= 95;

          return (
            <View style={styles.shelterCard}>
              <View style={styles.shelterCardHeader}>
                <View style={styles.nameBlock}>
                  <Text style={styles.shelterName}>{item.name}</Text>
                  <Text style={styles.shelterLocation}>{item.location}</Text>
                </View>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>{item.distanceKm} KM</Text>
                </View>
              </View>

              {/* CAPACITY AND OCCUPANCY BAR */}
              <View style={styles.capacitySection}>
                <View style={styles.capacityMeta}>
                  <Text style={styles.capacityLabel}>
                    OCCUPANCY: {item.currentOccupancy} / {item.capacity} ({occupancyPct}%)
                  </Text>
                  <Text style={[styles.statusText, isFull ? styles.statusFull : styles.statusOpen]}>
                    ● {item.status.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.min(100, occupancyPct)}%` },
                      isFull && styles.barFillFull,
                    ]}
                  />
                </View>
              </View>

              {/* ACCESSIBILITY TAGS */}
              <View style={styles.amenityRow}>
                {item.accessibility.wheelchairAccessible && (
                  <View style={styles.amenityPill}>
                    <Text style={styles.amenityText}>♿ Wheelchair</Text>
                  </View>
                )}
                {item.accessibility.medicalSupport && (
                  <View style={styles.amenityPill}>
                    <Text style={styles.amenityText}>✚ Medical Aid</Text>
                  </View>
                )}
                {item.accessibility.foodWaterAvailable && (
                  <View style={styles.amenityPill}>
                    <Text style={styles.amenityText}>🍲 Food / Water</Text>
                  </View>
                )}
                {item.accessibility.powerBackup && (
                  <View style={styles.amenityPill}>
                    <Text style={styles.amenityText}>⚡ Generator</Text>
                  </View>
                )}
              </View>

              {/* SOURCE ATTRIBUTION & ONE-TAP NAVIGATE */}
              <View style={styles.cardFooter}>
                <View style={styles.sourceMeta}>
                  <Text style={styles.sourceLabel}>Operator: {item.source}</Text>
                  <Text style={styles.updatedLabel}>{item.lastUpdated}</Text>
                </View>

                <TouchableOpacity
                  style={styles.navigateBtn}
                  onPress={() => handleNavigate(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`One tap navigate to ${item.name}`}
                >
                  <Text style={styles.navigateBtnText}>NAVIGATE →</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
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
  disclaimerBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surfaceHighlight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  disclaimerText: {
    fontFamily: typography.sans,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
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
  shelterCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 12,
  },
  shelterCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameBlock: {
    flex: 1,
    marginRight: 10,
  },
  shelterName: {
    fontFamily: typography.sans,
    fontSize: 16,
    fontWeight: '700',
    color: colors.paper,
  },
  shelterLocation: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  distanceBadge: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  distanceText: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    color: colors.terracotta,
  },
  capacitySection: {
    gap: 6,
  },
  capacityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  capacityLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textSecondary,
  },
  statusText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
  },
  statusOpen: {
    color: colors.safe,
  },
  statusFull: {
    color: colors.critical,
  },
  barTrack: {
    height: 4,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    backgroundColor: colors.safe,
  },
  barFillFull: {
    backgroundColor: colors.critical,
  },
  amenityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityPill: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  amenityText: {
    fontFamily: typography.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  sourceMeta: {
    flex: 1,
  },
  sourceLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.textMuted,
  },
  updatedLabel: {
    fontFamily: typography.sans,
    fontSize: 11,
    color: colors.textDim,
  },
  navigateBtn: {
    backgroundColor: colors.terracotta,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 4,
  },
  navigateBtnText: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#FFFFFF',
  },
});
