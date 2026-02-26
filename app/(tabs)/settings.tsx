import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Colors, ColorTheme } from "@/constants/Colors";
import { Spacing, BorderRadius, Layout } from "@/constants/Spacing";
import { MOCK_USER } from "@/fixtures/user";

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  theme,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  theme: ColorTheme;
}) {
  const styles = createStyles(theme);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsRow,
        pressed && styles.settingsRowPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.settingsRowLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color={theme.textSecondary} />
        </View>
        <Text style={styles.settingsLabel}>{label}</Text>
      </View>
      <View style={styles.settingsRowRight}>
        {value && <Text style={styles.settingsValue}>{value}</Text>}
        {showChevron && (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.textTertiary}
          />
        )}
      </View>
    </Pressable>
  );
}

function SettingsToggle({
  icon,
  label,
  value,
  onToggle,
  theme,
}: {
  icon: string;
  label: string;
  value: boolean;
  onToggle: (val: boolean) => void;
  theme: ColorTheme;
}) {
  const styles = createStyles(theme);
  return (
    <View style={styles.settingsRow}>
      <View style={styles.settingsRowLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color={theme.textSecondary} />
        </View>
        <Text style={styles.settingsLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.surfaceLight, true: theme.accentDim }}
        thumbColor={value ? theme.accent : theme.textTertiary}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = createStyles(theme);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {MOCK_USER.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{MOCK_USER.name}</Text>
            <Text style={styles.profileEmail}>{MOCK_USER.email}</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.textTertiary}
          />
        </View>

        {/* Calendar Integrations */}
        <Text style={styles.sectionTitle}>Calendar Integrations</Text>
        <View style={styles.section}>
          <SettingsRow
            icon="logo-google"
            label="Google Calendar"
            value="Connected"
            theme={theme}
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="logo-apple"
            label="Apple Calendar"
            value="Not connected"
            theme={theme}
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="logo-microsoft"
            label="Outlook"
            value="Not connected"
            theme={theme}
          />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.section}>
          <SettingsToggle
            icon="notifications"
            label="Push Notifications"
            value={notificationsEnabled}
            onToggle={setNotificationsEnabled}
            theme={theme}
          />
          <View style={styles.separator} />
          <SettingsToggle
            icon="phone-portrait"
            label="Haptic Feedback"
            value={hapticEnabled}
            onToggle={setHapticEnabled}
            theme={theme}
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="time"
            label="Working Hours"
            value="9 AM – 6 PM"
            theme={theme}
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="calendar"
            label="Working Days"
            value="Mon – Fri"
            theme={theme}
          />
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.section}>
          <SettingsRow
            icon="information-circle"
            label="Version"
            value="1.0.0"
            showChevron={false}
            theme={theme}
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="document-text"
            label="Privacy Policy"
            theme={theme}
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="shield-checkmark"
            label="Terms of Service"
            theme={theme}
          />
        </View>

        {/* Sign Out */}
        <Pressable style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={20} color={theme.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ColorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      paddingHorizontal: Layout.screenPaddingHorizontal,
      paddingBottom: Layout.tabBarHeight + Spacing["4xl"],
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.textPrimary,
      letterSpacing: -0.3,
      paddingTop: Spacing.lg,
      marginBottom: Spacing["3xl"],
    },
    profileCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.lg,
      padding: Layout.cardPadding,
      marginBottom: Spacing["3xl"],
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.accentDim,
      justifyContent: "center",
      alignItems: "center",
      marginRight: Spacing.md,
    },
    avatarText: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.accent,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 17,
      fontWeight: "600",
      color: theme.textPrimary,
    },
    profileEmail: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 2,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.textTertiary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: Spacing.sm,
    },
    section: {
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing["2xl"],
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
      overflow: "hidden",
    },
    settingsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Layout.cardPadding,
      paddingVertical: Spacing.md,
      minHeight: 48,
    },
    settingsRowPressed: {
      backgroundColor: theme.surfaceLight,
    },
    settingsRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
    },
    iconContainer: {
      width: 28,
      alignItems: "center",
    },
    settingsLabel: {
      fontSize: 16,
      color: theme.textPrimary,
    },
    settingsRowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
    },
    settingsValue: {
      fontSize: 14,
      color: theme.textTertiary,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.border,
      marginLeft: 56,
    },
    signOutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.sm,
      paddingVertical: Spacing.lg,
      marginTop: Spacing.lg,
    },
    signOutText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.danger,
    },
  });
