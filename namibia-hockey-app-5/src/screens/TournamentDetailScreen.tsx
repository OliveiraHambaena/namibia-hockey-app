import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Dimensions, Animated, StatusBar, Share } from 'react-native';
import { Text, Button, Chip, Divider, Avatar, List, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data for tournament details
const tournamentDetails = {
  id: '1',
  title: 'Summer Hockey Championship',
  description: 'Join the most exciting hockey tournament of the summer! This championship brings together teams from across the region to compete for the grand prize and bragging rights.',
  location: 'City Arena, Downtown',
  fullAddress: '123 Main Street, Downtown, City, 12345',
  date: 'June 15-20, 2025',
  registrationDeadline: 'May 30, 2025',
  status: 'Registration Open',
  statusColor: '#00A651', // Green
  imageUrl: 'https://via.placeholder.com/600x300/0066CC/FFFFFF?text=Summer+Championship',
  categories: ['Adult', 'Professional'],
  teams: 16,
  maxTeams: 24,
  prize: '$5,000',
  entryFee: '$250 per team',
  organizer: {
    name: 'City Hockey Association',
    logo: 'https://via.placeholder.com/50x50',
    contact: 'info@cityhockey.org'
  },
  schedule: [
    { day: 'Day 1', date: 'June 15', events: ['Opening Ceremony (9:00 AM)', 'Group Stage Matches (10:00 AM - 6:00 PM)'] },
    { day: 'Day 2', date: 'June 16', events: ['Group Stage Matches (9:00 AM - 6:00 PM)'] },
    { day: 'Day 3', date: 'June 17', events: ['Group Stage Matches (9:00 AM - 6:00 PM)'] },
    { day: 'Day 4', date: 'June 18', events: ['Quarter Finals (10:00 AM - 2:00 PM)', 'Semi Finals (3:00 PM - 7:00 PM)'] },
    { day: 'Day 5', date: 'June 19', events: ['Rest Day', 'Skills Competition (2:00 PM - 5:00 PM)'] },
    { day: 'Day 6', date: 'June 20', events: ['Finals (1:00 PM - 3:00 PM)', 'Award Ceremony (4:00 PM)'] }
  ],
  rules: [
    'Teams must have a minimum of 15 players and a maximum of 25 players',
    'Games consist of three 20-minute periods',
    'Tournament follows official IIHF rules with modifications',
    'All players must wear full protective equipment',
    'Zero tolerance for fighting or major penalties'
  ],
  registeredTeams: [
    { id: '1', name: 'Blazing Blades', logo: 'https://via.placeholder.com/40x40', players: 18 },
    { id: '2', name: 'Ice Titans', logo: 'https://via.placeholder.com/40x40', players: 22 },
    { id: '3', name: 'Frozen Flyers', logo: 'https://via.placeholder.com/40x40', players: 20 }
  ]
};

// Define types for navigation and route props
type TournamentDetailProps = {
  route: { params: { tournamentId?: string } };
  navigation: any; // Using 'any' for simplicity, but ideally should use proper navigation type
};

const TournamentDetailScreen = ({ route, navigation }: TournamentDetailProps) => {
  // In a real app, you would fetch the tournament details based on the ID
  // const { tournamentId } = route.params;
  const tournament = tournamentDetails; // For mock purposes
  
  const { width } = Dimensions.get('window');
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Run entrance animation once when component mounts
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
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
    try {
      await Share.share({
        message: `Check out the ${tournament.title} happening on ${tournament.date} at ${tournament.location}! Register now!`,
        title: tournament.title,
      });
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
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
            source={{ uri: tournament.imageUrl }}
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
          <View style={[styles.statusBadge, { backgroundColor: tournament.statusColor }]}>
            <Text style={styles.statusText}>{tournament.status}</Text>
          </View>
          
          <Text style={styles.tournamentTitle}>{tournament.title}</Text>
          
          <View style={styles.categoriesContainer}>
            {tournament.categories.map((category, idx) => (
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
            <Text style={styles.infoText}>{tournament.date}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={18} color="#0066CC" style={styles.infoIcon} />
            <Text style={styles.infoText}>{tournament.location}</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tournament.teams}/{tournament.maxTeams}</Text>
              <Text style={styles.statLabel}>Teams</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tournament.prize}</Text>
              <Text style={styles.statLabel}>Prize Pool</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tournament.entryFee}</Text>
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
              source={{ uri: tournament.organizer.logo }} 
              style={styles.organizerLogo}
            />
            <View style={styles.organizerInfo}>
              <Text style={styles.organizerName}>{tournament.organizer.name}</Text>
              <Text style={styles.organizerContact}>{tournament.organizer.contact}</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Schedule */}
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.scheduleContainer}>
            {tournament.schedule.map((day, index) => (
              <View key={index} style={styles.scheduleItem}>
                <View style={styles.scheduleDay}>
                  <Text style={styles.scheduleDayText}>{day.day}</Text>
                  <Text style={styles.scheduleDateText}>{day.date}</Text>
                </View>
                <View style={styles.scheduleEvents}>
                  {day.events.map((event, eventIndex) => (
                    <Text key={eventIndex} style={styles.scheduleEventText}>• {event}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Rules */}
          <Text style={styles.sectionTitle}>Tournament Rules</Text>
          <View style={styles.rulesContainer}>
            {tournament.rules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <Icon name="check-circle" size={16} color="#00A651" style={styles.ruleIcon} />
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Registered Teams */}
          <Text style={styles.sectionTitle}>Registered Teams</Text>
          <View style={styles.teamsContainer}>
            {tournament.registeredTeams.map((team) => (
              <View key={team.id} style={styles.teamItem}>
                <Image source={{ uri: team.logo }} style={styles.teamLogo} />
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamPlayers}>{team.players} players</Text>
                </View>
                <TouchableOpacity style={styles.teamViewButton}>
                  <Text style={styles.teamViewButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            ))}
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
              onPress={() => navigation.navigate('TournamentRegistration', { tournamentId: tournament.id })}
            >
              Register Your Team
            </Button>
            <Text style={styles.registrationDeadline}>
              Registration Deadline: {tournament.registrationDeadline}
            </Text>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  scheduleDay: {
    width: 80,
  },
  scheduleDayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  scheduleDateText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  scheduleEvents: {
    flex: 1,
  },
  scheduleEventText: {
    fontSize: 14,
    color: '#444444',
    marginBottom: 6,
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
});

export default TournamentDetailScreen;
