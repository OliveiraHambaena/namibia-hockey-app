import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { ChevronRight, Edit, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";

interface TeamCardProps {
  id: string;
  name: string;
  division: string;
  approvalStatus: "approved" | "pending" | "rejected";
  logoUrl: string;
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const TeamCard = ({
  id = "1",
  name = "Coastal Strikers",
  division = "Premier League",
  approvalStatus = "approved",
  logoUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=hockey",
  isAdmin = false,
  onEdit,
  onDelete,
}: TeamCardProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/team/${id}`);
  };

  const handleEdit = (e: any) => {
    e.stopPropagation();
    if (onEdit) onEdit(id);
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };

  const getStatusColor = () => {
    switch (approvalStatus) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-white rounded-lg shadow-sm p-4 mb-3 flex-row items-center border border-gray-100"
    >
      <Image
        source={{ uri: logoUrl }}
        className="w-16 h-16 rounded-full bg-gray-200"
        contentFit="cover"
      />

      <View className="flex-1 ml-4">
        <Text className="text-lg font-bold text-gray-800">{name}</Text>
        <Text className="text-sm text-gray-600">{division}</Text>
        <View className="flex-row items-center mt-1">
          <View className={`px-2 py-0.5 rounded-full ${getStatusColor()}`}>
            <Text className="text-xs capitalize">{approvalStatus}</Text>
          </View>
        </View>
      </View>

      {isAdmin && (
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleEdit} className="p-2 mr-1">
            <Edit size={18} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} className="p-2">
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}

      {!isAdmin && <ChevronRight size={20} color="#9CA3AF" />}
    </TouchableOpacity>
  );
};

export default TeamCard;
