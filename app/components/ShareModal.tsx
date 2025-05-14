import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Link, Copy, Mail, MessageSquare } from "lucide-react-native";

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  teamName: string;
}

const ShareModal = ({ visible, onClose, teamName }: ShareModalProps) => {
  const shareOptions = [
    {
      icon: <Copy size={20} color="#4B5563" />,
      label: "Copy Link",
      onPress: () => {
        console.log("Link copied");
        onClose();
      },
    },
    {
      icon: <Mail size={20} color="#4B5563" />,
      label: "Email",
      onPress: () => {
        console.log("Share via email");
        onClose();
      },
    },
    {
      icon: <MessageSquare size={20} color="#4B5563" />,
      label: "Message",
      onPress: () => {
        console.log("Share via message");
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
