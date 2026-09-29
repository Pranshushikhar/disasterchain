import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { ImpactNode } from '../types/situation';

interface ImpactChainViewProps {
  impact: ImpactNode;
}

export const ImpactChainView: React.FC<ImpactChainViewProps> = ({ impact }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>WEATHER → IMPACT CHAIN</Text>
        <Text style={styles.attributionBadge}>DERIVED ASSESSMENT</Text>
      </View>

      <View style={styles.nodeItem}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepNum}>1</Text>
        </View>
        <View style={styles.nodeContent}>
          <Text style={styles.nodeLabel}>ATMOSPHERIC TRIGGER</Text>
          <Text style={styles.nodeValue}>{impact.trigger}</Text>
        </View>
      </View>

      <View style={styles.downConnector}>
        <Text style={styles.downArrow}>↓</Text>
      </View>

      <View style={styles.nodeItem}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepNum}>2</Text>
        </View>
        <View style={styles.nodeContent}>
          <Text style={styles.nodeLabel}>HYDROLOGICAL MECHANISM</Text>
          <Text style={styles.nodeValue}>{impact.mechanism}</Text>
        </View>
      </View>

      <View style={styles.downConnector}>
        <Text style={styles.downArrow}>↓</Text>
      </View>

      <View style={styles.nodeItem}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepNum}>3</Text>
        </View>
        <View style={styles.nodeContent}>
          <Text style={styles.nodeLabel}>GROUND CONSEQUENCE</Text>
          <Text style={styles.nodeValue}>{impact.consequence}</Text>
        </View>
      </View>

      <View style={styles.directiveBox}>
        <Text style={styles.directiveLabel}>OPERATIONAL DIRECTIVE</Text>
        <Text style={styles.directiveText}>{impact.operationalDirective}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontFamily: typography.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.paper,
  },
  attributionBadge: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.terracotta,
    backgroundColor: colors.terracottaGlow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  nodeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNum: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textSecondary,
  },
  nodeContent: {
    flex: 1,
  },
  nodeLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  nodeValue: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.paper,
    marginTop: 2,
  },
  downConnector: {
    paddingLeft: 7,
    paddingVertical: 2,
  },
  downArrow: {
    color: colors.borderStrong,
    fontSize: 12,
  },
  directiveBox: {
    marginTop: 14,
    padding: 10,
    backgroundColor: colors.surfaceHighlight,
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
    marginBottom: 3,
  },
  directiveText: {
    fontFamily: typography.sans,
    fontSize: 13,
    fontWeight: '500',
    color: colors.paper,
  },
});
