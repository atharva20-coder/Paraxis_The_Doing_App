/**
 * Home Screen — SPARK Ideas Dashboard
 *
 * Design (Jony Ive):
 * - Colorful category-accented cards with left edge indicator
 * - Rich greeting header with orange streak badge
 * - Category-colored momentum bars
 * - Premium FAB with shadow depth
 */

import { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import * as Haptics from "expo-haptics";
import { Colors, ColorTheme } from "@/constants/Colors";
import { Spacing, BorderRadius, Layout } from "@/constants/Spacing";
import { FontFamily } from "@/constants/Typography";
import { MOCK_IDEAS } from "@/fixtures/ideas";
import { MOCK_USER } from "@/fixtures/user";
import { Idea, IdeaStatus, IdeaCategory } from "@/types/idea";

// ─── Category → Color mapping ──────────────────────────────────────────────

const getCategoryColor = (
  category: IdeaCategory,
  theme: ColorTheme,
): string => {
  const map: Record<IdeaCategory, string> = {
    "Mobile App": theme.indigo,
    "Web App": theme.cyan,
    SaaS: theme.teal,
    "API / Backend": theme.orange,
    "AI / ML": theme.purple,
    Other: theme.mint,
  };
  return map[category] ?? theme.accent;
};

const getCategoryIcon = (category: IdeaCategory): string => {
  const map: Record<IdeaCategory, string> = {
    "Mobile App": "phone-portrait",
    "Web App": "globe",
    SaaS: "cloud",
    "API / Backend": "server",
    "AI / ML": "sparkles",
    Other: "shapes",
  };
  return map[category] ?? "shapes";
};

// ─── Status config ─────────────────────────────────────────────────────────

const getStatusConfig = (
  theme: ColorTheme,
): Record<IdeaStatus, { label: string; color: string; bgColor: string }> => ({
  draft: {
    label: "Draft",
    color: theme.statusDraft,
    bgColor: `${theme.statusDraft}20`,
  },
  researching: {
    label: "Researching",
    color: theme.cyan,
    bgColor: `${theme.cyan}18`,
  },
  researched: {
    label: "Researched",
    color: theme.green,
    bgColor: `${theme.green}18`,
  },
  scheduled: {
    label: "Scheduled",
    color: theme.orange,
    bgColor: `${theme.orange}18`,
  },
  in_progress: {
    label: "In Progress",
    color: theme.indigo,
    bgColor: `${theme.indigo}18`,
  },
  done: {
    label: "Done",
    color: theme.green,
    bgColor: `${theme.green}18`,
  },
});

// ─── Idea Card ─────────────────────────────────────────────────────────────

function IdeaCard({
  idea,
  onPress,
  theme,
}: {
  idea: Idea;
  onPress: () => void;
  theme: ColorTheme;
}) {
  const status = getStatusConfig(theme)[idea.status];
  const categoryColor = getCategoryColor(idea.category, theme);
  const categoryIcon = getCategoryIcon(idea.category);
  const styles = createStyles(theme);

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Colored left accent bar */}
      <View style={[styles.cardAccent, { backgroundColor: categoryColor }]} />

      <View style={styles.cardBody}>
        {/* Top row: category icon + status badge */}
        <View style={styles.cardHeader}>
          <View style={styles.categoryRow}>
            <View
              style={[
                styles.categoryIconBg,
                { backgroundColor: `${categoryColor}15` },
              ]}
            >
              <Ionicons
                name={categoryIcon as any}
                size={14}
                color={categoryColor}
              />
            </View>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {idea.category}
            </Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: status.bgColor }]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: status.color }]}
            />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* Title & description */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {idea.title}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {idea.description}
        </Text>

        {/* Momentum bar — colored by category */}
        {idea.momentum > 0 && (
          <View style={styles.momentumRow}>
            <View style={styles.momentumBarBg}>
              <View
                style={[
                  styles.momentumBarFill,
                  {
                    width: `${idea.momentum}%`,
                    backgroundColor: categoryColor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.momentumText, { color: categoryColor }]}>
              {idea.momentum}%
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = createStyles(theme);
  const router = useRouter();

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [100, 0],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const firstName = MOCK_USER.name.split(" ")[0];

  // Time-aware greeting
  const hour = new Date().getHours();
  const greetingText =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { height: headerHeight, opacity: headerOpacity },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            {greetingText}, <Text style={styles.greetingName}>{firstName}</Text>
          </Text>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Ionicons name="flame" size={14} color={theme.orange} />
              <Text style={[styles.headerStatText, { color: theme.orange }]}>
                {MOCK_USER.streakCount}d streak
              </Text>
            </View>
            <View style={styles.headerStatDot} />
            <View style={styles.headerStat}>
              <Ionicons name="bulb" size={14} color={theme.cyan} />
              <Text style={[styles.headerStatText, { color: theme.cyan }]}>
                {MOCK_IDEAS.length} sparks
              </Text>
            </View>
            <View style={styles.headerStatDot} />
            <View style={styles.headerStat}>
              <Ionicons name="checkmark-circle" size={14} color={theme.green} />
              <Text style={[styles.headerStatText, { color: theme.green }]}>
                {MOCK_USER.completedTasks} done
              </Text>
            </View>
          </View>
        </View>
        <Pressable
          style={[styles.streakBadge, { backgroundColor: `${theme.orange}15` }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/(tabs)/streak");
          }}
        >
          <Ionicons name="flame" size={20} color={theme.orange} />
          <Text style={[styles.streakNumber, { color: theme.orange }]}>
            {MOCK_USER.streakCount}
          </Text>
        </Pressable>
      </Animated.View>

      {/* Idea List */}
      <Animated.FlatList
        data={MOCK_IDEAS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <IdeaCard
            idea={item}
            onPress={() => router.push(`/idea/${item.id}`)}
            theme={theme}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      />

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/idea/new");
        }}
      >
        <View style={styles.fabSolid}>
          <Ionicons name="add" size={28} color={theme.textInverse} />
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const createStyles = (theme: ColorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: Layout.screenPaddingHorizontal,
      paddingTop: Spacing.sm,
      overflow: "hidden",
    },
    headerLeft: {
      flex: 1,
    },
    greeting: {
      fontSize: 24,
      fontWeight: "600",
      color: theme.textSecondary,
      letterSpacing: -0.2,
    },
    greetingName: {
      fontWeight: "800",
      color: theme.textPrimary,
      fontFamily: FontFamily.bold,
    },
    headerStats: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: Spacing.sm,
      gap: Spacing.sm,
    },
    headerStat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    headerStatText: {
      fontSize: 12,
      fontWeight: "600",
    },
    headerStatDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: theme.textTertiary,
    },
    streakBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
      gap: Spacing.xs,
    },
    streakNumber: {
      fontSize: 18,
      fontWeight: "800",
      fontFamily: FontFamily.bold,
    },
    listContent: {
      paddingHorizontal: Layout.screenPaddingHorizontal,
      paddingBottom: Layout.tabBarHeight + Spacing["4xl"],
      paddingTop: Spacing.lg,
    },
    card: {
      flexDirection: "row",
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.xl,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    cardPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.9,
    },
    cardAccent: {
      width: 4,
    },
    cardBody: {
      flex: 1,
      padding: Layout.cardPadding,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.sm,
    },
    categoryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
    },
    categoryIconBg: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    categoryText: {
      fontSize: 12,
      fontWeight: "600",
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: BorderRadius.full,
      gap: 5,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      fontSize: 10,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.textPrimary,
      marginBottom: Spacing.xs,
      letterSpacing: -0.2,
      fontFamily: FontFamily.bold,
    },
    cardDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    momentumRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: Spacing.md,
      gap: Spacing.sm,
    },
    momentumBarBg: {
      flex: 1,
      height: 4,
      backgroundColor: theme.surfaceLight,
      borderRadius: 2,
      overflow: "hidden",
    },
    momentumBarFill: {
      height: "100%",
      borderRadius: 2,
    },
    momentumText: {
      fontSize: 12,
      fontWeight: "700",
      minWidth: 32,
      textAlign: "right",
    },
    fab: {
      position: "absolute",
      bottom: Layout.tabBarHeight + Spacing.lg,
      right: Layout.screenPaddingHorizontal,
    },
    fabPressed: {
      transform: [{ scale: 0.9 }],
    },
    fabSolid: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.indigo,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.indigo,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 14,
      elevation: 10,
    },
  });
