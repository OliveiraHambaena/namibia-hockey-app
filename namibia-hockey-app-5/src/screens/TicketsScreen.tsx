import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  FlatList,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Button, Searchbar, Chip, Badge, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data for tickets
const upcomingGames = [
  {
    id: 'game1',
    homeTeam: 'Coastal Pirates',
    homeTeamLogo: 'https://via.placeholder.com/100x100/0066CC/FFFFFF?text=CP',
    awayTeam: 'Windhoek Warriors',
    awayTeamLogo: 'https://via.placeholder.com/100x100/FFB81C/000000?text=WW',
    date: 'May 15, 2025',
    time: '7:30 PM CAT',
    venue: 'Swakopmund Ice Arena',
    ticketsAvailable: true,
    ticketPrice: 'N$120',
    ticketTypes: ['Standard', 'Premium', 'VIP']
  },
  {
    id: 'game2',
    homeTeam: 'Desert Lions',
    homeTeamLogo: 'https://via.placeholder.com/100x100/C8102E/FFFFFF?text=DL',
    awayTeam: 'Coastal Pirates',
    awayTeamLogo: 'https://via.placeholder.com/100x100/0066CC/FFFFFF?text=CP',
    date: 'May 18, 2025',
    time: '7:00 PM CAT',
    venue: 'Windhoek National Arena',
    ticketsAvailable: true,
    ticketPrice: 'N$100',
    ticketTypes: ['Standard', 'Premium']
  },
  {
    id: 'game3',
    homeTeam: 'Coastal Pirates',
    homeTeamLogo: 'https://via.placeholder.com/100x100/0066CC/FFFFFF?text=CP',
    awayTeam: 'Northern Lights',
    awayTeamLogo: 'https://via.placeholder.com/100x100/FF4C00/FFFFFF?text=NL',
    date: 'May 20, 2025',
    time: '7:30 PM CAT',
    venue: 'Swakopmund Ice Arena',
    ticketsAvailable: true,
    ticketPrice: 'N$120',
    ticketTypes: ['Standard', 'Premium', 'VIP']
  },
  {
    id: 'game4',
    homeTeam: 'Kalahari Kings',
    homeTeamLogo: 'https://via.placeholder.com/100x100/6F263D/FFFFFF?text=KK',
    awayTeam: 'Coastal Pirates',
    awayTeamLogo: 'https://via.placeholder.com/100x100/0066CC/FFFFFF?text=CP',
    date: 'May 25, 2025',
    time: '6:00 PM CAT',
    venue: 'Gobabis Stadium',
    ticketsAvailable: false,
    ticketPrice: 'N$100',
    ticketTypes: ['Standard']
  },
  {
    id: 'game5',
    homeTeam: 'Walvis Bay Sharks',
    homeTeamLogo: 'https://via.placeholder.com/100x100/006778/FFFFFF?text=WBS',
    awayTeam: 'Windhoek Warriors',
    awayTeamLogo: 'https://via.placeholder.com/100x100/FFB81C/000000?text=WW',
    date: 'May 28, 2025',
    time: '7:00 PM CAT',
    venue: 'Walvis Bay Ice Center',
    ticketsAvailable: true,
    ticketPrice: 'N$110',
    ticketTypes: ['Standard', 'Premium']
  }
];

// Mock data for my tickets
const myTickets = [
  {
    id: 'ticket1',
    homeTeam: 'Coastal Pirates',
    homeTeamLogo: 'https://via.placeholder.com/100x100/0066CC/FFFFFF?text=CP',
    awayTeam: 'Desert Lions',
    awayTeamLogo: 'https://via.placeholder.com/100x100/C8102E/FFFFFF?text=DL',
    date: 'May 10, 2025',
    time: '7:30 PM CAT',
    venue: 'Swakopmund Ice Arena',
    ticketType: 'Premium',
    section: 'B',
    row: '12',
    seat: '5',
    qrCode: 'https://via.placeholder.com/200x200/FFFFFF/000000?text=QR+Code',
    used: false
  },
  {
    id: 'ticket2',
    homeTeam: 'Windhoek Warriors',
    homeTeamLogo: 'https://via.placeholder.com/100x100/FFB81C/000000?text=WW',
    awayTeam: 'Northern Lights',
    awayTeamLogo: 'https://via.placeholder.com/100x100/FF4C00/FFFFFF?text=NL',
    date: 'May 5, 2025',
    time: '7:00 PM CAT',
    venue: 'Windhoek National Arena',
    ticketType: 'Standard',
    section: 'C',
    row: '8',
    seat: '14',
    qrCode: 'https://via.placeholder.com/200x200/FFFFFF/000000?text=QR+Code',
    used: true
  }
];

