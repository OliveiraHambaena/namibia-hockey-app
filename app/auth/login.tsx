import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Here you would implement actual authentication logic
    // For now, we'll just navigate to the home screen
    router.replace("/");
  };

  return (
    <View className="flex-1 bg-white p-6">
      <TouchableOpacity
        onPress={() => router.back()}
        className="mb-6 flex-row items-center"
      >
        <ArrowLeft size={20} color="#3B82F6" />
        <Text className="text-blue-500 ml-2">Back</Text>
      </TouchableOpacity>

      <View className="items-center mb-10">
        <Image
          source={require("../../assets/images/NamibiaHockey app.jpeg")}
          className="w-32 h-32 rounded-full mb-4"
          contentFit="cover"
        />
        <Text className="text-2xl font-bold text-gray-800">Welcome Back</Text>
        <Text className="text-gray-500 text-center mt-2">
          Sign in to access your hockey team account
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2 font-medium">Email</Text>
        <TextInput
          className="bg-gray-100 p-4 rounded-lg text-gray-800"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View className="mb-8">
        <Text className="text-gray-700 mb-2 font-medium">Password</Text>
        <TextInput
          className="bg-gray-100 p-4 rounded-lg text-gray-800"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity className="self-end mt-2">
          <Text className="text-blue-500">Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {errorMsg && (
        <View className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <Text className="text-red-600">{errorMsg}</Text>
        </View>
      )}

      <TouchableOpacity
        className="bg-blue-600 py-4 rounded-lg items-center mb-6"
        onPress={handleLogin}
      >
        <Text className="text-white font-semibold text-base">Sign In</Text>
      </TouchableOpacity>

      <View className="flex-row justify-center">
        <Text className="text-gray-600">Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/auth/register")}>
          <Text className="text-blue-600 font-semibold">Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
