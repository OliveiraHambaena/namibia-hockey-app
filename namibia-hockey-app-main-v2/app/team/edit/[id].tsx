import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Upload, Check } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

const TeamEditPage = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = id || "1";

  // Mock data for the team being edited
  const [teamName, setTeamName] = useState("Windhoek Warriors");
  const [division, setDivision] = useState("Premier League");
  const [description, setDescription] = useState(
    "Founded in 2010, the Windhoek Warriors have been a dominant force in Namibian hockey, winning multiple championships and developing top talent for the national team.",
  );
  const [contactEmail, setContactEmail] = useState(
    "warriors@namibiahockey.com",
  );
  const [contactPhone, setContactPhone] = useState("+264 61 123 4567");
  const [teamLogo, setTeamLogo] = useState<string>(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=WindhoekWarriors",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const divisions = [
    "Premier League",
    "First Division",
    "Second Division",
    "Junior Division",
    "School Division",
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setTeamLogo(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!teamName || !division || !contactEmail) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Team Updated",
        "Your team information has been successfully updated.",
        [{ text: "OK", onPress: () => router.push(`/team/${teamId}`) }],
      );
    }, 1500);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-4 px-4 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full bg-blue-700"
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold ml-4">
          Edit Team Details
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Team Logo Upload */}
        <View className="items-center mb-6">
          <TouchableOpacity
            onPress={pickImage}
            className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center overflow-hidden border-2 border-dashed border-blue-500"
          >
            {teamLogo ? (
              <Image
                source={{ uri: teamLogo }}
                className="w-full h-full"
                contentFit="cover"
              />
            ) : (
              <View className="items-center">
                <Upload size={32} color="#3b82f6" />
                <Text className="text-blue-500 mt-2 text-sm">Upload Logo</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text className="text-gray-500 text-xs mt-2">
            Tap to change team logo
          </Text>
        </View>

        {/* Team Details Form */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-1 font-medium">Team Name *</Text>
          <TextInput
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Enter team name"
            className="border border-gray-300 rounded-md p-3 bg-gray-50"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 mb-1 font-medium">Division *</Text>
          <View className="border border-gray-300 rounded-md bg-gray-50 overflow-hidden">
            {divisions.map((div, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setDivision(div)}
                className={`p-3 flex-row justify-between items-center ${index < divisions.length - 1 ? "border-b border-gray-200" : ""} ${division === div ? "bg-blue-50" : ""}`}
              >
                <Text
                  className={`${division === div ? "text-blue-600 font-medium" : "text-gray-700"}`}
                >
                  {div}
                </Text>
                {division === div && <Check size={20} color="#2563eb" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 mb-1 font-medium">Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Tell us about your team"
            multiline
            numberOfLines={4}
            className="border border-gray-300 rounded-md p-3 bg-gray-50 h-24 textAlignVertical-top"
          />
        </View>

        <Text className="text-lg font-bold mb-2 mt-4">Contact Information</Text>

        <View className="mb-4">
          <Text className="text-gray-700 mb-1 font-medium">Email *</Text>
          <TextInput
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder="team@example.com"
            keyboardType="email-address"
            className="border border-gray-300 rounded-md p-3 bg-gray-50"
          />
        </View>

        <View className="mb-8">
          <Text className="text-gray-700 mb-1 font-medium">Phone Number</Text>
          <TextInput
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder="+264 XX XXX XXXX"
            keyboardType="phone-pad"
            className="border border-gray-300 rounded-md p-3 bg-gray-50"
          />
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="p-4 border-t border-gray-200 bg-white">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`rounded-md py-3 px-4 ${isSubmitting ? "bg-gray-400" : "bg-blue-600"} flex-row justify-center items-center`}
        >
          {isSubmitting ? (
            <Text className="text-white font-bold">Updating...</Text>
          ) : (
            <Text className="text-white font-bold">Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TeamEditPage;
