import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Globe, Bell, Moon, Smartphone } from "lucide-react-native";

export default function SettingsScreen() {
  const router = useRouter();

  // Settings state
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [language, setLanguage] = useState("English");

  return (
    <View className="flex-1 bg-gray-50">
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
          <Text className="text-white font-semibold text-base">Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-100 py-3 rounded-lg items-center"
          onPress={() => router.push("/profile/settings")}
        >
          <Text className="text-blue-600 font-semibold text-base">Settings</Text>
        </TouchableOpacity>

        <View className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
          <Text className="p-4 text-lg font-bold text-gray-800 border-b border-gray-100">
            Appearance
          </Text>

          <View className="p-4 flex-row items-center border-b border-gray-100">
            <Moon size={20} color="#4B5563" />
            <Text className="text-gray-800 ml-3 flex-1">Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
              thumbColor={darkMode ? "#2563EB" : "#9CA3AF"}
            />
          </View>

          <TouchableOpacity className="p-4 flex-row items-center border-b border-gray-100">
            <Globe size={20} color="#4B5563" />
            <View className="flex-1 ml-3">
              <Text className="text-gray-800">Language</Text>
              <Text className="text-gray-500 text-sm">{language}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
          <Text className="p-4 text-lg font-bold text-gray-800 border-b border-gray-100">
            Notifications
          </Text>

          <View className="p-4 flex-row items-center border-b border-gray-100">
            <Bell size={20} color="#4B5563" />
            <Text className="text-gray-800 ml-3 flex-1">
              Push Notifications
            </Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
              thumbColor={notifications ? "#2563EB" : "#9CA3AF"}
            />
          </View>

          <View className="p-4 flex-row items-center">
            <Smartphone size={20} color="#4B5563" />
            <Text className="text-gray-800 ml-3 flex-1">Email Alerts</Text>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
              thumbColor={emailAlerts ? "#2563EB" : "#9CA3AF"}
            />
          </View>
        </View>

        <View className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
          <Text className="p-4 text-lg font-bold text-gray-800 border-b border-gray-100">
            About
          </Text>

          <TouchableOpacity className="p-4 border-b border-gray-100">
            <Text className="text-gray-800">Terms of Service</Text>
          </TouchableOpacity>

          <TouchableOpacity className="p-4 border-b border-gray-100">
            <Text className="text-gray-800">Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity className="p-4">
            <Text className="text-gray-800">App Version 1.0.0</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="bg-red-50 rounded-lg p-4 mb-6">
          <Text className="text-red-500 text-center font-medium">
            Clear App Data
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
