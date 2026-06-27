import { ThemePreference, STORAGE_KEYS } from "./theme.type";
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveThemePreference(
  preference: ThemePreference,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, preference);
}

export async function getThemePreference(): Promise<ThemePreference | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return null;
}
