import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-4 px-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Terms of Service</Text>
        </View>
      </View>

      {/* Terms Content */}
      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-lg shadow-sm mb-4 p-4">
          <Text className="text-xl font-bold mb-4">Terms of Service</Text>
          <Text className="text-gray-700 mb-4">Last Updated: June 1, 2023</Text>

          <Text className="text-lg font-bold mb-2">1. Acceptance of Terms</Text>
          <Text className="text-gray-700 mb-4">
            By accessing or using the Namibia Hockey Union app, you agree to be
            bound by these Terms of Service. If you do not agree to these terms,
            please do not use the app.
          </Text>

          <Text className="text-lg font-bold mb-2">2. User Accounts</Text>
          <Text className="text-gray-700 mb-4">
            When you create an account with us, you must provide accurate and
            complete information. You are responsible for maintaining the
            security of your account and password. The Namibia Hockey Union
            cannot and will not be liable for any loss or damage from your
            failure to comply with this security obligation.
          </Text>

          <Text className="text-lg font-bold mb-2">3. Team Registration</Text>
          <Text className="text-gray-700 mb-4">
            Teams registered through the app must provide accurate information.
            The Namibia Hockey Union reserves the right to verify team
            information and reject registrations that do not meet our standards
            or violate these terms.
          </Text>

          <Text className="text-lg font-bold mb-2">4. User Content</Text>
          <Text className="text-gray-700 mb-4">
            Users may post content such as team information, player profiles,
            and event details. You retain ownership of your content, but grant
            the Namibia Hockey Union a license to use, modify, and display that
            content for the purpose of operating the app.
          </Text>

          <Text className="text-lg font-bold mb-2">
            5. Prohibited Activities
          </Text>
          <Text className="text-gray-700 mb-4">
            Users may not engage in any activity that interferes with the proper
            functioning of the app, attempts to gain unauthorized access, or
            violates any laws or regulations.
          </Text>

          <Text className="text-lg font-bold mb-2">6. Termination</Text>
          <Text className="text-gray-700 mb-4">
            The Namibia Hockey Union reserves the right to terminate or suspend
            access to the app for any user who violates these Terms of Service.
          </Text>

          <Text className="text-lg font-bold mb-2">7. Changes to Terms</Text>
          <Text className="text-gray-700 mb-4">
            The Namibia Hockey Union may modify these terms at any time. We will
            notify users of significant changes through the app or via email.
          </Text>

          <Text className="text-lg font-bold mb-2">8. Contact Information</Text>
          <Text className="text-gray-700 mb-4">
            If you have any questions about these Terms of Service, please
            contact us at legal@namibiahockey.org.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
