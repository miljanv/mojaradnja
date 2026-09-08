import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { theme } from "@/lib/theme";

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
}: {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  style?: StyleProp<ViewStyle>;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        variant === "primary" && styles.btnPrimary,
        variant === "secondary" && styles.btnSecondary,
        variant === "ghost" && styles.btnGhost,
        isDisabled && styles.btnDisabled,
        pressed && !isDisabled && styles.btnPressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : theme.colors.primary} />
      ) : (
        <Text
          style={[
            styles.btnText,
            variant === "primary" ? styles.btnTextLight : styles.btnTextDark,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ label, tone = "muted" }: { label: string; tone?: "muted" | "brand" | "success" }) {
  return (
    <View
      style={[
        styles.pill,
        tone === "brand" && { backgroundColor: theme.colors.primarySoft },
        tone === "success" && { backgroundColor: "#E6F6EF" },
      ]}
    >
      <Text
        style={[
          styles.pillText,
          tone === "brand" && { color: theme.colors.primaryDark },
          tone === "success" && { color: theme.colors.success },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  btnPrimary: { backgroundColor: theme.colors.primary },
  btnSecondary: {
    backgroundColor: theme.colors.white,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  btnGhost: { backgroundColor: "transparent" },
  btnDisabled: { opacity: 0.45 },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  btnText: { fontSize: 17, fontWeight: "700" },
  btnTextLight: { color: theme.colors.white },
  btnTextDark: { color: theme.colors.text },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.bgMuted,
    alignSelf: "flex-start",
  },
  pillText: { fontSize: 13, fontWeight: "700", color: theme.colors.textMuted },
});
