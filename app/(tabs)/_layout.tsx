import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View, useColorScheme } from "react-native";
import { BlurView } from "expo-blur";
import { Colors } from "@/constants/Colors";
import { Layout } from "@/constants/Spacing";

type TabIconName = "home" | "calendar" | "flame" | "settings";

const TAB_ICONS: Record<string, { default: string; focused: string }> = {
  index: { default: "home-outline", focused: "home" },
  schedule: { default: "calendar-outline", focused: "calendar" },
  streak: { default: "flame-outline", focused: "flame" },
  settings: { default: "settings-outline", focused: "settings" },
};

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = createStyles(theme);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <BlurView
              intensity={80}
              tint={colorScheme === "dark" ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="streak"
        options={{
          title: "Streak",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "flame" : "flame-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    tabBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: Layout.tabBarHeight,
      backgroundColor: "transparent",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
      elevation: 0,
      paddingBottom: 20,
    },
    tabBarBackground: {
      ...StyleSheet.absoluteFillObject,
      overflow: "hidden",
    },
    tabBarLabel: {
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
  });
