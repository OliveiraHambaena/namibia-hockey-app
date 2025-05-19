import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import {
  Button,
  Card,
  TextInput,
  Divider,
  Chip,
  SegmentedButtons,
  Avatar,
  IconButton,
  FAB,
  Dialog,
  Portal,
  RadioButton,
  Checkbox,
  HelperText,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RegisterScreen = ({ navigation }: { navigation: any }) => {
  // Get screen dimensions for responsive design
  const { width, height } = useWindowDimensions();
  const isTablet = width > 768;
  
  // Calculate dialog dimensions based on screen size
  const dialogWidth = isTablet ? Math.min(500, width * 0.8) : width * 0.92;
  const dialogMaxHeight = height * 0.65; // Reduced from 0.8 to 0.65 for more compact popups
  // State for the active tab
  const [activeTab, setActiveTab] = useState('news');
  
  // State for the form dialogs
  const [newsDialogVisible, setNewsDialogVisible] = useState(false);
  const [announcementDialogVisible, setAnnouncementDialogVisible] = useState(false);
  const [teamDialogVisible, setTeamDialogVisible] = useState(false);
  const [tournamentDialogVisible, setTournamentDialogVisible] = useState(false);
  
  // Form states
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    category: 'general',
    image: null,
  });
  
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'normal',
  });
  
  const [teamForm, setTeamForm] = useState({
    name: '',
    division: '',
    coach: '',
    players: '',
    logo: null,
  });
  
  const [tournamentForm, setTournamentForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
    teams: '',
  });
  
  // Mock data for existing items
  const newsItems = [
    {
      id: '1',
      title: 'Season Opener Announced',
      date: 'May 15, 2025',
      category: 'Events',
      author: 'Admin',
    },
    {
      id: '2',
      title: 'New Training Schedule',
      date: 'May 12, 2025',
      category: 'Training',
      author: 'Coach Smith',
    },
  ];
  
  const announcements = [
    {
      id: '1',
      title: 'Ice Rink Maintenance',
      date: 'May 20, 2025',
      priority: 'High',
    },
    {
      id: '2',
      title: 'Season Pass Discount',
      date: 'May 18, 2025',
      priority: 'Normal',
    },
  ];
  
  const teams = [
    {
      id: '1',
      name: 'Thunderbolts',
      division: 'Junior A',
      players: 22,
      status: 'Active',
    },
    {
      id: '2',
      name: 'Ice Hawks',
      division: 'Senior',
      players: 24,
      status: 'Active',
    },
  ];
  
  const tournaments = [
    {
      id: '1',
      name: 'Summer Championship',
      dates: 'Jun 10-15, 2025',
      teams: 8,
      location: 'Main Arena',
    },
    {
      id: '2',
      name: 'Youth Tournament',
      dates: 'Jul 5-10, 2025',
      teams: 12,
      location: 'Community Center',
    },
  ];
  
  // Render the appropriate content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'news':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>News Articles</Text>
              <Text style={styles.sectionSubtitle}>{newsItems.length} articles</Text>
            </View>
            
            {newsItems.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <MaterialCommunityIcons name="newspaper-variant-outline" size={64} color="#BDBDBD" />
                <Text style={styles.emptyStateText}>No news articles yet</Text>
                <Text style={styles.emptyStateSubtext}>Create your first article by tapping the button below</Text>
              </View>
            ) : (
              newsItems.map((item) => (
                <Card key={item.id} style={styles.card} mode="elevated">
                  <LinearGradient
                    colors={['#E3F2FD', '#FFFFFF']}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <Card.Content>
                      <View style={styles.cardHeader}>
                        <View style={styles.cardTitleContainer}>
                          <Text style={styles.cardTitle}>{item.title}</Text>
                          <Text style={styles.cardSubtitle}>{item.date}</Text>
                        </View>
                        <Chip 
                          mode="outlined" 
                          style={styles.categoryChip}
                          textStyle={styles.chipText}
                        >
                          {item.category}
                        </Chip>
                      </View>
                      <Divider style={styles.divider} />
                      <View style={styles.cardFooter}>
                        <View style={styles.authorContainer}>
                          <Avatar.Icon size={24} icon="account" style={styles.authorAvatar} />
                          <Text style={styles.authorText}>{item.author}</Text>
                        </View>
                        <View style={styles.actionButtons}>
                          <IconButton 
                            icon="pencil" 
                            size={20} 
                            onPress={() => {}} 
                            style={styles.actionButton}
                            iconColor="#0D47A1"
                          />
                          <IconButton 
                            icon="delete" 
                            size={20} 
                            onPress={() => {}} 
                            style={styles.actionButton}
                            iconColor="#D32F2F"
                          />
                        </View>
                      </View>
                    </Card.Content>
                  </LinearGradient>
                </Card>
              ))
            )}
          </View>
        );
      
      case 'announcements':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Announcements</Text>
              <Text style={styles.sectionSubtitle}>{announcements.length} announcements</Text>
            </View>
            
            {announcements.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <MaterialCommunityIcons name="bullhorn-outline" size={64} color="#BDBDBD" />
                <Text style={styles.emptyStateText}>No announcements yet</Text>
                <Text style={styles.emptyStateSubtext}>Create your first announcement by tapping the button below</Text>
              </View>
            ) : (
              announcements.map((item) => {
                const priorityColors: Record<string, { bg: string; text: string; icon: string }> = {
                  'High': { bg: '#FFEBEE', text: '#D32F2F', icon: 'alert-circle' },
                  'Normal': { bg: '#E8F5E9', text: '#2E7D32', icon: 'information' },
                  'Low': { bg: '#E3F2FD', text: '#1565C0', icon: 'information-outline' }
                };
                const priorityColor = priorityColors[item.priority] || priorityColors['Normal'];
                
                return (
                  <Card key={item.id} style={styles.card} mode="elevated">
                    <LinearGradient
                      colors={[priorityColor.bg, '#FFFFFF']}
                      style={styles.cardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    >
                      <Card.Content>
                        <View style={styles.cardHeader}>
                          <View style={styles.cardTitleContainer}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardSubtitle}>{item.date}</Text>
                          </View>
                          <View style={styles.priorityContainer}>
                            <MaterialCommunityIcons name={priorityColor.icon as any} size={16} color={priorityColor.text} style={styles.priorityIcon} />
                            <Chip 
                              mode="outlined" 
                              style={[styles.priorityChip, { backgroundColor: priorityColor.bg }]}
                              textStyle={[styles.chipText, { color: priorityColor.text }]}
                            >
                              {item.priority} Priority
                            </Chip>
                          </View>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.cardFooter}>
                          <View style={styles.actionButtons}>
                            <IconButton 
                              icon="pencil" 
                              size={20} 
                              onPress={() => {}} 
                              style={styles.actionButton}
                              iconColor="#0D47A1"
                            />
                            <IconButton 
                              icon="delete" 
                              size={20} 
                              onPress={() => {}} 
                              style={styles.actionButton}
                              iconColor="#D32F2F"
                            />
                          </View>
                        </View>
                      </Card.Content>
                    </LinearGradient>
                  </Card>
                );
              })
            )}
          </View>
        );
      
      case 'teams':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Team Registrations</Text>
              <Text style={styles.sectionSubtitle}>{teams.length} teams</Text>
            </View>
            
            {teams.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <MaterialCommunityIcons name="account-group-outline" size={64} color="#BDBDBD" />
                <Text style={styles.emptyStateText}>No teams registered yet</Text>
                <Text style={styles.emptyStateSubtext}>Register your first team by tapping the button below</Text>
              </View>
            ) : (
              teams.map((item) => (
                <Card key={item.id} style={styles.card} mode="elevated">
                  <LinearGradient
                    colors={['#E8F5E9', '#FFFFFF']}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <Card.Content>
                      <View style={styles.cardHeader}>
                        <View style={styles.teamInfo}>
                          <Avatar.Icon 
                            size={48} 
                            icon="account-group" 
                            style={styles.teamAvatar} 
                            color="white"
                          />
                          <View style={styles.cardTitleContainer}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <Text style={styles.cardSubtitle}>{item.division}</Text>
                          </View>
                        </View>
                        <Chip 
                          mode="outlined" 
                          style={styles.statusChip}
                          textStyle={styles.chipText}
                        >
                          {item.status}
                        </Chip>
                      </View>
                      <Divider style={styles.divider} />
                      <View style={styles.teamDetailsContainer}>
                        <View style={styles.detailItem}>
                          <MaterialCommunityIcons name="account-multiple" size={18} color="#666" />
                          <Text style={styles.detailText}>{item.players} Players</Text>
                        </View>
                      </View>
                      <View style={styles.cardFooter}>
                        <Button 
                          mode="text" 
                          icon="account-details" 
                          onPress={() => {}}
                          style={styles.viewDetailsButton}
                        >
                          View Roster
                        </Button>
                        <View style={styles.actionButtons}>
                          <IconButton 
                            icon="pencil" 
                            size={20} 
                            onPress={() => {}} 
                            style={styles.actionButton}
                            iconColor="#0D47A1"
                          />
                          <IconButton 
                            icon="delete" 
                            size={20} 
                            onPress={() => {}} 
                            style={styles.actionButton}
                            iconColor="#D32F2F"
                          />
                        </View>
                      </View>
                    </Card.Content>
                  </LinearGradient>
                </Card>
              ))
            )}
          </View>
        );
      
      case 'tournaments':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tournament Registrations</Text>
              <Text style={styles.sectionSubtitle}>{tournaments.length} tournaments</Text>
            </View>
            
            {tournaments.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <MaterialCommunityIcons name="trophy-outline" size={64} color="#BDBDBD" />
                <Text style={styles.emptyStateText}>No tournaments registered yet</Text>
                <Text style={styles.emptyStateSubtext}>Register your first tournament by tapping the button below</Text>
              </View>
            ) : (
              tournaments.map((item) => (
                <Card key={item.id} style={styles.card} mode="elevated">
                  <LinearGradient
                    colors={['#FFF3E0', '#FFFFFF']}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <Card.Content>
                      <View style={styles.cardHeader}>
                        <View style={styles.tournamentTitleSection}>
                          <Avatar.Icon 
                            size={48} 
                            icon="trophy" 
                            style={styles.tournamentAvatar} 
                            color="white"
                          />
                          <View style={styles.cardTitleContainer}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <Text style={styles.cardSubtitle}>{item.dates}</Text>
                          </View>
                        </View>
                      </View>
                      <Divider style={styles.divider} />
                      <View style={styles.tournamentDetails}>
                        <View style={styles.detailItem}>
                          <MaterialCommunityIcons name="account-group" size={18} color="#666" />
                          <Text style={styles.detailText}>{item.teams} Teams</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <MaterialCommunityIcons name="map-marker" size={18} color="#666" />
                          <Text style={styles.detailText}>{item.location}</Text>
                        </View>
                      </View>
                      <View style={styles.cardFooter}>
                        <Button 
                          mode="text" 
                          icon="information-outline" 
                          onPress={() => {}}
                          style={styles.viewDetailsButton}
                        >
                          View Details
                        </Button>
                        <View style={styles.actionButtons}>
                          <IconButton 
                            icon="pencil" 
                            size={20} 
                            onPress={() => {}} 
                            style={styles.actionButton}
                            iconColor="#0D47A1"
                          />
                          <IconButton 
                            icon="delete" 
                            size={20} 
                            onPress={() => {}} 
                            style={styles.actionButton}
                            iconColor="#D32F2F"
                          />
                        </View>
                      </View>
                    </Card.Content>
                  </LinearGradient>
                </Card>
              ))
            )}
          </View>
        );
      
      default:
        return null;
    }
  };

  // Render form dialogs
  const renderDialogs = () => (
    <Portal>
      {/* News Form Dialog */}
      <Dialog 
        visible={newsDialogVisible} 
        onDismiss={() => setNewsDialogVisible(false)}
        style={[styles.dialog, { width: dialogWidth }]}
      >
        <LinearGradient
          colors={['#E3F2FD', '#FFFFFF']}
          style={styles.dialogHeader}
        >
          <Dialog.Title style={styles.dialogTitle}>
            <MaterialCommunityIcons name="newspaper-plus" size={24} color="#0D47A1" style={styles.dialogTitleIcon} />
            Create News Article
          </Dialog.Title>
        </LinearGradient>
        <Dialog.ScrollArea style={[styles.dialogScrollArea, { maxHeight: dialogMaxHeight }]}>
          <ScrollView contentContainerStyle={styles.dialogScrollContent}>
            <View style={styles.dialogContent}>
              <View style={styles.dialogIntro}>
                <Text style={styles.dialogDescription}>Create a news article to share important updates with your community.</Text>
              </View>
              
              <TextInput
                label="Title"
                value={newsForm.title}
                onChangeText={(text) => setNewsForm({ ...newsForm, title: text })}
                mode="outlined"
                style={styles.input}
                outlineColor="#BBDEFB"
                activeOutlineColor="#1565C0"

              />
              <TextInput
                label="Content"
                value={newsForm.content}
                onChangeText={(text) => setNewsForm({ ...newsForm, content: text })}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.textArea}
                outlineColor="#BBDEFB"
                activeOutlineColor="#1565C0"

                placeholder="Enter the main content of your news article..."
              />
              
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryContainer}>
                <RadioButton.Group
                  onValueChange={(value) => setNewsForm({ ...newsForm, category: value })}
                  value={newsForm.category}
                >
                  <View style={styles.radioGroup}>
                    <TouchableOpacity 
                      style={[styles.categoryOption, newsForm.category === 'general' && styles.selectedCategory]}
                      onPress={() => setNewsForm({ ...newsForm, category: 'general' })}
                    >
                      <RadioButton 
                        value="general" 
                        color="#1565C0"
                      />
                      <Text style={styles.categoryText}>General</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.categoryOption, newsForm.category === 'events' && styles.selectedCategory]}
                      onPress={() => setNewsForm({ ...newsForm, category: 'events' })}
                    >
                      <RadioButton 
                        value="events" 
                        color="#1565C0"
                      />
                      <Text style={styles.categoryText}>Events</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.categoryOption, newsForm.category === 'training' && styles.selectedCategory]}
                      onPress={() => setNewsForm({ ...newsForm, category: 'training' })}
                    >
                      <RadioButton 
                        value="training" 
                        color="#1565C0"
                      />
                      <Text style={styles.categoryText}>Training</Text>
                    </TouchableOpacity>
                  </View>
                </RadioButton.Group>
              </View>
              
              <View style={styles.imageUploadContainer}>
                <Text style={styles.inputLabel}>Featured Image</Text>
                <TouchableOpacity style={styles.imageUploadBox} onPress={() => {}}>
                  <MaterialCommunityIcons name="image-plus" size={36} color="#BBDEFB" />
                  <Text style={styles.uploadText}>Tap to upload image</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={styles.dialogActions}>
          <Button 
            onPress={() => setNewsDialogVisible(false)}
            textColor="#757575"
            style={styles.dialogButton}
          >
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={() => setNewsDialogVisible(false)}
            style={styles.saveButton}
            labelStyle={styles.saveButtonLabel}
          >
            Save Article
          </Button>
        </Dialog.Actions>
      </Dialog>

      {/* Announcement Form Dialog */}
      <Dialog 
        visible={announcementDialogVisible} 
        onDismiss={() => setAnnouncementDialogVisible(false)}
        style={[styles.dialog, { width: dialogWidth }]}
      >
        <LinearGradient
          colors={['#E8F5E9', '#FFFFFF']}
          style={styles.dialogHeader}
        >
          <Dialog.Title style={styles.dialogTitle}>
            <MaterialCommunityIcons name="bullhorn" size={24} color="#2E7D32" style={styles.dialogTitleIcon} />
            Create Announcement
          </Dialog.Title>
        </LinearGradient>
        <Dialog.ScrollArea style={[styles.dialogScrollArea, { maxHeight: dialogMaxHeight }]}>
          <ScrollView contentContainerStyle={styles.dialogScrollContent}>
            <View style={styles.dialogContent}>
              <View style={styles.dialogIntro}>
                <Text style={styles.dialogDescription}>Create an announcement to notify members about important information.</Text>
              </View>
              
              <TextInput
                label="Title"
                value={announcementForm.title}
                onChangeText={(text) => setAnnouncementForm({ ...announcementForm, title: text })}
                mode="outlined"
                style={styles.input}
                outlineColor="#C8E6C9"
                activeOutlineColor="#2E7D32"

                placeholder="Enter a clear, concise title"
              />
              <TextInput
                label="Content"
                value={announcementForm.content}
                onChangeText={(text) => setAnnouncementForm({ ...announcementForm, content: text })}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.textArea}
                outlineColor="#C8E6C9"
                activeOutlineColor="#2E7D32"
              />
              
              <Text style={styles.inputLabel}>Priority Level</Text>
              <View style={styles.priorityOptionsContainer}>
                <RadioButton.Group
                  onValueChange={(value) => setAnnouncementForm({ ...announcementForm, priority: value })}
                  value={announcementForm.priority}
                >
                  <View style={styles.priorityOptions}>
                    <TouchableOpacity 
                      style={[styles.priorityOption, announcementForm.priority === 'low' && styles.selectedPriorityLow]}
                      onPress={() => setAnnouncementForm({ ...announcementForm, priority: 'low' })}
                    >
                      <MaterialCommunityIcons name="information-outline" size={20} color="#1565C0" style={styles.priorityOptionIcon} />
                      <View style={styles.priorityOptionContent}>
                        <Text style={styles.priorityOptionTitle}>Low</Text>
                        <Text style={styles.priorityOptionDescription}>General information</Text>
                      </View>
                      <RadioButton 
                        value="low" 
                        color="#1565C0"
                      />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.priorityOption, announcementForm.priority === 'normal' && styles.selectedPriorityNormal]}
                      onPress={() => setAnnouncementForm({ ...announcementForm, priority: 'normal' })}
                    >
                      <MaterialCommunityIcons name="information" size={20} color="#2E7D32" style={styles.priorityOptionIcon} />
                      <View style={styles.priorityOptionContent}>
                        <Text style={styles.priorityOptionTitle}>Normal</Text>
                        <Text style={styles.priorityOptionDescription}>Standard updates</Text>
                      </View>
                      <RadioButton 
                        value="normal" 
                        color="#2E7D32"
                      />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.priorityOption, announcementForm.priority === 'high' && styles.selectedPriorityHigh]}
                      onPress={() => setAnnouncementForm({ ...announcementForm, priority: 'high' })}
                    >
                      <MaterialCommunityIcons name="alert-circle" size={20} color="#D32F2F" style={styles.priorityOptionIcon} />
                      <View style={styles.priorityOptionContent}>
                        <Text style={styles.priorityOptionTitle}>High</Text>
                        <Text style={styles.priorityOptionDescription}>Important alerts</Text>
                      </View>
                      <RadioButton 
                        value="high" 
                        color="#D32F2F"
                      />
                    </TouchableOpacity>
                  </View>
                </RadioButton.Group>
              </View>
            </View>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={styles.dialogActions}>
          <Button 
            onPress={() => setAnnouncementDialogVisible(false)}
            textColor="#757575"
            style={styles.dialogButton}
          >
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={() => setAnnouncementDialogVisible(false)}
            style={[styles.saveButton, { backgroundColor: '#2E7D32' }]}
            labelStyle={styles.saveButtonLabel}
          >
            Post Announcement
          </Button>
        </Dialog.Actions>
      </Dialog>

      {/* Team Form Dialog */}
      <Dialog 
        visible={teamDialogVisible} 
        onDismiss={() => setTeamDialogVisible(false)}
        style={[styles.dialog, { width: dialogWidth }]}
      >
        <LinearGradient
          colors={['#E8F5E9', '#FFFFFF']}
          style={styles.dialogHeader}
        >
          <Dialog.Title style={styles.dialogTitle}>
            <MaterialCommunityIcons name="account-group" size={24} color="#00A651" style={styles.dialogTitleIcon} />
            Register Team
          </Dialog.Title>
        </LinearGradient>
        <Dialog.ScrollArea style={[styles.dialogScrollArea, { maxHeight: dialogMaxHeight }]}>
          <ScrollView contentContainerStyle={styles.dialogScrollContent}>
            <View style={styles.dialogContent}>
              <View style={styles.dialogIntro}>
                <Text style={styles.dialogDescription}>Register a new team to participate in leagues and tournaments.</Text>
              </View>
              
              <TextInput
                label="Team Name"
                value={teamForm.name}
                onChangeText={(text) => setTeamForm({ ...teamForm, name: text })}
                mode="outlined"
                style={styles.input}
                outlineColor="#C8E6C9"
                activeOutlineColor="#00A651"

                placeholder="Enter team name"
              />
              
              <View style={styles.formRow}>
                <TextInput
                  label="Division"
                  value={teamForm.division}
                  onChangeText={(text) => setTeamForm({ ...teamForm, division: text })}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  outlineColor="#C8E6C9"
                  activeOutlineColor="#00A651"
                />
                
                <TextInput
                  label="Coach Name"
                  value={teamForm.coach}
                  onChangeText={(text) => setTeamForm({ ...teamForm, coach: text })}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  outlineColor="#C8E6C9"
                  activeOutlineColor="#00A651"
                />
              </View>
              
              <TextInput
                label="Players (comma separated)"
                value={teamForm.players}
                onChangeText={(text) => setTeamForm({ ...teamForm, players: text })}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.textArea}
                outlineColor="#C8E6C9"
                activeOutlineColor="#00A651"
              />
              
              <View style={styles.imageUploadContainer}>
                <Text style={styles.inputLabel}>Team Logo</Text>
                <TouchableOpacity style={styles.imageUploadBox} onPress={() => {}}>
                  <MaterialCommunityIcons name="shield-plus" size={36} color="#C8E6C9" />
                  <Text style={styles.uploadText}>Tap to upload team logo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={styles.dialogActions}>
          <Button 
            onPress={() => setTeamDialogVisible(false)}
            textColor="#757575"
            style={styles.dialogButton}
          >
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={() => setTeamDialogVisible(false)}
            style={[styles.saveButton, { backgroundColor: '#00A651' }]}
            labelStyle={styles.saveButtonLabel}
          >
            Register Team
          </Button>
        </Dialog.Actions>
      </Dialog>

      {/* Tournament Form Dialog */}
      <Dialog 
        visible={tournamentDialogVisible} 
        onDismiss={() => setTournamentDialogVisible(false)}
        style={[styles.dialog, { width: dialogWidth }]}
      >
        <LinearGradient
          colors={['#FFF3E0', '#FFFFFF']}
          style={styles.dialogHeader}
        >
          <Dialog.Title style={styles.dialogTitle}>
            <MaterialCommunityIcons name="trophy" size={24} color="#FF9800" style={styles.dialogTitleIcon} />
            Register Tournament
          </Dialog.Title>
        </LinearGradient>
        <Dialog.ScrollArea style={[styles.dialogScrollArea, { maxHeight: dialogMaxHeight }]}>
          <ScrollView contentContainerStyle={styles.dialogScrollContent}>
            <View style={styles.dialogContent}>
              <View style={styles.dialogIntro}>
                <Text style={styles.dialogDescription}>Create a new tournament with customized settings and participating teams.</Text>
              </View>
              
              <TextInput
                label="Tournament Name"
                value={tournamentForm.name}
                onChangeText={(text) => setTournamentForm({ ...tournamentForm, name: text })}
                mode="outlined"
                style={styles.input}
                outlineColor="#FFE0B2"
                activeOutlineColor="#FF9800"

                placeholder="Enter tournament name"
              />
              
              <View style={styles.formRow}>
                <TextInput
                  label="Start Date"
                  value={tournamentForm.startDate}
                  onChangeText={(text) => setTournamentForm({ ...tournamentForm, startDate: text })}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  outlineColor="#FFE0B2"
                  activeOutlineColor="#FF9800"
  
                />
                
                <TextInput
                  label="End Date"
                  value={tournamentForm.endDate}
                  onChangeText={(text) => setTournamentForm({ ...tournamentForm, endDate: text })}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  outlineColor="#FFE0B2"
                  activeOutlineColor="#FF9800"
  
                />
              </View>
              
              <TextInput
                label="Location"
                value={tournamentForm.location}
                onChangeText={(text) => setTournamentForm({ ...tournamentForm, location: text })}
                mode="outlined"
                style={styles.input}
                outlineColor="#FFE0B2"
                activeOutlineColor="#FF9800"

              />
              
              <TextInput
                label="Description"
                value={tournamentForm.description}
                onChangeText={(text) => setTournamentForm({ ...tournamentForm, description: text })}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.textArea}
                outlineColor="#FFE0B2"
                activeOutlineColor="#FF9800"
              />
              
              <View style={styles.teamsContainer}>
                <Text style={styles.inputLabel}>Participating Teams</Text>
                <TextInput
                  label="Teams (comma separated)"
                  value={tournamentForm.teams}
                  onChangeText={(text) => setTournamentForm({ ...tournamentForm, teams: text })}
                  mode="outlined"
                  style={styles.input}
                  outlineColor="#FFE0B2"
                  activeOutlineColor="#FF9800"
                />
                <View style={styles.chipContainer}>
                  {tournamentForm.teams.split(',').filter(team => team.trim() !== '').map((team, index) => (
                    <Chip 
                      key={index} 
                      style={styles.teamChip}
                      onClose={() => {
                        const teams = tournamentForm.teams.split(',').filter((_, i) => i !== index).join(',');
                        setTournamentForm({ ...tournamentForm, teams });
                      }}
                    >
                      {team.trim()}
                    </Chip>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={styles.dialogActions}>
          <Button 
            onPress={() => setTournamentDialogVisible(false)}
            textColor="#757575"
            style={styles.dialogButton}
          >
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={() => setTournamentDialogVisible(false)}
            style={[styles.saveButton, { backgroundColor: '#FF9800' }]}
            labelStyle={styles.saveButtonLabel}
          >
            Register Tournament
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  // Show the appropriate form dialog based on the active tab
  const showCreateForm = () => {
    switch (activeTab) {
      case 'news':
        setNewsDialogVisible(true);
        break;
      case 'announcements':
        setAnnouncementDialogVisible(true);
        break;
      case 'teams':
        setTeamDialogVisible(true);
        break;
      case 'tournaments':
        setTournamentDialogVisible(true);
        break;
      default:
        break;
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#1565C0', '#0D47A1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <IconButton 
              icon="arrow-left" 
              iconColor="white" 
              size={24} 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            />
            <View>
              <Text style={styles.headerTitle}>Registration Center</Text>
              <Text style={styles.headerSubtitle}>Create and manage content</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            buttons={[
              { value: 'news', label: 'News', icon: 'newspaper' },
              { value: 'announcements', label: 'Announcements', icon: 'bullhorn' },
              { value: 'teams', label: 'Teams', icon: 'account-group' },
              { value: 'tournaments', label: 'Tournaments', icon: 'trophy' },
            ]}
            style={[styles.tabButtons, { width: isTablet ? width * 0.8 : width * 0.95 }]}
            density="medium"
          />
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>

      {renderDialogs()}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={showCreateForm}
        label={`Create ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}`}
        color="#FFFFFF"
        theme={{ colors: { onPrimaryContainer: '#FFFFFF' } }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    marginBottom: 10,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
    letterSpacing: 0.3,
  },
  tabContainer: {
    paddingTop: 30,
    paddingBottom: 20,
    marginTop: -24,
    zIndex: 1,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  tabButtons: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    marginBottom: 24,
    marginHorizontal: 4,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#757575',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },
  card: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    marginHorizontal: 2,
  },
  cardGradient: {
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  categoryChip: {
    backgroundColor: '#E3F2FD',
    borderColor: '#BBDEFB',
    marginLeft: 8,
  },
  priorityChip: {
    borderWidth: 1,
    marginLeft: 4,
  },
  statusChip: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 14,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginHorizontal: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    backgroundColor: '#0D47A1',
    marginRight: 8,
  },
  authorText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIcon: {
    marginRight: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginLeft: 4,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamAvatar: {
    marginRight: 16,
    backgroundColor: '#00A651',
  },
  tournamentTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tournamentAvatar: {
    marginRight: 16,
    backgroundColor: '#FF9800',
  },
  tournamentDetails: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 12,
  },
  teamDetailsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  viewDetailsButton: {
    marginLeft: -8,
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    backgroundColor: '#0D47A1',
    elevation: 6,
    borderRadius: 28,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  textArea: {
    marginBottom: 16,
    backgroundColor: 'white',
    minHeight: 80, // Reduced from 120 to 80
  },
  inputLabel: {
    fontSize: 16,
    color: '#424242',
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '500',
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  selectedCategory: {
    backgroundColor: '#E3F2FD',
    borderColor: '#BBDEFB',
  },
  categoryText: {
    fontSize: 14,
    color: '#424242',
    marginLeft: 4,
  },
  priorityOptionsContainer: {
    marginBottom: 16,
  },
  priorityOptions: {
    flexDirection: 'column',
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  selectedPriorityLow: {
    backgroundColor: '#E3F2FD',
    borderColor: '#BBDEFB',
  },
  selectedPriorityNormal: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  selectedPriorityHigh: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  priorityOptionIcon: {
    marginRight: 12,
  },
  priorityOptionContent: {
    flex: 1,
  },
  priorityOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#424242',
  },
  priorityOptionDescription: {
    fontSize: 12,
    color: '#757575',
  },
  imageUploadContainer: {
    marginBottom: 16,
  },
  imageUploadBox: {
    borderWidth: 1,
    borderColor: '#BBDEFB',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  uploadText: {
    marginTop: 8,
    color: '#757575',
    fontSize: 14,
  },
  dialog: {
    borderRadius: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  dialogHeader: {
    paddingVertical: 12, // Reduced from 16 to 12
  },
  dialogTitle: {
    fontSize: 20,
    color: '#424242',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dialogTitleIcon: {
    marginRight: 8,
    verticalAlign: 'middle',
  },
  dialogScrollArea: {
    paddingHorizontal: 4,
  },
  dialogScrollContent: {
    flexGrow: 1,
  },
  dialogContent: {
    padding: 16, // Reduced from 20 to 16
  },
  dialogActions: {
    padding: 16, // Reduced from 20 to 16
    justifyContent: 'space-between',
  },
  dialogButton: {
    marginHorizontal: 4,
  },
  saveButton: {
    backgroundColor: '#1565C0',
    paddingHorizontal: 16,
  },
  saveButtonLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  dialogIntro: {
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#BBDEFB',
  },
  dialogDescription: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    flex: 0.48,
  },
  teamsContainer: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  teamChip: {
    margin: 4,
    backgroundColor: '#FFF3E0',
  },
});

export default RegisterScreen;
