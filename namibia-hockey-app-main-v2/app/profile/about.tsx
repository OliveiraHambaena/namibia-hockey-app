import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-4 px-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">About</Text>
        </View>
      </View>

      {/* About Content */}
      <ScrollView className="flex-1 p-4">
        <View className="items-center mb-6">
          <Image
            source={require("../../assets/images/NamibiaHockey app.jpeg")}
            className="w-32 h-32 rounded-full mb-4"
            contentFit="cover"
          />
          <Text className="text-2xl font-bold text-gray-800 mb-1">
            Namibia Hockey Union
          </Text>
          <Text className="text-gray-500 text-center">Version 1.0.0</Text>
        </View>

        <View className="bg-white rounded-lg shadow-sm mb-4 p-4">
          <Text className="text-lg font-bold mb-2">Our Mission</Text>
          <Text className="text-gray-700 mb-4">
            The Namibia Hockey Union app aims to streamline team registration
            and management, making it easier for hockey teams across Namibia to
            organize, compete, and grow the sport.
          </Text>

          <Text className="text-lg font-bold mb-2">About Us</Text>
          <Text className="text-gray-700 mb-4">
            Founded in 2023, the Namibia Hockey Union is dedicated to promoting
            hockey throughout Namibia. We organize tournaments, support team
            development, and provide resources for players of all skill levels.
          </Text>

          <Text className="text-lg font-bold mb-2">Contact Information</Text>
          <Text className="text-gray-700">Email: info@namibiahockey.org</Text>
          <Text className="text-gray-700">Phone: +264 61 123 4567</Text>
          <Text className="text-gray-700">
            Address: 123 Hockey Street, Windhoek, Namibia
          </Text>
        </View>

        <View className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <Text className="text-lg font-bold mb-2">Acknowledgements</Text>
          <Text className="text-gray-700">
            We would like to thank all the volunteers, coaches, players, and
            supporters who have contributed to the growth of hockey in Namibia.
            Your dedication and passion make this community thrive.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
