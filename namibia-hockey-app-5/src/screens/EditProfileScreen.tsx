import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  useWindowDimensions,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Text,
  TextInput,
  Button,
  Appbar,
  Avatar,
  HelperText,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

const EditProfileScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  
  // Determine if device is tablet or large screen
  const isTablet = width > 768;
  const isLandscape = width > height;
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Load user profile data and set up real-time subscription
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const fetchProfileData = async () => {
      try {
        console.log('Fetching profile data for editing, user ID:', user.id);
        
        // Try to get data from profiles_view first
        const { data, error } = await supabase
          .from('profiles_view')
          .select('full_name, email, avatar_url, team')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile data:', error.message);
          
          // Fallback to profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, email, avatar_url, team')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.error('Fallback also failed:', profileError.message);
            setError('Could not load profile data');
          } else if (profileData) {
            console.log('Profile data fetched from profiles table:', profileData);
            // Set form data from profile
            setFullName(profileData.full_name || '');
            setEmail(profileData.email || '');
            setTeam(profileData.team || '');
            setAvatarUrl(profileData.avatar_url || '');
          }
        } else if (data) {
          console.log('Profile data fetched from profiles_view:', data);
          // Set form data from profile_view
          setFullName(data.full_name || '');
          setEmail(data.email || '');
          setTeam(data.team || '');
          setAvatarUrl(data.avatar_url || '');
        }
      } catch (err: any) {
        console.error('Unexpected error fetching profile for editing:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
    
    // Set up real-time subscription to profiles table
    // This allows the form to update in real-time if changes are made elsewhere
    const subscription = supabase
      .channel('edit-profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time profile update received in edit form:', payload);
          
          const newData = payload.new;
          // Only update form fields if they haven't been modified by the user
          // This prevents overwriting user's current edits
          if (newData) {
            // Check if user has modified the fields
            const hasModifiedName = fullName !== '' && fullName !== newData.full_name;
            const hasModifiedTeam = team !== '' && team !== newData.team;
            const hasModifiedAvatar = avatarUrl !== '' && avatarUrl !== newData.avatar_url;
            
            // Only update fields that haven't been modified
            if (!hasModifiedName) setFullName(newData.full_name || '');
            if (!hasModifiedTeam) setTeam(newData.team || '');
            if (!hasModifiedAvatar) setAvatarUrl(newData.avatar_url || '');
            
            // Always update email as it's read-only
            setEmail(newData.email || '');
          }
        }
      )
      .subscribe();
    
    // Clean up subscription when component unmounts
    return () => {
      console.log('Unsubscribing from profile changes in edit form');
      subscription.unsubscribe();
    };
  }, [user]);
  
  // Generate avatar placeholder if no avatar URL
  const getAvatarPlaceholder = () => {
    const initials = fullName
      ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
      : email
        ? email.substring(0, 2).toUpperCase()
        : 'US';
    
    return `https://via.placeholder.com/150/1565C0/FFFFFF?text=${initials}`;
  };
  
  // Handle form submission
  const handleSave = async () => {
    if (!user) return;
    
    // Validate form
    if (!fullName.trim()) {
      setError('Name is required');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      // Prepare update data
      const updateData = {
        full_name: fullName.trim(),
        team: team.trim(),
        avatar_url: avatarUrl || getAvatarPlaceholder(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Updating profile with data:', updateData);
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating profile:', error.message);
        setError('Failed to update profile');
      } else {
        console.log('Profile updated successfully');
        
        // Show success message
        setSnackbarMessage('Profile updated successfully');
        setSnackbarVisible(true);
        
        // Wait a moment before navigating back
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Unexpected error updating profile:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigation.goBack();
  };
  
  // Handle avatar selection
  const handleAvatarOptions = () => {
    setModalVisible(true);
  };

  // Pick image from gallery
  const pickImage = async () => {
    setModalVisible(false);
    
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Use the selected image URI
        setAvatarUrl(result.assets[0].uri);
        console.log('Selected image URI:', result.assets[0].uri);
        
        // Here you would typically upload the image to your storage
        // and then update the user's profile with the new URL
        // For now, we'll just update the local state
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };
  
  // Generate random avatar
  const generateRandomAvatar = () => {
    setModalVisible(false);
    // Generate a random avatar URL
    const randomId = Math.floor(Math.random() * 1000);
    setAvatarUrl(`https://i.pravatar.cc/300?img=${randomId}`);
  };
  
  // Refresh profile data from server
  const refreshProfileData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles_view')
        .select('full_name, email, avatar_url, team')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error refreshing profile data:', error.message);
        setError('Failed to refresh profile data');
      } else if (data) {
        console.log('Profile data refreshed:', data);
        setFullName(data.full_name || '');
        setEmail(data.email || '');
        setTeam(data.team || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (err: any) {
      console.error('Unexpected error refreshing profile:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1565C0" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar style="light" />
      
      {/* Custom header with gradient */}
      <View style={[styles.header, isTablet && styles.headerTablet]}>
        <LinearGradient
          colors={['#1565C0', '#0D47A1']}
          style={styles.headerGradient}
        >
          <View style={[styles.headerContent, isTablet && styles.headerContentTablet]}>
            <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
              <Avatar.Icon 
                size={isTablet ? 48 : 36} 
                icon="arrow-left" 
                style={[styles.backIcon, {backgroundColor: 'transparent'}]} 
                color="white" 
              />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, isTablet && styles.headerTitleTablet]}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveIcon}>
              <Avatar.Icon 
                size={isTablet ? 48 : 36} 
                icon="content-save" 
                color="white" 
                style={[{backgroundColor: 'transparent'}, saving ? styles.disabledIcon : {}]}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, isTablet && styles.scrollContentTablet]}
      >
        {/* Profile card with avatar */}
        <Card style={[styles.profileCard, isTablet && styles.profileCardTablet]}>
          <Card.Content style={styles.profileCardContent}>
            {/* Avatar section */}
            <View style={styles.avatarContainer}>
              <Avatar.Image
                source={{ uri: avatarUrl || getAvatarPlaceholder() }}
                size={isTablet ? 160 : 120}
                style={[styles.avatar, isTablet && styles.avatarTablet]}
              />
              <TouchableOpacity 
                style={[styles.changeAvatarButton, isTablet && styles.changeAvatarButtonTablet]} 
                onPress={handleAvatarOptions}
              >
                <LinearGradient
                  colors={['#1565C0', '#0D47A1']}
                  style={[styles.changeAvatarGradient, isTablet && styles.changeAvatarGradientTablet]}
                >
                  <Text style={[styles.changeAvatarText, isTablet && styles.changeAvatarTextTablet]}>Change Avatar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
        
        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <HelperText type="error" visible={!!error} style={styles.errorText}>
              {error}
            </HelperText>
          </View>
        )}
        
        {/* Form card */}
        <Card style={[styles.formCard, isTablet && styles.formCardTablet]}>
          <Card.Content style={isTablet && styles.formContentTablet}>
            <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>Personal Information</Text>
            
            {/* Form fields */}
            <View style={isTablet && isLandscape ? styles.formRowTablet : null}>
              <TextInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                style={[styles.input, isTablet && styles.inputTablet, 
                  isTablet && isLandscape && styles.inputHalfWidth]}
                mode="outlined"
                autoCapitalize="words"
                left={<TextInput.Icon icon="account" color="#1565C0" />}
                outlineColor="#DDDDDD"
                activeOutlineColor="#1565C0"
              />
              
              <TextInput
                label="Email"
                value={email}
                disabled={true}
                style={[styles.input, isTablet && styles.inputTablet, 
                  isTablet && isLandscape && styles.inputHalfWidth]}
                mode="outlined"
                keyboardType="email-address"
                left={<TextInput.Icon icon="email" color="#1565C0" />}
                outlineColor="#DDDDDD"
                activeOutlineColor="#1565C0"
              />
            </View>
            
            <TextInput
              label="Team"
              value={team}
              onChangeText={setTeam}
              style={[styles.input, isTablet && styles.inputTablet]}
              mode="outlined"
              left={<TextInput.Icon icon="account-group" color="#1565C0" />}
              outlineColor="#DDDDDD"
              activeOutlineColor="#1565C0"
            />
          </Card.Content>
        </Card>
        
        {/* Action buttons */}
        <View style={[styles.buttonContainer, isTablet && styles.buttonContainerTablet]}>
          {isTablet && isLandscape ? (
            <View style={styles.buttonRowTablet}>
              <Button
                mode="contained"
                onPress={handleSave}
                style={[styles.saveButton, styles.buttonHalfWidth]}
                loading={saving}
                disabled={saving}
                icon="content-save"
                labelStyle={[styles.buttonLabel, isTablet && styles.buttonLabelTablet]}
              >
                Save Changes
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleCancel}
                style={[styles.cancelButton, styles.buttonHalfWidth]}
                disabled={saving}
                icon="close"
                labelStyle={[styles.cancelButtonLabel, isTablet && styles.buttonLabelTablet]}
              >
                Cancel
              </Button>
            </View>
          ) : (
            <>
              <Button
                mode="contained"
                onPress={handleSave}
                style={[styles.saveButton, isTablet && styles.saveButtonTablet]}
                loading={saving}
                disabled={saving}
                icon="content-save"
                labelStyle={[styles.buttonLabel, isTablet && styles.buttonLabelTablet]}
              >
                Save Changes
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleCancel}
                style={[styles.cancelButton, isTablet && styles.cancelButtonTablet]}
                disabled={saving}
                icon="close"
                labelStyle={[styles.cancelButtonLabel, isTablet && styles.buttonLabelTablet]}
              >
                Cancel
              </Button>
            </>
          )}
        </View>
      </ScrollView>
      
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
      
      {/* Avatar options modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, isTablet && styles.modalContentTablet]}>
            <Text style={styles.modalTitle}>Choose Avatar Option</Text>
            
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={pickImage}
            >
              <Avatar.Icon size={24} icon="image" style={{backgroundColor: 'transparent'}} color="#1565C0" />
              <Text style={styles.modalButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={generateRandomAvatar}
            >
              <Avatar.Icon size={24} icon="refresh" style={{backgroundColor: 'transparent'}} color="#1565C0" />
              <Text style={styles.modalButtonText}>Generate Random Avatar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelModalButton]} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// Get screen dimensions for initial styles
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const initialIsTablet = screenWidth > 768;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  // Header styles
  header: {
    height: 120,
    width: '100%',
  },
  headerTablet: {
    height: 160,
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
  headerContentTablet: {
    paddingHorizontal: 24,
    height: 80,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitleTablet: {
    fontSize: 28,
  },
  backButton: {
    borderRadius: 20,
  },
  backIcon: {
    backgroundColor: 'transparent',
  },
  saveIcon: {
    borderRadius: 20,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  // Scroll view styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  scrollContentTablet: {
    padding: 24,
    paddingTop: 0,
    alignItems: initialIsTablet ? 'center' : 'stretch',
  },
  // Profile card styles
  profileCard: {
    marginTop: -30,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  profileCardTablet: {
    marginTop: -50,
    borderRadius: 16,
    elevation: 6,
    width: '90%',
    maxWidth: 800,
    alignSelf: 'center',
    marginBottom: 24,
  },
  profileCardContent: {
    paddingVertical: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  avatar: {
    borderWidth: 4,
    borderColor: 'white',
  },
  avatarTablet: {
    borderWidth: 6,
  },
  changeAvatarButton: {
    marginTop: 16,
    overflow: 'hidden',
    borderRadius: 20,
  },
  changeAvatarButtonTablet: {
    marginTop: 24,
  },
  changeAvatarGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changeAvatarGradientTablet: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  changeAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  changeAvatarTextTablet: {
    fontSize: 16,
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
  formCardTablet: {
    borderRadius: 16,
    elevation: 3,
    width: '90%',
    maxWidth: 800,
    alignSelf: 'center',
    marginBottom: 24,
  },
  formContentTablet: {
    padding: 16,
  },
  formRowTablet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionTitleTablet: {
    fontSize: 22,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  inputTablet: {
    marginBottom: 24,
    fontSize: 16,
  },
  inputHalfWidth: {
    width: '48%',
  },
  // Button styles
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  buttonContainerTablet: {
    width: '90%',
    maxWidth: 800,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  buttonRowTablet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonHalfWidth: {
    width: '48%',
  },
  saveButton: {
    marginBottom: 12,
    backgroundColor: '#1565C0',
    borderRadius: 8,
    paddingVertical: 6,
  },
  saveButtonTablet: {
    marginBottom: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonLabelTablet: {
    fontSize: 18,
  },
  cancelButton: {
    borderColor: '#1565C0',
    borderRadius: 8,
  },
  cancelButtonTablet: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  cancelButtonLabel: {
    fontSize: 16,
    color: '#1565C0',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContentTablet: {
    padding: 24,
    width: '60%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#F5F7FA',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  cancelModalButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  cancelModalButtonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    width: '100%',
  },
});

export default EditProfileScreen;
