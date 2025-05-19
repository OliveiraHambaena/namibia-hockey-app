import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Animated,
  StatusBar,
  Dimensions,
  useWindowDimensions,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Button, Chip, Divider, DataTable, Searchbar, SegmentedButtons } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data for standings
const standingsData = [
  {
    id: 'team1',
    name: 'Coastal Pirates',
    logo: 'https://via.placeholder.com/100x100/0066CC/FFFFFF?text=CP',
    gamesPlayed: 15,
    wins: 12,
    losses: 2,
    overtimeLosses: 1,
    points: 25,
    goalsFor: 45,
    goalsAgainst: 28
  },
  {
    id: 'team2',
    name: 'Windhoek Warriors',
    logo: 'https://via.placeholder.com/100x100/FFB81C/000000?text=WW',
    gamesPlayed: 15,
    wins: 10,
    losses: 4,
    overtimeLosses: 1,
    points: 21,
    goalsFor: 38,
    goalsAgainst: 30
  },
  {
    id: 'team3',
    name: 'Desert Lions',
    logo: 'https://via.placeholder.com/100x100/C8102E/FFFFFF?text=DL',
    gamesPlayed: 15,
    wins: 8,
    losses: 5,
    overtimeLosses: 2,
    points: 18,
    goalsFor: 36,
    goalsAgainst: 32
  },
  {
    id: 'team4',
    name: 'Northern Lights',
    logo: 'https://via.placeholder.com/100x100/FF4C00/FFFFFF?text=NL',
    gamesPlayed: 15,
    wins: 7,
    losses: 6,
    overtimeLosses: 2,
    points: 16,
    goalsFor: 32,
    goalsAgainst: 34
  },
  {
    id: 'team5',
    name: 'Kalahari Kings',
    logo: 'https://via.placeholder.com/100x100/6F263D/FFFFFF?text=KK',
    gamesPlayed: 15,
    wins: 5,
    losses: 8,
    overtimeLosses: 2,
    points: 12,
    goalsFor: 28,
    goalsAgainst: 36
  },
  {
    id: 'team6',
    name: 'Walvis Bay Sharks',
    logo: 'https://via.placeholder.com/100x100/006778/FFFFFF?text=WBS',
    gamesPlayed: 15,
    wins: 3,
    losses: 10,
    overtimeLosses: 2,
    points: 8,
    goalsFor: 24,
    goalsAgainst: 40
  }
];

// Mock data for top scorers
const topScorersData = [
  {
    id: 'player1',
    name: 'Alex Johnson',
    team: 'Coastal Pirates',
    teamLogo: 'https://via.placeholder.com/100x100/0066CC/FFFFFF?text=CP',
    position: 'C',
    goals: 18,
    assists: 12,
    points: 30,
    gamesPlayed: 15
  },
  {
    id: 'player2',
    name: 'Michael Smith',
    team: 'Windhoek Warriors',
    teamLogo: 'https://via.placeholder.com/100x100/FFB81C/000000?text=WW',
    position: 'RW',
    goals: 15,
    assists: 14,
    points: 29,
    gamesPlayed: 15
  },
  {
    id: 'player3',
    name: 'David Williams',
    team: 'Desert Lions',
    teamLogo: 'https://via.placeholder.com/100x100/C8102E/FFFFFF?text=DL',
    position: 'C',
    goals: 14,
    assists: 13,
    points: 27,
    gamesPlayed: 15
  },
  {
    id: 'player4',
    name: 'James Brown',
    team: 'Northern Lights',
    teamLogo: 'https://via.placeholder.com/100x100/FF4C00/FFFFFF?text=NL',
    position: 'LW',
    goals: 12,
    assists: 14,
    points: 26,
    gamesPlayed: 14
  },
  {
    id: 'player5',
    name: 'Robert Davis',
    team: 'Coastal Pirates',
    teamLogo: 'https://via.placeholder.com/100x100/0066CC/FFFFFF?text=CP',
    position: 'D',
    goals: 8,
    assists: 16,
    points: 24,
    gamesPlayed: 15
  }
];

