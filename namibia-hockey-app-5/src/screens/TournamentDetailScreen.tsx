import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Dimensions, Animated, StatusBar, Share, ActivityIndicator, Alert, Modal, FlatList, TextInput } from 'react-native';
import { Text, Button, Chip, Divider, Avatar, List, Card, Searchbar, Portal, Provider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

// Default placeholder image for tournaments without images
const DEFAULT_TOURNAMENT_IMAGE = 'https://via.placeholder.com/600x300/0066CC/FFFFFF?text=Tournament';

// Define types for tournament data
type Tournament = {
  id: string;
  title: string;
  description?: string;
  location: string;
  full_address?: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  status: string;
  status_color: string;
  image_url?: string;
  teams_count: number;
  max_teams?: number;
  prize_pool?: string;
  entry_fee?: string;
  created_at?: string;
  updated_at?: string;
  organizer_id?: string;
  organizer_name?: string;
  organizer_logo?: string;
  organizer_contact?: string;
  categories: string[];
  schedule?: any[];
  rules?: string[];
  registered_teams?: any[];
};

// Define types for navigation and route props
type TournamentDetailProps = {
  route: { params: { tournamentId?: string } };
  navigation: any; // Using 'any' for simplicity, but ideally should use proper navigation type
};

// Define Team type
type Team = {
  id: string;
  name: string;
  logo?: string;
  city: string;
  division: string;
  conference: string;
  standing?: string;
  record?: string;
  points?: number;
  category?: string;
  created_by?: string;
};

const TournamentDetailScreen = ({ route, navigation }: TournamentDetailProps) => {
  const { tournamentId } = route.params;
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamsModalVisible, setTeamsModalVisible] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [scheduleDay, setScheduleDay] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [dayNumber, setDayNumber] = useState(1);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [eventName, setEventName] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventError, setEventError] = useState<string | null>(null);
  const [eventSaving, setEventSaving] = useState(false);
  
  const { width } = Dimensions.get('window');
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Format date range for display
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Format the dates
    const startFormatted = start.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
    
    const endFormatted = end.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };
  
  // Fetch tournament details
  const fetchTournamentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch tournament details
      const { data, error } = await supabase
        .from('tournament_details_view')
        .select('*')
        .eq('id', tournamentId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Fetch tournament schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('tournament_schedule')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('day_number', { ascending: true });
      
      if (scheduleError) {
        console.error('Error fetching schedule:', scheduleError);
      }
      
      // Fetch events for each schedule day
      let scheduleWithEvents = [];
      
      if (scheduleData && scheduleData.length > 0) {
        // Create an array of promises to fetch events for each schedule day
        const eventPromises = scheduleData.map(async (scheduleDay) => {
          const { data: eventData, error: eventError } = await supabase
            .from('tournament_events')
            .select('*')
            .eq('schedule_id', scheduleDay.id)
            .order('event_time', { ascending: true });
            
          if (eventError) {
            console.error('Error fetching events for schedule day:', eventError);
            return {
              ...scheduleDay,
              events: []
            };
          }
          
          return {
            ...scheduleDay,
            // Format the date for display
            date: scheduleDay.schedule_date ? new Date(scheduleDay.schedule_date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            }) : 'TBD',
            events: eventData || []
          };
        });
        
        // Wait for all event fetching to complete
        scheduleWithEvents = await Promise.all(eventPromises);
      }
      
      if (data) {
        // If we have events data, use it, otherwise format the schedule data without events
        const formattedSchedule = scheduleWithEvents.length > 0 ? scheduleWithEvents : scheduleData ? scheduleData.map(item => ({
          day_number: item.day_number,
          day_name: item.day_name,
          date: item.schedule_date ? new Date(item.schedule_date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }) : 'TBD',
          events: [] // Default empty events array
        })) : [];
        
        // Format the data to match our Tournament type
        const formattedData: Tournament = {
          ...data,
          // Ensure categories is always an array
          categories: data.categories || [],
          // Parse JSON fields if they are strings
          rules: typeof data.rules === 'string' ? JSON.parse(data.rules) : data.rules || [],
          // Use the fetched schedule data if available, otherwise use the data from tournament_details_view
          schedule: formattedSchedule.length > 0 ? formattedSchedule : 
                   (typeof data.schedule === 'string' ? JSON.parse(data.schedule) : data.schedule || []),
          registered_teams: typeof data.registered_teams === 'string' ? JSON.parse(data.registered_teams) : data.registered_teams || []
        };
        
        setTournament(formattedData);
        
        // Check if the current user's team is registered
        if (user && formattedData.registered_teams) {
          // This is a simplified check - in a real app, you'd check if the user's team is registered
          setIsRegistered(false); // Default to not registered
        }
      }
    } catch (error: any) {
      console.error('Error fetching tournament details:', error);
      setError(error.message || 'Failed to fetch tournament details');
      Alert.alert('Error', 'Failed to load tournament details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch tournament details on component mount
  useEffect(() => {
    fetchTournamentDetails();
    
    // Run entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [tournamentId]);
  
  // Header animation based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp'
  });
  
  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.2, 1, 0.8],
    extrapolate: 'clamp'
  });
  
  // Share tournament info
  const shareTournament = async () => {
    if (!tournament) return;
    
    try {
      const dateText = tournament.start_date && tournament.end_date ? 
        formatDateRange(tournament.start_date, tournament.end_date) : 'TBD';
      
      await Share.share({
        message: `Check out the ${tournament.title} happening on ${dateText} at ${tournament.location}! Register now!`,
        title: tournament.title,
      });
    } catch (error) {
      console.error(error);
    }
  };
  
  // Fetch teams that the user can register
  const fetchTeams = async () => {
    if (!user) return;
    
    try {
      setLoadingTeams(true);
      setRegisterError(null);
      
      // Fetch all teams that the user can register
      const { data, error } = await supabase
        .from('teams')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setTeams(data);
      }
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      setRegisterError(error.message || 'Failed to fetch teams');
    } finally {
      setLoadingTeams(false);
    }
  };
  
  // Add a new schedule day to the tournament
  const addTournamentSchedule = async () => {
    if (!tournament || !user || !scheduleDay || !scheduleDate) return;
    
    try {
      setScheduleSaving(true);
      setScheduleError(null);
      
      // Insert new schedule day
      const { error } = await supabase
        .from('tournament_schedule')
        .insert([
          { 
            tournament_id: tournamentId,
            day_number: dayNumber,
            day_name: scheduleDay,
            schedule_date: scheduleDate
          }
        ]);
      
      if (error) {
        throw error;
      }
      
      // Schedule added successfully
      setScheduleModalVisible(false);
      
      // Reset form fields
      setScheduleDay('');
      setScheduleDate('');
      setDayNumber(prevDay => prevDay + 1);
      
      // Refresh tournament details to update the schedule list
      fetchTournamentDetails();
      
      Alert.alert('Success', 'Schedule day has been added to the tournament!');
    } catch (error: any) {
      console.error('Error adding schedule:', error);
      setScheduleError(error.message || 'Failed to add schedule');
      Alert.alert('Error', 'Failed to add schedule. Please try again.');
    } finally {
      setScheduleSaving(false);
    }
  };
  
  // Register a team for the tournament
  const registerTeamForTournament = async (teamId: string) => {
    if (!tournament || !user || !teamId) return;
    
    try {
      setRegistering(true);
      setRegisterError(null);
      
      // Check if the team is already registered
      const { data: existingRegistration, error: checkError } = await supabase
        .from('tournament_teams')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('team_id', teamId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
        throw checkError;
      }
      
      if (existingRegistration) {
        setRegisterError('This team is already registered for the tournament');
        return;
      }
      
      // Register the team
      const { error: insertError } = await supabase
        .from('tournament_teams')
        .insert([
          { 
            tournament_id: tournamentId,
            team_id: teamId,
            status: 'Registered'
          }
        ]);
      
      if (insertError) {
        throw insertError;
      }
      
      // Registration successful
      setRegisterSuccess(true);
      setTeamsModalVisible(false);
      
      // Refresh tournament details to update the registered teams list
      fetchTournamentDetails();
      
      Alert.alert('Success', 'Team has been registered for the tournament!');
    } catch (error: any) {
      console.error('Error registering team:', error);
      setRegisterError(error.message || 'Failed to register team');
      Alert.alert('Error', 'Failed to register team. Please try again.');
    } finally {
      setRegistering(false);
    }
  };
  
  // Add a new event to a schedule day
  const addTournamentEvent = async () => {
    if (!user || !selectedScheduleId || !eventName) return;
    
    try {
      setEventSaving(true);
      setEventError(null);
      
      // Insert new event
      const { error } = await supabase
        .from('tournament_events')
        .insert([
          { 
            schedule_id: selectedScheduleId,
            event_name: eventName,
            event_time: eventTime
          }
        ]);
      
      if (error) {
        throw error;
      }
      
      // Event added successfully
      setEventModalVisible(false);
      
      // Reset form fields
      setEventName('');
      setEventTime('');
      setSelectedScheduleId(null);
      
      // Refresh tournament details to update the events list
      fetchTournamentDetails();
      
      Alert.alert('Success', 'Event has been added to the schedule!');
    } catch (error: any) {
      console.error('Error adding event:', error);
      setEventError(error.message || 'Failed to add event');
      Alert.alert('Error', 'Failed to add event. Please try again.');
    } finally {
      setEventSaving(false);
    }
  };
  
  // Open event modal for a specific schedule day
  const openEventModal = (scheduleId: string) => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to manage tournament events.');
      return;
    }
    
    if (user.role !== 'admin') {
      Alert.alert('Permission Denied', 'Only administrators can manage tournament events.');
      return;
    }
    
    // Set the selected schedule ID and show the event modal
    setSelectedScheduleId(scheduleId);
    setEventModalVisible(true);
  };
  
  // Open schedule modal
  const openScheduleModal = () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to manage tournament schedule.');
      return;
    }
    
    if (user.role !== 'admin') {
      Alert.alert('Permission Denied', 'Only administrators can manage tournament schedules.');
      return;
    }
    
    // Show schedule modal
    setScheduleModalVisible(true);
  };
  
  // Open team selection modal
  const openTeamSelectionModal = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to register a team for this tournament.');
      return;
    }
    
    // Fetch teams before opening the modal
    await fetchTeams();
    
    if (teams.length === 0) {
      Alert.alert(
        'No Teams Available', 
        'You don\'t have any teams to register. Would you like to create a team first?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Create Team',
            onPress: () => navigation.navigate('CreateTeam'),
          },
        ]
      );
      return;
    }
    
    // Show team selection modal
    setTeamsModalVisible(true);
  };
  
  // Show loading indicator while fetching data
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading tournament details...</Text>
      </SafeAreaView>
    );
  }
  
  // Show error message if there was an error
  if (error || !tournament) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={60} color="#FF3B30" />
        <Text style={styles.errorText}>Failed to load tournament details</Text>
        <Button mode="contained" onPress={fetchTournamentDetails} style={styles.retryButton}>
          Retry
        </Button>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.backButton}>
          Go Back
        </Button>
      </SafeAreaView>
    );
  }
  
  // Team selection modal component
  const TeamSelectionModal = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTeams, setFilteredTeams] = useState<Team[]>(teams);
    
    // Handle search
    const handleSearch = (query: string) => {
      setSearchQuery(query);
      if (query.trim() === '') {
        setFilteredTeams(teams);
      } else {
        const filtered = teams.filter(team => 
          team.name.toLowerCase().includes(query.toLowerCase()) ||
          team.city.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredTeams(filtered);
      }
    };
    
    // Render team item
    const renderTeamItem = ({ item }: { item: Team }) => (
      <TouchableOpacity 
        style={styles.teamSelectionItem}
        onPress={() => registerTeamForTournament(item.id)}
        disabled={registering}
      >
        <Image 
          source={{ uri: item.logo || 'https://via.placeholder.com/50x50' }} 
          style={styles.teamSelectionLogo}
        />
        <View style={styles.teamSelectionInfo}>
          <Text style={styles.teamSelectionName}>{item.name}</Text>
          <Text style={styles.teamSelectionCity}>{item.city}</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#0066CC" />
      </TouchableOpacity>
    );
    
    return (
      <Modal
        visible={teamsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTeamsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Team to Register</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setTeamsModalVisible(false)}
              >
                <Icon name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            
            <Searchbar
              placeholder="Search teams"
              onChangeText={handleSearch}
              value={searchQuery}
              style={styles.teamSearchBar}
            />
            
            {loadingTeams ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#0066CC" />
                <Text style={styles.modalLoadingText}>Loading teams...</Text>
              </View>
            ) : registerError ? (
              <View style={styles.modalErrorContainer}>
                <Icon name="alert-circle-outline" size={40} color="#FF3B30" />
                <Text style={styles.modalErrorText}>{registerError}</Text>
                <Button 
                  mode="contained" 
                  onPress={fetchTeams}
                  style={styles.modalRetryButton}
                >
                  Retry
                </Button>
              </View>
            ) : filteredTeams.length === 0 ? (
              <View style={styles.modalEmptyContainer}>
                <Icon name="account-group-outline" size={40} color="#999999" />
                <Text style={styles.modalEmptyText}>
                  {searchQuery ? 'No teams match your search' : 'You don\'t have any teams yet'}
                </Text>
                {!searchQuery && (
                  <Button 
                    mode="contained" 
                    onPress={() => {
                      setTeamsModalVisible(false);
                      navigation.navigate('CreateTeam');
                    }}
                    style={styles.modalCreateButton}
                  >
                    Create Team
                  </Button>
                )}
              </View>
            ) : (
              <FlatList
                data={filteredTeams}
                renderItem={renderTeamItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.teamSelectionList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <Provider>
      <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.animatedHeader,
          { opacity: headerOpacity }
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{tournament.title}</Text>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={shareTournament}
          >
            <Icon name="share-variant" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image with Gradient Overlay */}
        <View style={styles.heroContainer}>
          <Animated.Image
            source={{ uri: tournament.image_url || DEFAULT_TOURNAMENT_IMAGE }}
            style={[
              styles.heroImage,
              { transform: [{ scale: imageScale }] }
            ]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={shareTournament}
          >
            <Icon name="share-variant" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Tournament Info */}
        <Animated.View 
          style={[
            styles.infoContainer,
            { opacity: fadeAnim }
          ]}
        >
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: tournament.status_color || '#666666' }]}>
            <Text style={styles.statusText}>{tournament.status || 'Draft'}</Text>
          </View>
          
          <Text style={styles.tournamentTitle}>{tournament.title}</Text>
          
          <View style={styles.categoriesContainer}>
            {tournament.categories && tournament.categories.map((category: string, idx: number) => (
              <Chip 
                key={idx} 
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
              >
                {category}
              </Chip>
            ))}
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="calendar" size={18} color="#0066CC" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              {tournament.start_date && tournament.end_date ? 
                formatDateRange(tournament.start_date, tournament.end_date) : 'TBD'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={18} color="#0066CC" style={styles.infoIcon} />
            <Text style={styles.infoText}>{tournament.location}</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tournament.teams_count || 0}/{tournament.max_teams || 'N/A'}</Text>
              <Text style={styles.statLabel}>Teams</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tournament.prize_pool || 'TBD'}</Text>
              <Text style={styles.statLabel}>Prize Pool</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tournament.entry_fee || 'Free'}</Text>
              <Text style={styles.statLabel}>Entry Fee</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Description */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{tournament.description}</Text>
          
          <Divider style={styles.divider} />
          
          {/* Organizer */}
          <Text style={styles.sectionTitle}>Organizer</Text>
          <View style={styles.organizerContainer}>
            <Image 
              source={{ uri: tournament.organizer_logo || 'https://via.placeholder.com/50x50' }} 
              style={styles.organizerLogo}
            />
            <View style={styles.organizerInfo}>
              <Text style={styles.organizerName}>{tournament.organizer_name || 'Tournament Organizer'}</Text>
              <Text style={styles.organizerContact}>{tournament.organizer_contact || 'No contact information'}</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Schedule */}
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            {user && user.role === 'admin' && (
              <Button 
                mode="contained" 
                compact 
                style={styles.addScheduleButton}
                labelStyle={styles.addScheduleButtonLabel}
                onPress={openScheduleModal}
              >
                Add Schedule
              </Button>
            )}
          </View>
          <View style={styles.scheduleContainer}>
            {tournament.schedule && tournament.schedule.length > 0 ? (
              tournament.schedule.map((day: any, index: number) => (
                <View key={index} style={styles.scheduleItem}>
                  <View style={styles.scheduleDayCard}>
                    <LinearGradient
                      colors={['#0066CC', '#0052A3']}
                      style={styles.scheduleDayGradient}
                    >
                      <Text style={styles.scheduleDayNumber}>DAY {day.day_number || index + 1}</Text>
                      <Text style={styles.scheduleDayText}>{day.day_name || day.day}</Text>
                    </LinearGradient>
                    <View style={styles.scheduleDateContainer}>
                      <Icon name="calendar" size={16} color="#0066CC" style={styles.scheduleDateIcon} />
                      <Text style={styles.scheduleDateText}>{day.date}</Text>
                    </View>
                  </View>
                  <View style={styles.scheduleEventsContainer}>
                    <View style={styles.scheduleEventsTitleRow}>
                      <Text style={styles.scheduleEventsTitle}>Events</Text>
                      {user && user.role === 'admin' && (
                        <TouchableOpacity 
                          style={styles.addEventButton}
                          onPress={() => openEventModal(day.id)}
                        >
                          <Icon name="plus" size={16} color="white" />
                          <Text style={styles.addEventButtonText}>Add Event</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {day.events && day.events.length > 0 ? (
                      day.events.map((event: any, eventIndex: number) => (
                        <View key={eventIndex} style={styles.scheduleEventItem}>
                          <Icon name="clock-outline" size={16} color="#0066CC" style={styles.scheduleEventIcon} />
                          <Text style={styles.scheduleEventText}>
                            {event.event_time && <Text style={styles.eventTime}>{event.event_time} - </Text>}
                            {event.event_name}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.scheduleNoEventsText}>No events scheduled for this day</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyScheduleContainer}>
                <Icon name="calendar-blank" size={50} color="#CCCCCC" />
                <Text style={styles.emptyText}>No schedule available yet</Text>
              </View>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Rules */}
          <Text style={styles.sectionTitle}>Tournament Rules</Text>
          <View style={styles.rulesContainer}>
            {tournament.rules && tournament.rules.length > 0 ? (
              tournament.rules.map((rule: string, index: number) => (
                <View key={index} style={styles.ruleItem}>
                  <Icon name="check-circle" size={16} color="#00A651" style={styles.ruleIcon} />
                  <Text style={styles.ruleText}>{rule}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No rules specified yet</Text>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Registered Teams */}
          <Text style={styles.sectionTitle}>Registered Teams</Text>
          <View style={styles.teamsContainer}>
            {tournament.registered_teams && tournament.registered_teams.length > 0 ? (
              tournament.registered_teams.map((team: any) => (
                <View key={team.id} style={styles.teamItem}>
                  <Image source={{ uri: team.logo || 'https://via.placeholder.com/40x40' }} style={styles.teamLogo} />
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamPlayers}>{team.players || 0} players</Text>
                  </View>
                  <TouchableOpacity style={styles.teamViewButton}>
                    <Text style={styles.teamViewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No teams registered yet</Text>
            )}
            <TouchableOpacity style={styles.viewAllTeamsButton}>
              <Text style={styles.viewAllTeamsText}>View All Teams</Text>
              <Icon name="chevron-right" size={20} color="#0066CC" />
            </TouchableOpacity>
          </View>
          
          {/* Registration Button */}
          <View style={styles.registerButtonContainer}>
            <Button
              mode="contained"
              style={styles.registerButton}
              labelStyle={styles.registerButtonLabel}
              onPress={openTeamSelectionModal}
              disabled={isRegistered}
              loading={registering}
            >
              {isRegistered ? 'Already Registered' : 'Register for Tournament'}
            </Button>
            {tournament.registration_deadline && (
              <Text style={styles.registrationDeadline}>
                Registration deadline: {new Date(tournament.registration_deadline).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            )}
          </View>
        </Animated.View>
      </Animated.ScrollView>
      
      {/* Team Selection Modal */}
      <TeamSelectionModal />
      
      {/* Schedule Modal */}
      <Modal
        visible={scheduleModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Tournament Schedule</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setScheduleModalVisible(false)}
              >
                <Icon name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            
            {scheduleError ? (
              <View style={styles.modalErrorContainer}>
                <Icon name="alert-circle-outline" size={40} color="#FF3B30" />
                <Text style={styles.modalErrorText}>{scheduleError}</Text>
              </View>
            ) : null}
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Day Number</Text>
              <TextInput
                style={styles.formInput}
                value={dayNumber.toString()}
                onChangeText={(text) => setDayNumber(parseInt(text) || 1)}
                keyboardType="numeric"
                placeholder="Enter day number"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Day Name</Text>
              <TextInput
                style={styles.formInput}
                value={scheduleDay}
                onChangeText={setScheduleDay}
                placeholder="e.g. Opening Day, Finals, etc."
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date</Text>
              <TextInput
                style={styles.formInput}
                value={scheduleDate}
                onChangeText={setScheduleDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <Button
              mode="contained"
              onPress={addTournamentSchedule}
              style={styles.scheduleSubmitButton}
              loading={scheduleSaving}
              disabled={!scheduleDay || !scheduleDate || scheduleSaving}
            >
              Add Schedule Day
            </Button>
          </View>
        </View>
      </Modal>
      
      {/* Event Modal */}
      <Modal
        visible={eventModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEventModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Event</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setEventModalVisible(false)}
              >
                <Icon name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            
            {eventError ? (
              <View style={styles.modalErrorContainer}>
                <Icon name="alert-circle-outline" size={40} color="#FF3B30" />
                <Text style={styles.modalErrorText}>{eventError}</Text>
              </View>
            ) : null}
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Event Name</Text>
              <TextInput
                style={styles.formInput}
                value={eventName}
                onChangeText={setEventName}
                placeholder="e.g. Opening Ceremony, Match: Team A vs Team B"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Event Time</Text>
              <TextInput
                style={styles.formInput}
                value={eventTime}
                onChangeText={setEventTime}
                placeholder="e.g. 10:00 AM, 2:30 PM"
              />
            </View>
            
            <Button
              mode="contained"
              onPress={addTournamentEvent}
              style={styles.scheduleSubmitButton}
              loading={eventSaving}
              disabled={!eventName || eventSaving}
            >
              Add Event
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  </Provider>
);
};

const styles = StyleSheet.create({
  // Section title container for buttons
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addScheduleButton: {
    backgroundColor: '#0066CC',
    borderRadius: 4,
    paddingHorizontal: 12,
    height: 36,
  },
  addScheduleButtonLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  
  // Form styles for schedule modal
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  scheduleSubmitButton: {
    backgroundColor: '#0066CC',
    marginTop: 16,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginTop: 16,
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 16,
    width: 150,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  scrollView: {
    flex: 1,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: '#0066CC',
    zIndex: 100,
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  heroContainer: {
    height: 250,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  tournamentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    marginRight: 8,
    height: 28,
  },
  categoryChipText: {
    fontSize: 12,
    color: '#0066CC',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#444444',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444444',
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  organizerContact: {
    fontSize: 14,
    color: '#666666',
  },
  scheduleContainer: {
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 16,
  },
  scheduleItem: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  scheduleDayCard: {
    width: '100%',
  },
  scheduleDayGradient: {
    padding: 16,
    alignItems: 'center',
  },
  scheduleDayNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
    marginBottom: 4,
  },
  scheduleDayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  scheduleDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F7FF',
    padding: 8,
  },
  scheduleDateIcon: {
    marginRight: 6,
  },
  scheduleDateText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  scheduleEventsContainer: {
    padding: 16,
  },
  scheduleEventsTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleEventsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066CC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  addEventButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  eventTime: {
    fontWeight: 'bold',
    color: '#0066CC',
  },
  scheduleEventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#F9F9F9',
    borderRadius: 6,
  },
  scheduleEventIcon: {
    marginRight: 8,
  },
  scheduleEventText: {
    fontSize: 14,
    color: '#444444',
    flex: 1,
  },
  scheduleNoEventsText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 12,
  },
  emptyScheduleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  rulesContainer: {
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 16,
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  ruleIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
  },
  teamsContainer: {
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 16,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  teamPlayers: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  teamViewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
  },
  teamViewButtonText: {
    fontSize: 12,
    color: '#0066CC',
    fontWeight: '500',
  },
  viewAllTeamsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllTeamsText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
    marginRight: 4,
  },
  registerButtonContainer: {
    marginTop: 24,
  },
  registerButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
  },
  registerButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  registrationDeadline: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalCloseButton: {
    padding: 8,
  },
  teamSearchBar: {
    marginBottom: 16,
    elevation: 0,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  teamSelectionList: {
    paddingBottom: 20,
  },
  teamSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  teamSelectionLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  teamSelectionInfo: {
    flex: 1,
  },
  teamSelectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  teamSelectionCity: {
    fontSize: 14,
    color: '#666666',
  },
  modalLoadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  modalErrorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  modalErrorText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
  },
  modalRetryButton: {
    backgroundColor: '#0066CC',
  },
  modalEmptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  modalEmptyText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  modalCreateButton: {
    backgroundColor: '#0066CC',
  },
});

export default TournamentDetailScreen;
