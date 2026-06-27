import React from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemePreference, useThemeContext } from "../theme";

function Pill({
  label,
  onPress,
  isActive,
}: {
  label: string;
  onPress: () => void;
  isActive: boolean;
}) {
  const { theme } = useThemeContext();

  return (
    <TouchableOpacity
      style={[
        styles.pill,
        {
          backgroundColor: isActive ? theme.colors.primary : theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={{
          color: isActive ? "#FFFFFF" : theme.colors.text,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ThemeArchitectureDemoScreen() {
  const {
    preference,
    resolvedScheme,
    theme,
    setPreference,
    toggleTheme,
    isHydrated,
  } = useThemeContext();

  const options: ThemePreference[] = ["light", "dark", "system"];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={resolvedScheme === "dark" ? "light-content" : "dark-content"}
      />

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Theme Day 1
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
          End-to-end flow with Context + Provider + AsyncStorage + System mode.
        </Text>

        <View style={styles.row}>
          {options.map((option) => (
            <Pill
              key={option}
              label={option.toUpperCase()}
              isActive={preference === option}
              onPress={() => {
                void setPreference(option);
              }}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => {
            void toggleTheme();
          }}
        >
          <Text style={{ color: theme.colors.text, fontWeight: "600" }}>
            Toggle (forces light/dark)
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.metaText, { color: theme.colors.text }]}>
            Stored preference: {preference}
          </Text>
          <Text style={[styles.metaText, { color: theme.colors.text }]}>
            Resolved scheme: {resolvedScheme}
          </Text>
          <Text style={[styles.metaText, { color: theme.colors.mutedText }]}>
            Hydrated from storage: {isHydrated ? "yes" : "no"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  toggleButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  metaText: {
    fontSize: 14,
  },
});
