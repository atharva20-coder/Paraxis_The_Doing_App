/**
 * SPARK Design System — Typography Scale
 *
 * Uses Inter (Google Fonts) as primary typeface.
 * Scale follows iOS Human Interface Guidelines with custom adjustments for SPARK.
 */

import { TextStyle } from "react-native";

export const FontFamily = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

/** Predefined text styles for consistent typography across the app. */
export const Typography: Record<string, TextStyle> = {
  // ── Display ──
  displayLarge: {
    fontFamily: FontFamily.bold,
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -0.4,
  },
  displayMedium: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
  },

  // ── Headings ──
  headingLarge: {
    fontFamily: FontFamily.semibold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  headingMedium: {
    fontFamily: FontFamily.semibold,
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.1,
  },
  headingSmall: {
    fontFamily: FontFamily.semibold,
    fontSize: 17,
    lineHeight: 22,
  },

  // ── Body ──
  bodyLarge: {
    fontFamily: FontFamily.regular,
    fontSize: 17,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 21,
  },
  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
  },

  // ── Labels ──
  labelLarge: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  labelSmall: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },

  // ── Special ──
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  streakNumber: {
    fontFamily: FontFamily.bold,
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -1,
  },
} as const;
