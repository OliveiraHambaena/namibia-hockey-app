import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Filter } from "lucide-react-native";

export default function EventsScreen() {
  const router = useRouter();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  // Mock events data
  const events = [
    {
      id: "1",
      title: "National Hockey Championship",
      date: "June 15-20, 2023",
      location: "Windhoek Hockey Stadium",
      image:
        "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=800&q=80",
      type: "tournament",
    },
    {
      id: "2",
      title: "Coastal Strikers vs Windhoek Warriors",
      date: "June 12, 2023 • 15:00",
      location: "Swakopmund Sports Complex",
      image:
        "https://images.unsplash.com/photo-1607457561901-e6ec3a6d16cf?w=800&q=80",
      type: "match",
    },
    {
      id: "3",
      title: "Junior Hockey Development Camp",
      date: "July 5-10, 2023",
      location: "Walvis Bay Sports Center",
      image:
        "https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=800&q=80",
      type: "camp",
    },
    {
      id: "4",
      title: "Namibia vs South Africa Friendly",
      date: "July 15, 2023 • 18:00",
      location: "Independence Stadium",
      image:
        "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80",
      type: "match",
    },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-4 px-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Events</Text>
          <View className="flex-1" />
          <TouchableOpacity
            className="p-2"
            onPress={() => setFilterModalVisible(true)}
          >
            <Filter size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View className="bg-blue-700 rounded-lg p-4 flex-row items-center">
          <Calendar size={24} color="white" />
          <View className="ml-3">
            <Text className="text-white font-bold text-lg">
              Upcoming Events
            </Text>
            <Text className="text-white opacity-80">4 events this month</Text>
          </View>
        </View>
      </View>

      {/* Filter indicator */}
      {activeFilter && (
        <View className="flex-row justify-between items-center px-4 py-2 bg-gray-100">
          <Text className="text-gray-800">
            Filtered by:{" "}
            <Text className="font-bold capitalize">{activeFilter}</Text>
          </Text>
          <TouchableOpacity onPress={() => setActiveFilter(null)}>
            <Text className="text-blue-600">Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Events List */}
      <ScrollView className="flex-1 p-4">
        {(activeFilter
          ? events.filter((event) => event.type === activeFilter)
          : events
        ).map((event) => (
          <TouchableOpacity
            key={event.id}
            className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden border border-gray-100"
            onPress={() => console.log(`Event ${event.id} pressed`)}
          >
            <Image
              source={{ uri: event.image }}
              className="w-full h-40"
              contentFit="cover"
            />
            <View className="p-4">
              <View className="flex-row justify-between items-center mb-2">
                <View
                  className={`px-2 py-1 rounded-full ${event.type === "match" ? "bg-green-100" : event.type === "tournament" ? "bg-blue-100" : "bg-purple-100"}`}
                >
                  <Text
                    className={`text-xs capitalize ${event.type === "match" ? "text-green-800" : event.type === "tournament" ? "text-blue-800" : "text-purple-800"}`}
                  >
                    {event.type}
                  </Text>
                </View>
              </View>
              <Text className="text-lg font-bold text-gray-800 mb-1">
                {event.title}
              </Text>
              <Text className="text-gray-600 mb-1">{event.date}</Text>
              <Text className="text-gray-600">{event.location}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        transparent={true}
        visible={filterModalVisible}
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/30 justify-start items-end"
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
        >
          <View className="bg-white w-56 mt-24 mr-4 rounded-lg shadow-lg overflow-hidden">
            <Text className="p-3 font-bold text-gray-800 border-b border-gray-100">
              Filter Events
            </Text>

            <TouchableOpacity
              className="p-3 border-b border-gray-100 flex-row justify-between items-center"
              onPress={() => {
                setActiveFilter(null);
                setFilterModalVisible(false);
              }}
            >
              <Text className="text-gray-800">All Events</Text>
              {activeFilter === null && (
                <Text className="text-blue-600">✓</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="p-3 border-b border-gray-100 flex-row justify-between items-center"
              onPress={() => {
                setActiveFilter("match");
                setFilterModalVisible(false);
              }}
            >
              <Text className="text-gray-800">Matches</Text>
              {activeFilter === "match" && (
                <Text className="text-blue-600">✓</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="p-3 border-b border-gray-100 flex-row justify-between items-center"
              onPress={() => {
                setActiveFilter("tournament");
                setFilterModalVisible(false);
              }}
            >
              <Text className="text-gray-800">Tournaments</Text>
              {activeFilter === "tournament" && (
                <Text className="text-blue-600">✓</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="p-3 flex-row justify-between items-center"
              onPress={() => {
                setActiveFilter("camp");
                setFilterModalVisible(false);
              }}
            >
              <Text className="text-gray-800">Camps</Text>
              {activeFilter === "camp" && (
                <Text className="text-blue-600">✓</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
