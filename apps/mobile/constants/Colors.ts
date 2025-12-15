// OYO-style Hotel Booking App Colors
// Using a vibrant red/coral theme similar to OYO

const primaryColor = '#E23744'; // OYO Red
const primaryDark = '#C41E3A';  // Darker Red
const primaryLight = '#FF6B7A'; // Lighter Red for accents
const accentGold = '#FFB400';   // Gold accent
const accentTeal = '#00A699';   // Teal accent

export default {
  light: {
    text: '#222222',
    textSecondary: '#717171',
    background: '#FFFFFF',
    backgroundSecondary: '#F7F7F7',
    tint: primaryColor,
    tabIconDefault: '#B0B0B0',
    tabIconSelected: primaryColor,
    border: '#EBEBEB',
    success: '#00A699',
    error: '#FF5A5F',
    warning: '#FFB400',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.5)',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    background: '#1A1A1A',
    backgroundSecondary: '#262626',
    tint: '#FF6B6B',
    tabIconDefault: '#6B6B6B',
    tabIconSelected: '#FF6B6B',
    border: '#333333',
    success: '#00D9C0',
    error: '#FF6B6B',
    warning: '#FFD166',
    card: '#262626',
    cardElevated: '#2F2F2F',
    overlay: 'rgba(0,0,0,0.7)',
  },
  primary: primaryColor,
  primaryDark: primaryDark,
  primaryLight: primaryLight,
  accent: {
    gold: accentGold,
    teal: accentTeal,
  },
  gradient: {
    primary: [primaryColor, primaryDark],
    premium: ['#E23744', '#FF6B7A'],
    overlay: ['transparent', 'rgba(0,0,0,0.7)'],
  },
};
