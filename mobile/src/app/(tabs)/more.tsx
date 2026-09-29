import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { haptics } from '../../utils/haptics';

interface NavItem {
  title: string;
  subtitle: string;
  route: string;
  isExternal?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAVIGATION_SECTIONS: NavSection[] = [
  {
    title: 'OPERATIONAL',
    items: [
      { title: 'Situation Room', subtitle: 'Live operational posture & directives', route: '/(tabs)' },
      { title: 'Emergency Alerts', subtitle: 'Active hazard warnings & feed', route: '/(tabs)/alerts' },
      { title: 'Civil Shelters', subtitle: 'Capacity, locations & navigation', route: '/shelters' },
      { title: 'Crisis Cartography', subtitle: 'Tactical spatial map & hazard grid', route: '/(tabs)/map' },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { title: 'Ask DisasterChain', subtitle: 'WeatherGPT conversational intelligence', route: '/weathergpt' },
      { title: 'Weather Telemetry', subtitle: 'Live Doppler, precipitation & impact chain', route: '/weather' },
      { title: 'Replay Simulation', subtitle: 'Historical timeline & prognostic scrub', route: '/replay' },
      { title: 'Digital Twin Model', subtitle: 'Touch-optimized 2.5D urban catchment simulation', route: '/digital-twin' },
    ],
  },
  {
    title: 'CITIZEN RESPONSE',
    items: [
      { title: 'Report Incident', subtitle: 'Photo verification & category dispatch', route: '/report-incident' },
      { title: 'Community Verifications', subtitle: 'Peer field observer telemetry', route: '/(tabs)/alerts' },
    ],
  },
  {
    title: 'ACCOUNT & SAFETY',
    items: [
      { title: 'Safety Profile', subtitle: 'Emergency contacts & home locality', route: '/profile' },
      { title: 'Notification Preferences', subtitle: 'Manage critical alert channels', route: '/profile' },
      { title: 'Privacy & Token Storage', subtitle: 'On-device secure token management', route: '/profile' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { title: 'Network Connectivity', subtitle: 'Offline sync queue & telemetry health', route: '/system-status' },
      { title: 'Data Attribution', subtitle: 'IMD, Open-Meteo, GDACS & Sensor Grid', route: '/about' },
      { title: 'About DisasterChain', subtitle: 'v1.2.0 · Calm Future / Operational Humanism', route: '/about' },
    ],
  },
];

export default function MoreScreen() {
  const handleNavigate = (route: string) => {
    haptics.lightQuiet();
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.screenHeader}>
        <Text style={styles.headerOverline}>SYSTEM DIRECTORY</Text>
        <Text style={styles.headerTitle}>OPERATIONS & INTELLIGENCE</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {NAVIGATION_SECTIONS.map((section) => (
          <View key={section.title} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            <View style={styles.menuGroup}>
              {section.items.map((item, idx) => {
                const isLast = idx === section.items.length - 1;
                return (
                  <TouchableOpacity
                    key={item.title}
                    style={[styles.menuItem, isLast && styles.menuItemLast]}
                    onPress={() => handleNavigate(item.route)}
                    accessibilityRole="button"
                    accessibilityLabel={item.title}
                  >
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    </View>
                    <Text style={styles.chevron}>→</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>DISASTERCHAIN EMERGENCY INSTRUMENT</Text>
          <Text style={styles.footerGovText}>
            Civil-response platform. Official emergency rescue: Call 112.
          </Text>
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
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 20,
  },
  sectionContainer: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.textMuted,
  },
  menuGroup: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontFamily: typography.sans,
    fontSize: 15,
    fontWeight: '600',
    color: colors.paper,
  },
  itemSubtitle: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontFamily: typography.mono,
    fontSize: 14,
    color: colors.terracotta,
  },
  footerNote: {
    paddingTop: 10,
    alignItems: 'center',
    gap: 4,
  },
  footerNoteText: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textMuted,
  },
  footerGovText: {
    fontFamily: typography.sans,
    fontSize: 11,
    color: colors.textDim,
  },
});
