import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const CreateNewsButton = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  // Only show button for admin users
  if (!user || user.role !== 'admin') {
    return null;
  }
  
  return (
    <TouchableOpacity 
      style={styles.fab}
      onPress={() => navigation.navigate('CreateNews')}
    >
      <Icon name="plus" size={24} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  }
});

export default CreateNewsButton;
