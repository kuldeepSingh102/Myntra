import { Appearance, ColorSchemeName } from "react-native";
import { ThemePreference } from "./theme.type";


export function resolveColorScheme(
  preference: ThemePreference,
  systemScheme: ColorSchemeName,
): "light" | "dark" {
  if (preference === "light") {
    return "light";
  }

  if (preference === "dark") {
    return "dark";
  }

  const current = systemScheme ?? Appearance.getColorScheme();
  return current === "dark" ? "dark" : "light";
}
