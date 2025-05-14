import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Key,
  AlertTriangle,
} from "lucide-react-native";

export default function PrivacySecurityScreen() {
  const router = useRouter();

  // Privacy settings state
  const [locationSharing, setLocationSharing] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-4 px-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            Privacy & Security
          </Text>
        </View>
      </View>

      {/* Privacy Content */}
      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
          <Text className="p-4 text-lg font-bold text-gray-800 border-b border-gray-100">
            Privacy
          </Text>

          <View className="p-4 flex-row items-center border-b border-gray-100">
            <Eye size={20} color="#4B5563" />
            <Text className="text-gray-800 ml-3 flex-1">
              Profile Visibility
            </Text>
            <Switch
              value={profileVisibility}
              onValueChange={setProfileVisibility}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
              thumbColor={profileVisibility ? "#2563EB" : "#9CA3AF"}
            />
          </View>

          <View className="p-4 flex-row items-center">
            <Shield size={20} color="#4B5563" />
            <Text className="text-gray-800 ml-3 flex-1">Location Sharing</Text>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
              thumbColor={locationSharing ? "#2563EB" : "#9CA3AF"}
            />
          </View>
        </View>

        <View className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
          <Text className="p-4 text-lg font-bold text-gray-800 border-b border-gray-100">
            Security
          </Text>

          <TouchableOpacity className="p-4 flex-row items-center border-b border-gray-100">
            <Lock size={20} color="#4B5563" />
            <Text className="text-gray-800 ml-3">Change Password</Text>
          </TouchableOpacity>

          <View className="p-4 flex-row items-center border-b border-gray-100">
            <Key size={20} color="#4B5563" />
            <Text className="text-gray-800 ml-3 flex-1">
              Two-Factor Authentication
            </Text>
            <Switch
              value={twoFactorAuth}
              onValueChange={setTwoFactorAuth}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
              thumbColor={twoFactorAuth ? "#2563EB" : "#9CA3AF"}
            />
          </View>

          <TouchableOpacity className="p-4 flex-row items-center">
            <AlertTriangle size={20} color="#4B5563" />
            <Text className="text-gray-800 ml-3">Login Activity</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
          <Text className="p-4 text-lg font-bold text-gray-800 border-b border-gray-100">
            Data
          </Text>

          <TouchableOpacity className="p-4 border-b border-gray-100">
            <Text className="text-gray-800">Download Your Data</Text>
          </TouchableOpacity>

          <TouchableOpacity className="p-4">
            <Text className="text-gray-800">Data Sharing Preferences</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="bg-red-50 rounded-lg p-4 mb-6">
          <Text className="text-red-500 text-center font-medium">
            Delete Account
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
