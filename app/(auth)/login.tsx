/**
 * Login Screen — Magic-link email + Apple Sign-In
 *
 * Premium minimal auth form following the SPARK design system.
 * Uses RN Animated API (Expo Go compatible). No react-native-reanimated.
 *
 * NOTE: Actual auth integration (Better Auth + Argon2) is Phase 4.
 * For now, all auth actions navigate to (tabs) using the test user.
 */

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  useColorScheme,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Colors, ColorTheme } from "@/constants/Colors";
import { Spacing, BorderRadius } from "@/constants/Spacing";
import { Typography, FontFamily } from "@/constants/Typography";

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = createStyles(theme);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // ─── Animations (RN Animated — Expo Go safe) ──────────────────────────

  const logoScale = useRef(new Animated.Value(1)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(40)).current;
  const formFade = useRef(new Animated.Value(0)).current;
  const footerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.06,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Staggered entrance
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(logoFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(formFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(formSlide, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(footerFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoScale, logoFade, formFade, formSlide, footerFade]);

  // ─── Handlers ─────────────────────────────────────────────────────────

  const isEmailValid =
    email.length > 0 && email.includes("@") && email.includes(".");

  const handleMagicLink = () => {
    if (!isEmailValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    // Simulate magic link send — Phase 4 will wire Better Auth
    setTimeout(() => {
      setIsLoading(false);
      setMagicLinkSent(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  const handleAppleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Phase 4: Wire Apple Sign-In via Better Auth
    // For now, navigate to tabs with test user
    Alert.alert(
      "Apple Sign-In",
      "Apple Sign-In will be available once backend is connected. Continuing with test user.",
      [
        {
          text: "Continue",
          onPress: () => router.replace("/(tabs)"),
        },
      ],
    );
  };

  const handleContinueAsTestUser = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(tabs)");
  };

  // ─── Magic Link Sent State ────────────────────────────────────────────

  if (magicLinkSent) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.sentContainer}>
          <View style={styles.sentIconContainer}>
            <Ionicons name="mail-open" size={64} color={theme.success} />
          </View>
          <Text style={styles.sentTitle}>Check your inbox</Text>
          <Text style={styles.sentSubtitle}>
            We sent a magic link to{"\n"}
            <Text style={styles.sentEmail}>{email}</Text>
          </Text>
          <Pressable
            style={styles.resendButton}
            onPress={() => {
              setMagicLinkSent(false);
              setEmail("");
            }}
          >
            <Text style={styles.resendText}>Use a different email</Text>
          </Pressable>

          {/* Test user shortcut */}
          <Pressable
            style={styles.testUserButton}
            onPress={handleContinueAsTestUser}
          >
            <Text style={styles.testUserText}>Continue as Test User →</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main Login Form ──────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Logo + Brand */}
        <Animated.View style={[styles.logoSection, { opacity: logoFade }]}>
          <Animated.View
            style={[
              styles.logoContainer,
              { transform: [{ scale: logoScale }] },
            ]}
          >
            <Ionicons name="flash" size={48} color={theme.accent} />
          </Animated.View>
          <Text style={styles.brandName}>SPARK</Text>
          <Text style={styles.brandTagline}>Turn ideas into reality</Text>
        </Animated.View>

        {/* Auth Form */}
        <Animated.View
          style={[
            styles.formSection,
            { opacity: formFade, transform: [{ translateY: formSlide }] },
          ]}
        >
          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={theme.textTertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={theme.placeholderText}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              returnKeyType="go"
              onSubmitEditing={handleMagicLink}
            />
          </View>

          {/* Send Magic Link Button */}
          <Pressable
            style={({ pressed }) => [
              styles.magicLinkButton,
              !isEmailValid && styles.buttonDisabled,
              pressed && isEmailValid && styles.buttonPressed,
            ]}
            onPress={handleMagicLink}
            disabled={!isEmailValid || isLoading}
          >
            {isLoading ? (
              <Text style={styles.magicLinkText}>Sending…</Text>
            ) : (
              <>
                <Ionicons
                  name="sparkles"
                  size={18}
                  color={theme.textInverse}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.magicLinkText}>Send Magic Link</Text>
              </>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Apple Sign-In Button */}
          <Pressable
            style={({ pressed }) => [
              styles.appleButton,
              pressed && styles.appleButtonPressed,
            ]}
            onPress={handleAppleSignIn}
          >
            <Ionicons
              name="logo-apple"
              size={20}
              color="#FFFFFF"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.appleText}>Sign in with Apple</Text>
          </Pressable>
        </Animated.View>

        {/* Test User Shortcut (dev only) */}
        <Animated.View style={[styles.testSection, { opacity: footerFade }]}>
          <Pressable
            onPress={handleContinueAsTestUser}
            style={styles.testUserButton}
          >
            <Text style={styles.testUserText}>
              Skip → Continue as Test User
            </Text>
          </Pressable>
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: footerFade }]}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{" "}
            <Text style={styles.footerLink}>Terms of Service</Text> and{" "}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const createStyles = (theme: ColorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardView: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: Spacing["3xl"],
    },

    // Logo
    logoSection: {
      alignItems: "center",
      marginBottom: Spacing["5xl"],
    },
    logoContainer: {
      width: 88,
      height: 88,
      borderRadius: 22,
      backgroundColor: theme.accentDim,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: Spacing.lg,
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    brandName: {
      ...Typography.displayLarge,
      color: theme.textPrimary,
      letterSpacing: 4,
      fontFamily: FontFamily.bold,
    },
    brandTagline: {
      ...Typography.bodyMedium,
      color: theme.textSecondary,
      marginTop: Spacing.xs,
    },

    // Form
    formSection: {
      gap: Spacing.lg,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
      paddingHorizontal: Spacing.lg,
    },
    inputIcon: {
      marginRight: Spacing.md,
    },
    input: {
      flex: 1,
      paddingVertical: Spacing.lg,
      ...Typography.bodyLarge,
      color: theme.textPrimary,
    },
    magicLinkButton: {
      backgroundColor: theme.accent,
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.lg,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    buttonDisabled: {
      opacity: 0.4,
      shadowOpacity: 0,
    },
    buttonPressed: {
      transform: [{ scale: 0.97 }],
      opacity: 0.9,
    },
    magicLinkText: {
      ...Typography.labelLarge,
      color: theme.textInverse,
      fontFamily: FontFamily.semibold,
      fontSize: 16,
    },

    // Divider
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: Spacing.xs,
    },
    dividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.border,
    },
    dividerText: {
      ...Typography.caption,
      color: theme.textTertiary,
      marginHorizontal: Spacing.lg,
    },

    // Apple Button
    appleButton: {
      backgroundColor: "#000000",
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.lg,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    appleButtonPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.97 }],
    },
    appleText: {
      ...Typography.labelLarge,
      color: "#FFFFFF",
      fontFamily: FontFamily.semibold,
      fontSize: 16,
    },

    // Test User
    testSection: {
      marginTop: Spacing["2xl"],
      alignItems: "center",
    },
    testUserButton: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },
    testUserText: {
      ...Typography.labelMedium,
      color: theme.accent,
    },

    // Footer
    footer: {
      marginTop: Spacing["3xl"],
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
    },
    footerText: {
      ...Typography.caption,
      color: theme.textTertiary,
      textAlign: "center",
      lineHeight: 18,
    },
    footerLink: {
      color: theme.accent,
    },

    // Magic Link Sent State
    sentContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: Spacing["3xl"],
    },
    sentIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.successDim,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: Spacing["3xl"],
    },
    sentTitle: {
      ...Typography.displayMedium,
      color: theme.textPrimary,
      textAlign: "center",
      marginBottom: Spacing.md,
    },
    sentSubtitle: {
      ...Typography.bodyMedium,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
    sentEmail: {
      color: theme.accent,
      fontFamily: FontFamily.semibold,
    },
    resendButton: {
      marginTop: Spacing["2xl"],
      paddingVertical: Spacing.md,
    },
    resendText: {
      ...Typography.labelMedium,
      color: theme.textSecondary,
    },
  });
