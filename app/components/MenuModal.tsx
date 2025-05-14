import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Settings, HelpCircle, Info, LogOut } from "lucide-react-native";
import { useRouter } from "expo-router";

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
}

const MenuModal = ({ visible, onClose }: MenuModalProps) => {
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, implement actual logout logic
    onClose();
    router.replace("/");
  };

  const menuItems = [
    {
      icon: <Settings size={20} color="#4B5563" />,
      label: "Settings",
      onPress: () => {
        onClose();
        console.log("Settings pressed");
      },
    },
    {
      icon: <Info size={20} color="#4B5563" />,
      label: "About",
      onPress: () => {
        onClose();
        console.log("About pressed");
      },
    },
    {
      icon: <HelpCircle size={20} color="#4B5563" />,
      label: "Help",
      onPress: () => {
        onClose();
        console.log("Help pressed");
      },
    },
    {
      icon: <LogOut size={20} color="#EF4444" />,
      label: "Logout",
      onPress: handleLogout,
      textColor: "text-red-500",
    },
  ];

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/30 justify-start items-end">
          <TouchableWithoutFeedback>
            <View className="bg-white w-56 mt-24 mr-4 rounded-lg shadow-lg overflow-hidden">
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className={`flex-row items-center p-4 ${index < menuItems.length - 1 ? "border-b border-gray-100" : ""}`}
                  onPress={item.onPress}
                >
                  {item.icon}
                  <Text className={`ml-3 ${item.textColor || "text-gray-800"}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MenuModal;
