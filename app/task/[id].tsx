import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/Colors";
import { Spacing, BorderRadius, Layout } from "@/constants/Spacing";
import { MOCK_TASKS } from "@/fixtures/tasks";
import { MOCK_IDEAS } from "@/fixtures/ideas";

export default function TaskExecutionScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const task = MOCK_TASKS.find((t) => t.id === id);
  const idea = task ? MOCK_IDEAS.find((i) => i.id === task.ideaId) : undefined;

  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Task not found</Text>
      </SafeAreaView>
    );
  }

  const totalSeconds = task.durationMinutes * 60;
  const progress = Math.min(secondsElapsed / totalSeconds, 1);
  const minutesLeft = Math.max(
    0,
    Math.ceil((totalSeconds - secondsElapsed) / 60),
  );
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleComplete = () => {
    setIsRunning(false);
    setIsCompleted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable style={styles.rescheduleBtn}>
            <Ionicons
              name="swap-horizontal"
              size={16}
              color={theme.textSecondary}
            />
            <Text style={styles.rescheduleText}>Reschedule</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        {/* Project Context */}
        {idea && (
          <View style={styles.projectBadge}>
            <Ionicons name="bulb" size={14} color={theme.accent} />
            <Text style={styles.projectName}>{idea.title}</Text>
          </View>
        )}

        {/* Task Title */}
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskDescription}>{task.description}</Text>

        {/* Timer Circle */}
        <View style={styles.timerContainer}>
          <View style={styles.timerOuter}>
            <View
              style={[
                styles.timerRing,
                { backgroundColor: isCompleted ? theme.success : theme.accent },
              ]}
            >
              <View style={styles.timerInner}>
                {isCompleted ? (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={48}
                      color={theme.success}
                    />
                    <Text style={styles.completedText}>Done! 🎉</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.timerText}>
                      {formatTime(secondsElapsed)}
                    </Text>
                    <Text style={styles.timerSubtext}>
                      {minutesLeft} min remaining
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Difficulty & Duration */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="speedometer" size={16} color={theme.textTertiary} />
            <Text style={styles.metaText}>{task.difficulty}</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Ionicons name="time" size={16} color={theme.textTertiary} />
            <Text style={styles.metaText}>{task.durationMinutes} min</Text>
          </View>
        </View>

        {/* Resources */}
        {task.resources.length > 0 && (
          <View style={styles.resourcesSection}>
            <Text style={styles.resourcesLabel}>Resources</Text>
            {task.resources.map((url, i) => (
              <View key={i} style={styles.resourceItem}>
                <Ionicons name="link" size={14} color={theme.info} />
                <Text style={styles.resourceUrl} numberOfLines={1}>
                  {url}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        {isCompleted ? (
          <Pressable onPress={() => router.back()}>
            <View
              style={[styles.actionButton, { backgroundColor: theme.success }]}
            >
              <Text style={styles.actionText}>Back to Schedule</Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.footerRow}>
            <Pressable
              style={styles.timerToggle}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setIsRunning(!isRunning);
              }}
            >
              <Ionicons
                name={isRunning ? "pause" : "play"}
                size={24}
                color={theme.accent}
              />
            </Pressable>
            <Pressable onPress={handleComplete} style={{ flex: 1 }}>
              <View
                style={[styles.actionButton, { backgroundColor: theme.accent }]}
              >
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={theme.textInverse}
                />
                <Text style={styles.actionText}>Mark Complete</Text>
              </View>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Layout.screenPaddingHorizontal,
      paddingVertical: Spacing.md,
    },
    headerRight: {
      flexDirection: "row",
    },
    rescheduleBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: theme.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    rescheduleText: {
      fontSize: 13,
      color: theme.textSecondary,
      fontWeight: "500",
    },
    content: {
      flex: 1,
      paddingHorizontal: Layout.screenPaddingHorizontal,
    },
    projectBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
      marginBottom: Spacing.md,
    },
    projectName: {
      fontSize: 13,
      color: theme.accent,
      fontWeight: "600",
    },
    taskTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.textPrimary,
      letterSpacing: -0.2,
      marginBottom: Spacing.sm,
    },
    taskDescription: {
      fontSize: 15,
      color: theme.textSecondary,
      lineHeight: 22,
      marginBottom: Spacing["3xl"],
    },
    errorText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 100,
    },
    timerContainer: {
      alignItems: "center",
      marginBottom: Spacing["3xl"],
    },
    timerOuter: {
      width: 200,
      height: 200,
      borderRadius: 100,
    },
    timerRing: {
      flex: 1,
      borderRadius: 100,
      padding: 6,
    },
    timerInner: {
      flex: 1,
      borderRadius: 94,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
    },
    timerText: {
      fontSize: 42,
      fontWeight: "700",
      color: theme.textPrimary,
      fontVariant: ["tabular-nums"],
    },
    timerSubtext: {
      fontSize: 14,
      color: theme.textTertiary,
      marginTop: Spacing.xs,
    },
    completedText: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.success,
      marginTop: Spacing.sm,
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: Spacing.lg,
      marginBottom: Spacing["2xl"],
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
    },
    metaText: {
      fontSize: 14,
      color: theme.textTertiary,
      textTransform: "capitalize",
    },
    metaDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: theme.textTertiary,
    },
    resourcesSection: {
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.lg,
      padding: Layout.cardPadding,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    resourcesLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.textTertiary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: Spacing.sm,
    },
    resourceItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
      paddingVertical: Spacing.xs,
    },
    resourceUrl: {
      flex: 1,
      fontSize: 14,
      color: theme.info,
    },
    footer: {
      paddingHorizontal: Layout.screenPaddingHorizontal,
      paddingBottom: Spacing["3xl"],
      paddingTop: Spacing.lg,
    },
    footerRow: {
      flexDirection: "row",
      gap: Spacing.md,
      alignItems: "center",
    },
    timerToggle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.accentDim,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.accent,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.sm,
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.md,
    },
    actionText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.textInverse,
    },
  });
