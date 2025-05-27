import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Image } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordScreen = ({ navigation }: { navigation: any }) => {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  
  const { resetPassword, loading } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string }>({});
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form validation
  const validateForm = () => {
    const errors: { email?: string } = {};
    
    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle password reset request
  const handleResetPassword = async () => {
    if (validateForm()) {
      try {
        setError(null);
        console.log('ForgotPasswordScreen - Attempting to send reset email to:', email);
        
        // Attempt to send reset password email
        const success = await resetPassword(email);
        
        if (success) {
          console.log('ForgotPasswordScreen - Reset email sent successfully');
          setResetSent(true);
        } else {
          console.log('ForgotPasswordScreen - Reset email failed');
          setError('Failed to send reset email. Please try again.');
        }
      } catch (err) {
        console.error('ForgotPasswordScreen - Unexpected error during reset:', err);
        setError('An unexpected error occurred. Please try again.');
      }
    } else {
      console.log('ForgotPasswordScreen - Form validation failed');
    }
  };

  // Handle back to login
  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, isTablet && styles.tabletScrollContent]}
          keyboardShouldPersistTaps="handled"
        >
          {/* App logo */}
          <View style={styles.headerContainer}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              {resetSent 
                ? 'Password reset email has been sent. Please check your inbox.' 
                : 'Enter your email address and we\'ll send you a link to reset your password.'}
            </Text>
          </View>
          
          {/* Error message if auth fails */}
          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#B00020" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          
          {/* Success message */}
          {resetSent ? (
            <View style={styles.successContainer}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.successText}>
                Password reset link sent to your email.
              </Text>
            </View>
          ) : null}
          
          {!resetSent && (
            <>
              {/* Email input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>EMAIL</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="flat"
                  underlineColor="#E0E0E0"
                  activeUnderlineColor="#2196F3"
                  error={!!formErrors.email}
                  theme={{ colors: { text: '#333', background: 'transparent' } }}
                  left={<TextInput.Icon icon="email-outline" color="#757575" />}
                />
                {formErrors.email ? (
                  <HelperText type="error" visible={!!formErrors.email}>
                    {formErrors.email}
                  </HelperText>
                ) : null}
              </View>
              
              {/* Reset password button */}
              <Button
                mode="contained"
                onPress={handleResetPassword}
                style={styles.resetButton}
                contentStyle={styles.resetButtonContent}
                labelStyle={styles.resetButtonLabel}
                loading={loading}
                disabled={loading}
                buttonColor="#2196F3"
              >
                Reset Password
              </Button>
            </>
          )}
          
          {/* Back to login link */}
          <TouchableOpacity 
            style={styles.backToLoginContainer}
            onPress={handleBackToLogin}
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidView: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabletScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    width: '100%',
  },
  logo: {
    width: 120,
    height: 120,
  },
  titleContainer: {
    marginTop: 0,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(176, 0, 32, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#B00020',
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    maxWidth: 400,
  },
  successText: {
    color: '#4CAF50',
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
    width: '100%',
    maxWidth: 400,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#757575',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  resetButton: {
    borderRadius: 4,
    marginBottom: 24,
    width: '100%',
    maxWidth: 400,
  },
  resetButtonContent: {
    height: 48,
    width: '100%',
  },
  resetButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  backToLoginContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#2196F3',
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;
