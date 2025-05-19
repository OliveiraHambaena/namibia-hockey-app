import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Globe, Bell, Moon, Smartphone } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { ThemedView, ThemedText } from "../components/ThemedView";

export default function SettingsScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [language, setLanguage] = useState("English");

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    toggleTheme();
  };

  return (
    <ThemedView
      lightBgColor="bg-gray-50"
      darkBgColor="bg-gray-900"
      className="flex-1"
    >
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-4 px-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Settings</Text>
        </View>
      </View>

      {/* Settings Content */}
      <ScrollView className="flex-1 p-4">
        <TouchableOpacity
          className="bg-blue-600 py-3 rounded-lg items-center mb-4"
          onPress={() => router.push("/profile/edit")}
        >
          <Text className="text-white font-semibold text-base">
            Edit Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-100 py-3 rounded-lg items-center"
          onPress={() => router.push("/profile/settings")}
        >
          <Text className="text-blue-600 font-semibold text-base">
            Settings
          </Text>
        </TouchableOpacity>

        <ThemedView
          lightBgColor="bg-white"
          darkBgColor="bg-gray-800"
          className="rounded-lg shadow-sm mb-4 overflow-hidden"
        >
          <ThemedText
            className="p-4 text-lg font-bold border-b border-gray-100"
            lightTextColor="text-gray-800"
            darkTextColor="text-white"
          >
            Appearance
          </ThemedText>

          <ThemedView
            lightBgColor="bg-white"
            darkBgColor="bg-gray-800"
            className="p-4 flex-row items-center border-b border-gray-100"
          >
            <Moon size={20} color={isDarkMode ? "#e5e7eb" : "#4B5563"} />
            <ThemedText
              className="ml-3 flex-1"
              lightTextColor="text-gray-800"
              darkTextColor="text-white"
            >
              Dark Mode
            </ThemedText>
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
              thumbColor={isDarkMode ? "#2563EB" : "#9CA3AF"}
            />
          </ThemedView>

          <TouchableOpacity className="p-4 flex-row items-center border-b border-gray-100">
            <Globe size={20} color={isDarkMode ? "#e5e7eb" : "#4B5563"} />
            <View className="flex-1 ml-3">
              <ThemedText
                lightTextColor="text-gray-800"
                darkTextColor="text-white"
              >
                Language
              </ThemedText>
              <ThemedText
                className="text-sm"
                lightTextColor="text-gray-500"
                darkTextColor="text-gray-400"
              >
                {language}
              </ThemedText>
            </View>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView
          lightBgColor="bg-white"
          darkBgColor="bg-gray-800"
          className="rounded-lg shadow-sm mb-4 overflow-hidden"
        >
          <ThemedText
            className="p-4 text-lg font-bold border-b border-gray-100"
            lightTextColor="text-gray-800"
            darkTextColor="text-white"
          >
            Notifications
          </ThemedText>

          <ThemedView
            lightBgColor="bg-white"
            darkBgColor="bg-gray-800"
            className="p-4 flex-row items-center border-b border-gray-100"
          >
            <Bell size={20} color={isDarkMode ? "#e5e7eb" : "#4B5563"} />
            <ThemedText
              className="ml-3 flex-1"
              lightTextColor="text-gray-800"
              darkTextColor="text-white"
            >
              Push Notifications
            </ThemedText>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
              thumbColor={notifications ? "#2563EB" : "#9CA3AF"}
            />
          </ThemedView>

          <ThemedView
            lightBgColor="bg-white"
            darkBgColor="bg-gray-800"
            className="p-4 flex-row items-center"
          >
            <Smartphone size={20} color={isDarkMode ? "#e5e7eb" : "#4B5563"} />
            <ThemedText
              className="ml-3 flex-1"
              lightTextColor="text-gray-800"
              darkTextColor="text-white"
            >
              Email Alerts
            </ThemedText>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
              thumbColor={emailAlerts ? "#2563EB" : "#9CA3AF"}
            />
          </ThemedView>
        </ThemedView>

        <ThemedView
          lightBgColor="bg-white"
          darkBgColor="bg-gray-800"
          className="rounded-lg shadow-sm mb-4 overflow-hidden"
        >
          <ThemedText
            className="p-4 text-lg font-bold border-b border-gray-100"
            lightTextColor="text-gray-800"
            darkTextColor="text-white"
          >
            About
          </ThemedText>

          <TouchableOpacity className="p-4 border-b border-gray-100">
            <ThemedText
              lightTextColor="text-gray-800"
              darkTextColor="text-white"
            >
              Terms of Service
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity className="p-4 border-b border-gray-100">
            <ThemedText
              lightTextColor="text-gray-800"
              darkTextColor="text-white"
            >
              Privacy Policy
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity className="p-4">
            <ThemedText
              lightTextColor="text-gray-800"
              darkTextColor="text-white"
            >
              App Version 1.0.0
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <TouchableOpacity
          className={
            isDarkMode
              ? "bg-red-900 rounded-lg p-4 mb-6"
              : "bg-red-50 rounded-lg p-4 mb-6"
          }
        >
          <Text className="text-red-500 text-center font-medium">
            Clear App Data
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}
