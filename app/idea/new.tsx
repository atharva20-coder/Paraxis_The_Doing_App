/**
 * New Spark Screen — Capture ideas via text or voice
 *
 * Design (Jony Ive):
 * - Colorful category chips with per-category accent color
 * - Mic button for voice input (Phase 4: real speech-to-text)
 * - Clean, spacious form with focus on content
 * - Animated submit button with sparkle
 */

import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import * as Haptics from "expo-haptics";
import { Colors, ColorTheme } from "@/constants/Colors";
import { Spacing, BorderRadius, Layout } from "@/constants/Spacing";
import { FontFamily } from "@/constants/Typography";
import { IdeaCategory } from "@/types/idea";

// ─── Category config with colors and icons ─────────────────────────────────

interface CategoryConfig {
  name: IdeaCategory;
  icon: string;
  color: (theme: ColorTheme) => string;
}

const CATEGORIES: CategoryConfig[] = [
  { name: "Mobile App", icon: "phone-portrait", color: (t) => t.indigo },
  { name: "Web App", icon: "globe", color: (t) => t.cyan },
  { name: "SaaS", icon: "cloud", color: (t) => t.teal },
  { name: "API / Backend", icon: "server", color: (t) => t.orange },
  { name: "AI / ML", icon: "sparkles", color: (t) => t.purple },
  { name: "Other", icon: "shapes", color: (t) => t.mint },
];

export default function NewIdeaScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = createStyles(theme);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IdeaCategory | null>(
    null,
  );
  const [isRecording, setIsRecording] = useState(false);

  // Mic pulse animation
  const micPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micPulse, {
            toValue: 1.3,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(micPulse, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      micPulse.setValue(1);
    }
  }, [isRecording, micPulse]);

  const isValid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    selectedCategory !== null;

  const selectedConfig = CATEGORIES.find((c) => c.name === selectedCategory);
  const activeColor = selectedConfig
    ? selectedConfig.color(theme)
    : theme.accent;

  const handleMicPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // Phase 4: Process speech-to-text result and append to description
      setDescription(
        (prev) =>
          prev +
          (prev.length > 0 ? " " : "") +
          "An app that uses AI to help people build side projects faster...",
      );
    } else {
      setIsRecording(true);
      // Phase 4: Start real speech recognition
      Alert.alert(
        "Voice Input",
        "🎙️ Listening... Tap the mic again to stop.\n\n(Speech-to-text will be connected in Phase 4)",
      );
    }
  };

  const handleSubmit = () => {
    if (!isValid) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Phase 4: POST to FastAPI backend
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close" size={28} color={theme.textSecondary} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Ionicons name="flash" size={16} color={activeColor} />
            <Text style={[styles.headerTitle, { color: activeColor }]}>
              New Spark
            </Text>
          </View>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Input */}
          <Text style={styles.label}>What's your idea?</Text>
          <View style={styles.titleInputWrapper}>
            <Ionicons
              name="bulb-outline"
              size={20}
              color={theme.yellow}
              style={{ marginRight: Spacing.sm }}
            />
            <TextInput
              style={styles.titleInput}
              placeholder="e.g. AI-Powered Recipe Generator"
              placeholderTextColor={theme.placeholderText}
              value={title}
              onChangeText={setTitle}
              autoFocus
              returnKeyType="next"
              maxLength={100}
            />
          </View>

          {/* Description with mic */}
          <View style={styles.descriptionHeader}>
            <Text style={styles.label}>Describe it (brain dump)</Text>
            <Animated.View style={{ transform: [{ scale: micPulse }] }}>
              <Pressable
                style={[
                  styles.micButton,
                  isRecording && {
                    backgroundColor: `${theme.red}20`,
                    borderColor: theme.red,
                  },
                ]}
                onPress={handleMicPress}
              >
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={18}
                  color={isRecording ? theme.red : theme.purple}
                />
              </Pressable>
            </Animated.View>
          </View>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Pour out everything — the messier the better. Our AI will structure it for you..."
            placeholderTextColor={theme.placeholderText}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />
          <View style={styles.descriptionFooter}>
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={[styles.recordingText, { color: theme.red }]}>
                  Listening...
                </Text>
              </View>
            )}
            <Text style={styles.charCount}>{description.length}/2000</Text>
          </View>

          {/* Category Selection */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              const catColor = cat.color(theme);
              return (
                <Pressable
                  key={cat.name}
                  style={[
                    styles.categoryChip,
                    isSelected && {
                      backgroundColor: `${catColor}15`,
                      borderColor: catColor,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCategory(cat.name);
                  }}
                >
                  <View
                    style={[
                      styles.categoryChipIcon,
                      {
                        backgroundColor: isSelected
                          ? `${catColor}25`
                          : theme.surfaceLight,
                      },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={14}
                      color={isSelected ? catColor : theme.textTertiary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && {
                        color: catColor,
                        fontWeight: "700" as const,
                      },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Submit */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleSubmit}
            disabled={!isValid}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            <View
              style={[
                styles.submitButton,
                {
                  backgroundColor: isValid ? activeColor : theme.surfaceLight,
                },
              ]}
            >
              <Ionicons
                name="sparkles"
                size={20}
                color={isValid ? theme.textInverse : theme.textTertiary}
              />
              <Text
                style={[
                  styles.submitText,
                  !isValid && styles.submitTextDisabled,
                ]}
              >
                SPARK it ⚡
              </Text>
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Layout.screenPaddingHorizontal,
      paddingVertical: Spacing.md,
    },
    headerCenter: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: "700",
      fontFamily: FontFamily.bold,
    },
    scrollContent: {
      paddingHorizontal: Layout.screenPaddingHorizontal,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing["3xl"],
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.textSecondary,
      marginBottom: Spacing.sm,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    titleInputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing["2xl"],
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    titleInput: {
      flex: 1,
      fontSize: 18,
      fontWeight: "600",
      color: theme.textPrimary,
      padding: Spacing.md,
      fontFamily: FontFamily.semibold,
    },
    descriptionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.sm,
    },
    micButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: `${theme.purple}15`,
      borderWidth: 1,
      borderColor: `${theme.purple}30`,
      justifyContent: "center",
      alignItems: "center",
    },
    descriptionInput: {
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.lg,
      padding: Layout.cardPadding,
      fontSize: 16,
      color: theme.textPrimary,
      minHeight: 140,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
      lineHeight: 24,
    },
    descriptionFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: Spacing.sm,
      marginBottom: Spacing["2xl"],
    },
    recordingIndicator: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
    },
    recordingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.red,
    },
    recordingText: {
      fontSize: 12,
      fontWeight: "600",
    },
    charCount: {
      fontSize: 12,
      color: theme.textTertiary,
      marginLeft: "auto",
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
      marginBottom: Spacing["3xl"],
    },
    categoryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    categoryChipIcon: {
      width: 26,
      height: 26,
      borderRadius: 13,
      justifyContent: "center",
      alignItems: "center",
    },
    categoryChipText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: "500",
    },
    footer: {
      paddingHorizontal: Layout.screenPaddingHorizontal,
      paddingBottom: Spacing["3xl"],
      paddingTop: Spacing.lg,
    },
    submitButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.sm,
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.lg,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    submitText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.textInverse,
      letterSpacing: 1,
      fontFamily: FontFamily.bold,
    },
    submitTextDisabled: {
      color: theme.textTertiary,
    },
  });