const TicketsScreen = ({ navigation }: { navigation: any }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketType, setSelectedTicketType] = useState('All');
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
  const logoSize = width * 0.15 > 70 ? 70 : width * 0.15 < 40 ? 40 : width * 0.15;

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

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const filteredGames = upcomingGames.filter(game => {
    const matchesSearch = 
      game.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.venue.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTicketType = 
      selectedTicketType === 'All' || 
      (selectedTicketType === 'Available' && game.ticketsAvailable) ||
      game.ticketTypes.includes(selectedTicketType);
    
    return matchesSearch && matchesTicketType;
  });

  const renderGameItem = ({ item }: { item: any }) => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }], alignSelf: 'center' }}>
      <Card 
        style={[styles.gameCard, { width: cardWidth }]} 
        onPress={() => navigation.navigate('TicketDetail', { game: item })}>
        <Card.Content>
          <View style={styles.gameHeader}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{item.date}</Text>
              <Text style={styles.timeText}>{item.time}</Text>
              <Text style={styles.venueText}>{item.venue}</Text>
            </View>
            {item.ticketsAvailable ? (
              <Chip 
                style={styles.availableChip}
                textStyle={styles.availableChipText}
              >
                Tickets Available
              </Chip>
            ) : (
              <Chip 
                style={styles.soldOutChip}
                textStyle={styles.soldOutChipText}
              >
                Sold Out
              </Chip>
            )}
          </View>
          
          <View style={styles.teamsContainer}>
            <View style={styles.teamContainer}>
              <Image 
                source={{ uri: item.homeTeamLogo }} 
                style={styles.teamLogo}
                resizeMode="contain"
              />
              <Text style={styles.teamName}>{item.homeTeam}</Text>
              <Text style={styles.homeText}>HOME</Text>
            </View>
            
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            
            <View style={styles.teamContainer}>
              <Image 
                source={{ uri: item.awayTeamLogo }} 
                style={styles.teamLogo}
                resizeMode="contain"
              />
              <Text style={styles.teamName}>{item.awayTeam}</Text>
              <Text style={styles.awayText}>AWAY</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.ticketInfoContainer}>
            <View>
              <Text style={styles.ticketPriceLabel}>Starting at</Text>
              <Text style={styles.ticketPrice}>{item.ticketPrice}</Text>
            </View>
            
            <Button 
              mode="contained" 
              style={[styles.buyButton, !item.ticketsAvailable && styles.disabledButton]}
              labelStyle={styles.buyButtonLabel}
              onPress={() => navigation.navigate('TicketDetail', { game: item })}
              disabled={!item.ticketsAvailable}
            >
              {item.ticketsAvailable ? 'Buy Tickets' : 'Sold Out'}
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderMyTicketItem = ({ item }: { item: any }) => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }], alignSelf: 'center' }}>
      <Card 
        style={[styles.ticketCard, { width: cardWidth }]} 
        onPress={() => navigation.navigate('MyTicketDetail', { ticket: item })}>
        <LinearGradient
          colors={item.used ? ['#BBBBBB', '#999999'] : ['#0066CC', '#004999']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.ticketGradient}
        >
          <View style={styles.ticketHeader}>
            <View>
              <Text style={styles.ticketTypeText}>{item.ticketType} Ticket</Text>
              <Text style={styles.ticketDateText}>{item.date} • {item.time}</Text>
            </View>
            {item.used && (
              <Badge style={styles.usedBadge} size={24}>Used</Badge>
            )}
          </View>
          
          <View style={styles.ticketTeamsContainer}>
            <View style={styles.ticketTeam}>
              <Image 
                source={{ uri: item.homeTeamLogo }} 
                style={styles.ticketTeamLogo}
                resizeMode="contain"
              />
              <Text style={styles.ticketTeamName}>{item.homeTeam}</Text>
            </View>
            
            <Text style={styles.ticketVsText}>VS</Text>
            
            <View style={styles.ticketTeam}>
              <Image 
                source={{ uri: item.awayTeamLogo }} 
                style={styles.ticketTeamLogo}
                resizeMode="contain"
              />
              <Text style={styles.ticketTeamName}>{item.awayTeam}</Text>
            </View>
          </View>
          
          <View style={styles.ticketDetailsContainer}>
            <View style={styles.ticketDetailItem}>
              <Text style={styles.ticketDetailLabel}>Section</Text>
              <Text style={styles.ticketDetailValue}>{item.section}</Text>
            </View>
            
            <View style={styles.ticketDetailItem}>
              <Text style={styles.ticketDetailLabel}>Row</Text>
              <Text style={styles.ticketDetailValue}>{item.row}</Text>
            </View>
            
            <View style={styles.ticketDetailItem}>
              <Text style={styles.ticketDetailLabel}>Seat</Text>
              <Text style={styles.ticketDetailValue}>{item.seat}</Text>
            </View>
          </View>
          
          <View style={styles.ticketFooter}>
            <Text style={styles.ticketVenueText}>{item.venue}</Text>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Ticket</Text>
              <Icon name="chevron-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  // Memoize the header to prevent unnecessary re-renders
  const renderHeader = useCallback(() => (
    <>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tickets</Text>
        <View style={{ width: 40 }} /> {/* Empty view for balance */}
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming Games</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'mytickets' && styles.activeTab]}
          onPress={() => setActiveTab('mytickets')}
        >
          <Text style={[styles.tabText, activeTab === 'mytickets' && styles.activeTabText]}>My Tickets</Text>
          <Badge style={styles.badge} size={20}>{myTickets.length}</Badge>
        </TouchableOpacity>
      </View>
    </>
  ), [activeTab, myTickets.length]);
  
  return (
    <SafeAreaView style={[styles.safeArea, { 
      paddingTop: Platform.OS === 'android' ? insets.top : 0,
      paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
      paddingLeft: Platform.OS === 'android' ? insets.left : 0,
      paddingRight: Platform.OS === 'android' ? insets.right : 0
    }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      
      {renderHeader()}
      
      {activeTab === 'upcoming' ? (
        <>
          <Searchbar
            placeholder="Search games, teams, venues..."
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#666666"
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            <TouchableOpacity 
              style={[styles.filterChip, selectedTicketType === 'All' && styles.selectedFilterChip]}
              onPress={() => setSelectedTicketType('All')}
            >
              <Text style={[styles.filterChipText, selectedTicketType === 'All' && styles.selectedFilterChipText]}>All Games</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterChip, selectedTicketType === 'Available' && styles.selectedFilterChip]}
              onPress={() => setSelectedTicketType('Available')}
            >
              <Text style={[styles.filterChipText, selectedTicketType === 'Available' && styles.selectedFilterChipText]}>Available</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterChip, selectedTicketType === 'Standard' && styles.selectedFilterChip]}
              onPress={() => setSelectedTicketType('Standard')}
            >
              <Text style={[styles.filterChipText, selectedTicketType === 'Standard' && styles.selectedFilterChipText]}>Standard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterChip, selectedTicketType === 'Premium' && styles.selectedFilterChip]}
              onPress={() => setSelectedTicketType('Premium')}
            >
              <Text style={[styles.filterChipText, selectedTicketType === 'Premium' && styles.selectedFilterChipText]}>Premium</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterChip, selectedTicketType === 'VIP' && styles.selectedFilterChip]}
              onPress={() => setSelectedTicketType('VIP')}
            >
              <Text style={[styles.filterChipText, selectedTicketType === 'VIP' && styles.selectedFilterChipText]}>VIP</Text>
            </TouchableOpacity>
          </ScrollView>
          
          <FlatList
            data={filteredGames}
            renderItem={renderGameItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="ticket-outline" size={64} color="#CCCCCC" />
                <Text style={styles.emptyText}>No games found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
              </View>
            }
          />
        </>
      ) : (
        <FlatList
          data={myTickets}
          renderItem={renderMyTicketItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="ticket-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>No tickets found</Text>
              <Text style={styles.emptySubtext}>Purchase tickets to upcoming games</Text>
              <Button 
                mode="contained" 
                style={styles.emptyButton}
                labelStyle={styles.emptyButtonLabel}
                onPress={() => setActiveTab('upcoming')}
              >
                Browse Games
              </Button>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    // SafeAreaView handles iOS safe areas automatically, but we add padding for Android in the component
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0066CC',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#0066CC',
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  searchBar: {
    margin: 16,
    elevation: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  filterContainer: {
    paddingHorizontal: 12,
    marginBottom: 20, // Increased bottom margin for more space
    paddingBottom: 8, // Added padding at the bottom
    flexGrow: 0,
    minHeight: 60, // Added minimum height
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    height: 40, // Fixed height for consistency
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
  },
  selectedFilterChip: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
    height: 40, // Match height with regular chips
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipText: {
    color: '#666666',
    fontWeight: '500',
    textAlign: 'center', // Ensure text is centered
  },
  selectedFilterChipText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  gameCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  timeText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  venueText: {
    fontSize: 14,
    color: '#666666',
  },
  availableChip: {
    backgroundColor: 'rgba(0, 153, 51, 0.1)',
  },
  availableChipText: {
    color: '#009933',
    fontSize: 12,
  },
  soldOutChip: {
    backgroundColor: 'rgba(204, 0, 0, 0.1)',
  },
  soldOutChipText: {
    color: '#CC0000',
    fontSize: 12,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  teamContainer: {
    flex: 2,
    alignItems: 'center',
    minWidth: 100,
    padding: 5,
  },
  teamLogo: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    maxWidth: 70,
    maxHeight: 70,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 4,
  },
  homeText: {
    fontSize: 12,
    color: '#0066CC',
    fontWeight: '500',
  },
  awayText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  vsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999999',
  },
  divider: {
    backgroundColor: '#EEEEEE',
    height: 1,
    marginBottom: 16,
  },
  ticketInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketPriceLabel: {
    fontSize: 12,
    color: '#666666',
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  buyButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buyButtonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
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
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  emptyButtonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ticketCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    alignSelf: 'center',
  },
  ticketGradient: {
    padding: 16,
    borderRadius: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  ticketTypeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  ticketDateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  usedBadge: {
    backgroundColor: '#FF3B30',
  },
  usedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  ticketTeamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ticketTeam: {
    flex: 2,
    alignItems: 'center',
  },
  ticketTeamLogo: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    maxWidth: 60,
    maxHeight: 60,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
  },
  ticketTeamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  ticketVsText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  ticketDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  ticketDetailItem: {
    alignItems: 'center',
  },
  ticketDetailLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  ticketDetailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketVenueText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 4,
  }
});

export default TicketsScreen;
