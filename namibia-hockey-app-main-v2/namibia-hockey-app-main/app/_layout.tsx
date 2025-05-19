import {
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useCallback } from "react";
import "react-native-reanimated";
import "../global.css";
import { Platform, View } from "react-native";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// Add this to make TypeScript happy with our window augmentation
declare global {
  interface Window {
    tempoDevtoolsLoaded?: boolean;
    TempoDevtools?: {
      init: () => void;
    };
  }
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider>
      <NavigationThemeProvider value={DefaultTheme}>
        <RootLayoutNav />
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}

function StatusBarWithTheme() {
  const { isDarkMode } = useTheme();
  return <StatusBar style={isDarkMode ? "light" : "dark"} />;
}

function RootLayoutNav() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    // Only run on web and when Tempo is enabled
    if (process.env.EXPO_PUBLIC_TEMPO && Platform.OS === "web") {
      try {
        // Only attempt to load the module in a web environment
        if (typeof window !== "undefined" && !window.tempoDevtoolsLoaded) {
          window.tempoDevtoolsLoaded = true;

          // Use the installed tempo-devtools package directly
          // This avoids dynamic imports that might cause file system errors
          if (typeof window.TempoDevtools !== "undefined") {
            window.TempoDevtools.init();
          } else {
            console.warn("Tempo Devtools not available on window object");
          }
        }
      } catch (error) {
        console.warn("Tempo Devtools initialization skipped:", error);
      }
    }
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      await SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (loaded) {
      setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 1000);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Stack
        screenOptions={({ route }) => ({
          headerShown: false,
        })}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="team/index" />
        <Stack.Screen name="team/create" />
        <Stack.Screen name="team/[id]/index" />
        <Stack.Screen name="team/[id]/roster" />
        <Stack.Screen name="events/index" />
        <Stack.Screen name="profile/index" />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="profile/settings" />
        <Stack.Screen name="profile/privacy" />
        <Stack.Screen name="profile/help" />
        <Stack.Screen name="team/edit/[id]" />
      </Stack>
      <StatusBarWithTheme />
    </View>
  );
}
