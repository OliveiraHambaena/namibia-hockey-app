import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Image } from 'react-native';
import { TextInput, Button, HelperText, Checkbox } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const SignUpScreen = ({ navigation }: { navigation: any }) => {
  const { width, height } = useWindowDimensions();
  const isTablet = width > 768;
  const { register, loading, error } = useAuth();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  // Validate form
  const validateForm = () => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      terms?: string;
    } = {};

    // Name validation
    if (!name) {
      errors.name = 'Name is required';
    }

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

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!termsAccepted) {
      errors.terms = 'You must accept the terms and conditions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle sign up
  const handleSignUp = async () => {
    if (validateForm()) {
      const success = await register(name, email, password);
      if (success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'TabHome' }],
        });
      }
    }
  };

  // Handle sign in navigation
  const handleSignIn = () => {
    navigation.navigate('SignIn');
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
            <Text style={styles.welcomeTitle}>Create account</Text>
            <Text style={styles.welcomeSubtitle}>Sign up to join Hockey Union</Text>
          </View>
          
          {/* Error message if auth fails */}
          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#B00020" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          
          {/* Full Name input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              autoCapitalize="words"
              mode="flat"
              underlineColor="#E0E0E0"
              activeUnderlineColor="#2196F3"
              error={!!formErrors.name}
              theme={{ colors: { text: '#333', background: 'transparent' } }}
              left={<TextInput.Icon icon="account-outline" color="#757575" />}
            />
            {formErrors.name ? (
              <HelperText type="error" visible={!!formErrors.name}>
                {formErrors.name}
              </HelperText>
            ) : null}
          </View>
          
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
          
          {/* Confirm Password input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              mode="flat"
              underlineColor="#E0E0E0"
              activeUnderlineColor="#2196F3"
              error={!!formErrors.confirmPassword}
              theme={{ colors: { text: '#333', background: 'transparent' } }}
              left={<TextInput.Icon icon="lock-check-outline" color="#757575" />}
              right={<TextInput.Icon icon={showConfirmPassword ? "eye-off" : "eye"} color="#757575" onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
            />
            {formErrors.confirmPassword ? (
              <HelperText type="error" visible={!!formErrors.confirmPassword}>
                {formErrors.confirmPassword}
              </HelperText>
            ) : null}
          </View>
          
          {/* Terms and conditions */}
          <View style={styles.termsContainer}>
            <Checkbox
              status={termsAccepted ? 'checked' : 'unchecked'}
              onPress={() => setTermsAccepted(!termsAccepted)}
              color="#2196F3"
            />
            <View style={styles.termsTextContainer}>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms and Conditions</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
              {formErrors.terms ? (
                <HelperText type="error" visible={!!formErrors.terms}>
                  {formErrors.terms}
                </HelperText>
              ) : null}
            </View>
          </View>
          
          {/* Sign up button */}
          <Button
            mode="contained"
            onPress={handleSignUp}
            style={styles.signUpButton}
            contentStyle={styles.signUpButtonContent}
            labelStyle={styles.signUpButtonLabel}
            loading={loading}
            disabled={loading}
            buttonColor="#2196F3"
          >
            Sign Up
          </Button>
          
          {/* Sign in link */}
          <View style={styles.signInContainer}>
            <Text style={styles.alreadyAccountText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text style={styles.signInText}>Sign In</Text>
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
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    width: '100%',
    maxWidth: 400,
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  termsText: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  termsLink: {
    color: '#2196F3',
    fontWeight: '500',
  },
  signUpButton: {
    borderRadius: 4,
    marginBottom: 24,
    width: '100%',
    maxWidth: 400,
  },
  signUpButtonContent: {
    height: 48,
    width: '100%',
  },
  signUpButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alreadyAccountText: {
    color: '#757575',
  },
  signInText: {
    color: '#2196F3',
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default SignUpScreen;
