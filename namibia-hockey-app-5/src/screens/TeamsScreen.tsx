import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Dimensions, Animated, StatusBar, RefreshControl, FlatList, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Text, useTheme, Button, Chip, Divider, Avatar, Badge, Searchbar, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../utils/supabase';

// Mock data for team categories
const teamCategories = [
  { id: '1', name: 'All', icon: 'hockey-sticks' },
  { id: '2', name: 'Professional', icon: 'medal' },
  { id: '3', name: 'Amateur', icon: 'account-group' },
  { id: '4', name: 'Youth', icon: 'human-child' },
  { id: '5', name: 'Women', icon: 'human-female' }
];

// Mock data for featured team
const featuredTeam = {
  id: 'featured1',
  name: 'Coastal Pirates',
  logo: 'https://via.placeholder.com/150x150/0066CC/FFFFFF?text=CP',
  coverImage: 'https://via.placeholder.com/600x300/0066CC/FFFFFF?text=Coastal+Pirates',
  city: 'Swakopmund',
  division: 'Coastal',
  conference: 'Premier',
  standing: '1st',
  record: '18-4-2',
  points: 56,
  nextGame: {
    opponent: 'Windhoek Warriors',
    date: 'May 15, 2025',
    time: '7:30 PM CAT',
    location: 'Home'
  }
};

// Mock data for teams from Namibia
const teamsData = [
  {
    id: '1',
    name: 'Windhoek Warriors',
    logo: 'https://via.placeholder.com/100x100/FFB81C/000000?text=WW',
    city: 'Windhoek',
    division: 'Central',
    conference: 'Premier',
    standing: '2nd',
    record: '16-5-3',
    points: 51,
    category: 'Professional'
  },
  {
    id: '2',
    name: 'Desert Lions',
    logo: 'https://via.placeholder.com/100x100/0038A8/FFFFFF?text=DL',
    city: 'Walvis Bay',
    division: 'Coastal',
    conference: 'Premier',
    standing: '3rd',
    record: '15-6-3',
    points: 48,
    category: 'Professional'
  },
  {
    id: '3',
    name: 'Kalahari Kings',
    logo: 'https://via.placeholder.com/100x100/6F263D/FFFFFF?text=KK',
    city: 'Gobabis',
    division: 'Eastern',
    conference: 'Premier',
    standing: '1st',
    record: '17-4-3',
    points: 54,
    category: 'Professional'
  },
  {
    id: '4',
    name: 'Northern Lights',
    logo: 'https://via.placeholder.com/100x100/FF4C00/FFFFFF?text=NL',
    city: 'Oshakati',
    division: 'Northern',
    conference: 'Premier',
    standing: '2nd',
    record: '14-7-3',
    points: 45,
    category: 'Professional'
  },
  {
    id: '5',
    name: 'Namib Falcons',
    logo: 'https://via.placeholder.com/100x100/F74902/FFFFFF?text=NF',
    city: 'Swakopmund',
    division: 'Coastal',
    conference: 'Premier',
    standing: '4th',
    record: '13-8-3',
    points: 42,
    category: 'Professional'
  },
  {
    id: '6',
    name: 'Capital Blades',
    logo: 'https://via.placeholder.com/100x100/002868/FFFFFF?text=CB',
    city: 'Windhoek',
    division: 'Central',
    conference: 'Premier',
    standing: '5th',
    record: '12-9-3',
    points: 39,
    category: 'Professional'
  },
  {
    id: '7',
    name: 'Otjiwarongo Oilers',
    logo: 'https://via.placeholder.com/100x100/9C27B0/FFFFFF?text=OO',
    city: 'Otjiwarongo',
    division: 'Central',
    conference: 'National',
    standing: '1st',
    record: '15-5-2',
    points: 47,
    category: 'Amateur'
  },
  {
    id: '8',
    name: 'Kunene Rapids',
    logo: 'https://via.placeholder.com/100x100/FF6600/FFFFFF?text=KR',
    city: 'Opuwo',
    division: 'Northern',
    conference: 'National',
    standing: '2nd',
    record: '14-6-2',
    points: 44,
    category: 'Amateur'
  },
  {
    id: '9',
    name: 'Zambezi Juniors',
    logo: 'https://via.placeholder.com/100x100/00A651/FFFFFF?text=ZJ',
    city: 'Katima Mulilo',
    division: 'U16',
    conference: 'Youth',
    standing: '1st',
    record: '12-3-1',
    points: 37,
    category: 'Youth'
  },
  {
    id: '10',
    name: 'Windhoek Queens',
    logo: 'https://via.placeholder.com/100x100/E91E63/FFFFFF?text=WQ',
    city: 'Windhoek',
    division: 'Division A',
    conference: 'Women',
    standing: '1st',
    record: '16-4-0',
    points: 48,
    category: 'Women'
  }
];

