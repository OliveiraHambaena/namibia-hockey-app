import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Dimensions, Animated, StatusBar, Share, ActivityIndicator } from 'react-native';
import { Text, Card, Chip, Divider, Avatar, List, Button, DataTable, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../utils/supabase';

// Define a function to generate random colors for placeholder images if needed
const getRandomColor = () => {
  const colors = ['0066CC', 'FFB81C', 'CC0000', '006633', '9900CC', 'FF6600', '339933', '990000'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Define types for Player, Game, and other data structures
interface Player {
  id: string;
  number: string;
  name: string;
  position: string;
  goals: number;
  assists: number;
  points: number;
}

interface Game {
  id: string;
  opponent: string;
  opponentLogo: string;
  date: string;
  time: string;
  location: string;
  venue?: string;
}

interface Coach {
  name: string;
  image: string;
  experience: string;
}

interface TeamStats {
  goalsFor: number;
  goalsAgainst: number;
  powerPlayPercentage: string;
  penaltyKillPercentage: string;
  shotsPerGame: number;
  faceoffPercentage: string;
}

interface TeamData {
  id: string;
  name: string;
  logo: string;
  coverImage: string;
  city: string;
  division: string;
  conference: string;
  standing: string;
  record: string;
  points: number;
  stats: TeamStats;
  coach: Coach;
  roster: Player[];
  nextGame: Game | null;
  lastGame: any | null;
  schedule: Game[];
}

// Define types for navigation and route props
interface TeamDetailProps {
  route: { params: { teamId?: string } };
  navigation: any; // Using 'any' for simplicity, but ideally should use proper navigation type
};

const TeamDetailScreen = ({ route, navigation }: TeamDetailProps) => {
  const { teamId } = route.params || {};
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if current user has admin role
  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch user's profile to check role
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (data && data.role === 'admin') {
          setIsAdmin(true);
        }
      }
    } catch (err) {
      console.error('Error checking user role:', err);
    }
  };
  
  const { width } = Dimensions.get('window');
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Fetch team details from Supabase
  const fetchTeamDetails = async () => {
    if (!teamId) {
      setError('Team ID is missing');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch team details from team_details_view
      const { data, error } = await supabase
        .from('team_details_view')
        .select('*')
        .eq('id', teamId)
        .single();
      
      if (error) {
        console.error('Error fetching team details:', error.message);
        setError('Failed to load team details. Please try again.');
        return;
      }
      
      if (data) {
        // Transform data to match the expected structure
        const transformedData = {
          id: data.id,
          name: data.name,
          logo: data.logo_url,
          coverImage: data.cover_image_url,
          city: data.city,
          division: data.division,
          conference: data.conference,
          standing: data.standing || 'N/A',
          record: data.record || '0-0-0',
          points: data.points || 0,
          stats: data.stats || {
            goalsFor: 0,
            goalsAgainst: 0,
            powerPlayPercentage: '0%',
            penaltyKillPercentage: '0%',
            shotsPerGame: 0,
            faceoffPercentage: '0%'
          },
          coach: data.coach || {
            name: 'No Coach Assigned',
            image: 'https://via.placeholder.com/100x100/CCCCCC/666666?text=Coach',
            experience: 'N/A'
          },
          roster: data.roster || [],
          nextGame: data.next_game || null,
          lastGame: data.last_game || null,
          schedule: data.schedule || []
        };
        
        setTeam(transformedData);
      } else {
        setError('Team not found');
      }
    } catch (err: any) {
      console.error('Unexpected error fetching team details:', err.message);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Run entrance animation and fetch team details when component mounts
  useEffect(() => {
    fetchTeamDetails();
    checkUserRole();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [teamId]);
  
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
    if (!team) return;
    
    try {
      await Share.share({
        message: `Check out the ${team?.city || ''} ${team?.name || ''} team! Current record: ${team?.record || '0-0-0'}`,
        title: `${team?.city || ''} ${team?.name || ''}`,
      });
    } catch (error) {
      console.error(error);
    }
  };
  
  // If loading, show loading spinner
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading team details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // If error, show error message
  if (error || !team) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#D32F2F" />
          <Text style={styles.errorText}>{error || 'Team not found'}</Text>
          <Button 
            mode="contained" 
            onPress={() => {
              if (teamId) fetchTeamDetails();
              else navigation.goBack();
            }}
            style={styles.retryButton}
          >
            {teamId ? 'Retry' : 'Go Back'}
          </Button>
        </View>
      </SafeAreaView>
    );
  }
  
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
                        source={{ uri: team?.nextGame?.opponentLogo || 'https://via.placeholder.com/50x50/CCCCCC/666666?text=Team' }} 
                        style={styles.gameTeamLogo}
                        resizeMode="contain"
                      />
                      <Text style={styles.gameTeamName}>{team?.nextGame?.opponent || 'TBD'}</Text>
                    </View>
                  </View>
                </View>
                
                <Divider style={styles.divider} />
                
                <View style={styles.gameDetails}>
                  <View style={styles.gameDetailItem}>
                    <Icon name="calendar" size={16} color="#0066CC" style={styles.gameDetailIcon} />
                    <Text style={styles.gameDetailText}>{team?.nextGame?.date || 'TBD'}</Text>
                  </View>
                  <View style={styles.gameDetailItem}>
                    <Icon name="clock-outline" size={16} color="#0066CC" style={styles.gameDetailIcon} />
                    <Text style={styles.gameDetailText}>{team?.nextGame?.time || 'TBD'}</Text>
                  </View>
                  <View style={styles.gameDetailItem}>
                    <Icon name="map-marker" size={16} color="#0066CC" style={styles.gameDetailIcon} />
                    <Text style={styles.gameDetailText}>
                      {team?.nextGame?.location === 'Home' ? 'Home - ' : 'Away - '}
                      {team?.nextGame?.venue || 'TBD'}
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
              <View style={styles.headerActions}>
                {isAdmin && (
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddPlayer', { teamId: team?.id })}
                  >
                    <Icon name="account-plus" size={16} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Add Player</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View Roster</Text>
                </TouchableOpacity>
              </View>
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
                
                {team?.roster && team.roster.length > 0 ? (
                  team.roster.map((player: Player) => (
                    <DataTable.Row key={player.id} style={styles.tableRow}>
                      <DataTable.Cell style={{ flex: 0.5 }}>{player.number}</DataTable.Cell>
                      <DataTable.Cell>{player.name}</DataTable.Cell>
                      <DataTable.Cell style={{ flex: 0.5 }}>{player.position}</DataTable.Cell>
                      <DataTable.Cell numeric>{player.goals}</DataTable.Cell>
                      <DataTable.Cell numeric>{player.assists}</DataTable.Cell>
                      <DataTable.Cell numeric>{player.points}</DataTable.Cell>
                    </DataTable.Row>
                  ))
                ) : (
                  <DataTable.Row style={styles.tableRow}>
                    <DataTable.Cell style={{ flex: 4, alignItems: 'center' }}>
                      <Text style={{ textAlign: 'center' }}>No players in roster</Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                )}
              </DataTable>
            </Card>
          </View>
          
          {/* Upcoming Games */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Games</Text>
              {isAdmin && (
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => navigation.navigate('AddGame', { teamId: team?.id })}
                >
                  <Icon name="calendar-plus" size={16} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add Game</Text>
                </TouchableOpacity>
              )}
            </View>
            <Card style={styles.scheduleCard}>
              <Card.Content>
                {team?.schedule && team.schedule.length > 0 ? (
                  team.schedule.map((game: Game, index: number) => (
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
                  ))
                ) : (
                  <View style={styles.emptySchedule}>
                    <Icon name="calendar-blank" size={40} color="#CCCCCC" />
                    <Text style={styles.emptyScheduleText}>No upcoming games</Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          </View>
          
          {/* Coach */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Coach</Text>
              {isAdmin && (
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => navigation.navigate('AddCoach', { teamId: team?.id })}
                >
                  <Icon name="account-tie-plus" size={16} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add Coach</Text>
                </TouchableOpacity>
              )}
            </View>
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
      
      {/* Snackbar for feedback messages */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#0066CC',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#0066CC',
  },
  emptySchedule: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyScheduleText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
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
