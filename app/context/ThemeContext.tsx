import React, { createContext, useState, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeType = "light" | "dark";

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  isDarkMode: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const deviceTheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>("light");

  // Load saved theme from AsyncStorage on initial render
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        } else if (deviceTheme) {
          // Use device theme as default if available
          setThemeState(deviceTheme as ThemeType);
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
      }
    };

    loadTheme();
  }, [deviceTheme]);

  const setTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem("theme", newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode: theme === "dark",
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
