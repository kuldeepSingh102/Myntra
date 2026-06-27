export const STORAGE_KEYS = {
  THEME_PREFERENCE: 'theme_preference',
} as const;

export type ThemePreference = 'light' | 'dark' | 'system';
