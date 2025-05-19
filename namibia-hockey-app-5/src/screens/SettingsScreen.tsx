import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from 'react-native';
import {
  List,
  Switch,
  Divider,
  Button,
  IconButton,
  Appbar,
  RadioButton,
  Dialog,
  Portal,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = ({ navigation }: { navigation: any }) => {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  const { user, logout } = useAuth();
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    darkMode: false,
    publicProfile: true,
    language: 'English',
    dataUsage: 'Wifi Only',
  });

  // Dialog states
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [dataUsageDialogVisible, setDataUsageDialogVisible] = useState(false);
  const [tempLanguage, setTempLanguage] = useState(settings.language);
  const [tempDataUsage, setTempDataUsage] = useState(settings.dataUsage);

  // Toggle settings
  const toggleSetting = (setting: string) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting as keyof typeof settings],
    });
  };

  // Handle language selection
  const handleLanguageSelect = () => {
    setSettings({
      ...settings,
      language: tempLanguage,
    });
    setLanguageDialogVisible(false);
  };

  // Handle data usage selection
  const handleDataUsageSelect = () => {
    setSettings({
      ...settings,
      dataUsage: tempDataUsage,
    });
    setDataUsageDialogVisible(false);
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'SignIn' }],
            });
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* App bar */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        <View style={[styles.content, isTablet && styles.tabletContent]}>
          {/* Account section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <List.Item
              title="Profile"
              description="Edit your personal information"
              left={props => <List.Icon {...props} icon="account-edit" color="#1565C0" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('ProfileTab')}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Security"
              description="Change password and security settings"
              left={props => <List.Icon {...props} icon="shield-lock" color="#1565C0" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {/* Navigate to security settings */}}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Privacy"
              description="Manage your privacy settings"
              left={props => <List.Icon {...props} icon="eye-off" color="#1565C0" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {/* Navigate to privacy settings */}}
              style={styles.listItem}
            />
          </View>
          
          {/* Notifications section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            <List.Item
              title="Push Notifications"
              description="Receive alerts on your device"
              left={props => <List.Icon {...props} icon="bell" color="#1565C0" />}
              right={() => (
                <Switch
                  value={settings.notifications}
                  onValueChange={() => toggleSetting('notifications')}
                  color="#1565C0"
                />
              )}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Email Notifications"
              description="Receive alerts via email"
              left={props => <List.Icon {...props} icon="email" color="#1565C0" />}
              right={() => (
                <Switch
                  value={settings.emailNotifications}
                  onValueChange={() => toggleSetting('emailNotifications')}
                  color="#1565C0"
                />
              )}
              style={styles.listItem}
            />
          </View>
          
          {/* Appearance section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            
            <List.Item
              title="Dark Mode"
              description="Toggle light/dark appearance"
              left={props => <List.Icon {...props} icon="theme-light-dark" color="#1565C0" />}
              right={() => (
                <Switch
                  value={settings.darkMode}
                  onValueChange={() => toggleSetting('darkMode')}
                  color="#1565C0"
                />
              )}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Language"
              description={settings.language}
              left={props => <List.Icon {...props} icon="translate" color="#1565C0" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setLanguageDialogVisible(true)}
              style={styles.listItem}
            />
          </View>
          
          {/* Data & Storage section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data & Storage</Text>
            
            <List.Item
              title="Data Usage"
              description={settings.dataUsage}
              left={props => <List.Icon {...props} icon="wifi" color="#1565C0" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setDataUsageDialogVisible(true)}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Clear Cache"
              description="Free up storage space"
              left={props => <List.Icon {...props} icon="broom" color="#1565C0" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                Alert.alert(
                  'Clear Cache',
                  'This will clear all cached data. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear', style: 'destructive' },
                  ]
                );
              }}
              style={styles.listItem}
            />
          </View>
          
          {/* Support section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            <List.Item
              title="Help Center"
              description="Get assistance and support"
              left={props => <List.Icon {...props} icon="help-circle" color="#1565C0" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {/* Navigate to help center */}}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Report a Problem"
              description="Let us know about issues"
              left={props => <List.Icon {...props} icon="alert-circle" color="#1565C0" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {/* Navigate to problem reporting */}}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="About"
              description="App version and information"
              left={props => <List.Icon {...props} icon="information" color="#1565C0" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {/* Navigate to about page */}}
              style={styles.listItem}
            />
          </View>
          
          {/* Sign out button */}
          <Button 
            mode="outlined" 
            icon="logout" 
            onPress={handleLogout} 
            style={styles.signOutButton}
            textColor="#D32F2F"
          >
            Sign Out
          </Button>
          
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
      
      {/* Language selection dialog */}
      <Portal>
        <Dialog
          visible={languageDialogVisible}
          onDismiss={() => setLanguageDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Select Language</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={value => setTempLanguage(value)}
              value={tempLanguage}
            >
              <RadioButton.Item label="English" value="English" />
              <RadioButton.Item label="Español" value="Español" />
              <RadioButton.Item label="Français" value="Français" />
              <RadioButton.Item label="Deutsch" value="Deutsch" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLanguageDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleLanguageSelect}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Data usage dialog */}
      <Portal>
        <Dialog
          visible={dataUsageDialogVisible}
          onDismiss={() => setDataUsageDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Data Usage</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={value => setTempDataUsage(value)}
              value={tempDataUsage}
            >
              <RadioButton.Item label="Wifi Only" value="Wifi Only" />
              <RadioButton.Item label="Wifi & Mobile Data" value="Wifi & Mobile Data" />
              <RadioButton.Item label="Ask Every Time" value="Ask Every Time" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDataUsageDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDataUsageSelect}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  appbar: {
    backgroundColor: '#1565C0',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  tabletContent: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
    padding: 16,
    paddingBottom: 8,
  },
  listItem: {
    paddingVertical: 8,
  },
  signOutButton: {
    marginVertical: 24,
    borderColor: '#FFCDD2',
    borderWidth: 1,
  },
  versionText: {
    textAlign: 'center',
    color: '#9E9E9E',
    marginBottom: 24,
  },
  dialog: {
    borderRadius: 12,
  },
});

export default SettingsScreen;
