import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as ExpoSplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, useColorScheme, View } from "react-native";
import { Colors } from "@/constants/Colors";
import CustomSplashScreen from "@/app/components/SplashScreen";
import { useOnboarding } from "@/hooks/useOnboarding";

ExpoSplashScreen.preventAutoHideAsync();

/**
 * Root Layout
 *
 * Handles conditional routing based on onboarding state:
 * - First launch → (auth)/onboarding → (auth)/login
 * - Returning user → (tabs) home screen
 *
 * Phase 4 will add real auth session checking.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = createStyles(theme);
  const { hasSeenOnboarding } = useOnboarding();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      ExpoSplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Redirect based on onboarding state once splash animation completes
  useEffect(() => {
    if (!isAnimationComplete || !fontsLoaded) return;

    // Small delay to ensure navigation is mounted
    const timer = setTimeout(() => {
      if (!hasSeenOnboarding) {
        router.replace("/(auth)/onboarding");
      }
      // If hasSeenOnboarding, the default route is (tabs) which loads automatically
    }, 100);

    return () => clearTimeout(timer);
  }, [isAnimationComplete, fontsLoaded, hasSeenOnboarding, router]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.background },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
          <Stack.Screen
            name="idea/new"
            options={{ presentation: "modal", animation: "slide_from_bottom" }}
          />
          <Stack.Screen name="idea/[id]" />
          <Stack.Screen name="task/[id]" />
        </Stack>
      </GestureHandlerRootView>

      {/* Render the Custom Splash Screen absolute on top until animation ends */}
      {!isAnimationComplete && (
        <CustomSplashScreen
          onAnimationComplete={() => setIsAnimationComplete(true)}
        />
      )}
    </View>
  );
}

const createStyles = (theme: typeof Colors.light | typeof Colors.dark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
  });
