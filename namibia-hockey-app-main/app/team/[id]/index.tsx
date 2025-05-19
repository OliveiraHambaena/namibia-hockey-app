import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import ShareModal from "../../components/ShareModal";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Users,
  Calendar,
  BarChart2,
  Info,
  Edit,
  Share2,
} from "lucide-react-native";
import { useRouter } from "expo-router";

const TeamProfile = () => {
  const router = useRouter();
  const { id = "1" } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("info");
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // Mock data for team profile
  const teamData = {
    id: id,
    name: "Windhoek Warriors",
    division: "Premier League",
    logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=WindhoekWarriors",
    description:
      "Founded in 2010, the Windhoek Warriors have been a dominant force in Namibian hockey, winning multiple championships and developing top talent for the national team.",
    contactEmail: "warriors@namibiahockey.com",
    contactPhone: "+264 61 123 4567",
    website: "www.windhoekwarriors.na",
    foundedYear: 2010,
    homeGround: "Windhoek Hockey Stadium",
    players: [
      { id: "1", name: "John Smith", position: "Forward", number: 10 },
      { id: "2", name: "Sarah Johnson", position: "Midfielder", number: 7 },
      { id: "3", name: "Michael Brown", position: "Defender", number: 4 },
      { id: "4", name: "Emma Wilson", position: "Goalkeeper", number: 1 },
    ],
    upcomingEvents: [
      {
        id: "1",
        name: "League Match vs Swakopmund Sharks",
        date: "2023-06-15",
        time: "15:00",
      },
      { id: "2", name: "Training Session", date: "2023-06-12", time: "18:00" },
      {
        id: "3",
        name: "Charity Tournament",
        date: "2023-06-20",
        time: "09:00",
      },
    ],
    stats: {
      wins: 15,
      losses: 3,
      draws: 2,
      goalsScored: 45,
      goalsConceded: 18,
    },
    isAdmin: true, // Mock admin status
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return (
          <View className="p-4">
            <Text className="text-lg font-bold mb-2">About</Text>
            <Text className="text-gray-700 mb-4">{teamData.description}</Text>

            <Text className="text-lg font-bold mb-2">Contact Information</Text>
            <View className="mb-4">
              <Text className="text-gray-700">
                Email: {teamData.contactEmail}
              </Text>
              <Text className="text-gray-700">
                Phone: {teamData.contactPhone}
              </Text>
              <Text className="text-gray-700">Website: {teamData.website}</Text>
            </View>

            <Text className="text-lg font-bold mb-2">Additional Details</Text>
            <View>
              <Text className="text-gray-700">
                Founded: {teamData.foundedYear}
              </Text>
              <Text className="text-gray-700">
                Home Ground: {teamData.homeGround}
              </Text>
              <Text className="text-gray-700">
                Division: {teamData.division}
              </Text>
            </View>
          </View>
        );
      case "players":
        return (
          <View className="p-4">
            <View className="flex-row justify-between mb-4">
              <Text className="text-lg font-bold">Team Roster</Text>
              {teamData.isAdmin && (
                <TouchableOpacity
                  className="bg-blue-500 px-3 py-1 rounded-md"
                  onPress={() => router.push(`/team/${id}/roster`)}
                >
                  <Text className="text-white">Manage</Text>
                </TouchableOpacity>
              )}
            </View>
            {teamData.players.map((player) => (
              <View
                key={player.id}
                className="flex-row justify-between items-center py-3 border-b border-gray-200"
              >
                <View>
                  <Text className="font-semibold">{player.name}</Text>
                  <Text className="text-gray-600">{player.position}</Text>
                </View>
                <View className="h-8 w-8 bg-blue-500 rounded-full items-center justify-center">
                  <Text className="text-white font-bold">{player.number}</Text>
                </View>
              </View>
            ))}
          </View>
        );
      case "events":
        return (
          <View className="p-4">
            <Text className="text-lg font-bold mb-4">Upcoming Events</Text>
            {teamData.upcomingEvents.map((event) => (
              <View key={event.id} className="mb-4 p-3 bg-gray-50 rounded-md">
                <Text className="font-semibold">{event.name}</Text>
                <Text className="text-gray-600">Date: {event.date}</Text>
                <Text className="text-gray-600">Time: {event.time}</Text>
              </View>
            ))}
          </View>
        );
      case "stats":
        return (
          <View className="p-4">
            <Text className="text-lg font-bold mb-4">Season Statistics</Text>
            <View className="flex-row justify-between mb-3 bg-gray-50 p-3 rounded-md">
              <Text className="font-semibold">Wins</Text>
              <Text>{teamData.stats.wins}</Text>
            </View>
            <View className="flex-row justify-between mb-3 bg-gray-50 p-3 rounded-md">
              <Text className="font-semibold">Losses</Text>
              <Text>{teamData.stats.losses}</Text>
            </View>
            <View className="flex-row justify-between mb-3 bg-gray-50 p-3 rounded-md">
              <Text className="font-semibold">Draws</Text>
              <Text>{teamData.stats.draws}</Text>
            </View>
            <View className="flex-row justify-between mb-3 bg-gray-50 p-3 rounded-md">
              <Text className="font-semibold">Goals Scored</Text>
              <Text>{teamData.stats.goalsScored}</Text>
            </View>
            <View className="flex-row justify-between mb-3 bg-gray-50 p-3 rounded-md">
              <Text className="font-semibold">Goals Conceded</Text>
              <Text>{teamData.stats.goalsConceded}</Text>
            </View>
          </View>
        );
      default:
        return (
          <View>
            <Text>No content available</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center p-4 border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold flex-1">Team Profile</Text>
          {teamData.isAdmin && (
            <TouchableOpacity
              className="mr-2"
              onPress={() => router.push(`/team/edit/${id}`)}
            >
              <Edit size={20} color="#3b82f6" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShareModalVisible(true)}>
            <Share2 size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <ScrollView>
          {/* Team Banner */}
          <View className="bg-blue-500 p-4">
            <View className="flex-row items-center">
              <Image
                source={{ uri: teamData.logo }}
                style={{ width: 80, height: 80 }}
                className="rounded-full bg-white"
                contentFit="contain"
              />
              <View className="ml-4">
                <Text className="text-2xl font-bold text-white">
                  {teamData.name}
                </Text>
                <Text className="text-white">{teamData.division}</Text>
              </View>
            </View>
          </View>

          {/* Navigation Tabs */}
          <View className="flex-row border-b border-gray-200">
            <TouchableOpacity
              className={`flex-1 py-3 flex-row justify-center items-center ${activeTab === "info" ? "border-b-2 border-blue-500" : ""}`}
              onPress={() => setActiveTab("info")}
            >
              <Info
                size={16}
                color={activeTab === "info" ? "#3b82f6" : "#6b7280"}
              />
              <Text
                className={`ml-1 ${activeTab === "info" ? "text-blue-500 font-semibold" : "text-gray-500"}`}
              >
                Info
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3 flex-row justify-center items-center ${activeTab === "players" ? "border-b-2 border-blue-500" : ""}`}
              onPress={() => setActiveTab("players")}
            >
              <Users
                size={16}
                color={activeTab === "players" ? "#3b82f6" : "#6b7280"}
              />
              <Text
                className={`ml-1 ${activeTab === "players" ? "text-blue-500 font-semibold" : "text-gray-500"}`}
              >
                Players
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3 flex-row justify-center items-center ${activeTab === "events" ? "border-b-2 border-blue-500" : ""}`}
              onPress={() => setActiveTab("events")}
            >
              <Calendar
                size={16}
                color={activeTab === "events" ? "#3b82f6" : "#6b7280"}
              />
              <Text
                className={`ml-1 ${activeTab === "events" ? "text-blue-500 font-semibold" : "text-gray-500"}`}
              >
                Events
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3 flex-row justify-center items-center ${activeTab === "stats" ? "border-b-2 border-blue-500" : ""}`}
              onPress={() => setActiveTab("stats")}
            >
              <BarChart2
                size={16}
                color={activeTab === "stats" ? "#3b82f6" : "#6b7280"}
              />
              <Text
                className={`ml-1 ${activeTab === "stats" ? "text-blue-500 font-semibold" : "text-gray-500"}`}
              >
                Stats
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {renderTabContent()}
        </ScrollView>
      </View>
      {/* Share Modal */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        teamName={teamData.name}
      />
    </SafeAreaView>
  );
};

export default TeamProfile;
