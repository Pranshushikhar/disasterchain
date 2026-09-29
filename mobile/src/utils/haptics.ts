import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const haptics = {
  /**
   * Emergency interactions (SOS triggered, critical alert confirmed)
   */
  async heavyEmergency() {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {}
  },

  /**
   * Key operational status change (Report submitted, filter applied)
   */
  async mediumOperational() {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  },

  /**
   * Normal quiet navigation or tap
   */
  async lightQuiet() {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  },

  /**
   * Success notification
   */
  async success() {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  },
};
