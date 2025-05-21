import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-4 px-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Privacy Policy</Text>
        </View>
      </View>

      {/* Privacy Policy Content */}
      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-lg shadow-sm mb-4 p-4">
          <Text className="text-xl font-bold mb-4">Privacy Policy</Text>
          <Text className="text-gray-700 mb-4">Last Updated: June 1, 2023</Text>

          <Text className="text-lg font-bold mb-2">
            1. Information We Collect
          </Text>
          <Text className="text-gray-700 mb-4">
            We collect information you provide directly to us when you create an
            account, register a team, or update your profile. This may include
            your name, email address, phone number, and profile picture. For
            team registrations, we collect team names, logos, player
            information, and team contact details.
          </Text>

          <Text className="text-lg font-bold mb-2">
            2. How We Use Your Information
          </Text>
          <Text className="text-gray-700 mb-4">
            We use the information we collect to provide, maintain, and improve
            our services, to communicate with you, to monitor and analyze trends
            and usage, and to enhance the safety and security of our app.
          </Text>

          <Text className="text-lg font-bold mb-2">3. Information Sharing</Text>
          <Text className="text-gray-700 mb-4">
            We may share certain information with other users as part of the
            normal operation of the app, such as team information and player
            profiles. We do not sell your personal information to third parties.
          </Text>

          <Text className="text-lg font-bold mb-2">4. Data Security</Text>
          <Text className="text-gray-700 mb-4">
            We implement reasonable measures to help protect your personal
            information from loss, theft, misuse, and unauthorized access.
            However, no security system is impenetrable, and we cannot guarantee
            the security of your information.
          </Text>

          <Text className="text-lg font-bold mb-2">5. Your Choices</Text>
          <Text className="text-gray-700 mb-4">
            You can update your account information at any time through the app.
            You can also adjust your notification settings or delete your
            account if you wish.
          </Text>

          <Text className="text-lg font-bold mb-2">6. Children's Privacy</Text>
          <Text className="text-gray-700 mb-4">
            Our app is not directed to children under the age of 13, and we do
            not knowingly collect personal information from children under 13.
            If we learn that we have collected personal information from a child
            under 13, we will promptly delete that information.
          </Text>

          <Text className="text-lg font-bold mb-2">
            7. Changes to This Policy
          </Text>
          <Text className="text-gray-700 mb-4">
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last Updated" date.
          </Text>

          <Text className="text-lg font-bold mb-2">8. Contact Us</Text>
          <Text className="text-gray-700 mb-4">
            If you have any questions about this Privacy Policy, please contact
            us at privacy@namibiahockey.org.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
