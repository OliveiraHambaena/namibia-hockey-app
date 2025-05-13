import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
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
      status: "approved",
      logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=striker",
      memberCount: 18,
    },
    {
      id: "2",
      name: "Windhoek Warriors",
      division: "Division 1",
      status: "pending",
      logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=warrior",
      memberCount: 15,
    },
  ];

  const allTeams = [
    ...myTeams,
    {
      id: "3",
      name: "Swakopmund Sharks",
      division: "Premier League",
      status: "approved",
      logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=shark",
      memberCount: 20,
    },
    {
      id: "4",
      name: "Walvis Bay Wanderers",
      division: "Division 2",
      status: "approved",
      logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=wanderer",
      memberCount: 16,
    },
  ];

  const displayedTeams = activeTab === "my-teams" ? myTeams : allTeams;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.headerTitle}>Namibia Hockey Union</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Menu size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "my-teams" && styles.activeTab]}
          onPress={() => setActiveTab("my-teams")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "my-teams" && styles.activeTabText,
            ]}
          >
            My Teams
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all-teams" && styles.activeTab]}
          onPress={() => setActiveTab("all-teams")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "all-teams" && styles.activeTabText,
            ]}
          >
            All Teams
          </Text>
        </TouchableOpacity>
      </View>

      {/* Team List */}
      <ScrollView
        style={styles.teamList}
        contentContainerStyle={styles.teamListContent}
      >
        {displayedTeams.length > 0 ? (
          displayedTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onPress={() => router.push(`/team/${team.id}`)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {activeTab === "my-teams"
                ? "You are not part of any teams yet."
                : "No teams available."}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Link href="/team/create" asChild>
        <TouchableOpacity style={styles.fab}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
    color: "#333",
  },
  menuButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#0066cc",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#0066cc",
    fontWeight: "600",
  },
  teamList: {
    flex: 1,
  },
  teamListContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0066cc",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default TeamIndexPage;
