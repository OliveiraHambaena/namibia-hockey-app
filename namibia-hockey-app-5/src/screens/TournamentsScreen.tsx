import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Dimensions, Animated, StatusBar, RefreshControl, FlatList } from 'react-native';
import { Card, Title, Paragraph, Text, useTheme, Button, Chip, Divider, Avatar, Badge, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data for tournaments
const tournamentsData = [
  {
    id: '1',
    title: 'Summer Hockey Championship',
    location: 'City Arena, Downtown',
    date: 'June 15-20, 2025',
    status: 'Registration Open',
    statusColor: '#00A651', // Green
    imageUrl: 'https://via.placeholder.com/300x150/0066CC/FFFFFF?text=Summer+Championship',
    categories: ['Adult', 'Professional'],
    teams: 16,
    prize: '$5,000'
  },
  {
    id: '2',
    title: 'Youth Hockey League',
    location: 'Community Sports Center',
    date: 'July 5-25, 2025',
    status: 'Coming Soon',
    statusColor: '#FF6600', // Orange
    imageUrl: 'https://via.placeholder.com/300x150/FF6600/FFFFFF?text=Youth+League',
    categories: ['Youth', 'U16'],
    teams: 12,
    prize: 'Trophies'
  },
  {
    id: '3',
    title: 'Veterans Cup',
    location: 'Memorial Stadium',
    date: 'May 30-31, 2025',
    status: 'Registration Closed',
    statusColor: '#FF3B30', // Red
    imageUrl: 'https://via.placeholder.com/300x150/9C27B0/FFFFFF?text=Veterans+Cup',
    categories: ['Veterans', '35+'],
    teams: 8,
    prize: '$2,500'
  },
  {
    id: '4',
    title: 'Winter Classic',
    location: 'Outdoor Rink, Central Park',
    date: 'December 15-20, 2025',
    status: 'Coming Soon',
    statusColor: '#FF6600', // Orange
    imageUrl: 'https://via.placeholder.com/300x150/2196F3/FFFFFF?text=Winter+Classic',
    categories: ['All Ages', 'Exhibition'],
    teams: 24,
    prize: '$10,000'
  },
  {
    id: '5',
    title: 'Corporate Challenge',
    location: 'Business District Arena',
    date: 'September 10-12, 2025',
    status: 'Registration Open',
    statusColor: '#00A651', // Green
    imageUrl: 'https://via.placeholder.com/300x150/FF9800/FFFFFF?text=Corporate+Challenge',
    categories: ['Corporate', 'Amateur'],
    teams: 10,
    prize: 'Trophy + Donation'
  }
];

// Filter categories for tournaments
const filterCategories = [
  { id: '1', name: 'All', icon: 'hockey-sticks' },
  { id: '2', name: 'Youth', icon: 'human-child' },
  { id: '3', name: 'Adult', icon: 'human' },
  { id: '4', name: 'Professional', icon: 'medal' },
  { id: '5', name: 'Amateur', icon: 'trophy-outline' }
];

// Define types for the component props
type TournamentsScreenProps = {
  navigation: any; // Using 'any' for simplicity, but ideally should use proper navigation type
};

// Define types for tournament data
type Tournament = {
  id: string;
  title: string;
  location: string;
  date: string;
  status: string;
  statusColor: string;
  imageUrl: string;
  categories: string[];
  teams: number;
  prize: string;
};

const TournamentsScreen = ({ navigation }: TournamentsScreenProps) => {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('1'); // Default to 'All'
  const [filteredTournaments, setFilteredTournaments] = useState(tournamentsData);
  
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
  
  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data fetching
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };
  
  // Handle search
  const onChangeSearch = (query) => {
    setSearchQuery(query);
    filterTournaments(query, activeFilter);
  };
  
  // Handle filter change
  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    filterTournaments(searchQuery, filterId);
  };
  
  // Filter tournaments based on search query and category filter
  const filterTournaments = (query, filter) => {
    let filtered = tournamentsData;
    
    // Apply search filter
    if (query) {
      filtered = filtered.filter(tournament => 
        tournament.title.toLowerCase().includes(query.toLowerCase()) ||
        tournament.location.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filter !== '1') { // If not 'All'
      const filterName = filterCategories.find(cat => cat.id === filter)?.name;
      filtered = filtered.filter(tournament => 
        tournament.categories.some(category => 
          category.toLowerCase().includes(filterName.toLowerCase())
        )
      );
    }
    
    setFilteredTournaments(filtered);
  };
  
  // Pre-create animation values for tournament cards
  const cardAnimations = tournamentsData.map((_, index) => ({
    scale: useRef(new Animated.Value(0.9)).current,
    opacity: useRef(new Animated.Value(0)).current,
    delay: index * 150
  }));
  
  // Run animations for tournament cards
  useEffect(() => {
    cardAnimations.forEach((anim) => {
      Animated.parallel([
        Animated.timing(anim.scale, {
          toValue: 1,
          duration: 500,
          delay: anim.delay,
          useNativeDriver: true
        }),
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 500,
          delay: anim.delay,
          useNativeDriver: true
        })
      ]).start();
    });
  }, []);
  
  // Render tournament card
  const renderTournamentCard = ({ item, index }: { item: Tournament, index: number }) => {
    // Get pre-created animation values
    const { scale: cardScale, opacity: cardOpacity } = cardAnimations[index < cardAnimations.length ? index : 0];
    
    return (
      <Animated.View 
        style={{
          opacity: cardOpacity,
          transform: [{ scale: cardScale }],
          marginBottom: 16
        }}
      >
        <Card 
          style={styles.tournamentCard}
          onPress={() => navigation.navigate('TournamentDetail', { tournamentId: item.id })}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.tournamentImage}
            resizeMode="cover"
          />
          
          {/* Status badge */}
          <View style={[styles.statusBadge, { backgroundColor: item.statusColor }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          
          <Card.Content style={styles.cardContent}>
            <Title style={styles.tournamentTitle}>{item.title}</Title>
            
            <View style={styles.infoRow}>
              <Icon name="calendar" size={16} color="#0066CC" style={styles.infoIcon} />
              <Text style={styles.infoText}>{item.date}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={16} color="#0066CC" style={styles.infoIcon} />
              <Text style={styles.infoText}>{item.location}</Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="account-group" size={18} color="#666666" />
                <Text style={styles.statText}>{item.teams} Teams</Text>
              </View>
              
              <View style={styles.statItem}>
                <Icon name="trophy" size={18} color="#666666" />
                <Text style={styles.statText}>{item.prize}</Text>
              </View>
            </View>
            
            <View style={styles.categoriesContainer}>
              {item.categories.map((category, idx) => (
                <Chip 
                  key={idx} 
                  style={styles.categoryChip}
                >
                  <Text style={styles.categoryChipText}>{category}</Text>
                </Chip>
              ))}
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
            <View>
              <Text style={styles.headerTitle}>Tournaments</Text>
              <Text style={styles.headerSubtitle}>Find and join hockey tournaments</Text>
            </View>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="filter-variant" size={24} color="#333333" />
            </TouchableOpacity>
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
        <FlatList
          data={filteredTournaments}
          renderItem={renderTournamentCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
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
              <Text style={styles.emptyText}>No tournaments found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          }
        />
        
        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('CreateTournament')}
        >
          <Icon name="plus" size={24} color="white" />
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
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
