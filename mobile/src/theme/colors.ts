export type AppThemeName = 'light' | 'dark';

export type AppColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  selectedSurface: string;
  text: string;
  muted: string;
  primary: string;
  primaryDark: string;
  primaryOn: string;
  accent: string;
  accentOn: string;
  danger: string;
  dangerSurface: string;
  successSurface: string;
  border: string;
  overlay: string;
  white: string;
};

export const darkColors: AppColors = {
  background: '#101820',
  surface: '#17212b',
  surfaceAlt: '#213140',
  selectedSurface: '#163a36',
  text: '#f7fbff',
  muted: '#b7c5d3',
  primary: '#40c9a2',
  primaryDark: '#1f8f78',
  primaryOn: '#101820',
  accent: '#ffd166',
  accentOn: '#101820',
  danger: '#f05d5e',
  dangerSurface: '#452226',
  successSurface: '#123d35',
  border: '#2e4357',
  overlay: 'rgba(0, 0, 0, 0.46)',
  white: '#ffffff',
};

export const lightColors: AppColors = {
  background: '#f4f8f7',
  surface: '#ffffff',
  surfaceAlt: '#e7f1ee',
  selectedSurface: '#d9f3ec',
  text: '#10201e',
  muted: '#5c706d',
  primary: '#159b7d',
  primaryDark: '#0d725f',
  primaryOn: '#ffffff',
  accent: '#d68c00',
  accentOn: '#ffffff',
  danger: '#c93c45',
  dangerSurface: '#ffe6e9',
  successSurface: '#dcf5ee',
  border: '#c9dad6',
  overlay: 'rgba(15, 32, 30, 0.28)',
  white: '#ffffff',
};

export const themeColors: Record<AppThemeName, AppColors> = {
  light: lightColors,
  dark: darkColors,
};
