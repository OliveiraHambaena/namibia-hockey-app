import React from "react";
import { View, Text, ViewProps, TextProps } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface ThemedViewProps extends ViewProps {
  lightBgColor?: string;
  darkBgColor?: string;
  children: React.ReactNode;
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  lightBgColor = "bg-white",
  darkBgColor = "bg-gray-900",
  className = "",
  children,
  ...props
}) => {
  const { isDarkMode } = useTheme();

  const bgColorClass = isDarkMode ? darkBgColor : lightBgColor;
  const combinedClassName = `${bgColorClass} ${className}`;

  return (
    <View className={combinedClassName} {...props}>
      {children}
    </View>
  );
};

interface ThemedTextProps extends TextProps {
  lightTextColor?: string;
  darkTextColor?: string;
  children: React.ReactNode;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  lightTextColor = "text-gray-800",
  darkTextColor = "text-gray-100",
  className = "",
  children,
  ...props
}) => {
  const { isDarkMode } = useTheme();

  const textColorClass = isDarkMode ? darkTextColor : lightTextColor;
  const combinedClassName = `${textColorClass} ${className}`;

  return (
    <Text className={combinedClassName} {...props}>
      {children}
    </Text>
  );
};
