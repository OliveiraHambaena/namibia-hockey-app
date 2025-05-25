import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity, Text as RNText } from 'react-native';
import { Card, Avatar } from 'react-native-paper';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Appbar,
  HelperText,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { StatusBar } from 'expo-status-bar';

const ChangePasswordScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuth();
  
  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Password visibility
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  // Effect to check if user is authenticated
  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    }
  }, [user, navigation]);
  
  // Validate password
  const validatePassword = () => {
    // Reset error
    setError(null);
    
    // Check if current password is provided
    if (!currentPassword) {
      setError('Current password is required');
      return false;
    }
    
    // Check if new password is provided
    if (!newPassword) {
      setError('New password is required');
      return false;
    }
    
    // Check password length
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Check if new password is different from current password
    if (newPassword === currentPassword) {
      setError('New password must be different from current password');
      return false;
    }
    
    return true;
  };
  
  // Handle password change
  const handleChangePassword = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    
    // Validate form
    if (!validatePassword()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Updating password directly');
      
      // Update password directly without verifying current password
      // Supabase will handle the verification internally
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        console.error('Error updating password:', error.message, error.code);
        setError(`Failed to update password: ${error.message}`);
      } else {
        console.log('Password updated successfully', data);
        
        // Show success message
        setSnackbarMessage('Password updated successfully');
        setSnackbarVisible(true);
        
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Wait a moment before navigating back
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Unexpected error updating password:', err);
      setError(`Unexpected error: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigation.goBack();
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar style="light" />
      
      {/* Custom header with gradient */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#1565C0', '#0D47A1']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
              <Avatar.Icon size={36} icon="arrow-left" style={[styles.backIcon, {backgroundColor: 'transparent'}]} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change Password</Text>
            <View style={{width: 36}} />
          </View>
        </LinearGradient>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Security icon */}
        <View style={styles.securityIconContainer}>
          <Card style={styles.securityIconCard}>
            <Card.Content style={styles.securityIconContent}>
              <Avatar.Icon 
                size={80} 
                icon="shield-lock" 
                color="white" 
                style={{backgroundColor: '#1565C0'}}
              />
              <Text style={styles.securityTitle}>Update Your Password</Text>
              <Text style={styles.securitySubtitle}>Create a strong, unique password to keep your account secure</Text>
            </Card.Content>
          </Card>
        </View>
        
        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <HelperText type="error" visible={!!error} style={styles.errorText}>
              {error}
            </HelperText>
          </View>
        )}
        
        {/* Password form */}
        <Card style={styles.formCard}>
          <Card.Content>
            {/* Form fields */}
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!currentPasswordVisible}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock" color="#1565C0" />}
              right={
                <TextInput.Icon
                  icon={currentPasswordVisible ? "eye-off" : "eye"}
                  onPress={() => setCurrentPasswordVisible(!currentPasswordVisible)}
                  color="#666"
                />
              }
              outlineColor="#DDDDDD"
              activeOutlineColor="#1565C0"
            />
            
            <View style={styles.divider} />
            
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!newPasswordVisible}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock-plus" color="#1565C0" />}
              right={
                <TextInput.Icon
                  icon={newPasswordVisible ? "eye-off" : "eye"}
                  onPress={() => setNewPasswordVisible(!newPasswordVisible)}
                  color="#666"
                />
              }
              outlineColor="#DDDDDD"
              activeOutlineColor="#1565C0"
            />
            
            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!confirmPasswordVisible}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock-check" color="#1565C0" />}
              right={
                <TextInput.Icon
                  icon={confirmPasswordVisible ? "eye-off" : "eye"}
                  onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  color="#666"
                />
              }
              outlineColor="#DDDDDD"
              activeOutlineColor="#1565C0"
            />
            
            <View style={styles.infoContainer}>
              <Avatar.Icon size={20} icon="information" style={{backgroundColor: 'transparent'}} color="#1565C0" />
              <Text style={styles.infoText}>Password must be at least 6 characters long</Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleChangePassword}
            style={styles.saveButton}
            loading={loading}
            disabled={loading}
            icon="lock-reset"
            labelStyle={styles.buttonLabel}
          >
            Update Password
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.cancelButton}
            disabled={loading}
            icon="close"
            labelStyle={styles.cancelButtonLabel}
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
      
      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      )}
      
      {/* Success message */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  // Header styles
  header: {
    height: 120,
    width: '100%',
  },
  headerGradient: {
    height: '100%',
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    borderRadius: 20,
  },
  backIcon: {
    backgroundColor: 'transparent',
  },
  // Scroll view styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  // Security icon styles
  securityIconContainer: {
    marginTop: -30,
    marginBottom: 16,
  },
  securityIconCard: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  securityIconContent: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 36,
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  securitySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // Error styles
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
  },
  // Form card styles
  formCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
    marginHorizontal: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  // Button styles
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  saveButton: {
    marginBottom: 12,
    backgroundColor: '#1565C0',
    borderRadius: 8,
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderColor: '#1565C0',
    borderRadius: 8,
  },
  cancelButtonLabel: {
    fontSize: 16,
    color: '#1565C0',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChangePasswordScreen;
