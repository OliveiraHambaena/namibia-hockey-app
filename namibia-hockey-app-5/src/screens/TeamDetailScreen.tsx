import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Dimensions, Animated, StatusBar, Share } from 'react-native';
import { Text, Card, Chip, Divider, Avatar, List, Button, DataTable } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data for team details (Namibian team)
const teamDetails = {
  id: 'featured1',
  name: 'Coastal Pirates',
  logo: 'https://via.placeholder.com/150x150/0066CC/FFFFFF?text=CP',
  coverImage: 'https://via.placeholder.com/800x400/0066CC/FFFFFF?text=Coastal+Pirates',
  city: 'Swakopmund',
  division: 'Coastal',
  conference: 'Premier',
  standing: '1st',
  record: '18-4-2',
  points: 56,
  stats: {
    goalsFor: 82,
    goalsAgainst: 45,
    powerPlayPercentage: '26.3%',
    penaltyKillPercentage: '85.7%',
    shotsPerGame: 29.8,
    faceoffPercentage: '54.2%'
  },
  nextGame: {
    opponent: 'Windhoek Warriors',
    opponentLogo: 'https://via.placeholder.com/50x50/FFB81C/000000?text=WW',
    date: 'May 15, 2025',
    time: '7:30 PM CAT',
    location: 'Home',
    venue: 'Swakopmund Ice Arena'
  },
  lastGame: {
    opponent: 'Desert Lions',
    opponentLogo: 'https://via.placeholder.com/50x50/0038A8/FFFFFF?text=DL',
    result: 'W 3-1',
    date: 'May 10, 2025'
  },
  coach: {
    name: 'Daniel Mwandingi',
    image: 'https://via.placeholder.com/100x100',
    experience: '7 years'
  },
  roster: [
    { id: 'p1', number: '10', name: 'Shilongo', position: 'C', goals: 22, assists: 18, points: 40 },
    { id: 'p2', number: '7', name: 'Amukoto', position: 'RW', goals: 15, assists: 24, points: 39 },
    { id: 'p3', number: '23', name: 'Nghipandulwa', position: 'C', goals: 14, assists: 19, points: 33 },
    { id: 'p4', number: '17', name: 'Van Wyk', position: 'RW', goals: 12, assists: 16, points: 28 },
    { id: 'p5', number: '3', name: 'Tjituka', position: 'D', goals: 5, assists: 21, points: 26 }
  ],
  schedule: [
    { id: 'g1', opponent: 'Windhoek Warriors', opponentLogo: 'https://via.placeholder.com/40x40/FFB81C/000000?text=WW', date: 'May 15, 2025', time: '7:30 PM', location: 'Home' },
    { id: 'g2', opponent: 'Kalahari Kings', opponentLogo: 'https://via.placeholder.com/40x40/6F263D/FFFFFF?text=KK', date: 'May 18, 2025', time: '7:00 PM', location: 'Away' },
    { id: 'g3', opponent: 'Northern Lights', opponentLogo: 'https://via.placeholder.com/40x40/FF4C00/FFFFFF?text=NL', date: 'May 20, 2025', time: '7:30 PM', location: 'Home' }
  ]
};

// Define types for navigation and route props
type TeamDetailProps = {
  route: { params: { teamId?: string } };
  navigation: any; // Using 'any' for simplicity, but ideally should use proper navigation type
};

