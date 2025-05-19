import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { supabase } from "../lib/supabase";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMsg("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/reset-password`,
      });

      if (error) {
        setErrorMsg(error.message || "Failed to send reset email");
      } else {
        Alert.alert(
          "Reset Email Sent",
          "Check your email for a link to reset your password.",
          [{ text: "OK", onPress: () => router.push("/auth/login") }],
        );
      }
    } catch (error: any) {
      setErrorMsg(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
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
        <Text className="text-2xl font-bold text-gray-800">Reset Password</Text>
        <Text className="text-gray-500 text-center mt-2">
          Enter your email to receive a password reset link
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

      {errorMsg && (
        <View className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <Text className="text-red-600">{errorMsg}</Text>
        </View>
      )}

      <TouchableOpacity
        className={`bg-blue-600 py-4 rounded-lg items-center mb-6 ${isLoading ? "opacity-70" : ""}`}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-base">
            Send Reset Link
          </Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center">
        <Text className="text-gray-600">Remember your password? </Text>
        <TouchableOpacity onPress={() => router.push("/auth/login")}>
          <Text className="text-blue-600 font-semibold">Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
