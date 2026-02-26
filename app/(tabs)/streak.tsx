/**
 * Streak Screen — Premium data-driven momentum dashboard
 *
 * Design Philosophy (Jony Ive / John Ivy):
 * - Typography IS the UI — the streak number is the hero, not an icon
 * - Data density over decoration — every pixel earns its place
 * - Subtle depth via shadow + border, never cartoon gradients
 * - Muted palette with one accent color punch
 * - Whitespace as a structural element
 */

import { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Animated,
  Dimensions,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Colors, ColorTheme } from "@/constants/Colors";
import { Spacing, BorderRadius, Layout } from "@/constants/Spacing";
import { Typography, FontFamily } from "@/constants/Typography";
import { MOCK_USER } from "@/fixtures/user";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Heatmap Data (7 weeks × 7 days, intensity 0–3) ─────────────────────────

const HEATMAP_DATA: number[][] = [
  [0, 2, 3, 0, 1, 2, 0],
  [1, 3, 0, 2, 3, 3, 1],
  [2, 3, 2, 3, 0, 2, 3],
  [0, 1, 3, 2, 3, 3, 0],
  [1, 2, 0, 0, 2, 3, 1],
  [3, 3, 2, 3, 3, 0, 2],
  [2, 3, 3, 3, 2, 3, 0],
];

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getHeatIntensity(value: number, theme: ColorTheme): string {
  switch (value) {
    case 0:
      return theme.surfaceLight;
    case 1:
      return `${theme.mint}40`;
    case 2:
      return `${theme.mint}90`;
    case 3:
      return theme.mint;
    default:
      return theme.surfaceLight;
  }
}

// ─── Metric Row Item ────────────────────────────────────────────────────────

function MetricItem({
  value,
  label,
  suffix,
  theme,
  color,
}: {
  value: string | number;
  label: string;
  suffix?: string;
  theme: ColorTheme;
  color?: string;
}) {
  const tint = color ?? theme.textPrimary;
  return (
    <View style={metricStyles(theme).item}>
      <View style={metricStyles(theme).valueRow}>
        <Text style={[metricStyles(theme).value, { color: tint }]}>
          {value}
        </Text>
        {suffix && (
          <Text style={[metricStyles(theme).suffix, { color: `${tint}90` }]}>
            {suffix}
          </Text>
        )}
      </View>
      <Text style={metricStyles(theme).label}>{label}</Text>
    </View>
  );
}

const metricStyles = (theme: ColorTheme) =>
  StyleSheet.create({
    item: {
      flex: 1,
      alignItems: "center",
    },
    valueRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    value: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.textPrimary,
      letterSpacing: -0.5,
      fontFamily: FontFamily.bold,
    },
    suffix: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.textTertiary,
      marginLeft: 2,
    },
    label: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.textTertiary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginTop: 4,
    },
  });

// ─── Weekly Progress Bar ────────────────────────────────────────────────────

