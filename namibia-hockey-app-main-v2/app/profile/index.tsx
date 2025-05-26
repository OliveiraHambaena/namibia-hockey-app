import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  // Mock user data
  const user = {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    role: "Team Manager",
    memberSince: "2021",
  };

  const handleLogout = () => {
    // In a real app, you would implement actual logout logic here
    console.log("Logging out...");
    // Navigate back to home screen
    router.replace("/");
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-4 px-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Profile</Text>
        </View>

        <View className="items-center mt-2">
          <Image
            source={{ uri: user.avatar }}
            className="w-24 h-24 rounded-full bg-white"
            contentFit="cover"
            style={{ width: 96, height: 96 }}
          />
          <Text className="text-white text-xl font-bold mt-3">{user.name}</Text>
          <Text className="text-white opacity-80">{user.role}</Text>
        </View>
      </View>

      {/* Profile Content */}
      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-800 mb-2">
              Account Information
            </Text>
            <View className="mb-2">
              <Text className="text-gray-500 text-sm">Email</Text>
              <Text className="text-gray-800">{user.email}</Text>
            </View>
            <View>
              <Text className="text-gray-500 text-sm">Member Since</Text>
              <Text className="text-gray-800">{user.memberSince}</Text>
            </View>
          </View>

          <TouchableOpacity
            className="p-4 flex-row items-center border-b border-gray-100"
            onPress={() => router.push("/profile/edit")}
          >
            <User size={20} color="#4B5563" />
            <Text className="text-gray-800 ml-3 flex-1">Edit Profile</Text>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4 flex-row items-center border-b border-gray-100"
            onPress={() => router.push("/profile/settings")}
          >
            <Settings size={20} color="#4B5563" />
            <Text className="text-gray-800 ml-3 flex-1">Settings</Text>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View className="p-4 flex-row items-center border-b border-gray-100">
            <Bell size={20} color="#4B5563" />
            <Text className="text-gray-800 ml-3 flex-1">Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
              thumbColor={notificationsEnabled ? "#2563EB" : "#9CA3AF"}
            />
          </View>

          <TouchableOpacity
            className="p-4 flex-row items-center border-b border-gray-100"
            onPress={() => router.push("/profile/privacy")}
          >
            <Shield size={20} color="#4B5563" />
            <Text className="text-gray-800 ml-3 flex-1">
              Privacy & Security
            </Text>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4 flex-row items-center"
            onPress={() => router.push("/profile/help")}
          >
            <HelpCircle size={20} color="#4B5563" />
            <Text className="text-gray-800 ml-3 flex-1">Help & Support</Text>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-white rounded-lg shadow-sm p-4 flex-row items-center mb-6"
          onPress={handleLogout}
        >
          <LogOut size={20} color="#EF4444" />
          <Text className="text-red-500 ml-3 font-medium">Log Out</Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-500 text-sm mb-6">
          Namibia Hockey Union App v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
