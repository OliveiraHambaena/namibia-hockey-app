import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Image } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const SignInScreen = ({ navigation }: { navigation: any }) => {
  const { width, height } = useWindowDimensions();
  const isTablet = width > 768;
  
  const { login, loading, error } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  // Form validation
  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    
    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle sign in
  const handleSignIn = async () => {
    if (validateForm()) {
      const success = await login(email, password);
      if (success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'TabHome' }],
        });
      }
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    // Navigate to forgot password screen or show modal
    console.log('Forgot password');
  };

  // Handle sign up navigation
  const handleSignUp = () => {
    navigation.navigate('SignUp');
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
          
          {/* Welcome text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to continue to Hockey Union</Text>
          </View>
          
          {/* Error message if auth fails */}
          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#B00020" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          
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
          
          {/* Password input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              mode="flat"
              underlineColor="#E0E0E0"
              activeUnderlineColor="#2196F3"
              error={!!formErrors.password}
              theme={{ colors: { text: '#333', background: 'transparent' } }}
              left={<TextInput.Icon icon="lock-outline" color="#757575" />}
              right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} color="#757575" onPress={() => setShowPassword(!showPassword)} />}
            />
            {formErrors.password ? (
              <HelperText type="error" visible={!!formErrors.password}>
                {formErrors.password}
              </HelperText>
            ) : null}
          </View>
          
          {/* Forgot password link */}
          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          
          {/* Sign in button */}
          <Button
            mode="contained"
            onPress={handleSignIn}
            style={styles.signInButton}
            contentStyle={styles.signInButtonContent}
            labelStyle={styles.signInButtonLabel}
            loading={loading}
            disabled={loading}
            buttonColor="#2196F3"
          >
            Sign In
          </Button>
          
          {/* Sign up link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.noAccountText}>Don't have an account?</Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
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
  welcomeContainer: {
    marginTop: 0,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#757575',
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    width: '100%',
    maxWidth: 400,
  },
  forgotPasswordText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  signInButton: {
    borderRadius: 4,
    marginBottom: 24,
    width: '100%',
    maxWidth: 400,
  },
  signInButtonContent: {
    height: 48,
    width: '100%',
  },
  signInButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAccountText: {
    color: '#757575',
  },
  signUpText: {
    color: '#2196F3',
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default SignInScreen;
