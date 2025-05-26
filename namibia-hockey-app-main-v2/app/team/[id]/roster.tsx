import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import {
  Search,
  Plus,
  MoreVertical,
  UserPlus,
  X,
  Check,
  ChevronDown,
} from "lucide-react-native";

type Player = {
  id: string;
  name: string;
  position: string;
  role: "Player" | "Captain" | "Coach" | "Manager";
  avatar: string;
  status: "Active" | "Pending" | "Inactive";
};

export default function TeamRosterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = id || "1";

  const [searchQuery, setSearchQuery] = useState("");
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Mock team data
  const [team] = useState({
    id: teamId,
    name: "Coastal Strikers",
    logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=team" + teamId,
  });

  // Mock players data
  const [players, setPlayers] = useState<Player[]>([
    {
      id: "1",
      name: "Emma Johnson",
      position: "Forward",
      role: "Captain",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
      status: "Active",
    },
    {
      id: "2",
      name: "Michael Smith",
      position: "Midfielder",
      role: "Player",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      status: "Active",
    },
    {
      id: "3",
      name: "Sarah Williams",
      position: "Defender",
      role: "Player",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      status: "Active",
    },
    {
      id: "4",
      name: "David Brown",
      position: "Goalkeeper",
      role: "Player",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
      status: "Active",
    },
    {
      id: "5",
      name: "Lisa Taylor",
      role: "Coach",
      position: "",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
      status: "Active",
    },
    {
      id: "6",
      name: "James Wilson",
      position: "Forward",
      role: "Player",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
      status: "Pending",
    },
  ]);

  // Filter players based on search query and role filter
  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole ? player.role === selectedRole : true;
    return matchesSearch && matchesRole;
  });

  const handleInvitePlayer = () => {
    Alert.alert("Invite Player", "Send invitation to join the team", [
      { text: "Cancel", style: "cancel" },
      { text: "Send Invite", onPress: () => console.log("Invite sent") },
    ]);
  };

  const handleRemovePlayer = (playerId: string) => {
    Alert.alert(
      "Remove Player",
      "Are you sure you want to remove this player from the team?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setPlayers(players.filter((player) => player.id !== playerId));
          },
        },
      ],
    );
  };

  const handleChangeRole = (playerId: string, newRole: Player["role"]) => {
    setPlayers(
      players.map((player) =>
        player.id === playerId ? { ...player, role: newRole } : player,
      ),
    );
  };

  const handleApprovePlayer = (playerId: string) => {
    setPlayers(
      players.map((player) =>
        player.id === playerId ? { ...player, status: "Active" } : player,
      ),
    );
  };

  const roles: Player["role"][] = ["Player", "Captain", "Coach", "Manager"];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-4 px-4">
        <View className="flex-row items-center mb-4">
          <Image
            source={{ uri: team.logo }}
            className="w-12 h-12 rounded-full bg-white"
            contentFit="cover"
          />
          <View className="ml-3">
            <Text className="text-white text-xl font-bold">{team.name}</Text>
            <Text className="text-white opacity-80">Team Roster</Text>
          </View>
        </View>

        {/* Search and filter */}
        <View className="flex-row items-center bg-white rounded-lg px-3 py-2">
          <Search size={20} color="#6b7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Search players..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            onPress={() => setShowRoleFilter(!showRoleFilter)}
            className="flex-row items-center"
          >
            <Text className="text-blue-600 mr-1">
              {selectedRole || "All Roles"}
            </Text>
            <ChevronDown size={16} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* Role filter dropdown */}
        {showRoleFilter && (
          <View className="bg-white rounded-lg mt-2 shadow-md">
            <TouchableOpacity
              className="px-4 py-3 border-b border-gray-100"
              onPress={() => {
                setSelectedRole(null);
                setShowRoleFilter(false);
              }}
            >
              <Text className="text-gray-800">All Roles</Text>
            </TouchableOpacity>
            {roles.map((role) => (
              <TouchableOpacity
                key={role}
                className="px-4 py-3 border-b border-gray-100"
                onPress={() => {
                  setSelectedRole(role);
                  setShowRoleFilter(false);
                }}
              >
                <Text className="text-gray-800">{role}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Player list */}
      <ScrollView className="flex-1">
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">
              Players ({filteredPlayers.length})
            </Text>
            <TouchableOpacity
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
              onPress={handleInvitePlayer}
            >
              <UserPlus size={18} color="white" />
              <Text className="text-white ml-2">Invite Player</Text>
            </TouchableOpacity>
          </View>

          {filteredPlayers.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-gray-500 text-center">
                No players found
              </Text>
            </View>
          ) : (
            filteredPlayers.map((player) => (
              <View
                key={player.id}
                className={`bg-white rounded-lg mb-3 p-4 flex-row items-center shadow-sm border border-gray-100 ${player.status === "Pending" ? "border-l-4 border-l-yellow-500" : ""}`}
              >
                <Image
                  source={{ uri: player.avatar }}
                  className="w-12 h-12 rounded-full bg-gray-200"
                  contentFit="cover"
                />
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center">
                    <Text className="text-gray-800 font-bold">
                      {player.name}
                    </Text>
                    {player.status === "Pending" && (
                      <View className="ml-2 bg-yellow-100 px-2 py-0.5 rounded">
                        <Text className="text-yellow-800 text-xs">Pending</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-gray-500">
                    {player.position || player.role}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View className="bg-blue-100 px-2 py-0.5 rounded">
                      <Text className="text-blue-800 text-xs">
                        {player.role}
                      </Text>
                    </View>
                  </View>
                </View>

                {player.status === "Pending" ? (
                  <View className="flex-row">
                    <TouchableOpacity
                      className="bg-green-100 p-2 rounded-full mr-2"
                      onPress={() => handleApprovePlayer(player.id)}
                    >
                      <Check size={18} color="#16a34a" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-red-100 p-2 rounded-full"
                      onPress={() => handleRemovePlayer(player.id)}
                    >
                      <X size={18} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(player.name, "Choose an action", [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Change Role",
                          onPress: () => {
                            Alert.alert("Change Role", "Select a new role", [
                              ...roles.map((role) => ({
                                text: role,
                                onPress: () =>
                                  handleChangeRole(player.id, role),
                              })),
                              { text: "Cancel", style: "cancel" },
                            ]);
                          },
                        },
                        {
                          text: "Remove Player",
                          style: "destructive",
                          onPress: () => handleRemovePlayer(player.id),
                        },
                      ]);
                    }}
                  >
                    <MoreVertical size={20} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add player floating button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={handleInvitePlayer}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
