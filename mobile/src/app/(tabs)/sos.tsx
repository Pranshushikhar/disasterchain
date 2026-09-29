import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Linking,
  ScrollView,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Emergency112Modal } from '../../components/Emergency112Modal';
import { dataService } from '../../services/dataService';
import { locationService } from '../../services/locationService';
import { SosEmergencyCategory, SosRecord } from '../../types/sos';
import { haptics } from '../../utils/haptics';

const CATEGORIES: SosEmergencyCategory[] = [
  'Flooding / Trapped Water',
  'Medical Emergency',
  'Structural Collapse',
  'Fire / Hazard',
  'Missing Person',
  'Other Imminent Danger',
];

export default function SosScreen() {
  const [selectedCategory, setSelectedCategory] = useState<SosEmergencyCategory>(CATEGORIES[0]);
  const [isPressing, setIsPressing] = useState(false);
  const [sosRecord, setSosRecord] = useState<SosRecord | null>(null);
  const [emergency112Visible, setEmergency112Visible] = useState(false);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number; name: string }>({
    latitude: 30.7333,
    longitude: 76.7794,
    name: 'Sector 17, Chandigarh',
  });
  const [peopleCount, setPeopleCount] = useState(1);

  // Press & hold animation progress (0 -> 1 over 1800ms)
  const holdProgress = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef<any>(null);

  useEffect(() => {
    locationService.getCurrentLocation().then((loc) => {
      setUserCoords({
        latitude: loc.latitude,
        longitude: loc.longitude,
        name: loc.localityName,
      });
    });
  }, []);

  const startHold = () => {
    setIsPressing(true);
    haptics.lightQuiet();

    Animated.timing(holdProgress, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: false,
    }).start();

    holdTimer.current = setTimeout(async () => {
      await triggerSos();
    }, 1800);
  };

  const cancelHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setIsPressing(false);
    Animated.timing(holdProgress, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const triggerSos = async () => {
    haptics.heavyEmergency();
    setIsPressing(false);
    holdProgress.setValue(0);

    const clientTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const requestId = `sos-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const res = await dataService.submitSos({
      requestId,
      name: 'Mobile Citizen User',
      contact: '9876543210',
      emergencyType: selectedCategory,
      description: `Civil emergency signal initiated via native mobile app. Category: ${selectedCategory}. People affected: ${peopleCount}.`,
      location: userCoords.name,
      latitude: userCoords.latitude,
      longitude: userCoords.longitude,
      peopleAffected: peopleCount,
      severity: 'Critical',
      clientTimestamp,
    });

    setSosRecord(res);
  };

  const handleDial112 = () => {
    haptics.heavyEmergency();
    Linking.openURL('tel:112').catch(() => {
      setEmergency112Visible(true);
    });
  };

  const handleResetSos = () => {
    haptics.mediumOperational();
    setSosRecord(null);
  };

  const progressInterpolate = holdProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.screenHeader}>
        <Text style={styles.headerOverline}>CIVIL DEFENCE PROTOCOL</Text>
        <Text style={styles.headerTitle}>LIFE-SAFETY SOS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* IF SOS IS ALREADY LOGGED */}
        {sosRecord ? (
          <View style={styles.loggedContainer}>
            <View style={styles.loggedBadge}>
              <Text style={styles.loggedBadgeText}>● SOS LOGGED IN CIVIL REGISTRY</Text>
            </View>

            <Text style={styles.loggedTitle}>EMERGENCY TRANSMISSION ACTIVE</Text>

            {/* TELEMETRY RECORD CARD */}
            <View style={styles.recordCard}>
              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>TIMESTAMP</Text>
                <Text style={styles.recordValue}>{sosRecord.clientTimestamp}</Text>
              </View>

              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>LOCATION</Text>
                <Text style={styles.recordValue}>{sosRecord.location}</Text>
              </View>

              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>COORDINATES</Text>
                <Text style={styles.recordMono}>
                  {sosRecord.latitude.toFixed(4)}° N, {sosRecord.longitude.toFixed(4)}° E
                </Text>
              </View>

              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>INCIDENT CATEGORY</Text>
                <Text style={styles.recordValue}>{sosRecord.emergencyType}</Text>
              </View>

              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>NETWORK STATUS</Text>
                <Text style={[styles.recordMono, { color: sosRecord.networkStatus === 'ONLINE' ? colors.safe : colors.staleAmber }]}>
                  {sosRecord.networkStatus}
                </Text>
              </View>

              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>TRACKING STATUS</Text>
                <Text style={styles.recordMono}>{sosRecord.trackingStatus}</Text>
              </View>
            </View>

            {/* MANDATORY 112 NOTICE */}
            <View style={styles.noticeBox}>
              <Text style={styles.noticeTitle}>DISASTERCHAIN EMERGENCY NOTICE</Text>
              <Text style={styles.noticeBody}>
                DisasterChain logs civil broadcasts to active nearby volunteers and community nodes. DisasterChain does not directly dispatch official police, fire, or government rescue teams.
              </Text>
              <Text style={styles.noticeCallPrompt}>
                For official government rescue, medical triage, or fire assistance:
              </Text>
            </View>

            {/* CALL 112 BUTTON */}
            <TouchableOpacity
              style={styles.call112Btn}
              onPress={handleDial112}
              accessibilityRole="button"
              accessibilityLabel="Call 112 National Emergency Helpline"
            >
              <Text style={styles.call112BtnText}>CALL 112 NOW</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={handleResetSos}>
              <Text style={styles.resetBtnText}>STAND DOWN / DISMISS SOS</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* SOS TRIGGER INTERFACE */
          <View style={styles.triggerContainer}>
            {/* INSTRUCTIONS */}
            <View style={styles.disclaimerBanner}>
              <Text style={styles.disclaimerText}>
                Press and hold the button below for 1.8 seconds to broadcast your emergency coordinates. Accidental taps will not trigger an alarm.
              </Text>
            </View>

            {/* CATEGORY SELECTOR */}
            <Text style={styles.sectionHeader}>SELECT EMERGENCY CATEGORY</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryBtn, isSelected && styles.categoryBtnSelected]}
                    onPress={() => {
                      haptics.lightQuiet();
                      setSelectedCategory(cat);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text style={[styles.categoryBtnText, isSelected && styles.categoryBtnTextSelected]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* PEOPLE AFFECTED */}
            <View style={styles.peopleRow}>
              <Text style={styles.peopleLabel}>PERSONS AT RISK:</Text>
              <View style={styles.peopleCounter}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => {
                    haptics.lightQuiet();
                    setPeopleCount(Math.max(1, peopleCount - 1));
                  }}
                >
                  <Text style={styles.counterText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{peopleCount}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => {
                    haptics.lightQuiet();
                    setPeopleCount(peopleCount + 1);
                  }}
                >
                  <Text style={styles.counterText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* HOLD TRIGGER BUTTON */}
            <View style={styles.holdTriggerWrapper}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={startHold}
                onPressOut={cancelHold}
                style={[styles.holdButton, isPressing && styles.holdButtonActive]}
                accessibilityRole="button"
                accessibilityLabel="Press and hold 1.8 seconds to trigger emergency SOS"
              >
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressInterpolate,
                    },
                  ]}
                />
                <View style={styles.holdButtonContent}>
                  <Text style={styles.holdIcon}>▲</Text>
                  <Text style={styles.holdTitle}>
                    {isPressing ? 'HOLDING... KEEP PRESSED' : 'PRESS AND HOLD'}
                  </Text>
                  <Text style={styles.holdSubtitle}>1.8 SECONDS TO BROADCAST</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* OFFICIAL 112 FALLBACK */}
            <View style={styles.officialFallback}>
              <Text style={styles.fallbackNote}>
                Immediate life threat requiring police, fire, or government rescue?
              </Text>
              <TouchableOpacity
                style={styles.direct112Btn}
                onPress={() => setEmergency112Visible(true)}
              >
                <Text style={styles.direct112BtnText}>CALL 112 (OFFICIAL SERVICES) →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

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
    color: colors.critical,
  },
  headerTitle: {
    fontFamily: typography.sans,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.paper,
    marginTop: 2,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  triggerContainer: {
    gap: 16,
  },
  disclaimerBanner: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  disclaimerText: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeader: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginTop: 4,
  },
  categoryGrid: {
    gap: 8,
  },
  categoryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  categoryBtnSelected: {
    borderColor: colors.critical,
    backgroundColor: colors.criticalBg,
  },
  categoryBtnText: {
    fontFamily: typography.sans,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  categoryBtnTextSelected: {
    color: colors.paper,
    fontWeight: '600',
  },
  peopleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  peopleLabel: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    color: colors.paper,
  },
  peopleCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.paper,
    lineHeight: 20,
  },
  counterValue: {
    fontFamily: typography.mono,
    fontSize: 16,
    fontWeight: '700',
    color: colors.paper,
  },
  holdTriggerWrapper: {
    marginTop: 10,
    marginBottom: 10,
  },
  holdButton: {
    backgroundColor: '#301412',
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.critical,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  holdButtonActive: {
    borderColor: '#FF5C4D',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.critical,
  },
  holdButtonContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  holdIcon: {
    fontSize: 22,
    color: colors.critical,
    marginBottom: 4,
  },
  holdTitle: {
    fontFamily: typography.mono,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#FFFFFF',
  },
  holdSubtitle: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 1,
    marginTop: 4,
  },
  officialFallback: {
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    gap: 8,
  },
  fallbackNote: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  direct112Btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  direct112BtnText: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    color: colors.critical,
    letterSpacing: 1,
  },
  // LOGGED STATE STYLES
  loggedContainer: {
    gap: 16,
  },
  loggedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.criticalBg,
    borderColor: colors.criticalBorder,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
  },
  loggedBadgeText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.critical,
    letterSpacing: 1.2,
  },
  loggedTitle: {
    fontFamily: typography.sans,
    fontSize: 20,
    fontWeight: '700',
    color: colors.paper,
  },
  recordCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    gap: 12,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: 8,
  },
  recordLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
  },
  recordValue: {
    fontFamily: typography.sans,
    fontSize: 13,
    fontWeight: '600',
    color: colors.paper,
    maxWidth: '65%',
    textAlign: 'right',
  },
  recordMono: {
    fontFamily: typography.mono,
    fontSize: 12,
    fontWeight: '600',
    color: colors.paper,
  },
  noticeBox: {
    backgroundColor: colors.surfaceHighlight,
    padding: 14,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.critical,
    gap: 6,
  },
  noticeTitle: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.critical,
  },
  noticeBody: {
    fontFamily: typography.sans,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  noticeCallPrompt: {
    fontFamily: typography.sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.paper,
    marginTop: 4,
  },
  call112Btn: {
    backgroundColor: colors.critical,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  call112BtnText: {
    fontFamily: typography.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#FFFFFF',
  },
  resetBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  resetBtnText: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
  },
});
