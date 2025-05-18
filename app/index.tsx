import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import SplashScreen from "./components/SplashScreen";

export default function HomeScreen() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would be determined by your auth state

  useEffect(() => {
    // The splash screen component will handle its own timing
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // If not logged in, show auth options
  if (!isLoggedIn) {
    return (
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-blue-600 pt-14 pb-8 px-4 items-center">
          <Image
            source={require("../assets/images/NamibiaHockey app.jpeg")}
            className="w-24 h-24 rounded-full bg-white mb-4"
            contentFit="cover"
          />
          <Text className="text-2xl font-bold text-white mb-1">
            Namibia Hockey Union
          </Text>
          <Text className="text-white opacity-80 text-center">
            Team Registration & Management Portal
          </Text>
        </View>

        {/* Welcome Content */}
        <View className="p-6 flex-1 justify-center">
          <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Welcome
          </Text>
          <Text className="text-gray-600 mb-8 text-center">
            Sign in or create an account to manage your hockey teams
          </Text>

          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-lg items-center mb-4"
            onPress={() => router.push("/auth/login")}
          >
            <Text className="text-white font-semibold text-base">Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white py-4 rounded-lg items-center border border-blue-600"
            onPress={() => router.push("/auth/register")}
          >
            <Text className="text-blue-600 font-semibold text-base">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="p-6 items-center">
          <TouchableOpacity onPress={() => router.push("/team")}>
            <Text className="text-gray-500 text-sm">Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main dashboard (when logged in)
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-8 px-4 items-center">
        <Image
          source={require("../assets/images/NamibiaHockey app.jpeg")}
          className="w-24 h-24 rounded-full bg-white mb-4"
          contentFit="cover"
          style={{ width: 96, height: 96 }}
        />
        <Text className="text-2xl font-bold text-white mb-1">
          Namibia Hockey Union
        </Text>
        <Text className="text-white opacity-80 text-center">
          Team Registration & Management Portal
        </Text>
      </View>

      {/* Main Content */}
      <View className="p-6">
        <Text className="text-xl font-bold text-gray-800 mb-6">
          Welcome to the Hockey Team Portal
        </Text>

        <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 border border-gray-100">
          <TouchableOpacity
            className="p-4 flex-row items-center"
            onPress={() => router.push("team")}
          >
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
              <Text className="text-blue-600 text-lg font-bold">T</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">Teams</Text>
              <Text className="text-gray-600">
                View and manage your hockey teams
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 border border-gray-100">
          <TouchableOpacity
            className="p-4 flex-row items-center"
            onPress={() => router.push("/events")}
          >
            <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-4">
              <Text className="text-green-600 text-lg font-bold">E</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                Events
              </Text>
              <Text className="text-gray-600">
                Upcoming matches and tournaments
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <TouchableOpacity
            className="p-4 flex-row items-center"
            onPress={() => router.push("/profile")}
          >
            <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mr-4">
              <Text className="text-purple-600 text-lg font-bold">P</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                Profile
              </Text>
              <Text className="text-gray-600">
                Manage your account settings
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="p-6 mt-auto">
        <TouchableOpacity
          className="bg-blue-600 py-3 rounded-lg items-center"
          onPress={() => router.push("/team/create")}
        >
          <Text className="text-white font-semibold text-base">
            Register a New Team
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
