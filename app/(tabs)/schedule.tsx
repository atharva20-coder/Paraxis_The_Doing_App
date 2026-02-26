import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";

import { Colors, ColorTheme } from "@/constants/Colors";
import { Spacing, BorderRadius, Layout } from "@/constants/Spacing";
import { MOCK_TASKS } from "@/fixtures/tasks";
import { MOCK_IDEAS } from "@/fixtures/ideas";
import { Task, TaskDifficulty } from "@/types/task";

const getDifficultyColors = (
  theme: ColorTheme,
): Record<TaskDifficulty, string> => ({
  easy: theme.difficultyEasy,
  medium: theme.difficultyMedium,
  hard: theme.difficultyHard,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DATES = ["26", "27", "28", "01", "02", "03", "04"];

function DaySelector({ theme }: { theme: ColorTheme }) {
  const styles = createStyles(theme);
  return (
    <View style={styles.dayRow}>
      {DAYS.map((day, i) => {
        const isToday = i === 0;
        return (
          <Pressable
            key={day}
            style={[styles.dayItem, isToday && styles.dayItemActive]}
          >
            <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>
              {day}
            </Text>
            <Text style={[styles.dateLabel, isToday && styles.dateLabelActive]}>
              {DATES[i]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TaskCard({ task, theme }: { task: Task; theme: ColorTheme }) {
  const styles = createStyles(theme);
  const ideaTitle =
    MOCK_IDEAS.find((i) => i.id === task.ideaId)?.title ?? "Unknown";
  const diffColor = getDifficultyColors(theme)[task.difficulty];
  const isCompleted = task.status === "completed";

  return (
    <View style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}>
      <View style={[styles.taskDiffStrip, { backgroundColor: diffColor }]} />
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTime}>{task.scheduledStartTime}</Text>
          <View style={[styles.durationBadge, { borderColor: diffColor }]}>
            <Ionicons name="time-outline" size={12} color={diffColor} />
            <Text style={[styles.durationText, { color: diffColor }]}>
              {task.durationMinutes}m
            </Text>
          </View>
        </View>
        <Text
          style={[styles.taskTitle, isCompleted && styles.taskTitleDone]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <Text style={styles.taskIdea} numberOfLines={1}>
          {ideaTitle}
        </Text>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={theme.success} />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ScheduleScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = createStyles(theme);
  const todayTasks = MOCK_TASKS.filter((t) => t.scheduledDate === "2026-02-26");
  const tomorrowTasks = MOCK_TASKS.filter(
    (t) => t.scheduledDate === "2026-02-27",
  );

  const scrollY = useRef(new Animated.Value(0)).current;

  // Header Animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [72, 0],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Animated.View
        style={[
          styles.header,
          { height: headerHeight, opacity: headerOpacity },
        ]}
      >
        <Text style={styles.title}>Schedule</Text>
        <Text style={styles.subtitle}>February 2026</Text>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        stickyHeaderIndices={[0]}
      >
        <View style={styles.stickyContainer}>
          <DaySelector theme={theme} />
        </View>

        {/* Today */}
        <View style={styles.sectionHeader}>
          <View
            style={[styles.sectionLine, { backgroundColor: theme.accent }]}
          />
          <Text style={styles.sectionTitle}>Today</Text>
        </View>
        {todayTasks.map((task) => (
          <TaskCard key={task.id} task={task} theme={theme} />
        ))}

        {/* Tomorrow */}
        <View style={[styles.sectionHeader, { marginTop: Spacing["3xl"] }]}>
          <View style={styles.sectionLineInactive} />
          <Text style={styles.sectionTitleInactive}>Tomorrow</Text>
        </View>
        {tomorrowTasks.map((task) => (
          <TaskCard key={task.id} task={task} theme={theme} />
        ))}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ColorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: Layout.screenPaddingHorizontal,
      paddingTop: Spacing.sm,
      overflow: "hidden",
      justifyContent: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.textPrimary,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 2,
    },
    stickyContainer: {
      backgroundColor: theme.background,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.md,
      zIndex: 10,
    },
    dayRow: {
      flexDirection: "row",
      gap: Spacing.sm,
    },
    dayItem: {
      flex: 1,
      alignItems: "center",
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
    },
    dayItemActive: {
      backgroundColor: theme.accentDim,
      borderWidth: 1,
      borderColor: theme.accent,
    },
    dayLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.textTertiary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    dayLabelActive: {
      color: theme.accent,
    },
    dateLabel: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.textSecondary,
      marginTop: 2,
    },
    dateLabelActive: {
      color: theme.accent,
    },
    scrollContent: {
      paddingHorizontal: Layout.screenPaddingHorizontal,
      paddingBottom: Layout.tabBarHeight + Spacing["4xl"],
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
      marginBottom: Spacing.lg,
    },
    sectionLine: {
      width: 32,
      height: 2,
      borderRadius: 1,
    },
    sectionLineInactive: {
      width: 32,
      height: 2,
      borderRadius: 1,
      backgroundColor: theme.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.accent,
    },
    sectionTitleInactive: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textTertiary,
    },
    taskCard: {
      flexDirection: "row",
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.md,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    taskCardCompleted: {
      opacity: 0.6,
    },
    taskDiffStrip: {
      width: 4,
    },
    taskContent: {
      flex: 1,
      padding: Layout.cardPadding,
    },
    taskHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.sm,
    },
    taskTime: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.textSecondary,
    },
    durationBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
    },
    durationText: {
      fontSize: 11,
      fontWeight: "600",
    },
    taskTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textPrimary,
      marginBottom: Spacing.xs,
    },
    taskTitleDone: {
      textDecorationLine: "line-through",
      color: theme.textTertiary,
    },
    taskIdea: {
      fontSize: 13,
      color: theme.textTertiary,
    },
    completedBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: Spacing.sm,
    },
    completedText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.success,
    },
  });
