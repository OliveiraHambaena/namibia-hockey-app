import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  Chip,
  HelperText,
  ActivityIndicator,
  Snackbar,
  IconButton,
  Menu,
  Dialog,
  Portal
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

// Define types for the component props
type CreateTeamScreenProps = {
  navigation: any;
};

// Define types for division/conference options
type Option = {
  id: string;
  name: string;
};

const CreateTeamScreen = ({ navigation }: CreateTeamScreenProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [division, setDivision] = useState('');
  const [conference, setConference] = useState('');
  const [category, setCategory] = useState('Professional');

  // Dropdown menus
  const [divisionMenuVisible, setDivisionMenuVisible] = useState(false);
  const [conferenceMenuVisible, setConferenceMenuVisible] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);

  // Options for dropdowns
  const divisions: Option[] = [
    { id: 'north', name: 'Northern' },
    { id: 'central', name: 'Central' },
    { id: 'coastal', name: 'Coastal' },
    { id: 'south', name: 'Southern' }
  ];

  const conferences: Option[] = [
    { id: 'premier', name: 'Premier' },
    { id: 'first', name: 'First Division' },
    { id: 'second', name: 'Second Division' }
  ];

  const categories: Option[] = [
    { id: 'professional', name: 'Professional' },
    { id: 'amateur', name: 'Amateur' },
    { id: 'youth', name: 'Youth' },
    { id: 'women', name: 'Women' }
  ];

  // Pick logo image from library
  const pickLogoImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLogoImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking logo image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Pick cover image from library
  const pickCoverImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCoverImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking cover image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Upload image to Supabase storage
  const uploadImage = async (uri: string, folder: string) => {
    try {
      // Convert image URI to base64
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
      
      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;
      const base64String = String(base64Data).split(',')[1];
      
      // Generate a unique filename
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      // Upload the file to team_images bucket
      const { error: uploadError, data } = await supabase.storage
        .from('team_images')
        .upload(filePath, decode(base64String), {
          contentType: `image/${fileExt}`,
          upsert: true
        });
        
      if (uploadError) {
        console.error('Error uploading image:', uploadError.message);
        throw uploadError;
      }
      
      // Get the public URL from team_images bucket
      const { data: urlData } = supabase.storage
        .from('team_images')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    } catch (err: any) {
      console.error('Unexpected error uploading image:', err.message);
      
      // Fallback to placeholder if upload fails
      const color = getRandomColor();
      const isLogo = folder === 'logos';
      
      if (isLogo) {
        return `https://via.placeholder.com/150x150/${color}/FFFFFF?text=${name.substring(0, 2).toUpperCase()}`;
      } else {
        return `https://via.placeholder.com/600x300/${color}/FFFFFF?text=${name.replace(/ /g, '+')}`;
      }
    }
  };

  // Generate placeholder image URL based on team name
  const generatePlaceholderImage = (isLogo: boolean) => {
    const color = getRandomColor();
    if (isLogo) {
      // Logo placeholder (square)
      return `https://via.placeholder.com/150x150/${color}/FFFFFF?text=${name.substring(0, 2).toUpperCase()}`;
    } else {
      // Cover placeholder (wide)
      return `https://via.placeholder.com/600x300/${color}/FFFFFF?text=${name.replace(/ /g, '+')}`;
    }
  };

  // Generate random color for placeholder images
  const getRandomColor = () => {
    const colors = ['0066CC', 'FF6B6B', '4CAF50', 'FFC107', '9C27B0', '795548'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Validate form
  const validateForm = () => {
    if (!name.trim()) {
      setError('Team name is required');
      return false;
    }
    
    if (!city.trim()) {
      setError('City is required');
      return false;
    }
    
    if (!division) {
      setError('Please select a division');
      return false;
    }
    
    if (!conference) {
      setError('Please select a conference');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to create a team');
      return;
    }
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Upload images if available, otherwise use placeholders
      let logoUrl = '';
      let coverUrl = '';
      
      // Upload logo image (required)
      if (logoImage) {
        try {
          logoUrl = await uploadImage(logoImage, 'logos');
          console.log('Logo uploaded successfully:', logoUrl);
        } catch (uploadError: any) {
          console.error('Logo upload failed:', uploadError.message);
          // Use placeholder if upload fails
          logoUrl = generatePlaceholderImage(true);
        }
      } else {
        // Use placeholder if no logo selected
        logoUrl = generatePlaceholderImage(true);
      }
      
      // Upload cover image (optional)
      if (coverImage) {
        try {
          coverUrl = await uploadImage(coverImage, 'covers');
          console.log('Cover uploaded successfully:', coverUrl);
        } catch (uploadError: any) {
          console.error('Cover upload failed:', uploadError.message);
          // Use placeholder if upload fails
          coverUrl = generatePlaceholderImage(false);
        }
      } else {
        // Use placeholder if no cover selected
        coverUrl = generatePlaceholderImage(false);
      }
      
      // Create team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name,
          city,
          logo_url: logoUrl,
          cover_image_url: coverUrl,
          division: getDivisionName(),
          conference: getConferenceName(),
          standing: '',
          record: '0-0-0',
          points: 0
        })
        .select()
        .single();
        
      if (teamError) {
        console.error('Error creating team:', teamError.message);
        setError(`Failed to create team: ${teamError.message}`);
        return;
      }
      
      // Create empty team stats
      if (teamData) {
        const { error: statsError } = await supabase
          .from('team_stats')
          .insert({
            team_id: teamData.id,
            goals_for: 0,
            goals_against: 0,
            power_play_percentage: '0%',
            penalty_kill_percentage: '0%',
            shots_per_game: 0,
            faceoff_percentage: '0%'
          });
          
        if (statsError) {
          console.error('Error creating team stats:', statsError.message);
          // Don't fail the whole operation if stats creation fails
        }
      }
      
      // Show success message
      setSnackbarMessage('Team created successfully!');
      setSnackbarVisible(true);
      
      // Navigate back to Teams screen
      navigation.navigate('Teams');
      
    } catch (err: any) {
      console.error('Unexpected error creating team:', err.message);
      setError(`Unexpected error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigation.goBack();
  };

  // Get division name from id
  const getDivisionName = () => {
    const div = divisions.find(d => d.id === division);
    return div ? div.name : '';
  };

  // Get conference name from id
  const getConferenceName = () => {
    const conf = conferences.find(c => c.id === conference);
    return conf ? conf.name : '';
  };

  // Get category name from id
  const getCategoryName = () => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.name : 'Professional';
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#0066CC', '#1E88E5']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleCancel}
            >
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New Team</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Team Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Team Information</Text>
            
            <TextInput
              label="Team Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
              placeholder="Enter team name"
              left={<TextInput.Icon icon="hockey-sticks" color="#1565C0" />}
              outlineColor="#DDDDDD"
              activeOutlineColor="#1565C0"
            />
            
            <TextInput
              label="City"
              value={city}
              onChangeText={setCity}
              style={styles.input}
              mode="outlined"
              placeholder="Enter city"
              left={<TextInput.Icon icon="map-marker" color="#1565C0" />}
              outlineColor="#DDDDDD"
              activeOutlineColor="#1565C0"
            />
            
            {/* Division Dropdown */}
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Division</Text>
              <Menu
                visible={divisionMenuVisible}
                onDismiss={() => setDivisionMenuVisible(false)}
                anchor={
                  <TouchableOpacity 
                    style={styles.dropdown}
                    onPress={() => setDivisionMenuVisible(true)}
                  >
                    <Text style={styles.dropdownText}>
                      {division ? getDivisionName() : 'Select Division'}
                    </Text>
                    <Icon name="chevron-down" size={20} color="#666666" />
                  </TouchableOpacity>
                }
              >
                {divisions.map((div) => (
                  <Menu.Item
                    key={div.id}
                    onPress={() => {
                      setDivision(div.id);
                      setDivisionMenuVisible(false);
                    }}
                    title={div.name}
                  />
                ))}
              </Menu>
            </View>
            
            {/* Conference Dropdown */}
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Conference</Text>
              <Menu
                visible={conferenceMenuVisible}
                onDismiss={() => setConferenceMenuVisible(false)}
                anchor={
                  <TouchableOpacity 
                    style={styles.dropdown}
                    onPress={() => setConferenceMenuVisible(true)}
                  >
                    <Text style={styles.dropdownText}>
                      {conference ? getConferenceName() : 'Select Conference'}
                    </Text>
                    <Icon name="chevron-down" size={20} color="#666666" />
                  </TouchableOpacity>
                }
              >
                {conferences.map((conf) => (
                  <Menu.Item
                    key={conf.id}
                    onPress={() => {
                      setConference(conf.id);
                      setConferenceMenuVisible(false);
                    }}
                    title={conf.name}
                  />
                ))}
              </Menu>
            </View>
            
            {/* Category Dropdown */}
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Category</Text>
              <Menu
                visible={categoryMenuVisible}
                onDismiss={() => setCategoryMenuVisible(false)}
                anchor={
                  <TouchableOpacity 
                    style={styles.dropdown}
                    onPress={() => setCategoryMenuVisible(true)}
                  >
                    <Text style={styles.dropdownText}>
                      {category ? getCategoryName() : 'Select Category'}
                    </Text>
                    <Icon name="chevron-down" size={20} color="#666666" />
                  </TouchableOpacity>
                }
              >
                {categories.map((cat) => (
                  <Menu.Item
                    key={cat.id}
                    onPress={() => {
                      setCategory(cat.id);
                      setCategoryMenuVisible(false);
                    }}
                    title={cat.name}
                  />
                ))}
              </Menu>
            </View>
          </Card.Content>
        </Card>
        
        {/* Team Images Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Team Images</Text>
            
            {/* Logo Image */}
            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>Team Logo</Text>
              <Text style={styles.imageDescription}>
                Upload a square logo image for your team
              </Text>
              
              <TouchableOpacity 
                style={styles.imagePickerButton}
                onPress={pickLogoImage}
              >
                {logoImage ? (
                  <Image 
                    source={{ uri: logoImage }} 
                    style={styles.logoPreview} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Icon name="image-plus" size={40} color="#AAAAAA" />
                    <Text style={styles.placeholderText}>Add Logo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            
            <Divider style={styles.divider} />
            
            {/* Cover Image */}
            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>Cover Image</Text>
              <Text style={styles.imageDescription}>
                Upload a wide cover image for your team profile
              </Text>
              
              <TouchableOpacity 
                style={styles.coverPickerButton}
                onPress={pickCoverImage}
              >
                {coverImage ? (
                  <Image 
                    source={{ uri: coverImage }} 
                    style={styles.coverPreview} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.coverPlaceholder}>
                    <Icon name="image-plus" size={40} color="#AAAAAA" />
                    <Text style={styles.placeholderText}>Add Cover Image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
        
        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            loading={saving}
            disabled={saving}
            icon="content-save"
            labelStyle={styles.buttonLabel}
          >
            Create Team
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.cancelButton}
            disabled={saving}
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
          <ActivityIndicator size="large" color="#1565C0" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
      
      {/* Snackbar for feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
        style={styles.snackbar}
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
  header: {
    height: 120,
    width: '100%',
  },
  headerGradient: {
    height: '100%',
    width: '100%',
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333333',
  },
  imageSection: {
    marginBottom: 16,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333333',
  },
  imageDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  imagePickerButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  logoPreview: {
    width: 120,
    height: 120,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderStyle: 'dashed',
  },
  coverPickerButton: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  coverPreview: {
    width: '100%',
    height: 160,
  },
  coverPlaceholder: {
    width: '100%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },
  divider: {
    marginVertical: 16,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  submitButton: {
    marginBottom: 12,
    backgroundColor: '#1565C0',
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderColor: '#999999',
  },
  cancelButtonLabel: {
    color: '#666666',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
  snackbar: {
    backgroundColor: '#323232',
    borderRadius: 4,
    marginBottom: 20,
  },
});

export default CreateTeamScreen;
