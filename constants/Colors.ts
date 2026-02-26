/**
 * SPARK Design System — Color Tokens
 *
 * Light and Dark modes with automatic system switching.
 * Standard iOS System Colors mapped directly from design files.
 */

const tintColorLight = "#007AFF"; // System Blue / Light
const tintColorDark = "#0A84FF"; // System Blue / Dark

export const Colors = {
  light: {
    // ── Brand / Core Palette ──
    blue: "#007AFF",
    brown: "#A2845E",
    cyan: "#32ADE6",
    green: "#34C759",
    indigo: "#5856D6",
    mint: "#00C7BE",
    orange: "#FF9500",
    pink: "#FF2D55",
    purple: "#AF52DE",
    red: "#FF3B30",
    teal: "#30B0C7",
    yellow: "#FFCC00",

    // ── Grayscale ──
    gray1: "#8E8E93",
    gray2: "#AEAEB2",
    gray3: "#C7C7CC",
    gray4: "#D1D1D6",
    gray5: "#E5E5EA",
    gray6: "#F2F2F7",

    // ── Backgrounds ──
    systemBackground: "#FFFFFF",
    secondarySystemBackground: "#F2F2F7",
    tertiarySystemBackground: "#FFFFFF",
    systemGroupedBackground: "#F2F2F7",
    secondarySystemGroupedBackground: "#FFFFFF",
    tertiarySystemGroupedBackground: "#F2F2F7",

    // Aliases to avoid refactoring entire app heavily
    background: "#F2F2F7", // System Grouped Background
    surface: "#FFFFFF", // Secondary System Grouped Background
    surfaceLight: "#E5E5EA", // System Gray 5
    surfaceGlass: "rgba(255,255,255,0.7)",

    // ── Text/Labels ──
    textPrimary: "#000000",
    textSecondary: "#8A8A8E",
    textTertiary: "#C4C4C6",
    textQuaternary: "#DCDCDD",
    textInverse: "#FFFFFF",
    placeholderText: "#C4C4C6",
    link: "#007AFF",

    // ── Fills ──
    systemFill: "#E4E4E6",
    secondarySystemFill: "#E9E9EA",
    tertiarySystemFill: "#EEEEEF",
    quaternarySystemFill: "#F4F4F5",

    // ── Borders & Dividers ──
    border: "#C5C5C8", // Opaque Separator
    borderLight: "#C6C6C8", // Separator
    divider: "#C6C6C8",
    separator: "#C6C6C8",
    opaqueSeparator: "#C5C5C8",

    // ── Accent / Brand ──
    accent: tintColorLight,
    accentDim: "rgba(0, 122, 255, 0.15)",
    accentPressed: "#005CDE",

    // ── Semantic ──
    success: "#34C759",
    successDim: "rgba(52, 199, 89, 0.15)",
    warning: "#FF9500",
    warningDim: "rgba(255, 149, 0, 0.15)",
    danger: "#FF3B30",
    dangerDim: "rgba(255, 59, 48, 0.15)",
    info: "#32ADE6",
    infoDim: "rgba(50, 173, 230, 0.15)",

    // ── Status Chips ──
    statusDraft: "#8E8E93",
    statusResearching: "#32ADE6",
    statusScheduled: "#FF9500",
    statusInProgress: tintColorLight,
    statusDone: "#34C759",

    // ── Difficulty ──
    difficultyEasy: "#34C759",
    difficultyMedium: "#FF9500",
    difficultyHard: "#FF3B30",

    // ── Overlay ──
    overlay: "rgba(0,0,0,0.3)",
    shimmer: "rgba(0,0,0,0.05)",
  },
  dark: {
    // ── Brand / Core Palette ──
    blue: "#0A84FF",
    brown: "#AC8E68",
    cyan: "#64D2FF",
    green: "#30D158",
    indigo: "#5E5CE6",
    mint: "#66D4CF",
    orange: "#FF9F0A",
    pink: "#FF375F",
    purple: "#BF5AF2",
    red: "#FF453A",
    teal: "#40C8E0",
    yellow: "#FFD60A",

    // ── Grayscale ──
    gray1: "#8E8E93",
    gray2: "#636366",
    gray3: "#48484A",
    gray4: "#3A3A3C",
    gray5: "#2C2C2E",
    gray6: "#1C1C1E",

    // ── Backgrounds ──
    systemBackground: "#000000",
    // In standard iOS, dark mode secondary system background is 1C1C1E.
    // The user's list maps "Secondary System background: F2F2F7" (which seems like a typo)
    // but the actual system grouped dark elements mapped to #1C1C1E / #2C2C2E. Let's map rationally.
    secondarySystemBackground: "#1C1C1E",
    tertiarySystemBackground: "#1C1C1E",
    systemGroupedBackground: "#2C2C2E",
    secondarySystemGroupedBackground: "#000000",
    tertiarySystemGroupedBackground: "#2C2C2E",

    // Aliases
    background: "#000000",
    surface: "#1C1C1E",
    surfaceLight: "#2C2C2E",
    surfaceGlass: "rgba(28, 28, 30, 0.7)",

    // ── Text/Labels ──
    textPrimary: "#FFFFFF",
    textSecondary: "#8E8E93", // Standard secondary label
    textTertiary: "#636366", // Standard tertiary
    textQuaternary: "#48484A",
    textInverse: "#000000",
    placeholderText: "#636366",
    link: "#0B84FF",

    // ── Fills ──
    systemFill: "#CECED1",
    secondarySystemFill: "#D3D3D6",
    tertiarySystemFill: "#DEDEE1",
    quaternarySystemFill: "#E6E6E8",

    // ── Borders & Dividers ──
    border: "#38383A", // Opaque
    borderLight: "#98989B", // Separator
    divider: "#98989B",
    separator: "#98989B",
    opaqueSeparator: "#38383A",

    // ── Accent / Brand ──
    accent: tintColorDark,
    accentDim: "rgba(10, 132, 255, 0.15)",
    accentPressed: "#0067E6",

    // ── Semantic ──
    success: "#30D158",
    successDim: "rgba(48, 209, 88, 0.15)",
    warning: "#FF9F0A",
    warningDim: "rgba(255, 159, 10, 0.15)",
    danger: "#FF453A",
    dangerDim: "rgba(255, 69, 58, 0.15)",
    info: "#64D2FF",
    infoDim: "rgba(100, 210, 255, 0.15)",

    // ── Status Chips ──
    statusDraft: "#8E8E93",
    statusResearching: "#64D2FF",
    statusScheduled: "#FF9F0A",
    statusInProgress: tintColorDark,
    statusDone: "#30D158",

    // ── Difficulty ──
    difficultyEasy: "#30D158",
    difficultyMedium: "#FF9F0A",
    difficultyHard: "#FF453A",

    // ── Overlay ──
    overlay: "rgba(0,0,0,0.6)",
    shimmer: "rgba(255,255,255,0.05)",
  },
} as const;

export type ColorTheme = typeof Colors.light | typeof Colors.dark;
export type ColorToken = keyof ColorTheme;
