import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, KeyboardAvoidingView, Platform, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Appbar, HelperText, Snackbar, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../utils/supabase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Define types for navigation and route props
interface AddCoachScreenProps {
  route: { params: { teamId?: string } };
  navigation: any;
}

const AddCoachScreen = ({ route, navigation }: AddCoachScreenProps) => {
  const { teamId } = route.params || {};
  
  // Form state
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [experience, setExperience] = useState('');
  const [localImage, setLocalImage] = useState<string | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form validation
  const [nameError, setNameError] = useState('');
  
  // Team details
  const [teamName, setTeamName] = useState('');
  
  // Request permission for image library access
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setSnackbarMessage('Permission to access media library is required!');
        setSnackbarVisible(true);
      }
    })();
  }, []);

  // Fetch team details
  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!teamId) {
        setSnackbarMessage('Team ID is missing');
        setSnackbarVisible(true);
        return;
      }
      
      try {
        // Fetch current team details
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('name')
          .eq('id', teamId)
          .single();
          
        if (teamError) {
          console.error('Error fetching team details:', teamError.message);
          return;
        }
        
        if (teamData) {
          setTeamName(teamData.name);
        }
      } catch (err: any) {
        console.error('Unexpected error fetching data:', err.message);
      }
    };
    
    fetchTeamDetails();
  }, [teamId]);
  
  // Pick image from library
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLocalImage(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      setSnackbarMessage('Error selecting image: ' + error.message);
      setSnackbarVisible(true);
    }
  };
  
  // Upload image to Supabase Storage
  const uploadImage = async (): Promise<string | null> => {
    if (!localImage) return null;
    
    try {
      setUploadingImage(true);
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(localImage);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }
      
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(localImage, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Get file extension
      const fileExt = localImage.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `coach-${Date.now()}.${fileExt}`;
      const filePath = `coaches/${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('team_images')
        .upload(filePath, decode(base64), {
          contentType: `image/${fileExt}`,
          upsert: true,
        });
        
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('team_images')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setSnackbarMessage('Error uploading image: ' + error.message);
      setSnackbarVisible(true);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Helper function to decode base64
  const decode = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };
  
  // Validate form
  const validateForm = () => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError('Coach name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    if (!teamId) {
      setSnackbarMessage('Team ID is missing');
      setSnackbarVisible(true);
      return;
    }
    
    setLoading(true);
    
    try {
      // Upload image if selected
      let finalImageUrl = imageUrl;
      
      if (localImage) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }
      
      // Insert coach into database
      const { data, error } = await supabase
        .from('coaches')
        .insert([
          {
            team_id: teamId,
            name,
            image_url: finalImageUrl || null,
            experience: experience || null
          }
        ])
        .select();
        
      if (error) {
        console.error('Error adding coach:', error.message);
        setSnackbarMessage(`Failed to add coach: ${error.message}`);
        setSnackbarVisible(true);
        return;
      }
      
      if (data) {
        Alert.alert(
          'Success',
          `Coach ${name} has been added to the team.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('TeamDetail', { teamId })
            }
          ]
        );
      }
    } catch (err: any) {
      console.error('Unexpected error adding coach:', err.message);
      setSnackbarMessage(`An unexpected error occurred: ${err.message}`);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Coach" subtitle={teamName ? `Team: ${teamName}` : undefined} />
      </Appbar.Header>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Coach Information</Text>
            
            {/* Name */}
            <TextInput
              label="Name *"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
              error={!!nameError}
              disabled={loading}
            />
            {nameError ? <HelperText type="error">{nameError}</HelperText> : null}
            
            {/* Image Upload */}
            <View style={styles.imageSection}>
              <Text style={styles.imageSectionTitle}>Coach Image</Text>
              
              <View style={styles.imageContainer}>
                {localImage ? (
                  <Image source={{ uri: localImage }} style={styles.imagePreview} />
                ) : imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Icon name="account-tie" size={50} color="#CCCCCC" />
                  </View>
                )}
                
                {uploadingImage && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color="#0066CC" />
                  </View>
                )}
              </View>
              
              <View style={styles.imageActions}>
                <Button
                  mode="outlined"
                  icon="camera"
                  onPress={pickImage}
                  style={styles.imageButton}
                  disabled={loading || uploadingImage}
                >
                  Select Image
                </Button>
                
                {(localImage || imageUrl) && (
                  <Button
                    mode="outlined"
                    icon="close"
                    onPress={() => {
                      setLocalImage(null);
                      setImageUrl('');
                    }}
                    style={[styles.imageButton, styles.clearButton]}
                    disabled={loading || uploadingImage}
                  >
                    Clear
                  </Button>
                )}
              </View>
              
              <Text style={styles.imageHelperText}>Or enter an image URL:</Text>
              
              <TextInput
                label="Image URL (optional)"
                value={imageUrl}
                onChangeText={setImageUrl}
                style={styles.input}
                mode="outlined"
                disabled={loading || !!localImage}
              />
            </View>
            
            {/* Experience */}
            <TextInput
              label="Experience (optional)"
              value={experience}
              onChangeText={setExperience}
              style={styles.input}
              mode="outlined"
              placeholder="e.g. 5 years, Former NHL player"
              disabled={loading}
            />
            
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={loading}
              disabled={loading || uploadingImage}
            >
              Add Coach
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
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
  // Image upload styles
  imageSection: {
    marginBottom: 16,
  },
  imageSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  imageButton: {
    marginHorizontal: 8,
  },
  clearButton: {
    borderColor: '#FF6B6B',
  },
  imageHelperText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
});

export default AddCoachScreen;
