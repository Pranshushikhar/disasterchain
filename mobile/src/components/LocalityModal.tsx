import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { KNOWN_LOCALITIES } from '../services/locationService';
import { haptics } from '../utils/haptics';

interface LocalityModalProps {
  visible: boolean;
  currentLocality: string;
  onSelectLocality: (name: string) => void;
  onRequestGps: () => void;
  onClose: () => void;
}

export const LocalityModal: React.FC<LocalityModalProps> = ({
  visible,
  currentLocality,
  onSelectLocality,
  onRequestGps,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>SELECT CIVIL LOCALITY</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            DisasterChain tailors situational risk, nearest shelters, and alert dispatches based on your selected operational sector.
          </Text>

          <TouchableOpacity
            style={styles.gpsButton}
            onPress={() => {
              haptics.mediumOperational();
              onRequestGps();
              onClose();
            }}
          >
            <Text style={styles.gpsIcon}>◎</Text>
            <View>
              <Text style={styles.gpsTitle}>USE AUTOMATIC GPS LOCATION</Text>
              <Text style={styles.gpsSub}>Requires foreground device permission</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.listSectionHeader}>OR CHOOSE MONITORED LOCALITY</Text>

          <FlatList
            data={KNOWN_LOCALITIES}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => {
              const isSelected = item.name.toLowerCase() === currentLocality.toLowerCase();
              return (
                <TouchableOpacity
                  style={[styles.localityItem, isSelected && styles.localityItemSelected]}
                  onPress={() => {
                    haptics.lightQuiet();
                    onSelectLocality(item.name);
                    onClose();
                  }}
                >
                  <View>
                    <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                      {item.name}
                    </Text>
                    <Text style={styles.districtText}>{item.district}</Text>
                  </View>
                  {isSelected && <Text style={styles.checkmark}>✓ ACTIVE</Text>}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: typography.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.paper,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  description: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 6,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginBottom: 18,
  },
  gpsIcon: {
    fontSize: 18,
    color: colors.terracotta,
  },
  gpsTitle: {
    fontFamily: typography.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.paper,
  },
  gpsSub: {
    fontFamily: typography.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  listSectionHeader: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginBottom: 8,
  },
  localityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  localityItemSelected: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 4,
  },
  itemText: {
    fontFamily: typography.sans,
    fontSize: 15,
    fontWeight: '500',
    color: colors.paper,
  },
  itemTextSelected: {
    color: colors.terracotta,
    fontWeight: '600',
  },
  districtText: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkmark: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.terracotta,
  },
});
