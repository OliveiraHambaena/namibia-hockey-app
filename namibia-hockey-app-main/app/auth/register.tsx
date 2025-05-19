// Import React and the useState hook to manage form input states
import React, { useState } from "react";

// Import basic UI components from React Native
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

// Import Expo Image for optimized image handling
import { Image } from "expo-image";

// Import navigation hook from expo-router for routing between screens
import { useRouter } from "expo-router";

// Import an icon for back navigation
import { ArrowLeft } from "lucide-react-native";

// Define the RegisterScreen component
export default function RegisterScreen() {
  // Initialize the router for navigation
  const router = useRouter();

  // Define state variables for the form inputs
  const [name, setName] = useState(""); // Full name
  const [email, setEmail] = useState(""); // Email address
  const [password, setPassword] = useState(""); // Password
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm password

  // Function to handle the registration logic (placeholder for now)
  const handleRegister = () => {
    // Normally, you'd add validation and API call here
    // For now, just navigate to the home screen
    router.replace("/");
  };

  // Render the screen UI
  return (
    <ScrollView className="flex-1 bg-white"> {/* Allows scrolling for small screens */}
      <View className="p-6"> {/* Padding around content */}

        {/* Back button to return to the previous screen */}
        <TouchableOpacity
          onPress={() => router.back()} // Go back to previous screen
          className="mb-6 flex-row items-center"
        >
          <ArrowLeft size={20} color="#3B82F6" /> {/* Blue back arrow icon */}
          <Text className="text-blue-500 ml-2">Back</Text> {/* "Back" label */}
        </TouchableOpacity>

        {/* Logo and heading text */}
        <View className="items-center mb-10">
          <Image
            source={require("../../assets/images/NamibiaHockey app.jpeg")} // NHU logo image
            className="w-32 h-32 rounded-full mb-4" // Make it round and sized
            contentFit="cover" // Keep aspect ratio
          />
          <Text className="text-2xl font-bold text-gray-800">
            Create Account
          </Text> {/* Main heading */}
          <Text className="text-gray-500 text-center mt-2">
            Join the Namibia Hockey Union portal
          </Text> {/* Subtext */}
        </View>

        {/* Full Name Input Field */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">Full Name</Text>
          <TextInput
            className="bg-gray-100 p-4 rounded-lg text-gray-800"
            placeholder="Enter your full name"
            value={name} // Controlled input bound to name state
            onChangeText={setName} // Update state when typing
          />
        </View>

        {/* Email Input Field */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">Email</Text>
          <TextInput
            className="bg-gray-100 p-4 rounded-lg text-gray-800"
            placeholder="Enter your email"
            value={email} // Controlled input
            on