// Define types for the component props
type TeamsScreenProps = {
  navigation: any; // Using 'any' for simplicity, but ideally should use proper navigation type
};

// Define types for team data
type Team = {
  id: string;
  name: string;
  logo: string;
  city: string;
  division: string;
  conference: string;
  standing: string;
  record: string;
  points: number;
  category: string;
  coverImage?: string;
  nextGame?: {
    opponent: string;
    date: string;
    time: string;
    location: string;
  };
};

const TeamsScreen = ({ navigation }: TeamsScreenProps) => {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('1'); // Default to 'All'
  const [teams, setTeams] = useState<any[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<any[]>([]);
  const [featuredTeam, setFeaturedTeam] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  
  // Pre-create animation values for team cards (will be updated when teams load)
  const [teamAnimations, setTeamAnimations] = useState<any[]>([]);
  
  // Featured team animation values
  const featuredScale = useRef(new Animated.Value(0.95)).current;
  const featuredOpacity = useRef(new Animated.Value(0)).current;
  
  // Fetch teams from Supabase
  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch teams from team_details_view
      const { data, error } = await supabase
        .from('team_details_view')
        .select('*');
        
      if (error) {
        console.error('Error fetching teams:', error.message);
        setError('Failed to load teams. Please try again.');
        return;
      }
      
      if (data && data.length > 0) {
        // Map the data to match our UI structure
        const mappedTeams = data.map(team => ({
          id: team.id,
          name: team.name,
          logo: team.logo_url,
          city: team.city,
          division: team.division,
          conference: team.conference,
          standing: team.standing || '',
          record: team.record || '0-0-0',
          points: team.points || 0,
          category: 'Professional', // Default since we don't have this field yet
          coverImage: team.cover_image_url,
          nextGame: team.next_game ? {
            opponent: team.next_game.opponent,
            date: team.next_game.date,
            time: team.next_game.time,
            location: team.next_game.location
          } : undefined
        }));
        
        // Set the first team as featured team if available
        if (mappedTeams.length > 0) {
          setFeaturedTeam(mappedTeams[0]);
          // Remove the featured team from the regular list
          const regularTeams = mappedTeams.slice(1);
          setTeams(regularTeams);
          setFilteredTeams(regularTeams);
          
          // Create animation values for team cards
          const animations = regularTeams.map((_, index) => ({
            scale: new Animated.Value(0.95),
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(20),
            delay: 300 + (index * 100)
          }));
          setTeamAnimations(animations);
        } else {
          setTeams([]);
          setFilteredTeams([]);
        }
      } else {
        // No teams found
        setTeams([]);
        setFilteredTeams([]);
        setFeaturedTeam(null);
      }
    } catch (err: any) {
      console.error('Unexpected error fetching teams:', err.message);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Run entrance animations and fetch teams when component mounts
  useEffect(() => {
    fetchTeams();
    
    // Run entrance animations
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
      Animated.timing(featuredScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(featuredOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // Run team card animations when teamAnimations changes
  useEffect(() => {
    if (teamAnimations.length > 0) {
      Animated.parallel(
        teamAnimations.map(({ scale, opacity, translateY, delay }) =>
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(scale, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ]),
          ])
        )
      ).start();
    }
  }, [teamAnimations]);
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeams();
    setRefreshing(false);
  };
  
  // Handle search
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    filterTeams(query, activeCategory);
  };
  
  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    
    // Filter teams based on category
    if (categoryId === '1') { // All
      setFilteredTeams(teams);
    } else {
      const categoryName = teamCategories.find(cat => cat.id === categoryId)?.name || '';
      // For now, we're using a default category since we don't have it in the database yet
      // In the future, when category is added to the database, use this filter
      // const filtered = teams.filter(team => team.category === categoryName);
      
      // For now, just simulate filtering based on conference or division
      let filtered = [];
      switch(categoryName) {
        case 'Professional':
          filtered = teams.filter(team => team.conference === 'Premier');
          break;
        case 'Amateur':
          filtered = teams.filter(team => team.conference === 'First Division');
          break;
        case 'Youth':
          filtered = teams.filter(team => team.division === 'Central' || team.division === 'Northern');
          break;
        case 'Women':
          filtered = teams.filter(team => team.division === 'Coastal' || team.division === 'Southern');
          break;
        default:
          filtered = teams;
      }
      
      setFilteredTeams(filtered);
    }
  };
  
  // Filter teams based on search query and category
  const filterTeams = (query: string, categoryId: string) => {
    let filtered = teams;
    
    // Apply search filter
    if (query) {
      filtered = filtered.filter(team => 
        team.name.toLowerCase().includes(query.toLowerCase()) ||
        team.city.toLowerCase().includes(query.toLowerCase()) ||
        team.division.toLowerCase().includes(query.toLowerCase()) ||
        team.conference.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryId !== '1') { // If not 'All'
      const categoryName = teamCategories.find(cat => cat.id === categoryId)?.name;
      if (categoryName) {
        filtered = filtered.filter(team => team.category === categoryName);
      }
    }
    
    setFilteredTeams(filtered);
  };
  
  // Render team category
  const renderTeamCategory = ({ item }: { item: { id: string, name: string, icon: string } }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        activeCategory === item.id && styles.activeCategoryButton
      ]}
      onPress={() => handleCategoryChange(item.id)}
    >
      <Icon 
        name={item.icon} 
        size={18} 
        color={activeCategory === item.id ? 'white' : '#0066CC'} 
      />
      <Text 
        style={[
          styles.categoryText,
          activeCategory === item.id && styles.activeCategoryText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  // Render team card
  const renderTeamCard = ({ item, index }: { item: Team, index: number }) => {
    // Get pre-created animation values
    const { scale, opacity, translateY: itemTranslateY } = teamAnimations[index < teamAnimations.length ? index : 0];
    
    return (
      <Animated.View 
        style={{
          opacity,
          transform: [{ scale }, { translateY: itemTranslateY }],
          marginBottom: 16,
          width: (width - 48) / 2, // Two columns with spacing
          marginHorizontal: 8
        }}
      >
        <Card 
          style={styles.teamCard}
          onPress={() => navigation.navigate('TeamDetail', { teamId: item.id })}
        >
          <View style={styles.teamLogoContainer}>
            <Image
              source={{ uri: item.logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          </View>
          
          <Card.Content style={styles.teamCardContent}>
            <Title style={styles.teamName}>{item.name}</Title>
            <Text style={styles.teamCity}>{item.city}</Text>
            
            <Divider style={styles.divider} />
            
            <View style={styles.teamStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Standing</Text>
                <Text style={styles.statValue}>{item.standing}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Record</Text>
                <Text style={styles.statValue}>{item.record}</Text>
              </View>
            </View>
            
            <View style={styles.teamFooter}>
              <Chip style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{item.category}</Text>
              </Chip>
              
              <View style={styles.pointsContainer}>
                <Text style={styles.pointsValue}>{item.points}</Text>
                <Text style={styles.pointsLabel}>PTS</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateY.interpolate({
                inputRange: [0, 30],
                outputRange: [0, -10],
                extrapolate: 'clamp'
              })}]
            }
          ]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#333333" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Teams</Text>
              <Text style={styles.headerSubtitle}>Discover Namibian hockey teams</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('CreateTeam')}
              >
                <Icon name="plus" size={24} color="#0066CC" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
        
        {/* Search Bar */}
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY }],
            paddingHorizontal: 16,
            paddingTop: 16,
            marginBottom: 16
          }}
        >
          <Searchbar
            placeholder="Search teams"
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#666666"
            inputStyle={styles.searchInput}
          />
        </Animated.View>
        
        {/* Categories */}
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY }],
            marginBottom: 16
          }}
        >
          <FlatList
            data={teamCategories}
            renderItem={renderTeamCategory}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </Animated.View>
        
        {/* Main Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0066CC']}
              tintColor="#0066CC"
            />
          }
        >
          {/* Loading State */}
          {loading && !refreshing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0066CC" />
              <Text style={styles.loadingText}>Loading teams...</Text>
            </View>
          )}
          
          {/* Error State */}
          {error && !loading && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle-outline" size={40} color="#D32F2F" />
              <Text style={styles.errorText}>{error}</Text>
              <Button 
                mode="contained" 
                onPress={fetchTeams}
                style={styles.retryButton}
              >
                Retry
              </Button>
            </View>
          )}
          
          {/* Featured Team */}
          {!loading && !error && featuredTeam && (
            <Animated.View 
              style={{
                opacity: featuredOpacity,
                transform: [{ scale: featuredScale }],
                marginHorizontal: 16,
                marginTop: 16,
                marginBottom: 24
              }}
            >
              <Card 
                style={styles.featuredCard}
                onPress={() => navigation.navigate('TeamDetail', { teamId: featuredTeam.id })}
              >
                <Image 
                  source={{ uri: featuredTeam.coverImage || featuredTeam.logo }}
                  style={styles.featuredImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
                  style={styles.featuredGradient}
                />
                <View style={styles.featuredContent}>
                  <View style={styles.featuredTeamInfo}>
                    <Image 
                      source={{ uri: featuredTeam.logo }}
                      style={styles.featuredLogo}
                      resizeMode="contain"
                    />
                    <View style={styles.featuredTeamDetails}>
                      <Text style={styles.featuredTeamName}>{featuredTeam.name}</Text>
                      <Text style={styles.featuredTeamCity}>
                        {featuredTeam.city || 'Unknown'} • {featuredTeam.division || 'Unknown'} Division
                      </Text>
                      <View style={styles.featuredTeamRecord}>
                        <Text style={styles.featuredTeamRecordText}>
                          {featuredTeam.standing || 'N/A'} • {featuredTeam.record || '0-0-0'}
                        </Text>
                        <Text style={styles.featuredTeamPoints}>
                          {featuredTeam.points || 0} PTS
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {featuredTeam.nextGame && (
                    <View style={styles.featuredNextGame}>
                      <Text style={styles.nextGameTitle}>Next Game</Text>
                      <Text style={styles.nextGameDetails}>
                        vs {featuredTeam.nextGame.opponent} • {featuredTeam.nextGame.date}
                      </Text>
                      <Text style={styles.nextGameTime}>
                        {featuredTeam.nextGame.time} • {featuredTeam.nextGame.location}
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            </Animated.View>
          )}
          
          {/* All Teams */}
          <View style={styles.allTeamsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Teams</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {filteredTeams.length > 0 ? (
              <View style={styles.teamsGrid}>
                {filteredTeams.map((item, index) => (
                  <View key={item.id}>
                    {renderTeamCard({ item, index })}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="hockey-sticks" size={60} color="#CCCCCC" />
                <Text style={styles.emptyText}>No teams found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0066CC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    elevation: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#333333',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666666',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  searchBar: {
    elevation: 2,
    borderRadius: 12,
    height: 50,
    backgroundColor: 'white',
    marginTop: 8,
  },
  searchInput: {
    fontSize: 14,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeCategoryButton: {
    backgroundColor: '#0066CC',
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  featuredImage: {
    height: 200,
    width: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredTeamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredLogo: {
    width: 70,
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 35,
    marginRight: 16,
  },
  featuredTeamDetails: {
    flex: 1,
  },
  featuredTeamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuredTeamCity: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  featuredTeamRecord: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredTeamRecordText: {
    color: 'white',
    fontSize: 14,
    marginRight: 12,
  },
  featuredTeamPoints: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  featuredNextGame: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  nextGameTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  nextGameDetails: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nextGameTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  allTeamsSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: '500',
  },
  teamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8, // Compensate for card margins
  },
  teamCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#FFFFFF',
    height: 220, // Fixed height for consistency
  },
  teamLogoContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 16,
  },
  teamLogo: {
    width: 70,
    height: 70,
  },
  teamCardContent: {
    padding: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#333333',
  },
  teamCity: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  divider: {
    backgroundColor: '#EEEEEE',
    height: 1,
    marginVertical: 8,
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
  },
  teamFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    height: 24,
  },
  categoryChipText: {
    color: '#0066CC',
    fontSize: 10,
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  pointsLabel: {
    fontSize: 10,
    color: '#666666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
  }
});

export default TeamsScreen;
