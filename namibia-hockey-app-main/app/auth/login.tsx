// Import React and useState hook for state management
import React, { useState } from "react";

// Import necessary React Native components
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet, // Note: Not used directly in this file
} from "react-native";

// Import Image component from Expo for optimized image handling
import { Image } from "expo-image";

// Import router for navigation between screens
import { useRouter } from "expo-router";

// Import back arrow icon from Lucide icon library
import { ArrowLeft } from "lucide-react-native";

// Define and export the LoginScreen component
export default function LoginScreen() {
  // Initialize the router for navigation
  const router = useRouter();

  // Define state for email input
  const [email, setEmail] = useState("");

  // Define state for password input
  const [password, setPassword] = useState("");

  // Function to handle login action
  const handleLogin = () => {
    // Placeholder for actual authentication logic
    // Right now, it just navigates to the home screen
    router.replace("/");
  };

  // Render the login screen UI
  return (
    <View className="flex-1 bg-white p-6"> {/* Main container with padding and white background */}
      
      {/* Back button to return to the previous screen */}
      <TouchableOpacity
        onPress={() => router.back()} // Navigate back
        className="mb-6 flex-row items-center"
      >
        <ArrowLeft size={20} color="#3B82F6" /> {/* Icon */}
        <Text className="text-blue-500 ml-2">Back</Text> {/* Label */}
      </TouchableOpacity>

      {/* App logo and welcome message */}
      <View className="items-center mb-10">
        <Image
          source={require("../../assets/images/NamibiaHockey app.jpeg")} // Logo image
          className="w-32 h-32 rounded-full mb-4" // Size and styling
          contentFit="cover" // Maintain aspect ratio
        />
        <Text className="text-2xl font-bold text-gray-800">Welcome Back</Text> {/* Heading */}
        <Text className="text-gray-500 text-center mt-2">
          Sign in to access your hockey team account
        </Text> {/* Subtext */}
      </View>

      {/* Email input field */}
      <View className="mb-6">
        <Text className="text-gray-700 mb-2 font-medium">Email</Text> {/* Label */}
        <TextInput
          className="bg-gray-100 p-4 rounded-lg text-gray-800" // Input styling
          placeholder="Enter your email" // Placeholder text
          value={email} // Bound to email state
          onChangeText={setEmail} // Update email state on change
          keyboardType="email-address" // Keyboard optimized for email
          autoCapitalize="none" // Prevent capital letters
        />
      </View>

      {/* Password input field */}
      <View className="mb-8">
        <Text className="text-gray-700 mb-2 font-medium">Password</Text> {/* Label */}
        <TextInput
          className="bg-gray-100 p-4 rounded-lg text-gray-800"
          placeholder="Enter your password"
          value={password} // Bound to password state
          onChangeText={setPassword} // Update password state
          secureTextEntry // Hide password input
        />
        {/* Forgot Password link */}
        <TouchableOpacity className="self-end mt-2">
          <Text className="text-blue-500">Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Sign In button */}
      <TouchableOpacity
        className="bg-blue-600 py-4 rounded-lg items-center mb-6"
        onPress={handleLogin} // Call login handler
      >
        <Text className="text-white font-semibold text-base">Sign In</Text>
      </TouchableOpacity>

      {/* Navigation to Register screen */}
      <View className="flex-row justify-center">
        <Text className="text-gray-600">Don't have an account? </Text> {/* Prompt */}
        <TouchableOpacity onPress={() => router.push("/auth/register")}> {/* Go to register screen */}
          <Text className="text-blue-600 font-semibold">Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

