import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  FileText,
  Send,
  Phone,
} from "lucide-react-native";

export default function HelpSupportScreen() {
  const router = useRouter();
  const [message, setMessage] = React.useState("");

  // Mock FAQ data
  const faqs = [
    {
      question: "How do I register a new team?",
      answer:
        "To register a new team, go to the Teams tab and click on the + button at the bottom right. Fill in the required information and submit for approval.",
    },
    {
      question: "How do I invite players to my team?",
      answer:
        "Navigate to your team profile, select the Players tab, and click on the Invite Player button. You can then enter the email addresses of the players you want to invite.",
    },
    {
      question: "How do I view upcoming events?",
      answer:
        "You can view all upcoming events by selecting the Events tab from the home screen. This will show you matches, tournaments, and other hockey events.",
    },
    {
      question: "How do I update my team information?",
      answer:
        "Go to your team profile, click on the Edit button (pencil icon) at the top right, and you can update your team's details from there.",
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, this would send the message to support
      alert(
        "Your message has been sent to our support team. We'll get back to you soon!",
      );
      setMessage("");
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-4 px-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Help & Support</Text>
        </View>
      </View>

      {/* Help Content */}
      <ScrollView className="flex-1 p-4">
        {/* Contact Support Section */}
        <View className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
          <Text className="p-4 text-lg font-bold text-gray-800 border-b border-gray-100">
            Contact Support
          </Text>

          <View className="p-4">
            <Text className="text-gray-600 mb-3">
              Have a question or need assistance? Send us a message and we'll
              get back to you as soon as possible.
            </Text>

            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message here..."
              multiline
              numberOfLines={4}
              className="border border-gray-300 rounded-md p-3 bg-gray-50 h-24 textAlignVertical-top mb-3"
            />

            <TouchableOpacity
              onPress={handleSendMessage}
              className="bg-blue-600 py-3 rounded-lg items-center flex-row justify-center"
            >
              <Send size={18} color="white" />
              <Text className="text-white font-semibold ml-2">
                Send Message
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
          <Text className="p-4 text-lg font-bold text-gray-800 border-b border-gray-100">
            Frequently Asked Questions
          </Text>

          {faqs.map((faq, index) => (
            <View
              key={index}
              className={`p-4 ${index < faqs.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <Text className="text-gray-800 font-semibold mb-1">
                {faq.question}
              </Text>
              <Text className="text-gray-600">{faq.answer}</Text>
            </View>
          ))}
        </View>

        {/* Additional Support Options */}
        <View className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
          <Text className="p-4 text-lg font-bold text-gray-800 border-b border-gray-100">
            Additional Support
          </Text>

          <TouchableOpacity className="p-4 flex-row items-center border-b border-gray-100">
            <Phone size={20} color="#4B5563" />
            <Text className="text-gray-800 ml-3">
              Call Support: +264 61 123 4567
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="p-4 flex-row items-center border-b border-gray-100">
            <MessageCircle size={20} color="#4B5563" />
            <Text className="text-gray-800 ml-3">Live Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity className="p-4 flex-row items-center">
            <FileText size={20} color="#4B5563" />
            <Text className="text-gray-800 ml-3">User Guide</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Live Chat Modal */}
      <Modal
        visible={showLiveChat}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLiveChat(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-xl p-4">
            <View className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <Text className="text-xl font-bold mb-4">Live Chat</Text>

            <View className="bg-gray-100 rounded-lg p-4 mb-4">
              <Text className="text-gray-800 font-medium">Support Agent</Text>
              <Text className="text-gray-600 mt-1">
                Hello! How can I help you today?
              </Text>
              <Text className="text-gray-400 text-xs mt-1">Just now</Text>
            </View>

            <View className="flex-row mb-4">
              <TextInput
                className="flex-1 bg-gray-100 rounded-lg p-3 mr-2"
                placeholder="Type your message..."
              />
              <TouchableOpacity className="bg-blue-600 rounded-lg p-3 items-center justify-center">
                <Send size={20} color="white" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-gray-200 py-3 rounded-lg items-center"
              onPress={() => setShowLiveChat(false)}
            >
              <Text className="text-gray-800 font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* User Guide Modal */}
      <Modal
        visible={showUserGuide}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserGuide(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-xl p-4 h-3/4">
            <View className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">User Guide</Text>
              <TouchableOpacity onPress={() => setShowUserGuide(false)}>
                <X size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
              <Text className="text-lg font-bold mb-2">Getting Started</Text>
              <Text className="text-gray-700 mb-4">
                Welcome to the Namibia Hockey Union app! This guide will help
                you navigate through the various features and functionalities of
                the application.
              </Text>

              <Text className="text-lg font-bold mb-2">Team Registration</Text>
              <Text className="text-gray-700 mb-4">
                To register a new team, navigate to the Teams tab and tap on the
                + button at the bottom right corner. Fill in all the required
                information about your team and submit for approval.
              </Text>

              <Text className="text-lg font-bold mb-2">
                Managing Team Members
              </Text>
              <Text className="text-gray-700 mb-4">
                Once your team is approved, you can manage team members by going
                to your team profile and selecting the Players tab. Here you can
                invite new players, approve pending requests, and manage
                existing members.
              </Text>

              <Text className="text-lg font-bold mb-2">
                Events and Tournaments
              </Text>
              <Text className="text-gray-700 mb-4">
                Stay updated with all hockey events by checking the Events tab.
                You can filter events by type (matches, tournaments, camps) to
                find what you're interested in.
              </Text>

              <Text className="text-lg font-bold mb-2">Account Settings</Text>
              <Text className="text-gray-700 mb-4">
                Manage your profile information, notification preferences, and
                privacy settings through the Profile tab. You can update your
                personal information, change your password, and adjust
                notification settings.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
