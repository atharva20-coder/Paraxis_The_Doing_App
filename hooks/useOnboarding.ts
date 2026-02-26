/**
 * useOnboarding Hook
 *
 * Manages the "has seen onboarding" flag.
 *
 * Uses a simple in-memory flag for Expo Go compatibility.
 * When moving to a dev build (expo prebuild), swap to MMKV
 * for persistent cross-session storage.
 *
 * NOTE: In Expo Go, onboarding will show each time the app
 * is force-closed. This is expected and acceptable for dev.
 */

import { useCallback, useState } from "react";

/**
 * Module-level flag survives re-renders and navigation
 * but resets on app restart (acceptable for dev builds).
 */
let _hasSeenOnboarding = false;

export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] =
    useState(_hasSeenOnboarding);

  const completeOnboarding = useCallback(() => {
    _hasSeenOnboarding = true;
    setHasSeenOnboarding(true);
  }, []);

  const resetOnboarding = useCallback(() => {
    _hasSeenOnboarding = false;
    setHasSeenOnboarding(false);
  }, []);

  return { hasSeenOnboarding, completeOnboarding, resetOnboarding } as const;
}
