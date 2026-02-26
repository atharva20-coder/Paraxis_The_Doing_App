/**
 * SPARK Design System — Spacing & Layout Tokens
 *
 * Consistent spacing scale based on a 4px base unit.
 * All padding, margins, and gaps should use these tokens.
 */

/** Base unit = 4px. All spacing derives from this. */
const BASE = 4;

export const Spacing = {
  xs: BASE, // 4
  sm: BASE * 2, // 8
  md: BASE * 3, // 12
  lg: BASE * 4, // 16
  xl: BASE * 5, // 20
  "2xl": BASE * 6, // 24
  "3xl": BASE * 8, // 32
  "4xl": BASE * 10, // 40
  "5xl": BASE * 12, // 48
  "6xl": BASE * 16, // 64
} as const;

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

/** Minimum touch target per Apple HIG: 44×44pt */
export const HitSlop = {
  top: 10,
  bottom: 10,
  left: 10,
  right: 10,
} as const;

export const Layout = {
  /** Horizontal screen padding */
  screenPaddingHorizontal: Spacing.lg,
  /** Vertical padding between sections */
  sectionGap: Spacing["3xl"],
  /** Card internal padding */
  cardPadding: Spacing.lg,
  /** Bottom tab bar height */
  tabBarHeight: 80,
  /** Minimum touch target size (Apple HIG) */
  minTouchTarget: 44,
} as const;
