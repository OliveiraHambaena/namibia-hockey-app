import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Platform, Alert, Modal } from 'react-native';
import { Text, TextInput, Button, useTheme, Chip, Divider, HelperText, ActivityIndicator, Portal, Dialog, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

// Define types for the component props
type CreateTournamentScreenProps = {
  navigation: any;
  route: any;
};

const CreateTournamentScreen = ({ navigation, route }: CreateTournamentScreenProps) => {
  const theme = useTheme();
  const { user } = useAuth();
  
  // Predefined categories for hockey tournaments
  const predefinedCategories = [
    'Adult',
    'Youth',
    'Senior Men',
    'Senior Women',
    'Junior Men',
    'Junior Women',
    'Under-21',
    'Under-18',
    'Under-16',
    'Under-14',
    'Masters',
    'Mixed',
    'Indoor',
    'Outdoor',
    'Professional',
    'Amateur',
    'School',
    'Club',
    'National',
    'International'
  ];
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [registrationDeadline, setRegistrationDeadline] = useState(new Date());
  const [maxTeams, setMaxTeams] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [rules, setRules] = useState<string[]>(['']);
  
  // Image state
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Date picker state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  
  // Temporary date state for dialogs
  const [tempDate, setTempDate] = useState(new Date());
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form validation
  const [errors, setErrors] = useState({
    title: '',
    location: '',
    maxTeams: '',
  });
  
  // Request permissions for camera and media library
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaStatus !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images!');
        }
      }
    })();
  }, []);
  
  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: '',
      location: '',
      maxTeams: '',
    };
    
    if (!title.trim()) {
      newErrors.title = 'Tournament title is required';
      isValid = false;
    }
    
    if (!location.trim()) {
      newErrors.location = 'Tournament location is required';
      isValid = false;
    }
    
    if (maxTeams && isNaN(Number(maxTeams))) {
      newErrors.maxTeams = 'Maximum teams must be a number';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle image selection
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  
  // Upload image to Supabase storage
  const uploadImage = async () => {
    if (!image) return null;
    
    try {
      setUploading(true);
      
      // Get file extension
      const fileExt = image.split('.').pop()?.toLowerCase() || 'jpg';
      
      // Create a unique file path
      const filePath = `${user?.id}_${Date.now()}.${fileExt}`;
      
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from('tournament_images')
        .upload(filePath, decode(base64), {
          contentType: `image/${fileExt}`,
          upsert: true,
        });
      
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tournament_images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  // Add a new category
  const addCategory = () => {
    if (selectedCategory && !categories.includes(selectedCategory)) {
      setCategories([...categories, selectedCategory]);
      setSelectedCategory('');
      setShowCategoryDropdown(false);
    }
  };
  
  // Remove a category
  const removeCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    setCategories(newCategories);
  };
  
  // Add a new rule
  const addRule = () => {
    setRules([...rules, '']);
  };
  
  // Update a rule
  const updateRule = (text: string, index: number) => {
    const newRules = [...rules];
    newRules[index] = text;
    setRules(newRules);
  };
  
  // Remove a rule
  const removeRule = (index: number) => {
    if (rules.length > 1) {
      const newRules = [...rules];
      newRules.splice(index, 1);
      setRules(newRules);
    }
  };
  
  // Handle date changes
  const onStartDateChange = () => {
    setStartDate(tempDate);
    // If end date is before start date, update it
    if (endDate < tempDate) {
      setEndDate(tempDate);
    }
    setShowStartDatePicker(false);
  };
  
  const onEndDateChange = () => {
    setEndDate(tempDate);
    setShowEndDatePicker(false);
  };
  
  const onDeadlineChange = () => {
    setRegistrationDeadline(tempDate);
    setShowDeadlinePicker(false);
  };
  
  // Open date pickers with the current value
  const openStartDatePicker = () => {
    setTempDate(startDate);
    setShowStartDatePicker(true);
  };
  
  const openEndDatePicker = () => {
    setTempDate(endDate);
    setShowEndDatePicker(true);
  };
  
  const openDeadlinePicker = () => {
    setTempDate(registrationDeadline);
    setShowDeadlinePicker(true);
  };
  
  // Helper function to adjust date
  const adjustDate = (amount: number) => {
    const newDate = new Date(tempDate);
    newDate.setDate(newDate.getDate() + amount);
    setTempDate(newDate);
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Submit the form
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // Upload image if selected
      const imageUrl = image ? await uploadImage() : null;
      
      // Filter out empty rules
      const filteredRules = rules.filter(rule => rule.trim() !== '');
      
      // Create tournament in Supabase
      const { data, error } = await supabase
        .from('tournaments')
        .insert([
          {
            title,
            description,
            location,
            full_address: fullAddress,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            registration_deadline: registrationDeadline.toISOString(),
            status: 'Draft',
            status_color: '#666666',
            image_url: imageUrl,
            max_teams: maxTeams ? parseInt(maxTeams) : null,
            prize_pool: prizePool,
            entry_fee: entryFee,
            user_id: user?.id,
            organizer_id: user?.id,
          }
        ])
        .select();
      
      if (error) {
        throw error;
      }
      
      const tournamentId = data[0].id;
      
      // Add categories
      if (categories.length > 0) {
        const categoryInserts = categories.map(category => ({
          tournament_id: tournamentId,
          category_name: category,
        }));
        
        const { error: categoryError } = await supabase
          .from('tournament_categories')
          .insert(categoryInserts);
        
        if (categoryError) {
          console.error('Error adding categories:', categoryError);
        }
      }
      
      // Add rules
      if (filteredRules.length > 0) {
        const ruleInserts = filteredRules.map((rule, index) => ({
          tournament_id: tournamentId,
          rule_text: rule,
          rule_order: index + 1,
        }));
        
        const { error: ruleError } = await supabase
          .from('tournament_rules')
          .insert(ruleInserts);
        
        if (ruleError) {
          console.error('Error adding rules:', ruleError);
        }
      }
      
      Alert.alert(
        'Success',
        'Tournament created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('TournamentDetail', { tournamentId }),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating tournament:', error);
      Alert.alert('Error', error.message || 'Failed to create tournament. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Tournament</Text>
            <View style={{ width: 40 }} />
          </View>
          
          {/* Tournament Image */}
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={pickImage}
            disabled={uploading}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="image-plus" size={40} color="#CCCCCC" />
                <Text style={styles.imagePlaceholderText}>Add Tournament Banner</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {uploading && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color="#0066CC" />
              <Text style={styles.uploadingText}>Uploading image...</Text>
            </View>
          )}
          
          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Tournament Details</Text>
            
            {/* Title */}
            <TextInput
              label="Tournament Title*"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              mode="outlined"
              error={!!errors.title}
            />
            {errors.title ? <HelperText type="error">{errors.title}</HelperText> : null}
            
            {/* Description */}
            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
            />
            
            {/* Location */}
            <TextInput
              label="Location*"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
              mode="outlined"
              error={!!errors.location}
            />
            {errors.location ? <HelperText type="error">{errors.location}</HelperText> : null}
            
            {/* Full Address */}
            <TextInput
              label="Full Address"
              value={fullAddress}
              onChangeText={setFullAddress}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={2}
            />
            
            {/* Dates */}
            <Text style={styles.subsectionTitle}>Tournament Dates</Text>
            
            {/* Start Date */}
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={openStartDatePicker}
            >
              <Text style={styles.dateLabel}>Start Date:</Text>
              <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
              <Icon name="calendar" size={20} color="#0066CC" />
            </TouchableOpacity>
            
            {/* End Date */}
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={openEndDatePicker}
            >
              <Text style={styles.dateLabel}>End Date:</Text>
              <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
              <Icon name="calendar" size={20} color="#0066CC" />
            </TouchableOpacity>
            
            {/* Registration Deadline */}
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={openDeadlinePicker}
            >
              <Text style={styles.dateLabel}>Registration Deadline:</Text>
              <Text style={styles.dateValue}>{formatDate(registrationDeadline)}</Text>
              <Icon name="calendar" size={20} color="#0066CC" />
            </TouchableOpacity>
            
            <Divider style={styles.divider} />
            
            {/* Tournament Settings */}
            <Text style={styles.subsectionTitle}>Tournament Settings</Text>
            
            {/* Max Teams */}
            <TextInput
              label="Maximum Teams"
              value={maxTeams}
              onChangeText={setMaxTeams}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
              error={!!errors.maxTeams}
            />
            {errors.maxTeams ? <HelperText type="error">{errors.maxTeams}</HelperText> : null}
            
            {/* Prize Pool */}
            <TextInput
              label="Prize Pool"
              value={prizePool}
              onChangeText={setPrizePool}
              style={styles.input}
              mode="outlined"
              placeholder="e.g. $5,000"
            />
            
            {/* Entry Fee */}
            <TextInput
              label="Entry Fee"
              value={entryFee}
              onChangeText={setEntryFee}
              style={styles.input}
              mode="outlined"
              placeholder="e.g. $250 per team"
            />
            
            <Divider style={styles.divider} />
            
            {/* Categories */}
            <Text style={styles.subsectionTitle}>Tournament Categories</Text>
            
            <View style={styles.categoriesContainer}>
              {categories.map((category, index) => (
                <Chip
                  key={index}
                  style={styles.categoryChip}
                  onClose={() => removeCategory(index)}
                >
                  {category}
                </Chip>
              ))}
            </View>
            
            <View style={styles.categoryInputContainer}>
              <Menu
                visible={showCategoryDropdown}
                onDismiss={() => setShowCategoryDropdown(false)}
                anchor={
                  <TouchableOpacity 
                    style={styles.categoryDropdown}
                    onPress={() => setShowCategoryDropdown(true)}
                  >
                    <Text style={styles.categoryDropdownText}>
                      {selectedCategory || 'Select Category'}
                    </Text>
                    <Icon name="chevron-down" size={20} color="#666666" />
                  </TouchableOpacity>
                }
              >
                {predefinedCategories
                  .filter(category => !categories.includes(category))
                  .map((category, index) => (
                    <Menu.Item
                      key={index}
                      onPress={() => {
                        setSelectedCategory(category);
                        setShowCategoryDropdown(false);
                      }}
                      title={category}
                    />
                  ))}
              </Menu>
              <Button 
                mode="contained" 
                onPress={addCategory}
                style={styles.addButton}
                disabled={!selectedCategory}
              >
                Add
              </Button>
            </View>
            
            <Divider style={styles.divider} />
            
            {/* Rules */}
            <Text style={styles.subsectionTitle}>Tournament Rules</Text>
            <Text style={styles.helperText}>Add rules for your tournament</Text>
            
            {rules.map((rule, index) => (
              <View key={index} style={styles.ruleContainer}>
                <TextInput
                  label={`Rule ${index + 1}`}
                  value={rule}
                  onChangeText={(text) => updateRule(text, index)}
                  style={styles.ruleInput}
                  mode="outlined"
                  multiline
                />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeRule(index)}
                  disabled={rules.length === 1 && !rule.trim()}
                >
                  <Icon name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
            
            <Button 
              mode="outlined" 
              onPress={addRule}
              style={styles.addRuleButton}
              icon="plus"
            >
              Add Rule
            </Button>
            
            <Divider style={styles.divider} />
            
            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Create Tournament
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Dialogs */}
      <Portal>
        {/* Start Date Dialog */}
        <Dialog visible={showStartDatePicker} onDismiss={() => setShowStartDatePicker(false)}>
          <Dialog.Title>Select Start Date</Dialog.Title>
          <Dialog.Content>
            <View style={styles.datePickerContainer}>
              <Text style={styles.selectedDateText}>{formatDate(tempDate)}</Text>
              <View style={styles.dateControls}>
                <Button onPress={() => adjustDate(-1)} mode="outlined">
                  <Icon name="chevron-left" size={20} />
                </Button>
                <Button onPress={() => adjustDate(1)} mode="outlined">
                  <Icon name="chevron-right" size={20} />
                </Button>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowStartDatePicker(false)}>Cancel</Button>
            <Button onPress={onStartDateChange}>OK</Button>
          </Dialog.Actions>
        </Dialog>

        {/* End Date Dialog */}
        <Dialog visible={showEndDatePicker} onDismiss={() => setShowEndDatePicker(false)}>
          <Dialog.Title>Select End Date</Dialog.Title>
          <Dialog.Content>
            <View style={styles.datePickerContainer}>
              <Text style={styles.selectedDateText}>{formatDate(tempDate)}</Text>
              <View style={styles.dateControls}>
                <Button onPress={() => adjustDate(-1)} mode="outlined">
                  <Icon name="chevron-left" size={20} />
                </Button>
                <Button onPress={() => adjustDate(1)} mode="outlined">
                  <Icon name="chevron-right" size={20} />
                </Button>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEndDatePicker(false)}>Cancel</Button>
            <Button onPress={onEndDateChange}>OK</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Registration Deadline Dialog */}
        <Dialog visible={showDeadlinePicker} onDismiss={() => setShowDeadlinePicker(false)}>
          <Dialog.Title>Select Registration Deadline</Dialog.Title>
          <Dialog.Content>
            <View style={styles.datePickerContainer}>
              <Text style={styles.selectedDateText}>{formatDate(tempDate)}</Text>
              <View style={styles.dateControls}>
                <Button onPress={() => adjustDate(-1)} mode="outlined">
                  <Icon name="chevron-left" size={20} />
                </Button>
                <Button onPress={() => adjustDate(1)} mode="outlined">
                  <Icon name="chevron-right" size={20} />
                </Button>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeadlinePicker(false)}>Cancel</Button>
            <Button onPress={onDeadlineChange}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  datePickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333333',
  },
  dateControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#999999',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadingText: {
    marginLeft: 8,
    color: '#0066CC',
  },
  formContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12,
    color: '#333333',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
    marginBottom: 12,
  },
  dateLabel: {
    color: '#666666',
    flex: 1,
  },
  dateValue: {
    color: '#333333',
    flex: 2,
  },
  divider: {
    marginVertical: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  categoryChip: {
    margin: 4,
  },
  categoryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDropdown: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
    padding: 12,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  categoryDropdownText: {
    fontSize: 16,
    color: '#333333',
  },
  addButton: {
    marginTop: 8,
  },
  helperText: {
    color: '#666666',
    marginBottom: 8,
  },
  ruleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  addRuleButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  submitButton: {
    marginVertical: 24,
    paddingVertical: 8,
  },
});

export default CreateTournamentScreen;
