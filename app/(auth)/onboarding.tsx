/**
 * Onboarding Screen — 3-slide value prop carousel
 *
 * Slide 1: "Spark Your Ideas" — lightbulb animation
 * Slide 2: "AI Does the Research" — magnifying glass animation
 * Slide 3: "Execute & Build Momentum" — rocket animation + "Get Started" CTA
 *
 * Uses RN Animated API (Expo Go compatible). No react-native-reanimated.
 * Swipeable via ScrollView + pagingEnabled.
 */

import { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
  Animated,
  Easing,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Colors, ColorTheme } from "@/constants/Colors";
import { Spacing, BorderRadius } from "@/constants/Spacing";
import { Typography, FontFamily } from "@/constants/Typography";
import { useOnboarding } from "@/hooks/useOnboarding";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SlideData {
  id: string;
  title: string;
  subtitle: string;
}

// ─── Animated Illustration Components ───────────────────────────────────────

function LightbulbAnimation() {
  const scale = useRef(new Animated.Value(0.9)).current;
  const glowOpacity = useRef(new Animated.Value(0.2)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulsing scale
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.92,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.5,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.15,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Gentle rotation wobble
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: -1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scale, glowOpacity, rotation]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-6deg", "0deg", "6deg"],
  });

  return (
    <View style={illustrationStyles.container}>
      <Animated.View
        style={[
          illustrationStyles.glow,
          { backgroundColor: "#FFD60A", opacity: glowOpacity },
        ]}
      />
      <Animated.View
        style={{ transform: [{ scale }, { rotate: rotateInterpolate }] }}
      >
        <Ionicons name="bulb" size={100} color="#FFD60A" />
      </Animated.View>
    </View>
  );
}

function ResearchAnimation({ theme }: { theme: ColorTheme }) {
  const translateX = useRef(new Animated.Value(-15)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  const sparkOpacity1 = useRef(new Animated.Value(0)).current;
  const sparkOpacity2 = useRef(new Animated.Value(0)).current;
  const sparkOpacity3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Searching X motion
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 15,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -15,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Searching Y motion
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -6,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 6,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Staggered sparkles
    const createSparkle = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.delay(1400 - delay),
        ]),
      );

    createSparkle(sparkOpacity1, 0).start();
    createSparkle(sparkOpacity2, 500).start();
    createSparkle(sparkOpacity3, 1000).start();
  }, [translateX, translateY, sparkOpacity1, sparkOpacity2, sparkOpacity3]);

  return (
    <View style={illustrationStyles.container}>
      <View
        style={[
          illustrationStyles.glow,
          { backgroundColor: theme.accent, opacity: 0.15 },
        ]}
      />
      <Animated.View style={{ transform: [{ translateX }, { translateY }] }}>
        <Ionicons name="search" size={100} color={theme.accent} />
      </Animated.View>
      <Animated.View
        style={[
          illustrationStyles.spark,
          { top: 20, right: 50, opacity: sparkOpacity1 },
        ]}
      >
        <Ionicons name="sparkles" size={22} color="#FFD60A" />
      </Animated.View>
      <Animated.View
        style={[
          illustrationStyles.spark,
          { top: 50, left: 40, opacity: sparkOpacity2 },
        ]}
      >
        <Ionicons name="sparkles" size={16} color={theme.accent} />
      </Animated.View>
      <Animated.View
        style={[
          illustrationStyles.spark,
          { bottom: 40, right: 40, opacity: sparkOpacity3 },
        ]}
      >
        <Ionicons name="sparkles" size={20} color={theme.success} />
      </Animated.View>
    </View>
  );
}

function RocketAnimation({ theme }: { theme: ColorTheme }) {
  const translateY = useRef(new Animated.Value(12)).current;
  const flameOpacity = useRef(new Animated.Value(0.6)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const starOpacity1 = useRef(new Animated.Value(0)).current;
  const starOpacity2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rocket hover
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -12,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 12,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Wobble
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: -1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Flame flicker
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(flameOpacity, {
          toValue: 0.4,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Star twinkles
    const twinkle = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.delay(1500 - delay),
        ]),
      );
    twinkle(starOpacity1, 200).start();
    twinkle(starOpacity2, 900).start();
  }, [translateY, flameOpacity, rotation, starOpacity1, starOpacity2]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-3deg", "0deg", "3deg"],
  });

  return (
    <View style={illustrationStyles.container}>
      <View
        style={[
          illustrationStyles.glow,
          { backgroundColor: theme.success, opacity: 0.12 },
        ]}
      />
      {/* Stars */}
      <Animated.View
        style={[
          illustrationStyles.spark,
          { top: 15, left: 55, opacity: starOpacity1 },
        ]}
      >
        <Ionicons name="star" size={18} color="#FFD60A" />
      </Animated.View>
      <Animated.View
        style={[
          illustrationStyles.spark,
          { top: 45, right: 45, opacity: starOpacity2 },
        ]}
      >
        <Ionicons name="star" size={14} color={theme.accent} />
      </Animated.View>
      <Animated.View
        style={{
          transform: [{ translateY }, { rotate: rotateInterpolate }],
        }}
      >
        <Ionicons name="rocket" size={100} color={theme.success} />
        <Animated.View
          style={{ alignSelf: "center", marginTop: -10, opacity: flameOpacity }}
        >
          <Ionicons name="flame" size={32} color="#FF9500" />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const illustrationStyles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  glow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  spark: {
    position: "absolute",
  },
});

