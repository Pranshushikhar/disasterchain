import { Platform, TextStyle } from 'react-native';

export const typography = {
  // Font Families
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'serif',
  }),
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'system-ui, -apple-system, sans-serif',
  }),
  mono: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: 'monospace',
  }),

  // Font Sizes & Line Heights
  sizes: {
    hero: 32,
    h1: 26,
    h2: 21,
    h3: 17,
    bodyLarge: 16,
    body: 14,
    bodySmall: 13,
    caption: 11,
    telemetry: 12,
    badge: 10,
  },

  // Pre-configured Operational Text Styles
  styles: {
    situationHero: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '500',
      letterSpacing: -0.5,
    } as TextStyle,

    localityHeader: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 2.2,
      textTransform: 'uppercase',
    } as TextStyle,

    sectionHeading: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1.8,
      textTransform: 'uppercase',
    } as TextStyle,

    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
    } as TextStyle,

    body: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
    } as TextStyle,

    bodyMuted: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400',
    } as TextStyle,

    telemetryMono: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      letterSpacing: 0.5,
    } as TextStyle,

    timestamp: {
      fontSize: 11,
      lineHeight: 14,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    } as TextStyle,

    badge: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    } as TextStyle,
  },
};
