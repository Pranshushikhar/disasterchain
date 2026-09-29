import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { storageService } from '../services/storageService';
import { clearAuthToken } from '../services/api';
import { UserSafetyProfile } from '../types/user';
import { haptics } from '../utils/haptics';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserSafetyProfile>({
    id: 'user-01',
    name: 'Citizen Responder',
    phone: '+91 98765 43210',
    email: 'citizen@disasterchain.org',
    homeLocality: 'Sector 17, Chandigarh',
    role: 'citizen',
    emergencyContacts: [
      { id: 'ec-1', name: 'Family Primary', relationship: 'Spouse', phone: '+91 98111 22334', isPrimary: true },
    ],
    notificationPreferences: {
      criticalEmergencies: true,
      severeWeather: true,
      nearbyIncidents: true,
      shelterChanges: false,
      communityUpdates: false,
    },
    language: 'English (authoritative fallback)',
    accessibility: {
      largeText: false,
      highContrast: false,
      reducedMotion: false,
      hapticFeedback: true,
    },
  });

  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    storageService.getUserProfile().then((p) => {
      if (p) setProfile(p);
    });
  }, []);

  const handleSave = async () => {
    haptics.mediumOperational();
    await storageService.saveUserProfile(profile);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleLogout = async () => {
    haptics.lightQuiet();
    await clearAuthToken();
    router.replace('/(tabs)');
  };

  const updateNotif = (key: keyof UserSafetyProfile['notificationPreferences'], val: boolean) => {
    haptics.lightQuiet();
    setProfile((prev) => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: val,
      },
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← RETURN</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerOverline}>CIVIL PROTOCOLS</Text>
          <Text style={styles.headerTitle}>SAFETY PROFILE</Text>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>SAVE</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {savedNotice && (
          <View style={styles.savedBanner}>
            <Text style={styles.savedBannerText}>✓ SAFETY PROFILE CACHED TO SECURE DEVICE STORE</Text>
          </View>
        )}

        {/* IDENTITY */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>CITIZEN IDENTITY & HOME SECTOR</Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <TextInput
              style={styles.textInput}
              value={profile.name}
              onChangeText={(t) => setProfile((p) => ({ ...p, name: t }))}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>CONTACT PHONE (FOR VERIFIED SOS DISPATCH)</Text>
            <TextInput
              style={styles.textInput}
              value={profile.phone}
              keyboardType="phone-pad"
              onChangeText={(t) => setProfile((p) => ({ ...p, phone: t }))}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>PRIMARY CIVIL LOCALITY</Text>
            <TextInput
              style={styles.textInput}
              value={profile.homeLocality}
              onChangeText={(t) => setProfile((p) => ({ ...p, homeLocality: t }))}
            />
          </View>
        </View>

        {/* EMERGENCY CONTACTS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>EMERGENCY CONTACTS (RELAY SOS)</Text>
          {profile.emergencyContacts.map((contact) => (
            <View key={contact.id} style={styles.contactItem}>
              <View>
                <Text style={styles.contactName}>{contact.name} ({contact.relationship})</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <Text style={styles.primaryBadge}>PRIMARY</Text>
            </View>
          ))}
        </View>

        {/* NOTIFICATION PREFERENCES */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>NOTIFICATION DISPATCH PREFERENCES</Text>

          <View style={styles.prefRow}>
            <View style={styles.prefTextGroup}>
              <Text style={styles.prefTitle}>Critical Emergencies & SOS</Text>
              <Text style={styles.prefSub}>High-priority sirens for imminent civil threats</Text>
            </View>
            <Switch
              value={profile.notificationPreferences.criticalEmergencies}
              onValueChange={(v) => updateNotif('criticalEmergencies', v)}
              thumbColor={colors.paper}
              trackColor={{ false: colors.surfaceHighlight, true: colors.critical }}
            />
          </View>

          <View style={styles.prefRow}>
            <View style={styles.prefTextGroup}>
              <Text style={styles.prefTitle}>Severe Weather Warnings</Text>
              <Text style={styles.prefSub}>Monsoon flash floods and gale alerts</Text>
            </View>
            <Switch
              value={profile.notificationPreferences.severeWeather}
              onValueChange={(v) => updateNotif('severeWeather', v)}
              thumbColor={colors.paper}
              trackColor={{ false: colors.surfaceHighlight, true: colors.terracotta }}
            />
          </View>

          <View style={styles.prefRow}>
            <View style={styles.prefTextGroup}>
              <Text style={styles.prefTitle}>Nearby Incident Clusters</Text>
              <Text style={styles.prefSub}>Verified community reports within 2km</Text>
            </View>
            <Switch
              value={profile.notificationPreferences.nearbyIncidents}
              onValueChange={(v) => updateNotif('nearbyIncidents', v)}
              thumbColor={colors.paper}
              trackColor={{ false: colors.surfaceHighlight, true: colors.terracotta }}
            />
          </View>

          <View style={styles.prefRow}>
            <View style={styles.prefTextGroup}>
              <Text style={styles.prefTitle}>Shelter Capacity Changes</Text>
              <Text style={styles.prefSub}>Alerts when local relief facilities reach capacity</Text>
            </View>
            <Switch
              value={profile.notificationPreferences.shelterChanges}
              onValueChange={(v) => updateNotif('shelterChanges', v)}
              thumbColor={colors.paper}
              trackColor={{ false: colors.surfaceHighlight, true: colors.terracotta }}
            />
          </View>
        </View>

        {/* SECURITY & TOKEN STORAGE */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>DEVICE ENCRYPTION & TOKENS</Text>
          <Text style={styles.securitySub}>
            Authentication credentials and offline disaster telemetry are cached in device Keychain / Keystore using AES-256 secure hardware storage. No private MongoDB keys or JWT secrets are bundled in this build.
          </Text>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>CLEAR CREDENTIALS & SESSIONS</Text>
          </TouchableOpacity>
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
  saveBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: colors.terracotta,
    borderRadius: 3,
  },
  saveBtnText: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  savedBanner: {
    backgroundColor: colors.safeBg,
    borderWidth: 1,
    borderColor: colors.safeBorder,
    padding: 10,
    borderRadius: 4,
  },
  savedBannerText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.safe,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 14,
  },
  sectionTitle: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.terracotta,
  },
  fieldGroup: {
    gap: 4,
  },
  inputLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  textInput: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.paper,
    fontFamily: typography.sans,
    fontSize: 14,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    padding: 12,
    borderRadius: 4,
  },
  contactName: {
    fontFamily: typography.sans,
    fontSize: 14,
    fontWeight: '600',
    color: colors.paper,
  },
  contactPhone: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  primaryBadge: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.safe,
    fontWeight: '700',
    letterSpacing: 1,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: 10,
  },
  prefTextGroup: {
    flex: 1,
    marginRight: 10,
  },
  prefTitle: {
    fontFamily: typography.sans,
    fontSize: 14,
    fontWeight: '600',
    color: colors.paper,
  },
  prefSub: {
    fontFamily: typography.sans,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  securitySub: {
    fontFamily: typography.sans,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  logoutBtn: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 4,
    marginTop: 4,
  },
  logoutBtnText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.critical,
    letterSpacing: 1,
  },
});
