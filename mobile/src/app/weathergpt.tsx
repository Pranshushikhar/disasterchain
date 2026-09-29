import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { StatusBadge } from '../components/StatusBadge';
import { dataService } from '../services/dataService';
import { WeatherGPTStructuredResponse } from '../types/weather';
import { haptics } from '../utils/haptics';

const QUICK_ACTIONS = [
  'Is it safe to travel?',
  'What changed?',
  'What should I avoid?',
  'Where should I go?',
];

export default function WeatherGPTScreen() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<WeatherGPTStructuredResponse | null>(null);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    haptics.mediumOperational();
    setLoading(true);
    try {
      const res = await dataService.queryWeatherGPT(q);
      setResponse(res);
      setQuery('');
    } catch {
      console.warn('Failed querying WeatherGPT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back to situation"
        >
          <Text style={styles.backBtnText}>← RETURN</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerOverline}>OPERATIONAL CONSOLE</Text>
          <Text style={styles.headerTitle}>ASK DISASTERCHAIN</Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={styles.greenPulse} />
          <Text style={styles.statusLabel}>AI ENGINE 2.0</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* QUICK OPERATIONAL DIRECTIVES */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.quickActionsLabel}>PRESET OPERATIONAL QUERIES</Text>
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action}
                style={styles.quickActionChip}
                onPress={() => handleSend(action)}
                accessibilityRole="button"
                accessibilityLabel={action}
              >
                <Text style={styles.quickActionText}>{action}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* LOADING INDICATOR */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.terracotta} />
            <Text style={styles.loadingText}>SYNTHESIZING METEOROLOGICAL & CIVIL SENSOR MATRICES...</Text>
          </View>
        )}

        {/* STRUCTURED INTELLIGENCE RESPONSE */}
        {response && !loading && (
          <View style={styles.responseContainer}>
            <View style={styles.responseMetaHeader}>
              <StatusBadge level={response.riskLevel} size="md" />
              <Text style={styles.confidenceText}>
                CONFIDENCE: {response.confidence} · {response.timestamp}
              </Text>
            </View>

            {/* 1. ANSWER */}
            <View style={styles.structuredSection}>
              <Text style={styles.sectionLabel}>DIRECT ANSWER</Text>
              <Text style={styles.answerText}>{response.answer}</Text>
            </View>

            {/* 2. WHY */}
            <View style={styles.structuredSection}>
              <Text style={styles.sectionLabel}>WHY</Text>
              <Text style={styles.whyText}>{response.why}</Text>
            </View>

            {/* 3. ACTIONABLE DIRECTIVE */}
            <View style={styles.directiveCard}>
              <Text style={styles.directiveLabel}>ACTIONABLE DIRECTIVE</Text>
              <Text style={styles.directiveText}>{response.actionableDirective}</Text>
            </View>

            {/* 4. DATA USED */}
            <View style={styles.structuredSection}>
              <Text style={styles.sectionLabel}>DATA TELEMETRY UTILIZED</Text>
              <View style={styles.dataTagList}>
                {response.dataUsed.map((source, i) => (
                  <View key={i} style={styles.dataTag}>
                    <Text style={styles.dataTagText}>● {source}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* INPUT CONSOLE BAR */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Ask situational inquiry (e.g. Is Dakshin Marg flooded?)"
          placeholderTextColor={colors.textMuted}
          returnKeyType="send"
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          style={[styles.sendButton, !query.trim() && styles.sendButtonDisabled]}
          disabled={!query.trim() || loading}
          onPress={() => handleSend()}
          accessibilityRole="button"
          accessibilityLabel="Submit inquiry"
        >
          <Text style={styles.sendButtonText}>QUERY →</Text>
        </TouchableOpacity>
      </View>
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
  headerTitleGroup: {
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.paper,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.liveGreen,
  },
  statusLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  quickActionsSection: {
    gap: 8,
  },
  quickActionsLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionChip: {
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  quickActionText: {
    fontFamily: typography.sans,
    fontSize: 12,
    fontWeight: '500',
    color: colors.paper,
  },
  loadingBox: {
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textMuted,
    textAlign: 'center',
  },
  responseContainer: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 16,
    gap: 16,
  },
  responseMetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: 10,
  },
  confidenceText: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  structuredSection: {
    gap: 4,
  },
  sectionLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.terracotta,
  },
  answerText: {
    fontFamily: typography.serif,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '500',
    color: colors.paper,
  },
  whyText: {
    fontFamily: typography.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  directiveCard: {
    backgroundColor: colors.surfaceHighlight,
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.terracotta,
    gap: 4,
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.paper,
    lineHeight: 20,
  },
  dataTagList: {
    flexDirection: 'column',
    gap: 4,
  },
  dataTag: {
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  dataTagText: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderStrong,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.paper,
    fontFamily: typography.sans,
    fontSize: 13,
  },
  sendButton: {
    backgroundColor: colors.terracotta,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#FFFFFF',
  },
});
