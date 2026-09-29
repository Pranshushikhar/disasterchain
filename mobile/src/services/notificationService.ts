import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { router } from 'expo-router';

// Configure default notification handler for in-app reception
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

export const notificationService = {
  async registerForPushNotifications(): Promise<string | null> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permission denied by user.');
        return null;
      }

      // In Android, configure primary high-priority channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('critical-alerts', {
          name: 'Critical Safety Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#D94332',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('operational-updates', {
          name: 'Civil Operational Updates',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 100],
          lightColor: '#D68832',
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
      return tokenData?.data || null;
    } catch (err) {
      console.warn('Could not register for push notifications:', err);
      return null;
    }
  },

  handleDeepLink(url: string | null) {
    if (!url) return;

    try {
      // Examples: disasterchain://situation, disasterchain://alerts, disasterchain://shelter/123
      const cleaned = url.replace('disasterchain://', '');
      const parts = cleaned.split('/');
      const screen = parts[0];
      const param = parts[1];

      switch (screen) {
        case 'situation':
          router.replace('/(tabs)');
          break;
        case 'map':
          router.replace('/(tabs)/map');
          break;
        case 'alerts':
          router.replace('/(tabs)/alerts');
          break;
        case 'sos':
          router.replace('/(tabs)/sos');
          break;
        case 'shelter':
          if (param) {
            router.push(`/shelters?id=${param}` as any);
          } else {
            router.push('/shelters' as any);
          }
          break;
        case 'incident':
          if (param) {
            router.push(`/(tabs)/map?incidentId=${param}`);
          }
          break;
        case 'weathergpt':
          router.push('/weathergpt' as any);
          break;
        default:
          break;
      }
    } catch (e) {
      console.warn('Failed parsing deep link:', url, e);
    }
  },

  setupNotificationListeners(onNotificationTapped?: (deepLink: string) => void) {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      const deepLink = (data?.deepLink as string) || (data?.url as string);
      if (deepLink) {
        if (onNotificationTapped) {
          onNotificationTapped(deepLink);
        } else {
          this.handleDeepLink(deepLink);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  },
};