function WeeklyProgress({ theme }: { theme: ColorTheme }) {
  const daysCompleted = 5; // Out of 7
  const totalDays = 7;
  const dayColors = [
    theme.green,
    theme.mint,
    theme.cyan,
    theme.indigo,
    theme.accent,
    theme.surfaceLight,
    theme.surfaceLight,
  ];

  return (
    <View style={weekStyles(theme).container}>
      <View style={weekStyles(theme).header}>
        <Text style={weekStyles(theme).title}>This Week</Text>
        <Text style={[weekStyles(theme).ratio, { color: theme.green }]}>
          {daysCompleted}/{totalDays} days
        </Text>
      </View>
      <View style={weekStyles(theme).barTrack}>
        {Array.from({ length: totalDays }).map((_, i) => (
          <View
            key={i}
            style={[
              weekStyles(theme).barSegment,
              i < daysCompleted
                ? { backgroundColor: dayColors[i] }
                : weekStyles(theme).barEmpty,
              i === 0 && { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
              i === totalDays - 1 && {
                borderTopRightRadius: 4,
                borderBottomRightRadius: 4,
              },
            ]}
          />
        ))}
      </View>
      <View style={weekStyles(theme).dayLabels}>
        {DAY_LABELS.map((label, i) => (
          <Text
            key={i}
            style={[
              weekStyles(theme).dayLabel,
              i < daysCompleted && {
                color: dayColors[i],
                fontWeight: "700" as const,
              },
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const weekStyles = (theme: ColorTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: Spacing.lg,
    },
    title: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.textPrimary,
    },
    ratio: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.accent,
    },
    barTrack: {
      flexDirection: "row",
      gap: 3,
      height: 8,
    },
    barSegment: {
      flex: 1,
      height: 8,
    },
    barFilled: {
      backgroundColor: theme.accent,
    },
    barEmpty: {
      backgroundColor: theme.surfaceLight,
    },
    dayLabels: {
      flexDirection: "row",
      marginTop: Spacing.sm,
    },
    dayLabel: {
      flex: 1,
      textAlign: "center",
      fontSize: 11,
      fontWeight: "500",
      color: theme.textTertiary,
    },
    dayLabelActive: {
      color: theme.accent,
      fontWeight: "600",
    },
  });

// ─── Heatmap Section ────────────────────────────────────────────────────────

function HeatmapGrid({ theme }: { theme: ColorTheme }) {
  const cellSize = Math.min(38, (SCREEN_WIDTH - Spacing.xl * 2 - 48 - 36) / 7);

  return (
    <View style={heatStyles(theme).container}>
      <View style={heatStyles(theme).header}>
        <Text style={heatStyles(theme).title}>Activity</Text>
        <Text style={heatStyles(theme).subtitle}>Last 7 weeks</Text>
      </View>
      <View style={heatStyles(theme).grid}>
        {/* Day labels column */}
        <View style={heatStyles(theme).dayColumn}>
          {DAY_LABELS.map((label, i) => (
            <Text
              key={i}
              style={[
                heatStyles(theme).dayText,
                { height: cellSize, lineHeight: cellSize },
              ]}
            >
              {label}
            </Text>
          ))}
        </View>
        {/* Heatmap columns */}
        {HEATMAP_DATA.map((week, wi) => (
          <View key={wi} style={heatStyles(theme).column}>
            {week.map((day, di) => (
              <View
                key={`${wi}-${di}`}
                style={[
                  {
                    width: cellSize,
                    height: cellSize,
                    borderRadius: 5,
                    backgroundColor: getHeatIntensity(day, theme),
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      {/* Legend */}
      <View style={heatStyles(theme).legend}>
        <Text style={heatStyles(theme).legendText}>Less</Text>
        {[0, 1, 2, 3].map((level) => (
          <View
            key={level}
            style={[
              heatStyles(theme).legendCell,
              { backgroundColor: getHeatIntensity(level, theme) },
            ]}
          />
        ))}
        <Text style={heatStyles(theme).legendText}>More</Text>
      </View>
    </View>
  );
}

const heatStyles = (theme: ColorTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: Spacing.xl,
    },
    title: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.textPrimary,
    },
    subtitle: {
      fontSize: 12,
      fontWeight: "500",
      color: theme.textTertiary,
    },
    grid: {
      flexDirection: "row",
      gap: 5,
    },
    dayColumn: {
      gap: 5,
      marginRight: 4,
    },
    dayText: {
      fontSize: 10,
      fontWeight: "500",
      color: theme.textTertiary,
      width: 14,
      textAlign: "center",
    },
    column: {
      flex: 1,
      gap: 5,
    },
    legend: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 6,
      marginTop: Spacing.lg,
    },
    legendCell: {
      width: 12,
      height: 12,
      borderRadius: 3,
    },
    legendText: {
      fontSize: 10,
      fontWeight: "500",
      color: theme.textTertiary,
    },
  });

// ─── Milestones Section ─────────────────────────────────────────────────────

function MilestonesRow({ theme }: { theme: ColorTheme }) {
  const milestones = [
    { days: 7, label: "1 week", reached: true, color: theme.green },
    { days: 14, label: "2 weeks", reached: true, color: theme.cyan },
    { days: 30, label: "1 month", reached: false, color: theme.indigo },
    { days: 100, label: "100 days", reached: false, color: theme.orange },
  ];

  return (
    <View style={mileStyles(theme).container}>
      <Text style={mileStyles(theme).title}>Milestones</Text>
      <View style={mileStyles(theme).row}>
        {milestones.map((m, i) => (
          <View key={i} style={mileStyles(theme).item}>
            <View
              style={[
                mileStyles(theme).badge,
                m.reached
                  ? { backgroundColor: `${m.color}18` }
                  : mileStyles(theme).badgeLocked,
              ]}
            >
              <Ionicons
                name={m.reached ? "checkmark" : "lock-closed"}
                size={14}
                color={m.reached ? m.color : theme.textTertiary}
              />
            </View>
            <Text
              style={[
                mileStyles(theme).label,
                m.reached && { color: m.color, fontWeight: "600" as const },
              ]}
            >
              {m.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const mileStyles = (theme: ColorTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    title: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.textPrimary,
      marginBottom: Spacing.lg,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    item: {
      alignItems: "center",
      gap: Spacing.sm,
    },
    badge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    badgeReached: {
      backgroundColor: theme.accentDim,
    },
    badgeLocked: {
      backgroundColor: theme.surfaceLight,
    },
    label: {
      fontSize: 11,
      fontWeight: "500",
      color: theme.textTertiary,
    },
    labelReached: {
      color: theme.accent,
      fontWeight: "600",
    },
  });

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function StreakScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = createStyles(theme);

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [60, 0],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const momentumPercent = Math.round((MOCK_USER.momentumScore / 100) * 100);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Animated.View
        style={[
          styles.headerContainer,
          { height: headerHeight, opacity: headerOpacity },
        ]}
      >
        <Text style={styles.headerTitle}>Momentum</Text>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        {/* ─── Streak Hero ─────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            {/* Streak Counter — Typography is the hero */}
            <View style={styles.streakCounter}>
              <Text style={styles.streakNumber}>{MOCK_USER.streakCount}</Text>
              <View style={styles.streakMeta}>
                <Text style={styles.streakUnit}>day streak</Text>
                <View style={styles.streakTrend}>
                  <Ionicons name="arrow-up" size={12} color={theme.success} />
                  <Text style={styles.trendText}>+3 this week</Text>
                </View>
              </View>
            </View>
            {/* Momentum Score — small, precise */}
            <View style={styles.momentumBadge}>
              <Text style={styles.momentumValue}>
                {MOCK_USER.momentumScore}
              </Text>
              <Text style={styles.momentumLabel}>momentum</Text>
            </View>
          </View>

          {/* Thin momentum bar */}
          <View style={styles.momentumBarTrack}>
            <View
              style={[styles.momentumBarFill, { width: `${momentumPercent}%` }]}
            />
          </View>
        </View>

        {/* ─── Metrics Row ─────────────────────────────────────────── */}
        <View style={styles.metricsCard}>
          <MetricItem
            value={MOCK_USER.longestStreak}
            suffix="d"
            label="Best Streak"
            theme={theme}
            color={theme.orange}
          />
          <View style={styles.metricDivider} />
          <MetricItem
            value={MOCK_USER.totalIdeas}
            label="Ideas"
            theme={theme}
            color={theme.cyan}
          />
          <View style={styles.metricDivider} />
          <MetricItem
            value={MOCK_USER.completedTasks}
            label="Completed"
            theme={theme}
            color={theme.green}
          />
        </View>

        {/* ─── This Week ───────────────────────────────────────────── */}
        <WeeklyProgress theme={theme} />

        {/* ─── Heatmap ─────────────────────────────────────────────── */}
        <HeatmapGrid theme={theme} />

        {/* ─── Milestones ──────────────────────────────────────────── */}
        <MilestonesRow theme={theme} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// ─── Main Styles ────────────────────────────────────────────────────────────

const createStyles = (theme: ColorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    headerContainer: {
      paddingHorizontal: Layout.screenPaddingHorizontal,
      justifyContent: "center",
      overflow: "hidden",
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.textPrimary,
      letterSpacing: -0.5,
      fontFamily: FontFamily.bold,
    },
    scrollContent: {
      paddingHorizontal: Layout.screenPaddingHorizontal,
      paddingBottom: Layout.tabBarHeight + Spacing["4xl"],
      paddingTop: Spacing.sm,
      gap: Spacing.lg,
    },

    // Hero Card
    heroCard: {
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    heroTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: Spacing.xl,
    },
    streakCounter: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: Spacing.md,
    },
    streakNumber: {
      fontSize: 64,
      fontWeight: "900",
      color: theme.orange,
      letterSpacing: -2,
      lineHeight: 64,
      fontFamily: FontFamily.bold,
    },
    streakMeta: {
      paddingBottom: 6,
    },
    streakUnit: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textSecondary,
    },
    streakTrend: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      marginTop: 4,
    },
    trendText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.success,
    },
    momentumBadge: {
      alignItems: "center",
      backgroundColor: `${theme.indigo}15`,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
    },
    momentumValue: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.indigo,
      letterSpacing: -0.5,
      fontFamily: FontFamily.bold,
    },
    momentumLabel: {
      fontSize: 10,
      fontWeight: "600",
      color: theme.indigo,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginTop: 2,
    },
    momentumBarTrack: {
      height: 4,
      backgroundColor: theme.surfaceLight,
      borderRadius: 2,
      overflow: "hidden",
    },
    momentumBarFill: {
      height: "100%",
      backgroundColor: theme.indigo,
      borderRadius: 2,
    },

    // Metrics Card
    metricsCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.xl,
      paddingVertical: Spacing.xl,
      paddingHorizontal: Spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    metricDivider: {
      width: StyleSheet.hairlineWidth,
      height: 36,
      backgroundColor: theme.border,
    },
  });
