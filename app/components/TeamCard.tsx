import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

interface TeamCardProps {
  id: string;
  name: string;
  division: string;
  approvalStatus: string;
  logoUrl: string;
}

const TeamCard = ({
  id,
  name,
  division,
  approvalStatus,
  logoUrl,
}: TeamCardProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/team/${id}`);
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
      onPress={handlePress}
    >
      <View className="flex-row items-center p-4">
        <Image
          source={{ uri: logoUrl }}
          className="w-12 h-12 rounded-full bg-blue-100"
          contentFit="cover"
        />
        <View className="flex-1 ml-3">
          <Text className="text-lg font-semibold text-gray-800">{name}</Text>
          <Text className="text-sm text-gray-600">{division}</Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${
            approvalStatus === "approved"
              ? "bg-green-100"
              : approvalStatus === "pending"
                ? "bg-yellow-100"
                : "bg-red-100"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              approvalStatus === "approved"
                ? "text-green-800"
                : approvalStatus === "pending"
                  ? "text-yellow-800"
                  : "text-red-800"
            }`}
          >
            {approvalStatus
              ? approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)
              : "Unknown"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TeamCard;
