import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, SafeAreaView, FlatList, RefreshControl, Animated, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { Searchbar, Card, Title, Divider, Chip, useTheme, Button, Paragraph, Badge, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

// Default placeholder image for tournaments without images
const DEFAULT_TOURNAMENT_IMAGE = 'https://via.placeholder.com/300x150/0066CC/FFFFFF?text=Tournament';

// Filter categories for tournaments
const filterCategories = [
  { id: '1', name: 'All', icon: 'hockey-sticks' },
  { id: '2', name: 'Adult', icon: 'human' },
  { id: '3', name: 'Youth', icon: 'human-child' },
  { id: '4', name: 'Senior Men', icon: 'human-male' },
  { id: '5', name: 'Senior Women', icon: 'human-female' },
  { id: '6', name: 'Junior Men', icon: 'human-male-child' },
  { id: '7', name: 'Junior Women', icon: 'human-female-child' },
  { id: '8', name: 'Under-21', icon: 'numeric-2-circle-outline' },
  { id: '9', name: 'Under-18', icon: 'numeric-1-circle-outline' },
  { id: '10', name: 'Under-16', icon: 'numeric-6-circle-outline' },
  { id: '11', name: 'Under-14', icon: 'numeric-4-circle-outline' },
  { id: '12', name: 'Masters', icon: 'account-star' },
  { id: '13', name: 'Mixed', icon: 'account-group' },
  { id: '14', name: 'Indoor', icon: 'home' },
  { id: '15', name: 'Outdoor', icon: 'tree' },
  { id: '16', name: 'Professional', icon: 'medal' },
  { id: '17', name: 'Amateur', icon: 'trophy-outline' },
  { id: '18', name: 'School', icon: 'school' },
  { id: '19', name: 'Club', icon: 'shield' },
  { id: '20', name: 'National', icon: 'flag' },
  { id: '21', name: 'International', icon: 'earth' }
];

// Define types for the component props
type TournamentsScreenProps = {
  navigation: any; // Using 'any' for simplicity, but ideally should use proper navigation type
};

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

const TournamentsScreen = ({ navigation }: TournamentsScreenProps) => {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const { user } = useAuth(); // Get the user from auth context
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('1'); // Default to 'All'
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  
  // Run entrance animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Fetch tournaments from Supabase
  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('tournament_details_view')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Format the data to match our Tournament type
        const formattedData: Tournament[] = data.map(tournament => ({
          ...tournament,
          // Ensure categories is always an array
          categories: tournament.categories || [],
        }));
        
        setTournaments(formattedData);
        setFilteredTournaments(formattedData);
      }
    } catch (error: any) {
      console.error('Error fetching tournaments:', error);
      setError(error.message || 'Failed to fetch tournaments');
      Alert.alert('Error', 'Failed to load tournaments. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Fetch tournaments on component mount
  useEffect(() => {
    fetchTournaments();
  }, []);
  
  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchTournaments();
  };
  
  // Handle search
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    filterTournaments(query, activeFilter);
  };
  
  // Handle filter change
  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    filterTournaments(searchQuery, filterId);
  };
  
  // Filter tournaments based on search query and category filter
  const filterTournaments = (query: string, filter: string) => {
    let filtered = [...tournaments];
    
    // Apply search filter
    if (query) {
      filtered = filtered.filter(tournament => 
        (tournament.title ? tournament.title.toLowerCase().includes(query.toLowerCase()) : false) ||
        (tournament.location ? tournament.location.toLowerCase().includes(query.toLowerCase()) : false)
      );
    }
    
    // Apply category filter
    if (filter !== '1') { // If not 'All'
      const filterName = filterCategories.find(cat => cat.id === filter)?.name;
      filtered = filtered.filter(tournament => 
        tournament.categories && tournament.categories.some(category => 
          category && typeof category === 'string' ? 
            category.toLowerCase().includes(filterName?.toLowerCase() || '') : 
            false
        )
      );
    }
    
    setFilteredTournaments(filtered);
  };
  
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
  
  // Create a single set of animation values that we'll reuse
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Run entrance animations when tournaments change
  useEffect(() => {
    // Reset animations
    scaleAnim.setValue(0.9);
    opacityAnim.setValue(0);
    
    // Start animations
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();
  }, [tournaments]);
  
  // Render tournament card
  const renderTournamentCard = ({ item, index }: { item: Tournament, index: number }) => {
    // Format date range
    const dateRange = item.start_date && item.end_date ? 
      formatDateRange(item.start_date, item.end_date) : 'TBD';
    
    return (
      <Animated.View 
        style={{
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
          marginBottom: 16
        }}
      >
        <Card 
          style={styles.tournamentCard}
          onPress={() => navigation.navigate('TournamentDetail', { tournamentId: item.id })}
        >
          <Image
            source={{ uri: item.image_url || DEFAULT_TOURNAMENT_IMAGE }}
            style={styles.tournamentImage}
            resizeMode="cover"
          />
          
          {/* Status badge */}
          <View style={[styles.statusBadge, { backgroundColor: item.status_color || '#666666' }]}>
            <Text style={styles.statusText}>{item.status || 'Draft'}</Text>
          </View>
          
          <Card.Content style={styles.cardContent}>
            <Title style={styles.tournamentTitle}>{item.title}</Title>
            
            <View style={styles.infoRow}>
              <Icon name="calendar" size={16} color="#0066CC" style={styles.infoIcon} />
              <Text style={styles.infoText}>{dateRange}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={16} color="#0066CC" style={styles.infoIcon} />
              <Text style={styles.infoText}>{item.location}</Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="account-group" size={18} color="#666666" />
                <Text style={styles.statText}>{item.teams_count || 0} Teams</Text>
              </View>
              
              <View style={styles.statItem}>
                <Icon name="trophy" size={18} color="#666666" />
                <Text style={styles.statText}>{item.prize_pool || 'TBD'}</Text>
              </View>
            </View>
            
            <View style={styles.categoriesContainer}>
              {item.categories && item.categories.length > 0 ? (
                item.categories.map((category, idx) => (
                  <Chip 
                    key={idx} 
                    style={styles.categoryChip}
                  >
                    <Text style={styles.categoryChipText}>{category}</Text>
                  </Chip>
                ))
              ) : (
                <Chip style={styles.categoryChip}>
                  <Text style={styles.categoryChipText}>General</Text>
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };
  
  // Render filter category
  const renderFilterCategory = ({ item }: { item: { id: string, name: string, icon: string } }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === item.id && styles.activeFilterButton
      ]}
      onPress={() => handleFilterChange(item.id)}
    >
      <Icon 
        name={item.icon} 
        size={20} 
        color={activeFilter === item.id ? 'white' : '#0066CC'} 
      />
      <Text 
        style={[
          styles.filterText,
          activeFilter === item.id && styles.activeFilterText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
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
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Tournaments</Text>
              <Text style={styles.headerSubtitle}>Find and join hockey tournaments</Text>
            </View>
            {user?.role === 'admin' && (
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('CreateTournament')}
              >
                <Icon name="plus" size={24} color="#0066CC" />
              </TouchableOpacity>
            )}
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
            placeholder="Search tournaments"
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#666666"
            inputStyle={styles.searchInput}
          />
        </Animated.View>
        
        {/* Filter Categories */}
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY }],
            marginBottom: 16
          }}
        >
          <FlatList
            data={filterCategories}
            renderItem={renderFilterCategory}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          />
        </Animated.View>
        
        {/* Main Content */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
            <Text style={styles.loadingText}>Loading tournaments...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTournaments}
            renderItem={renderTournamentCard}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={[styles.listContent, filteredTournaments.length === 0 && styles.emptyListContent]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#0066CC']}
                tintColor={'#0066CC'}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="trophy-outline" size={60} color="#CCCCCC" />
                <Text style={styles.emptyText}>
                  {error ? 'Error loading tournaments' : searchQuery || activeFilter !== '1' ? 'No tournaments found' : 'No tournaments available'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {error ? 'Pull down to try again' : 
                   searchQuery || activeFilter !== '1' ? 'Try adjusting your search or filters' : 
                   'Create your first tournament by tapping the + button'}
                </Text>
                {error && (
                  <TouchableOpacity style={styles.retryButton} onPress={fetchTournaments}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}
        
        {/* Floating Action Button - only visible to admin users */}
        {user?.role === 'admin' && (
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => navigation.navigate('CreateTournament')}
          >
            <Icon name="plus" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 30,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    elevation: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTextContainer: {
    flex: 1,
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButton: {
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
  activeFilterButton: {
    backgroundColor: '#0066CC',
  },
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  tournamentCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tournamentImage: {
    height: 150,
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  tournamentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222222',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#444444',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#EEEEEE',
    height: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 6,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    marginRight: 8,
    marginBottom: 4,
    height: 28,
  },
  categoryChipText: {
    fontSize: 12,
    color: '#0066CC',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    textAlign: 'center',
    marginTop: 8,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
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
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#0066CC',
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default TournamentsScreen;
