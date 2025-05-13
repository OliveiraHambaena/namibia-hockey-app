import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { Plus, Menu } from "lucide-react-native";
import TeamCard from "../components/TeamCard";

const TeamIndexPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("my-teams");

  // Mock data for teams
  const myTeams = [
    {
      id: "1",
      name: "Coastal Strikers",
      division: "Premier League",
      approvalStatus: "approved",
      logoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=striker",
    },
    {
      id: "2",
      name: "Windhoek Warriors",
      division: "Division 1",
      approvalStatus: "pending",
      logoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=warrior",
    },
  ];

  const allTeams = [
    ...myTeams,
    {
      id: "3",
      name: "Swakopmund Sharks",
      division: "Premier League",
      approvalStatus: "approved",
      logoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=shark",
    },
    {
      id: "4",
      name: "Walvis Bay Wanderers",
      division: "Division 2",
      approvalStatus: "approved",
      logoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=wanderer",
    },
  ];

  const displayedTeams = activeTab === "my-teams" ? myTeams : allTeams;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center bg-white pt-14 pb-4 px-4 border-b border-gray-200">
        <Image
          source={require("../../assets/images/icon.png")}
          className="w-10 h-10 rounded-full bg-blue-100"
          contentFit="contain"
        />
        <Text className="flex-1 text-lg font-bold ml-3 text-gray-800">
          Namibia Hockey Union
        </Text>
        <TouchableOpacity className="p-1">
          <Menu size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity
          className={`py-3 px-4 ${activeTab === "my-teams" ? "border-b-2 border-blue-600" : ""}`}
          onPress={() => setActiveTab("my-teams")}
        >
          <Text
            className={`text-base ${activeTab === "my-teams" ? "text-blue-600 font-semibold" : "text-gray-600"}`}
          >
            My Teams
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`py-3 px-4 ${activeTab === "all-teams" ? "border-b-2 border-blue-600" : ""}`}
          onPress={() => setActiveTab("all-teams")}
        >
          <Text
            className={`text-base ${activeTab === "all-teams" ? "text-blue-600 font-semibold" : "text-gray-600"}`}
          >
            All Teams
          </Text>
        </TouchableOpacity>
      </View>

      {/* Team List */}
      <ScrollView className="flex-1 px-4 pt-4">
        {displayedTeams.length > 0 ? (
          displayedTeams.map((team) => (
            <TeamCard
              key={team.id}
              id={team.id}
              name={team.name}
              division={team.division}
              approvalStatus={team.approvalStatus}
              logoUrl={team.logoUrl}
            />
          ))
        ) : (
          <View className="items-center justify-center py-10">
            <Text className="text-base text-gray-600 text-center">
              {activeTab === "my-teams"
                ? "You are not part of any teams yet."
                : "No teams available."}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Link href="/team/create" asChild>
        <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 items-center justify-center shadow-lg">
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default TeamIndexPage;
