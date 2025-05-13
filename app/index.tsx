import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-8 px-4 items-center">
        <Image
          source={require("../assets/images/icon.png")}
          className="w-20 h-20 rounded-full bg-white mb-4"
          contentFit="contain"
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
            onPress={() => router.push("/team")}
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
          <TouchableOpacity className="p-4 flex-row items-center">
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
          <TouchableOpacity className="p-4 flex-row items-center">
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