// Mock data for goalies
const goaliesData = [
  {
    id: 'goalie1',
    name: 'Thomas Wilson',
    team: 'Coastal Pirates',
    teamLogo: 'https://via.placeholder.com/100x100/0066CC/FFFFFF?text=CP',
    gamesPlayed: 14,
    wins: 11,
    losses: 2,
    overtimeLosses: 1,
    goalsAgainst: 26,
    savePercentage: 0.923,
    shutouts: 3
  },
  {
    id: 'goalie2',
    name: 'Christopher Lee',
    team: 'Windhoek Warriors',
    teamLogo: 'https://via.placeholder.com/100x100/FFB81C/000000?text=WW',
    gamesPlayed: 13,
    wins: 9,
    losses: 3,
    overtimeLosses: 1,
    goalsAgainst: 28,
    savePercentage: 0.918,
    shutouts: 2
  },
  {
    id: 'goalie3',
    name: 'Daniel Martinez',
    team: 'Desert Lions',
    teamLogo: 'https://via.placeholder.com/100x100/C8102E/FFFFFF?text=DL',
    gamesPlayed: 14,
    wins: 8,
    losses: 4,
    overtimeLosses: 2,
    goalsAgainst: 30,
    savePercentage: 0.912,
    shutouts: 1
  },
  {
    id: 'goalie4',
    name: 'Matthew Taylor',
    team: 'Northern Lights',
    teamLogo: 'https://via.placeholder.com/100x100/FF4C00/FFFFFF?text=NL',
    gamesPlayed: 12,
    wins: 6,
    losses: 4,
    overtimeLosses: 2,
    goalsAgainst: 29,
    savePercentage: 0.908,
    shutouts: 1
  },
  {
    id: 'goalie5',
    name: 'Anthony Anderson',
    team: 'Kalahari Kings',
    teamLogo: 'https://via.placeholder.com/100x100/6F263D/FFFFFF?text=KK',
    gamesPlayed: 13,
    wins: 5,
    losses: 6,
    overtimeLosses: 2,
    goalsAgainst: 32,
    savePercentage: 0.902,
    shutouts: 0
  }
];

// Mock data for recent games
const recentGamesData = [
  {
    id: 'game1',
    date: 'May 10, 2025',
    homeTeam: 'Coastal Pirates',
    homeTeamLogo: 'https://via.placeholder.com/100x100/0066CC/FFFFFF?text=CP',
    homeScore: 4,
    awayTeam: 'Desert Lions',
    awayTeamLogo: 'https://via.placeholder.com/100x100/C8102E/FFFFFF?text=DL',
    awayScore: 2,
    status: 'Final'
  },
  {
    id: 'game2',
    date: 'May 9, 2025',
    homeTeam: 'Windhoek Warriors',
    homeTeamLogo: 'https://via.placeholder.com/100x100/FFB81C/000000?text=WW',
    homeScore: 3,
    awayTeam: 'Northern Lights',
    awayTeamLogo: 'https://via.placeholder.com/100x100/FF4C00/FFFFFF?text=NL',
    awayScore: 2,
    status: 'Final OT'
  },
  {
    id: 'game3',
    date: 'May 8, 2025',
    homeTeam: 'Kalahari Kings',
    homeTeamLogo: 'https://via.placeholder.com/100x100/6F263D/FFFFFF?text=KK',
    homeScore: 1,
    awayTeam: 'Walvis Bay Sharks',
    awayTeamLogo: 'https://via.placeholder.com/100x100/006778/FFFFFF?text=WBS',
    awayScore: 3,
    status: 'Final'
  }
];

// Mock data for upcoming games
const upcomingGamesData = [
  {
    id: 'upcoming1',
    date: 'May 15, 2025',
    time: '7:30 PM CAT',
    homeTeam: 'Coastal Pirates',
    homeTeamLogo: 'https://via.placeholder.com/100x100/0066CC/FFFFFF?text=CP',
    awayTeam: 'Windhoek Warriors',
    awayTeamLogo: 'https://via.placeholder.com/100x100/FFB81C/000000?text=WW',
    venue: 'Swakopmund Ice Arena'
  },
  {
    id: 'upcoming2',
    date: 'May 16, 2025',
    time: '7:00 PM CAT',
    homeTeam: 'Desert Lions',
    homeTeamLogo: 'https://via.placeholder.com/100x100/C8102E/FFFFFF?text=DL',
    awayTeam: 'Northern Lights',
    awayTeamLogo: 'https://via.placeholder.com/100x100/FF4C00/FFFFFF?text=NL',
    venue: 'Windhoek National Arena'
  },
  {
    id: 'upcoming3',
    date: 'May 17, 2025',
    time: '6:30 PM CAT',
    homeTeam: 'Kalahari Kings',
    homeTeamLogo: 'https://via.placeholder.com/100x100/6F263D/FFFFFF?text=KK',
    awayTeam: 'Walvis Bay Sharks',
    awayTeamLogo: 'https://via.placeholder.com/100x100/006778/FFFFFF?text=WBS',
    venue: 'Gobabis Stadium'
  }
];

