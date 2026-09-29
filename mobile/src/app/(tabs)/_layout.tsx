import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.borderSubtle,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.terracotta,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: typography.mono,
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'SITUATION',
          tabBarIcon: ({ color, focused }) => (
            <Text style={[styles.tabIcon, { color }]}>{focused ? '◉' : '○'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'MAP',
          tabBarIcon: ({ color, focused }) => (
            <Text style={[styles.tabIcon, { color }]}>{focused ? '▧' : '▢'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'ALERTS',
          tabBarIcon: ({ color, focused }) => (
            <Text style={[styles.tabIcon, { color }]}>{focused ? '▲' : '△'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarActiveTintColor: colors.critical,
          tabBarInactiveTintColor: colors.critical,
          tabBarLabelStyle: {
            fontFamily: typography.mono,
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 1.5,
            color: colors.critical,
          },
          tabBarIcon: () => (
            <View style={styles.sosTabPill}>
              <Text style={styles.sosTabIcon}>●</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'MORE',
          tabBarIcon: ({ color, focused }) => (
            <Text style={[styles.tabIcon, { color }]}>{focused ? '☰' : '☷'}</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 16,
  },
  sosTabPill: {
    width: 28,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.criticalBg,
    borderWidth: 1,
    borderColor: colors.criticalBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosTabIcon: {
    fontSize: 12,
    color: colors.critical,
    lineHeight: 14,
  },
});