const TeamDetailScreen = ({ route, navigation }: TeamDetailProps) => {
  // In a real app, you would fetch the team details based on the ID
  // const { teamId } = route.params;
  const team = teamDetails; // For mock purposes
  
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
  
  // Share team info
  const shareTeam = async () => {
    try {
      await Share.share({
        message: `Check out the ${team.city} ${team.name} team! Current record: ${team.record}`,
        title: `${team.city} ${team.name}`,
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
          <Text style={styles.headerTitle}>{team.name}</Text>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={shareTeam}
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
            source={{ uri: team.coverImage }}
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
            onPress={shareTeam}
          >
            <Icon name="share-variant" size={24} color="white" />
          </TouchableOpacity>
          
          {/* Team Logo and Basic Info */}
          <View style={styles.teamHeroInfo}>
            <Image 
              source={{ uri: team.logo }} 
              style={styles.teamLogo}
              resizeMode="contain"
            />
            <View style={styles.teamBasicInfo}>
              <Text style={styles.teamName}>{team.name}</Text>
              <Text style={styles.teamCity}>{team.city}</Text>
              <View style={styles.teamDivision}>
                <Text style={styles.divisionText}>{team.conference} Conference • {team.division} Division</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Team Content */}
        <Animated.View 
          style={[
            styles.teamContainer,
            { opacity: fadeAnim }
          ]}
        >
          {/* Team Record Card */}
          <Card style={styles.recordCard}>
            <Card.Content style={styles.recordContent}>
              <View style={styles.recordItem}>
                <Text style={styles.recordLabel}>Record</Text>
                <Text style={styles.recordValue}>{team.record}</Text>
              </View>
              <View style={styles.recordDivider} />
              <View style={styles.recordItem}>
                <Text style={styles.recordLabel}>Standing</Text>
                <Text style={styles.recordValue}>{team.standing}</Text>
              </View>
              <View style={styles.recordDivider} />
              <View style={styles.recordItem}>
                <Text style={styles.recordLabel}>Points</Text>
                <Text style={styles.recordValue}>{team.points}</Text>
              </View>
            </Card.Content>
          </Card>
          
          {/* Next Game */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Next Game</Text>
            <Card style={styles.nextGameCard}>
              <Card.Content>
                <View style={styles.nextGameHeader}>
                  <View style={styles.gameTeams}>
                    <View style={styles.gameTeam}>
                      <Image 
                        source={{ uri: team.logo }} 
                        style={styles.gameTeamLogo}
                        resizeMode="contain"
                      />
                      <Text style={styles.gameTeamName}>{team.name}</Text>
                    </View>
                    <Text style={styles.vsText}>VS</Text>
                    <View style={styles.gameTeam}>
                      <Image 
                        source={{ uri: team.nextGame.opponentLogo }} 
                        style={styles.gameTeamLogo}
                        resizeMode="contain"
                      />
                      <Text style={styles.gameTeamName}>{team.nextGame.opponent}</Text>
                    </View>
                  </View>
                </View>
                
                <Divider style={styles.divider} />
                
                <View style={styles.gameDetails}>
                  <View style={styles.gameDetailItem}>
                    <Icon name="calendar" size={16} color="#0066CC" style={styles.gameDetailIcon} />
                    <Text style={styles.gameDetailText}>{team.nextGame.date}</Text>
                  </View>
                  <View style={styles.gameDetailItem}>
                    <Icon name="clock-outline" size={16} color="#0066CC" style={styles.gameDetailIcon} />
                    <Text style={styles.gameDetailText}>{team.nextGame.time}</Text>
                  </View>
                  <View style={styles.gameDetailItem}>
                    <Icon name="map-marker" size={16} color="#0066CC" style={styles.gameDetailIcon} />
                    <Text style={styles.gameDetailText}>
                      {team.nextGame.location === 'Home' ? 'Home - ' : 'Away - '}
                      {team.nextGame.venue}
                    </Text>
                  </View>
                </View>
                
                <Button 
                  mode="contained" 
                  style={styles.ticketButton}
                  labelStyle={styles.ticketButtonLabel}
                  onPress={() => {}}
                >
                  Get Tickets
                </Button>
              </Card.Content>
            </Card>
          </View>
          
          {/* Team Stats */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Team Stats</Text>
            <Card style={styles.statsCard}>
              <Card.Content>
                <View style={styles.statRow}>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Goals For</Text>
                    <Text style={styles.statValue}>{team.stats.goalsFor}</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Goals Against</Text>
                    <Text style={styles.statValue}>{team.stats.goalsAgainst}</Text>
                  </View>
                </View>
                
                <View style={styles.statRow}>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Power Play</Text>
                    <Text style={styles.statValue}>{team.stats.powerPlayPercentage}</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Penalty Kill</Text>
                    <Text style={styles.statValue}>{team.stats.penaltyKillPercentage}</Text>
                  </View>
                </View>
                
                <View style={styles.statRow}>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Shots Per Game</Text>
                    <Text style={styles.statValue}>{team.stats.shotsPerGame}</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Faceoff %</Text>
                    <Text style={styles.statValue}>{team.stats.faceoffPercentage}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>
          
          {/* Top Players */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Players</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View Roster</Text>
              </TouchableOpacity>
            </View>
            
            <Card style={styles.rosterCard}>
              <DataTable>
                <DataTable.Header style={styles.tableHeader}>
                  <DataTable.Title style={{ flex: 0.5 }}>#</DataTable.Title>
                  <DataTable.Title>Player</DataTable.Title>
                  <DataTable.Title style={{ flex: 0.5 }}>Pos</DataTable.Title>
                  <DataTable.Title numeric>G</DataTable.Title>
                  <DataTable.Title numeric>A</DataTable.Title>
                  <DataTable.Title numeric>PTS</DataTable.Title>
                </DataTable.Header>
                
                {team.roster.map((player) => (
                  <DataTable.Row key={player.id} style={styles.tableRow}>
                    <DataTable.Cell style={{ flex: 0.5 }}>{player.number}</DataTable.Cell>
                    <DataTable.Cell>{player.name}</DataTable.Cell>
                    <DataTable.Cell style={{ flex: 0.5 }}>{player.position}</DataTable.Cell>
                    <DataTable.Cell numeric>{player.goals}</DataTable.Cell>
                    <DataTable.Cell numeric>{player.assists}</DataTable.Cell>
                    <DataTable.Cell numeric>{player.points}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card>
          </View>
          
          {/* Upcoming Games */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Upcoming Games</Text>
            <Card style={styles.scheduleCard}>
              <Card.Content>
                {team.schedule.map((game, index) => (
                  <React.Fragment key={game.id}>
                    <View style={styles.scheduleItem}>
                      <View style={styles.scheduleTeam}>
                        <Image 
                          source={{ uri: game.opponentLogo }} 
                          style={styles.scheduleTeamLogo}
                          resizeMode="contain"
                        />
                        <Text style={styles.scheduleTeamName}>{game.opponent}</Text>
                      </View>
                      <View style={styles.scheduleInfo}>
                        <Text style={styles.scheduleDate}>{game.date}</Text>
                        <Text style={styles.scheduleTime}>{game.time}</Text>
                        <Chip style={styles.locationChip}>
                          <Text style={styles.locationChipText}>{game.location}</Text>
                        </Chip>
                      </View>
                    </View>
                    {index < team.schedule.length - 1 && <Divider style={styles.scheduleDivider} />}
                  </React.Fragment>
                ))}
              </Card.Content>
            </Card>
          </View>
          
          {/* Coach */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Coach</Text>
            <Card style={styles.coachCard}>
              <Card.Content style={styles.coachContent}>
                <Image 
                  source={{ uri: team.coach.image }} 
                  style={styles.coachImage}
                />
                <View style={styles.coachInfo}>
                  <Text style={styles.coachName}>{team.coach.name}</Text>
                  <Text style={styles.coachExperience}>{team.coach.experience} experience</Text>
                </View>
              </Card.Content>
            </Card>
          </View>
        </Animated.View>
      </Animated.ScrollView>
      
      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarButton}>
          <Icon name="bell-outline" size={24} color="#666666" />
          <Text style={styles.bottomBarButtonText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton}>
          <Icon name="calendar" size={24} color="#666666" />
          <Text style={styles.bottomBarButtonText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton}>
          <Icon name="account-group" size={24} color="#666666" />
          <Text style={styles.bottomBarButtonText}>Roster</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton}>
          <Icon name="chart-line" size={24} color="#666666" />
          <Text style={styles.bottomBarButtonText}>Stats</Text>
        </TouchableOpacity>
      </View>
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
    height: 300,
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
  teamHeroInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    marginRight: 16,
  },
  teamBasicInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  teamCity: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  teamDivision: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10, // Added bottom margin for better spacing
  },
  divisionText: {
    color: 'white',
    fontSize: 12,
  },
  teamContainer: {
    backgroundColor: '#F5F7FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120, // Increased bottom padding to create more space above the bottom bar
  },
  recordCard: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },
  recordContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  recordItem: {
    flex: 1,
    alignItems: 'center',
  },
  recordLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  recordValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  recordDivider: {
    width: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 8,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  viewAllText: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: '500',
  },
  nextGameCard: {
    borderRadius: 16,
    elevation: 2,
  },
  nextGameHeader: {
    marginBottom: 16,
  },
  gameTeams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameTeam: {
    alignItems: 'center',
    flex: 1,
  },
  gameTeamLogo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  gameTeamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
  },
  divider: {
    backgroundColor: '#EEEEEE',
    height: 1,
    marginVertical: 16,
  },
  gameDetails: {
    marginBottom: 16,
  },
  gameDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameDetailIcon: {
    marginRight: 8,
  },
  gameDetailText: {
    fontSize: 14,
    color: '#444444',
  },
  ticketButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
  },
  ticketButtonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 2,
  },
  statsCard: {
    borderRadius: 16,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  rosterCard: {
    borderRadius: 16,
    elevation: 2,
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#F0F2F5',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  scheduleCard: {
    borderRadius: 16,
    elevation: 2,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  scheduleTeam: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduleTeamLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  scheduleTeamName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  scheduleInfo: {
    alignItems: 'flex-end',
  },
  scheduleDate: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 2,
  },
  scheduleTime: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  locationChip: {
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    height: 30, // Increased height for better visibility
    paddingHorizontal: 8, // Added horizontal padding for better text display
    minWidth: 60, // Added minimum width to ensure text is fully visible
    justifyContent: 'center', // Center content vertically
  },
  locationChipText: {
    fontSize: 12, // Increased font size for better readability
    color: '#0066CC',
    textAlign: 'center', // Center the text in the chip
  },
  scheduleDivider: {
    backgroundColor: '#EEEEEE',
    height: 1,
  },
  coachCard: {
    borderRadius: 16,
    elevation: 2,
  },
  coachContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  coachExperience: {
    fontSize: 14,
    color: '#666666',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  bottomBarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  bottomBarButtonText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  }
});

export default TeamDetailScreen;
