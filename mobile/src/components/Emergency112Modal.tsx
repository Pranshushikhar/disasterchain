import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { haptics } from '../utils/haptics';

interface Emergency112ModalProps {
  visible: boolean;
  onClose: () => void;
}

export const Emergency112Modal: React.FC<Emergency112ModalProps> = ({ visible, onClose }) => {
  const handleDial112 = () => {
    haptics.heavyEmergency();
    Linking.openURL('tel:112').catch(() => {
      console.warn('Unable to dial tel:112 directly on this device.');
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <View style={styles.warningHeader}>
            <Text style={styles.badge}>CIVIL PROTOCOL 112</Text>
          </View>

          <Text style={styles.heading}>OFFICIAL EMERGENCY SERVICES</Text>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              DisasterChain is a civil intelligence and coordination network. DisasterChain does not directly dispatch official government emergency services.
            </Text>
            <Text style={styles.disclaimerHighlight}>
              For police, fire, or ambulance rescue assistance, call 112 immediately.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.callButton}
            onPress={handleDial112}
            accessibilityRole="button"
            accessibilityLabel="Call 112 National Emergency Helpline"
          >
            <Text style={styles.callButtonText}>CALL 112 NOW</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>RETURN TO APP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.criticalBorder,
    padding: 20,
  },
  warningHeader: {
    marginBottom: 8,
  },
  badge: {
    fontFamily: typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: colors.critical,
    letterSpacing: 1.5,
  },
  heading: {
    fontFamily: typography.sans,
    fontSize: 18,
    fontWeight: '700',
    color: colors.paper,
    marginBottom: 12,
  },
  disclaimerBox: {
    backgroundColor: colors.surfaceHighlight,
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.critical,
    marginBottom: 20,
    gap: 8,
  },
  disclaimerText: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  disclaimerHighlight: {
    fontFamily: typography.sans,
    fontSize: 13,
    fontWeight: '600',
    color: colors.paper,
    lineHeight: 18,
  },
  callButton: {
    backgroundColor: colors.critical,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 10,
  },
  callButtonText: {
    fontFamily: typography.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
});