const LeagueScreen = ({ navigation }: { navigation: any }) => {
  const [activeTab, setActiveTab] = useState('standings');
  const [statsType, setStatsType] = useState('skaters');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  
  // Get safe area insets
  const insets = useSafeAreaInsets();
  
  // Get window dimensions for responsive layout
  const { width, height } = useWindowDimensions();
  
  // Determine if device is in landscape orientation
  const isLandscape = width > height;
  
  // Calculate dynamic sizes based on screen dimensions
  const cardWidth = isLandscape ? width * 0.45 : width * 0.92;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderStandings = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>League Standings</Text>
        <DataTable>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title style={{ flex: 3 }}>Team</DataTable.Title>
            <DataTable.Title numeric>GP</DataTable.Title>
            <DataTable.Title numeric>W</DataTable.Title>
            <DataTable.Title numeric>L</DataTable.Title>
            <DataTable.Title numeric>OTL</DataTable.Title>
            <DataTable.Title numeric style={styles.pointsColumn}>PTS</DataTable.Title>
          </DataTable.Header>

          {standingsData.map((team) => (
            <DataTable.Row key={team.id} onPress={() => navigation.navigate('TeamDetail', { teamId: team.id })}>
              <DataTable.Cell style={{ flex: 3 }}>
                <View style={styles.teamCell}>
                  <Image source={{ uri: team.logo }} style={styles.teamLogo} />
                  <Text style={styles.teamName}>{team.name}</Text>
                </View>
              </DataTable.Cell>
              <DataTable.Cell numeric>{team.gamesPlayed}</DataTable.Cell>
              <DataTable.Cell numeric>{team.wins}</DataTable.Cell>
              <DataTable.Cell numeric>{team.losses}</DataTable.Cell>
              <DataTable.Cell numeric>{team.overtimeLosses}</DataTable.Cell>
              <DataTable.Cell numeric style={styles.pointsColumn}><Text style={styles.pointsText}>{team.points}</Text></DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </Card.Content>
    </Card>
  );

  const renderSkaterStats = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Top Scorers</Text>
        <DataTable>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title style={{ flex: 3 }}>Player</DataTable.Title>
            <DataTable.Title numeric>GP</DataTable.Title>
            <DataTable.Title numeric>G</DataTable.Title>
            <DataTable.Title numeric>A</DataTable.Title>
            <DataTable.Title numeric style={styles.pointsColumn}>PTS</DataTable.Title>
          </DataTable.Header>

          {topScorersData.map((player) => (
            <DataTable.Row key={player.id}>
              <DataTable.Cell style={{ flex: 3 }}>
                <View style={styles.playerCell}>
                  <Image source={{ uri: player.teamLogo }} style={styles.playerTeamLogo} />
                  <View>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerTeam}>{player.team} | {player.position}</Text>
                  </View>
                </View>
              </DataTable.Cell>
              <DataTable.Cell numeric>{player.gamesPlayed}</DataTable.Cell>
              <DataTable.Cell numeric>{player.goals}</DataTable.Cell>
              <DataTable.Cell numeric>{player.assists}</DataTable.Cell>
              <DataTable.Cell numeric style={styles.pointsColumn}><Text style={styles.pointsText}>{player.points}</Text></DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </Card.Content>
    </Card>
  );

  const renderGoalieStats = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Goalie Statistics</Text>
        <DataTable>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title style={{ flex: 3 }}>Goalie</DataTable.Title>
            <DataTable.Title numeric>GP</DataTable.Title>
            <DataTable.Title numeric>W</DataTable.Title>
            <DataTable.Title numeric>L</DataTable.Title>
            <DataTable.Title numeric style={styles.pointsColumn}>SV%</DataTable.Title>
          </DataTable.Header>

          {goaliesData.map((goalie) => (
            <DataTable.Row key={goalie.id}>
              <DataTable.Cell style={{ flex: 3 }}>
                <View style={styles.playerCell}>
                  <Image source={{ uri: goalie.teamLogo }} style={styles.playerTeamLogo} />
                  <View>
                    <Text style={styles.playerName}>{goalie.name}</Text>
                    <Text style={styles.playerTeam}>{goalie.team}</Text>
                  </View>
                </View>
              </DataTable.Cell>
              <DataTable.Cell numeric>{goalie.gamesPlayed}</DataTable.Cell>
              <DataTable.Cell numeric>{goalie.wins}</DataTable.Cell>
              <DataTable.Cell numeric>{goalie.losses}</DataTable.Cell>
              <DataTable.Cell numeric style={styles.pointsColumn}>
                <Text style={styles.pointsText}>{goalie.savePercentage.toFixed(3)}</Text>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </Card.Content>
    </Card>
  );

  const renderSchedule = () => (
    <>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Recent Games</Text>
          {recentGamesData.map((game) => (
            <View key={game.id} style={styles.gameItem}>
              <Text style={styles.gameDate}>{game.date}</Text>
              <View style={styles.gameTeams}>
                <View style={styles.gameTeam}>
                  <Image source={{ uri: game.homeTeamLogo }} style={styles.gameTeamLogo} />
                  <Text style={styles.gameTeamName}>{game.homeTeam}</Text>
                </View>
                <View style={styles.gameScoreContainer}>
                  <Text style={styles.gameScore}>{game.homeScore} - {game.awayScore}</Text>
                  <Chip style={styles.gameStatusChip}>
                    <Text style={styles.gameStatusText}>{game.status}</Text>
                  </Chip>
                </View>
                <View style={styles.gameTeam}>
                  <Image source={{ uri: game.awayTeamLogo }} style={styles.gameTeamLogo} />
                  <Text style={styles.gameTeamName}>{game.awayTeam}</Text>
                </View>
              </View>
              <Divider style={styles.gameDivider} />
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Upcoming Games</Text>
          {upcomingGamesData.map((game) => (
            <View key={game.id} style={styles.gameItem}>
              <View style={styles.upcomingGameHeader}>
                <Text style={styles.gameDate}>{game.date}</Text>
                <Text style={styles.gameTime}>{game.time}</Text>
              </View>
              <View style={styles.gameTeams}>
                <View style={styles.gameTeam}>
                  <Image source={{ uri: game.homeTeamLogo }} style={styles.gameTeamLogo} />
                  <Text style={styles.gameTeamName}>{game.homeTeam}</Text>
                </View>
                <View style={styles.vsContainer}>
                  <Text style={styles.vsText}>VS</Text>
                </View>
                <View style={styles.gameTeam}>
                  <Image source={{ uri: game.awayTeamLogo }} style={styles.gameTeamLogo} />
                  <Text style={styles.gameTeamName}>{game.awayTeam}</Text>
                </View>
              </View>
              <Text style={styles.venueText}>{game.venue}</Text>
              <Divider style={styles.gameDivider} />
            </View>
          ))}
        </Card.Content>
      </Card>
    </>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { 
      paddingTop: Platform.OS === 'android' ? insets.top : 0,
      paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
      paddingLeft: Platform.OS === 'android' ? insets.left : 0,
      paddingRight: Platform.OS === 'android' ? insets.right : 0
    }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0066CC" />
      
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#0066CC', '#004999']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>League</Text>
            <Text style={styles.headerSubtitle}>2024-2025 Season</Text>
          </View>
          <TouchableOpacity style={styles.infoButton}>
            <Icon name="information-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Tabs with pill-style design */}
        <View style={styles.tabContainer}>
          <View style={styles.tabPillContainer}>
            <TouchableOpacity 
              style={[styles.tabPill, activeTab === 'standings' && styles.activeTabPill]}
              onPress={() => setActiveTab('standings')}
            >
              <Icon 
                name="format-list-numbered" 
                size={18} 
                color={activeTab === 'standings' ? '#0066CC' : '#FFFFFF'} 
                style={styles.tabIcon}
              />
              <Text style={[styles.tabPillText, activeTab === 'standings' && styles.activeTabPillText]}>Standings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabPill, activeTab === 'stats' && styles.activeTabPill]}
              onPress={() => setActiveTab('stats')}
            >
              <Icon 
                name="chart-bar" 
                size={18} 
                color={activeTab === 'stats' ? '#0066CC' : '#FFFFFF'} 
                style={styles.tabIcon}
              />
              <Text style={[styles.tabPillText, activeTab === 'stats' && styles.activeTabPillText]}>Stats</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabPill, activeTab === 'schedule' && styles.activeTabPill]}
              onPress={() => setActiveTab('schedule')}
            >
              <Icon 
                name="calendar" 
                size={18} 
                color={activeTab === 'schedule' ? '#0066CC' : '#FFFFFF'} 
                style={styles.tabIcon}
              />
              <Text style={[styles.tabPillText, activeTab === 'schedule' && styles.activeTabPillText]}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY }] }
          ]}
        >
          {activeTab === 'standings' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>League Standings</Text>
                <Chip 
                  style={styles.seasonChip} 
                  textStyle={styles.seasonChipText}
                >
                  Regular Season
                </Chip>
              </View>
              {renderStandings()}
            </>
          )}
          
          {activeTab === 'stats' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Player Statistics</Text>
                <SegmentedButtons
                  value={statsType}
                  onValueChange={setStatsType}
                  buttons={[
                    { value: 'skaters', label: 'Skaters', icon: 'hockey-sticks' },
                    { value: 'goalies', label: 'Goalies', icon: 'shield' },
                  ]}
                  style={styles.segmentedButtons}
                />
              </View>
              {statsType === 'skaters' ? renderSkaterStats() : renderGoalieStats()}
            </>
          )}
          
          {activeTab === 'schedule' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Game Schedule</Text>
                <TouchableOpacity style={styles.calendarButton}>
                  <Icon name="calendar-month" size={20} color="#0066CC" />
                  <Text style={styles.calendarButtonText}>Full Calendar</Text>
                </TouchableOpacity>
              </View>
              {renderSchedule()}
            </>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  infoButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  tabPillContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 25,
    padding: 4,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTabPill: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabPillText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  activeTabPillText: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  container: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  seasonChip: {
    backgroundColor: '#E8F2FF',
    borderColor: '#0066CC',
    borderWidth: 1,
  },
  seasonChipText: {
    color: '#0066CC',
    fontWeight: '500',
    fontSize: 12,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  calendarButtonText: {
    color: '#0066CC',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 4,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderColor: '#EEEEEE',
    borderWidth: 1,
  },
  tableHeader: {
    backgroundColor: '#F5F7FA',
  },
  teamCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 14,
  },
  teamName: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  pointsColumn: {
    backgroundColor: 'rgba(0, 102, 204, 0.05)',
  },
  pointsText: {
    fontWeight: 'bold',
    color: '#0066CC',
  },
  playerCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerTeamLogo: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 14,
  },
  playerName: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  playerTeam: {
    fontSize: 12,
    color: '#666666',
  },
  segmentedButtons: {
    width: 180,
  },
  gameItem: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderColor: '#EEEEEE',
    borderWidth: 1,
    elevation: 2,
  },
  gameDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '500',
  },
  upcomingGameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gameTime: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  gameTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gameTeam: {
    alignItems: 'center',
    width: '40%',
  },
  gameTeamLogo: {
    width: 50,
    height: 50,
    marginBottom: 8,
    borderRadius: 25,
    backgroundColor: '#F5F7FA',
    padding: 4,
  },
  gameTeamName: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },
  gameScoreContainer: {
    alignItems: 'center',
    width: '20%',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 8,
  },
  gameScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  gameStatusChip: {
    backgroundColor: '#0066CC',
  },
  gameStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  vsContainer: {
    alignItems: 'center',
    width: '20%',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 8,
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  venueText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 0,
    backgroundColor: '#F5F7FA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'center',
  },
  gameDivider: {
    marginTop: 8,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
});

export default LeagueScreen;
