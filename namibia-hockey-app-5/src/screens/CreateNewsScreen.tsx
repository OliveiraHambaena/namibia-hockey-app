import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Chip,
  Divider,
  Avatar,
  Card,
  HelperText,
  ActivityIndicator,
  Snackbar,
  IconButton,
  Menu,
  Checkbox,
  Dialog,
  Portal,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Define types for the component props
type CreateNewsScreenProps = {
  navigation: any;
};

// Define types for news category
type NewsCategory = {
  id: string;
  name: string;
  icon: string;
};

// Define types for news tag
type NewsTag = {
  id: string;
  name: string;
  selected?: boolean;
};

const CreateNewsScreen = ({ navigation }: CreateNewsScreenProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [snippet, setSnippet] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [readTime, setReadTime] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorTitle, setAuthorTitle] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState('');

  // Category and tags state
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [tags, setTags] = useState<NewsTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [tagDialogVisible, setTagDialogVisible] = useState(false);

  // Load categories and tags on mount
  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchTags();
      // Set author name and avatar from user profile
      fetchUserProfile();
    }
  }, [user]);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles_view')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching user profile:', error.message);
      } else if (data) {
        setAuthorName(data.full_name || '');
        setAuthorAvatar(data.avatar_url || '');
      }
    } catch (err: any) {
      console.error('Unexpected error fetching user profile:', err.message);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news_categories')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching categories:', error.message);
        setError('Failed to load categories');
      } else {
        setCategories(data || []);
        // Don't select "All" category by default
        if (data && data.length > 1) {
          const nonAllCategory = data.find(cat => cat.name !== 'All');
          if (nonAllCategory) {
            setSelectedCategory(nonAllCategory.id);
          }
        }
      }
    } catch (err: any) {
      console.error('Unexpected error fetching categories:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tags
  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('news_tags')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching tags:', error.message);
      } else {
        setTags(data || []);
      }
    } catch (err: any) {
      console.error('Unexpected error fetching tags:', err.message);
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCategoryMenuVisible(false);
  };

  // Handle tag selection
  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  // Create a new tag
  const handleCreateTag = async () => {
    const trimmedTagName = newTagName.trim();
    
    // Validate tag name
    if (!trimmedTagName) {
      setSnackbarMessage('Tag name cannot be empty');
      setSnackbarVisible(true);
      return;
    }
    
    if (trimmedTagName.length < 2) {
      setSnackbarMessage('Tag name must be at least 2 characters');
      setSnackbarVisible(true);
      return;
    }
    
    // Check if tag already exists
    const tagExists = tags.some(tag => tag.name.toLowerCase() === trimmedTagName.toLowerCase());
    if (tagExists) {
      setSnackbarMessage('This tag already exists');
      setSnackbarVisible(true);
      return;
    }
    
    try {
      // Show loading state
      setLoading(true);
      
      const { data, error } = await supabase
        .from('news_tags')
        .insert({ name: trimmedTagName })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating tag:', error.message);
        setSnackbarMessage(`Failed to create tag: ${error.message}`);
        setSnackbarVisible(true);
      } else if (data) {
        // Add the new tag to the list and select it
        setTags(prev => [...prev, data]);
        setSelectedTags(prev => [...prev, data.id]);
        setNewTagName('');
        setTagDialogVisible(false);
        
        // Show success message
        setSnackbarMessage(`Tag "${data.name}" created and selected`);
        setSnackbarVisible(true);
      }
    } catch (err: any) {
      console.error('Unexpected error creating tag:', err.message);
      setSnackbarMessage(`Unexpected error: ${err.message}`);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Pick image from library
  const pickImage = async () => {
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
        const asset = result.assets[0];
        // Store the image URI for preview
        setImageUrl(asset.uri);
        // Store the base64 data for upload
        setImageFile(asset.base64 || null);
      }
    } catch (err: any) {
      console.error('Error picking image:', err.message);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // Upload image to Supabase storage
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    try {
      const fileName = `news-${Date.now()}.jpg`;
      const filePath = `${fileName}`;
      
      // Convert base64 to ArrayBuffer
      const arrayBuffer = decode(imageFile);
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('news_images')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });
        
      if (error) {
        console.error('Error uploading image:', error.message);
        throw new Error(`Failed to upload image: ${error.message}`);
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('news_images')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (err: any) {
      console.error('Unexpected error uploading image:', err.message);
      throw err;
    }
  };

  // Validate form
  const validateForm = () => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!snippet.trim()) {
      setError('Snippet is required');
      return false;
    }
    
    if (!content.trim()) {
      setError('Content is required');
      return false;
    }
    
    if (!selectedCategory) {
      setError('Please select a category');
      return false;
    }
    
    if (!authorName.trim()) {
      setError('Author name is required');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to create a news article');
      return;
    }
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Upload image if available
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage() || '';
      }
      
      // Create news article
      const { data: articleData, error: articleError } = await supabase
        .from('news_articles')
        .insert({
          user_id: user.id,
          title,
          snippet,
          content,
          image_url: finalImageUrl,
          author: authorName,
          author_avatar: authorAvatar,
          author_title: authorTitle,
          read_time: readTime || '3 min read',
          category_id: selectedCategory,
          is_featured: isFeatured,
        })
        .select()
        .single();
        
      if (articleError) {
        console.error('Error creating article:', articleError.message);
        setError(`Failed to create article: ${articleError.message}`);
        return;
      }
      
      // Add tags if selected
      if (selectedTags.length > 0 && articleData) {
        const tagInserts = selectedTags.map(tagId => ({
          article_id: articleData.id,
          tag_id: tagId,
        }));
        
        const { error: tagsError } = await supabase
          .from('news_article_tags')
          .insert(tagInserts);
          
        if (tagsError) {
          console.error('Error adding tags:', tagsError.message);
          // Don't fail the whole operation if tags fail
        }
      }
      
      // Show success message
      setSnackbarMessage('News article created successfully!');
      setSnackbarVisible(true);
      
      // Navigate back to News screen immediately
      // The real-time subscription will automatically update the news list
      navigation.navigate('News');
      
    } catch (err: any) {
      console.error('Unexpected error creating article:', err.message);
      setError(`Unexpected error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigation.goBack();
  };

  // Get selected category name
  const getSelectedCategoryName = () => {
    const category = categories.find(cat => cat.id === selectedCategory);
    return category ? category.name : 'Select Category';
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
            <Text style={styles.headerTitle}>Create News Article</Text>
            <TouchableOpacity onPress={handleSubmit} disabled={saving} style={styles.saveIcon}>
              <Avatar.Icon 
                size={36} 
                icon="content-save" 
                color="white" 
                style={[{backgroundColor: 'transparent'}, saving ? styles.disabledIcon : {}]}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <HelperText type="error" visible={!!error} style={styles.errorText}>
              {error}
            </HelperText>
          </View>
        )}
        
        {/* Image upload card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Featured Image</Text>
            
            <TouchableOpacity onPress={pickImage} style={styles.imageUploadContainer}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="image-plus" size={48} color="#CCCCCC" />
                  <Text style={styles.imagePlaceholderText}>Tap to upload image</Text>
                  <Text style={styles.imagePlaceholderSubtext}>Recommended: 16:9 ratio</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {imageUrl && (
              <Button 
                mode="outlined" 
                onPress={pickImage} 
                style={styles.changeImageButton}
                icon="image-edit"
              >
                Change Image
              </Button>
            )}
          </Card.Content>
        </Card>
        
        {/* Article details card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Article Details</Text>
            
            <TextInput
              label="Title"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              mode="outlined"
              placeholder="Enter article title"
              maxLength={255}
              left={<TextInput.Icon icon="format-title" color="#1565C0" />}
              outlineColor="#DDDDDD"
              activeOutlineColor="#1565C0"
            />
            
            <TextInput
              label="Snippet"
              value={snippet}
              onChangeText={setSnippet}
              style={styles.input}
              mode="outlined"
              placeholder="Brief summary of the article"
              multiline
              numberOfLines={3}
              left={<TextInput.Icon icon="text-short" color="#1565C0" />}
              outlineColor="#DDDDDD"
              activeOutlineColor="#1565C0"
            />
            
            <TextInput
              label="Content"
              value={content}
              onChangeText={setContent}
              style={[styles.input, styles.contentInput]}
              mode="outlined"
              placeholder="Full article content"
              multiline
              numberOfLines={10}
              left={<TextInput.Icon icon="text-long" color="#1565C0" />}
              outlineColor="#DDDDDD"
              activeOutlineColor="#1565C0"
            />
            
            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <Menu
                  visible={categoryMenuVisible}
                  onDismiss={() => setCategoryMenuVisible(false)}
                  anchor={
                    <TouchableOpacity 
                      style={styles.dropdownButton} 
                      onPress={() => setCategoryMenuVisible(true)}
                    >
                      <Text style={styles.dropdownButtonText}>{getSelectedCategoryName()}</Text>
                      <Icon name="chevron-down" size={20} color="#666666" />
                    </TouchableOpacity>
                  }
                >
                  {categories.filter(cat => cat.name !== 'All').map((category) => (
                    <Menu.Item
                      key={category.id}
                      onPress={() => handleCategorySelect(category.id)}
                      title={category.name}
                      leadingIcon={category.icon}
                    />
                  ))}
                </Menu>
              </View>
              
              <View style={styles.halfWidth}>
                <TextInput
                  label="Read Time"
                  value={readTime}
                  onChangeText={setReadTime}
                  style={styles.input}
                  mode="outlined"
                  placeholder="e.g. 5 min read"
                  left={<TextInput.Icon icon="clock-outline" color="#1565C0" />}
                  outlineColor="#DDDDDD"
                  activeOutlineColor="#1565C0"
                />
              </View>
            </View>
            
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={isFeatured ? 'checked' : 'unchecked'}
                onPress={() => setIsFeatured(!isFeatured)}
                color="#1565C0"
              />
              <Text style={styles.checkboxLabel}>Feature this article</Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Tags card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <Button 
                mode="text" 
                onPress={() => setTagDialogVisible(true)}
                icon="plus"
                compact
              >
                Add New Tag
              </Button>
            </View>
            
            <View style={styles.tagsContainer}>
              {tags.length === 0 ? (
                <Text style={styles.noTagsText}>No tags available. Create a new tag.</Text>
              ) : (
                <>
                  <Text style={styles.tagInstructions}>Select tags for your article (tap to select/deselect):</Text>
                  <View style={styles.tagChipsContainer}>
                    {tags.map((tag) => (
                      <Chip
                        key={tag.id}
                        selected={selectedTags.includes(tag.id)}
                        onPress={() => handleTagToggle(tag.id)}
                        style={[
                          styles.tagChip, 
                          selectedTags.includes(tag.id) && styles.selectedTagChip
                        ]}
                        textStyle={[
                          styles.tagChipText,
                          selectedTags.includes(tag.id) && styles.selectedTagChipText
                        ]}
                        icon={selectedTags.includes(tag.id) ? 'check' : undefined}
                      >
                        {tag.name}
                      </Chip>
                    ))}
                  </View>
                  {selectedTags.length > 0 && (
                    <View style={styles.selectedTagsInfo}>
                      <Text style={styles.selectedTagsCount}>
                        {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </Card.Content>
        </Card>
        
        {/* Author card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Author Information</Text>
            
            <TextInput
              label="Author Name"
              value={authorName}
              onChangeText={setAuthorName}
              style={styles.input}
              mode="outlined"
              placeholder="Author's name"
              left={<TextInput.Icon icon="account" color="#1565C0" />}
              outlineColor="#DDDDDD"
              activeOutlineColor="#1565C0"
            />
            
            <TextInput
              label="Author Title"
              value={authorTitle}
              onChangeText={setAuthorTitle}
              style={styles.input}
              mode="outlined"
              placeholder="e.g. Sports Correspondent"
              left={<TextInput.Icon icon="badge-account" color="#1565C0" />}
              outlineColor="#DDDDDD"
              activeOutlineColor="#1565C0"
            />
          </Card.Content>
        </Card>
        
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
            Create Article
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
      
      {/* New Tag Dialog */}
      <Portal>
        <Dialog visible={tagDialogVisible} onDismiss={() => setTagDialogVisible(false)}>
          <Dialog.Title>Create New Tag</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Create a new tag to categorize your article. Tags help readers find related content.
            </Text>
            <TextInput
              label="Tag Name"
              value={newTagName}
              onChangeText={setNewTagName}
              mode="outlined"
              autoFocus
              placeholder="Enter tag name (e.g., Strategy, Tournament, Player)"
              outlineColor="#DDDDDD"
              activeOutlineColor="#1565C0"
              right={newTagName.trim() ? <TextInput.Icon icon="check-circle" color="#4CAF50" /> : null}
              error={newTagName.trim().length > 0 && newTagName.trim().length < 2}
              maxLength={30}
            />
            {newTagName.trim().length > 0 && newTagName.trim().length < 2 && (
              <HelperText type="error" visible={true}>
                Tag name must be at least 2 characters
              </HelperText>
            )}
            {tags.some(tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase()) && (
              <HelperText type="error" visible={true}>
                This tag already exists
              </HelperText>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setTagDialogVisible(false)} color="#666666">
              Cancel
            </Button>
            <Button 
              onPress={handleCreateTag} 
              mode="contained" 
              disabled={newTagName.trim().length < 2 || tags.some(tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase())}
              style={styles.createTagButton}
            >
              Create Tag
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
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
    paddingBottom: 32,
  },
  // Card styles
  card: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  // Image upload styles
  imageUploadContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666666',
  },
  imagePlaceholderSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#999999',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeImageButton: {
    marginTop: 8,
  },
  // Form styles
  input: {
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  contentInput: {
    minHeight: 150,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
    padding: 14,
    height: 56,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  // Tags styles
  tagsContainer: {
    marginTop: 10,
  },
  tagChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagInstructions: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  selectedTagsInfo: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  selectedTagsCount: {
    fontSize: 14,
    color: '#1565C0',
    fontWeight: '500',
  },
  tagChip: {
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTagChip: {
    backgroundColor: '#1565C0',
  },
  tagChipText: {
    color: '#666666',
  },
  selectedTagChipText: {
    color: 'white',
  },
  noTagsText: {
    color: '#999999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  dialogText: {
    color: '#666666',
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  createTagButton: {
    backgroundColor: '#1565C0',
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
  // Button styles
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  submitButton: {
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
  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreateNewsScreen;
