import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Linking,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Link, Copy, Mail, MessageSquare } from "lucide-react-native";

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  teamName: string;
}

const ShareModal = ({ visible, onClose, teamName }: ShareModalProps) => {
  // Generate a shareable link for the team
  const getShareableLink = () => {
    return `https://namibiahockey.org/team/${teamName.replace(/\s+/g, "-").toLowerCase()}`;
  };

  const shareOptions = [
    {
      icon: <Copy size={20} color="#4B5563" />,
      label: "Copy Link",
      onPress: async () => {
        try {
          await Clipboard.setStringAsync(getShareableLink());
          Alert.alert("Success", "Link copied to clipboard!");
          onClose();
        } catch (error) {
          Alert.alert("Error", "Failed to copy link to clipboard");
        }
      },
    },
    {
      icon: <Mail size={20} color="#4B5563" />,
      label: "Email",
      onPress: async () => {
        const url = `mailto:?subject=Check out ${teamName} on Namibia Hockey Union&body=I thought you might be interested in checking out ${teamName}: ${getShareableLink()}`;
        const canOpen = await Linking.canOpenURL(url);

        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Error", "Could not open email app");
        }
        onClose();
      },
    },
    {
      icon: <MessageSquare size={20} color="#4B5563" />,
      label: "Message",
      onPress: async () => {
        const url = `sms:?body=Check out ${teamName} on Namibia Hockey Union: ${getShareableLink()}`;
        const canOpen = await Linking.canOpenURL(url);

        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Error", "Could not open messaging app");
        }
        onClose();
      },
    },
  ];

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/30 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-xl p-4">
              <View className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

              <Text className="text-xl font-bold text-center mb-2">
                Share Team
              </Text>

              <Text className="text-gray-500 text-center mb-4">
                Share {teamName} with others
              </Text>

              <View className="flex-row justify-around mb-6">
                {shareOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    className="items-center"
                    onPress={option.onPress}
                  >
                    <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-2">
                      {option.icon}
                    </View>
                    <Text className="text-sm text-gray-800">
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                className="bg-gray-100 py-3 rounded-lg items-center"
                onPress={onClose}
              >
                <Text className="text-gray-800 font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ShareModal;
