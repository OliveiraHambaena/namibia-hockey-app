import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  useWindowDimensions,
  Alert,
  ImageBackground,
  RefreshControl,
} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  List,
  Switch,
  Badge,
  Chip,
  SegmentedButtons,
  Portal,
  Dialog,
  Surface,
  FAB,
  ActivityIndicator,
  Menu,
  Appbar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  // Get screen dimensions and safe area insets for responsive design
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width > 768;

  // State for active tab
  const [activeTab, setActiveTab] = useState('settings');
  
  // State for logout dialog
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  
  // State for user profile data
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // State for menu
  const [menuVisible, setMenuVisible] = useState(false);
  
  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  
  // Get authenticated user from context
  const { user, logout: authLogout } = useAuth();

  // Fetch user profile data from profiles_view and set up real-time subscription
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Initial fetch of profile data
    const fetchProfileData = async () => {  
      try {
        console.log('Fetching profile data for user ID:', user.id);
        
        // Direct SQL query to the profiles_view
        const { data, error } = await supabase
          .from('profiles_view')
          .select('id, full_name, email, avatar_url, role, team, created_at, updated_at')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile data:', error.message, error.code, error.details);
          setError(error.message);
          
          // Fallback to the profiles table if view doesn't work
          console.log('Attempting fallback to profiles table...');
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.error('Fallback also failed:', profileError.message);
            
            // Create a basic profile from the user object as last resort
            console.log('Using basic user data as fallback');
            setProfileData({
              id: user.id,
              full_name: user.name,
              email: user.email,
              avatar_url: user.avatar,
              role: user.role || 'User',
              team: user.team || 'Unassigned',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          } else if (profileData) {
            console.log('Profile data fetched from profiles table:', profileData);
            setProfileData(profileData);
            setError(null);
          }
        } else if (data) {
          console.log('Profile data fetched from profiles_view:', data);
          setProfileData(data);
        } else {
          console.log('No profile data found for user ID:', user.id);
          
          // Create a basic profile from the user object if no data found
          console.log('Using basic user data as fallback');
          setProfileData({
            id: user.id,
            full_name: user.name,
            email: user.email,
            avatar_url: user.avatar,
            role: user.role || 'User',
            team: user.team || 'Unassigned',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } catch (err: any) {
        console.error('Unexpected error fetching profile:', err.message);
        setError(err.message);
        
        // Create a basic profile from the user object in case of error
        if (user && !profileData) {
          console.log('Using basic user data as fallback after error');
          setProfileData({
            id: user.id,
            full_name: user.name,
            email: user.email,
            avatar_url: user.avatar,
            role: user.role || 'User',
            team: user.team || 'Unassigned',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Execute initial fetch
    fetchProfileData();
    
    // Set up real-time subscription to profiles table
    const subscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}` // Only listen for changes to this user's profile
        },
        (payload) => {
          // Only log important events, not every update
          if (payload.eventType === 'UPDATE') {
            const newProfileData = payload.new;
            // Update the profile data with the new data
            setProfileData(newProfileData);
          } else if (payload.eventType === 'DELETE') {
            console.log('Profile was deleted');
            setProfileData(null);
          }
        }
      )
      .subscribe();
    
    // Clean up subscription when component unmounts
    return () => {
      console.log('Unsubscribing from profile changes');
      subscription.unsubscribe();
    };
  }, [user]);
  
  // Use real data if available, otherwise fall back to mock data
  const userData = profileData ? {
    name: profileData.full_name || 'User',
    username: profileData.email?.split('@')[0] || 'user',
    avatar: profileData.avatar_url || 'https://via.placeholder.com/150/1565C0/FFFFFF?text=USER',
    role: profileData.role || 'Player',
    team: profileData.team || 'Unassigned',
    position: 'Center', // These fields would need to be added to the profiles table
    jerseyNumber: '88',
    joinDate: new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    email: profileData.email,
    phone: '(555) 123-4567',
    bio: 'Hockey enthusiast with 10+ years of experience.',
    stats: {
      games: 42,
      goals: 18,
      assists: 24,
      points: 42,
      penaltyMinutes: 12,
    },
    achievements: [
      { id: '1', title: 'MVP', season: '2024', icon: 'trophy' },
      { id: '2', title: 'Most Goals', season: '2023', icon: 'hockey-puck' },
      { id: '3', title: 'Team Captain', season: '2022-2024', icon: 'shield' },
    ],
    activities: [
      { id: '1', type: 'Game', title: 'vs Ice Hawks', date: 'May 15, 2025', result: 'Win 4-2', stats: '2G, 1A' },
      { id: '2', type: 'Practice', title: 'Team Training', date: 'May 12, 2025', duration: '2h' },
      { id: '3', type: 'Game', title: 'vs Polar Bears', date: 'May 8, 2025', result: 'Loss 2-3', stats: '0G, 2A' },
      { id: '4', type: 'Event', title: 'Youth Camp Volunteer', date: 'May 5, 2025', duration: '3h' },
    ],
    preferences: {
      notifications: true,
      darkMode: false,
      publicProfile: true,
      language: 'English',
    }
  } : {
    name: 'Alex Johnson',
    username: 'alexj88',
    avatar: 'https://via.placeholder.com/150/1565C0/FFFFFF?text=AJ',
    role: 'Player',
    team: 'Thunderbolts',
    position: 'Center',
    jerseyNumber: '88',
    joinDate: 'May 2023',
    email: 'alex.johnson@example.com',
    phone: '(555) 123-4567',
    bio: 'Hockey enthusiast with 10+ years of experience. Team captain for 3 seasons and passionate about developing youth talent in the sport.',
    stats: {
      games: 42,
      goals: 18,
      assists: 24,
      points: 42,
      penaltyMinutes: 12,
    },
    achievements: [
      { id: '1', title: 'MVP', season: '2024', icon: 'trophy' },
      { id: '2', title: 'Most Goals', season: '2023', icon: 'hockey-puck' },
      { id: '3', title: 'Team Captain', season: '2022-2024', icon: 'shield' },
    ],
    activities: [
      { id: '1', type: 'Game', title: 'vs Ice Hawks', date: 'May 15, 2025', result: 'Win 4-2', stats: '2G, 1A' },
      { id: '2', type: 'Practice', title: 'Team Training', date: 'May 12, 2025', duration: '2h' },
      { id: '3', type: 'Game', title: 'vs Polar Bears', date: 'May 8, 2025', result: 'Loss 2-3', stats: '0G, 2A' },
      { id: '4', type: 'Event', title: 'Youth Camp Volunteer', date: 'May 5, 2025', duration: '3h' },
    ],
    preferences: {
      notifications: true,
      darkMode: false,
      publicProfile: true,
      language: 'English',
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setLogoutDialogVisible(false);
    try {
      await authLogout();
      // Navigate to the sign in screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };



  // Render settings section
  const renderSettings = () => (
    <View style={styles.settingsContainer}>
      <List.Section>
        <List.Subheader style={styles.settingsHeader}>Account Settings</List.Subheader>
        
        <List.Item
          title="Edit Profile"
          description="Change your personal information"
          left={props => <List.Icon {...props} icon="account-edit" color="#1565C0" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.settingsItem}
        />
        
        <List.Item
          title="Change Password"
          description="Update your security credentials"
          left={props => <List.Icon {...props} icon="lock" color="#1565C0" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('ChangePassword')}
          style={styles.settingsItem}
        />
        
        <List.Subheader style={styles.settingsHeader}>Preferences</List.Subheader>
        
        <List.Item
          title="Notifications"
          description="Receive alerts and updates"
          left={props => <List.Icon {...props} icon="bell" color="#1565C0" />}
          right={() => (
            <Switch
              value={userData.preferences.notifications}
              onValueChange={() => {}}
              color="#1565C0"
            />
          )}
          style={styles.settingsItem}
        />
        
        <List.Item
          title="Dark Mode"
          description="Toggle light/dark appearance"
          left={props => <List.Icon {...props} icon="theme-light-dark" color="#1565C0" />}
          right={() => (
            <Switch
              value={userData.preferences.darkMode}
              onValueChange={() => {}}
              color="#1565C0"
            />
          )}
          style={styles.settingsItem}
        />
        
        <List.Item
          title="Public Profile"
          description="Allow others to view your profile"
          left={props => <List.Icon {...props} icon="eye" color="#1565C0" />}
          right={() => (
            <Switch
              value={userData.preferences.publicProfile}
              onValueChange={() => {}}
              color="#1565C0"
            />
          )}
          style={styles.settingsItem}
        />
        
        <List.Subheader style={styles.settingsHeader}>Support</List.Subheader>
        
        <List.Item
          title="Help Center"
          description="Get assistance and support"
          left={props => <List.Icon {...props} icon="help-circle" color="#1565C0" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
          style={styles.settingsItem}
        />
        
        <List.Item
          title="About"
          description="App version and information"
          left={props => <List.Icon {...props} icon="information" color="#1565C0" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
          style={styles.settingsItem}
        />
        
        <List.Item
          title="Settings"
          description="Advanced settings"
          left={props => <List.Icon {...props} icon="cog" color="#1565C0" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsItem}
        />
      </List.Section>
    </View>
  );

  // Render the appropriate content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'settings':
        return renderSettings();
      default:
        return renderSettings();
    }
  };

  // Show loading state
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar style="light" />
        <LinearGradient
          colors={['#1565C0', '#0D47A1']}
          style={styles.loadingBackground}
        >
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </LinearGradient>
      </View>
    );
  }
  
  // Add a refresh function for manual refresh
  const refreshProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles_view')
        .select('id, full_name, email, avatar_url, role, team, created_at, updated_at')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error refreshing profile:', error.message);
        setError('Failed to refresh profile');
      } else if (data) {
        console.log('Profile refreshed:', data);
        setProfileData(data);
      }
    } catch (err: any) {
      console.error('Unexpected error refreshing profile:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
  };
  
  // Show error state
  if (error && !profileData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar style="light" />
        <Surface style={styles.errorContainer} elevation={4}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#D32F2F" />
          <Text style={styles.errorText}>Error loading profile</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.goBack()} 
            style={styles.errorButton}
            buttonColor="#1565C0"
          >
            Go Back
          </Button>
          <Button 
            mode="outlined" 
            onPress={refreshProfile} 
            style={styles.retryButton}
            textColor="#1565C0"
          >
            Retry
          </Button>
        </Surface>
      </View>
    );
  }
  
  // If no user is authenticated, redirect to sign in
  if (!user && !loading) {
    navigation.reset({
      index: 0,
      routes: [{ name: 'SignIn' }],
    });
    return null;
  }
  


  return (
    <>
      <View style={styles.container}>
        <StatusBar style="light" />
        
        {/* App Bar */}
        <Appbar.Header style={styles.appbar} statusBarHeight={insets.top}>
          <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
          <Appbar.Content title="Profile" color="white" />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={<Appbar.Action icon="dots-vertical" color="white" onPress={() => setMenuVisible(true)} />}
          >
            <Menu.Item onPress={() => {
              setMenuVisible(false);
              setEditMode(true);
            }} title="Edit Profile" leadingIcon="pencil" />
            <Menu.Item onPress={() => {
              setMenuVisible(false);
              setLogoutDialogVisible(true);
            }} title="Sign Out" leadingIcon="logout" />
          </Menu>
        </Appbar.Header>
        
        {/* Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1565C0']}
              tintColor="#1565C0"
            />
          }
        >
          {/* Profile Header */}
          <Surface style={styles.profileCard} elevation={2}>
            <LinearGradient
              colors={['#1565C0', '#0D47A1']}
              style={styles.profileHeader}
            >
              <View style={styles.profileImageContainer}>
                <View style={styles.avatarContainer}>
                  <Image 
                    source={{ uri: userData.avatar }} 
                    style={styles.avatar}
                  />
                </View>
                {editMode ? (
                  <TouchableOpacity style={styles.editAvatarButton}>
                    <MaterialCommunityIcons name="camera" size={20} color="white" />
                  </TouchableOpacity>
                ) : null}
              </View>
              
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userUsername}>@{userData.username}</Text>
                
                <View style={styles.roleContainer}>
                  <MaterialCommunityIcons name="shield-account" size={16} color="white" />
                  <Text style={styles.roleText}>{userData.role}</Text>
                </View>
                
                <View style={styles.userDetailsRow}>
                  <View style={styles.userDetailItem}>
                    <MaterialCommunityIcons name="account-group" size={16} color="white" />
                    <Text style={styles.userDetailText}>{userData.team}</Text>
                  </View>
                  
                  <View style={styles.userDetailItem}>
                    <MaterialCommunityIcons name="hockey-puck" size={16} color="white" />
                    <Text style={styles.userDetailText}>{userData.position} #{userData.jerseyNumber}</Text>
                  </View>
                  
                  <View style={styles.userDetailItem}>
                    <MaterialCommunityIcons name="calendar" size={16} color="white" />
                    <Text style={styles.userDetailText}>Since {userData.joinDate}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
            

          </Surface>
          
          {/* Contact Information */}
          <Surface style={styles.contactCard} elevation={2}>
            <View style={styles.contactHeader}>
              <MaterialCommunityIcons name="card-account-details" size={22} color="#1565C0" />
              <Text style={styles.contactTitle}>Contact Information</Text>
            </View>
            <Divider style={styles.divider} />
            
            <View style={styles.contactItem}>
              <MaterialCommunityIcons name="email" size={20} color="#666" />
              <Text style={styles.contactText}>{userData.email}</Text>
            </View>
            
            <View style={styles.contactItem}>
              <MaterialCommunityIcons name="phone" size={20} color="#666" />
              <Text style={styles.contactText}>{userData.phone}</Text>
            </View>
          </Surface>
          
          {/* Settings */}
          <Surface style={styles.settingsContainer} elevation={2}>
            {renderContent()}
          </Surface>
        </ScrollView>
        
        {/* Edit FAB */}
        {!editMode && (
          <FAB
            icon="pencil"
            style={styles.fab}
            onPress={() => setEditMode(true)}
            color="white"
          />
        )}
      </View>
      
      {/* Logout dialog */}
      <Portal>
        <Dialog
          visible={logoutDialogVisible}
          onDismiss={() => setLogoutDialogVisible(false)}
          style={styles.logoutDialog}
        >
          <Dialog.Title>Sign Out</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to sign out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleLogout} textColor="#D32F2F">Sign Out</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  // Base styles
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  divider: {
    marginVertical: 12,
  },
  
  // Loading state
  loadingBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
  
  // Error state
  errorContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    maxWidth: 400,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    marginTop: 8,
    width: '100%',
  },
  retryButton: {
    marginTop: 12,
    width: '100%',
  },
  
  // App Bar
  appbar: {
    backgroundColor: '#1565C0',
    elevation: 0,
  },
  
  // Profile Card
  profileCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  profileHeader: {
    padding: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatarContainer: {
    borderRadius: 60,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: '#0D47A1',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1565C0',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  userUsername: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 71, 161, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 16,
  },
  roleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  userDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  userDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  userDetailText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
  },

  
  // Contact Card
  contactCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    padding: 16,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565C0',
    marginLeft: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  
  // Settings
  settingsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  settingsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
    paddingVertical: 8,
  },
  settingsItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  
  // FAB
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1565C0',
  },
  
  // Dialog
  logoutDialog: {
    borderRadius: 12,
    backgroundColor: 'white',
  }
});

export default ProfileScreen;
