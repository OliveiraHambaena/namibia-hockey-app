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
import { useRouter } from "expo-router";
import { ArrowLeft, Upload } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

export default function EditProfileScreen() {
  const router = useRouter();

  // Mock user data
  const [name, setName] = useState("Sarah Johnson");
  const [email, setEmail] = useState("sarah.johnson@example.com");
  const [phone, setPhone] = useState("+264 61 123 4567");
  const [role, setRole] = useState("Team Manager");
  const [avatar, setAvatar] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!name || !email) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Profile Updated",
        "Your profile has been successfully updated.",
        [{ text: "OK", onPress: () => router.back() }],
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
        <Text className="text-white text-xl font-bold ml-4">Edit Profile</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Profile Picture Upload */}
        <View className="items-center mb-6">
          <TouchableOpacity
            onPress={pickImage}
            className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center overflow-hidden border-2 border-dashed border-blue-500"
          >
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                className="w-full h-full"
                contentFit="cover"
              />
            ) : (
              <View className="items-center">
                <Upload size={32} color="#3b82f6" />
                <Text className="text-blue-500 mt-2 text-sm">Upload Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text className="text-gray-500 text-xs mt-2">
            Tap to change profile picture
          </Text>
        </View>

        {/* Profile Details Form */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-1 font-medium">Full Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            className="border border-gray-300 rounded-md p-3 bg-gray-50"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 mb-1 font-medium">Email *</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            className="border border-gray-300 rounded-md p-3 bg-gray-50"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 mb-1 font-medium">Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+264 XX XXX XXXX"
            keyboardType="phone-pad"
            className="border border-gray-300 rounded-md p-3 bg-gray-50"
          />
        </View>

        <View className="mb-8">
          <Text className="text-gray-700 mb-1 font-medium">Role</Text>
          <TextInput
            value={role}
            onChangeText={setRole}
            placeholder="Your role in the team"
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
}
