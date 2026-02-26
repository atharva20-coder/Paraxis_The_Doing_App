import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated, Dimensions, View } from "react-native";

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

const { width, height } = Dimensions.get("window");

export default function SplashScreen({
  onAnimationComplete,
}: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Sequence: Pulse (scale up) slightly, then fade out
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAnimationComplete();
    });
  }, [fadeAnim, scaleAnim, onAnimationComplete]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.Image
        source={require("../../assets/paraxis-splash.png")}
        style={[
          styles.image,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, // Fill whole screen over layout
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999, // Ensure it's on top of Navigation Stack
  },
  image: {
    width: width * 0.6,
    height: width * 0.6,
  },
});