// ─── Main Onboarding Screen ────────────────────────────────────────────────

export default function OnboardingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = createStyles(theme);
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();

  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Entrance fade
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideUpAnim]);

  const slides: SlideData[] = [
    {
      id: "1",
      title: "Spark Your Ideas",
      subtitle:
        "Brain-dump any idea — we'll capture it instantly. No structure needed, just raw creativity.",
    },
    {
      id: "2",
      title: "AI Does the Research",
      subtitle:
        "Our AI agents research feasibility, find tools, and build a complete action plan — automatically.",
    },
    {
      id: "3",
      title: "Execute & Build Momentum",
      subtitle:
        "Atomic tasks land on your calendar. Build streaks, track momentum, and ship ideas into reality.",
    },
  ];

  const isLastSlide = activeIndex === slides.length - 1;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < slides.length) {
      setActiveIndex(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const goToNext = () => {
    if (isLastSlide) {
      handleGetStarted();
    } else {
      const nextIndex = activeIndex + 1;
      scrollRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setActiveIndex(nextIndex);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleGetStarted();
  };

  const handleGetStarted = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeOnboarding();
    router.replace("/(auth)/login");
  };

  const renderIllustration = (index: number) => {
    switch (index) {
      case 0:
        return <LightbulbAnimation />;
      case 1:
        return <ResearchAnimation theme={theme} />;
      case 2:
        return <RocketAnimation theme={theme} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Skip button */}
      {!isLastSlide && (
        <View style={styles.skipContainer}>
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.illustrationArea}>
              {renderIllustration(index)}
            </View>
            <View style={styles.textContent}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Controls */}
      <Animated.View
        style={[
          styles.bottomControls,
          { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
        ]}
      >
        {/* Dot Indicators */}
        <View style={styles.dotsRow}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
          onPress={goToNext}
        >
          <Text style={styles.ctaText}>
            {isLastSlide ? "Get Started" : "Next"}
          </Text>
          {!isLastSlide && (
            <Ionicons
              name="arrow-forward"
              size={18}
              color={theme.textInverse}
              style={{ marginLeft: 6 }}
            />
          )}
        </Pressable>
      </Animated.View>
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
    skipContainer: {
      position: "absolute",
      top: 60,
      right: Spacing.xl,
      zIndex: 10,
    },
    skipButton: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
    },
    skipText: {
      ...Typography.labelLarge,
      color: theme.textSecondary,
    },
    scrollView: {
      flex: 1,
    },
    slide: {
      width: SCREEN_WIDTH,
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: Spacing["3xl"],
    },
    illustrationArea: {
      width: 240,
      height: 240,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: Spacing["4xl"],
    },
    textContent: {
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
    },
    title: {
      ...Typography.displayMedium,
      color: theme.textPrimary,
      textAlign: "center",
      marginBottom: Spacing.md,
    },
    subtitle: {
      ...Typography.bodyMedium,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      maxWidth: 300,
    },
    bottomControls: {
      paddingHorizontal: Spacing["3xl"],
      paddingBottom: Spacing["3xl"],
      gap: Spacing["2xl"],
    },
    dotsRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: Spacing.sm,
    },
    dot: {
      height: 8,
      borderRadius: 4,
    },
    dotActive: {
      width: 24,
      backgroundColor: theme.accent,
    },
    dotInactive: {
      width: 8,
      backgroundColor: theme.textTertiary,
    },
    ctaButton: {
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
    ctaButtonPressed: {
      transform: [{ scale: 0.97 }],
      opacity: 0.9,
    },
    ctaText: {
      ...Typography.labelLarge,
      color: theme.textInverse,
      fontFamily: FontFamily.semibold,
      fontSize: 17,
    },
  });
