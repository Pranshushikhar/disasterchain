/**
 * DisasterChain Mobile Design System
 * CALM FUTURE / OPERATIONAL HUMANISM
 */

export const colors = {
  // Backgrounds
  background: '#0D0E0D', // Warm near-black
  backgroundElevated: '#141614',
  surface: '#1A1C19',
  surfaceSubtle: '#121412',
  surfaceHighlight: '#222521',

  // Paper / Text tokens
  paper: '#F2EFE8',
  softPaper: '#F7F4ED',
  textPrimary: '#F7F4ED',
  textSecondary: '#B4B8AD',
  textMuted: '#7E8377',
  textDim: '#52564C',

  // Brand Accent
  terracotta: '#D66A35',
  terracottaDark: '#A84E22',
  terracottaGlow: 'rgba(214, 106, 53, 0.15)',

  // Borders & Separators
  border: '#282B26',
  borderSubtle: '#1E211C',
  borderStrong: '#3A3F37',
  divider: '#20231E',

  // Semantic Emergency Palette (Restrained, used only where meaningful)
  critical: '#D94332', // Critical / SOS / High Risk
  criticalBg: 'rgba(217, 67, 50, 0.12)',
  criticalBorder: 'rgba(217, 67, 50, 0.35)',

  elevated: '#D68832', // Elevated Risk / Severe Warning
  elevatedBg: 'rgba(214, 136, 50, 0.12)',
  elevatedBorder: 'rgba(214, 136, 50, 0.35)',

  advisory: '#3C8CD9', // Operational Blue / Information
  advisoryBg: 'rgba(60, 140, 217, 0.12)',
  advisoryBorder: 'rgba(60, 140, 217, 0.35)',

  safe: '#4F9E6C', // Normal / Safe / Relieved
  safeBg: 'rgba(79, 158, 108, 0.12)',
  safeBorder: 'rgba(79, 158, 108, 0.35)',

  // Status Indicator
  liveGreen: '#45B66F',
  liveGreenGlow: 'rgba(69, 182, 111, 0.25)',
  staleAmber: '#CCA13B',
  offlineGray: '#7E8377',
};

export type ColorName = keyof typeof colors;
