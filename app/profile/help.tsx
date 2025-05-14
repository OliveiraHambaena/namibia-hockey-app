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
    </View>
  );
}
