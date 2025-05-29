import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Dimensions, Animated, StatusBar, RefreshControl, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Text, useTheme, Button, Chip, Divider, Avatar, Badge, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FlatList } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

// Types for carousel data
type CarouselItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  type: string;
  navigationParams?: any;
};

// Initial empty carousel data
const initialCarouselData: CarouselItem[] = [];

// Mock data for quick access tiles
const quickAccessData = [
  {
    id: '1',
    title: 'Tournaments',
    icon: 'trophy',
    color: '#FF6600'
  },
  {
    id: '2',
    title: 'News',
    icon: 'newspaper',
    color: '#0066CC'
  },
  {
    id: '3',
    title: 'Teams',
    icon: 'account-group',
    color: '#00A651'
  },
  {
    id: '4',
    title: 'Tickets',
    icon: 'ticket',
    color: '#9C27B0'
  },
  {
    id: '5',
    title: 'League',
    icon: 'medal',
    color: '#FF9800'
  },
  {
    id: '6',
    title: 'Register',
    icon: 'account-plus',
    color: '#2196F3'
  }
];

// Define type for news article from the news_articles_view
type NewsArticle = {
  id: string;
  title: string;
  snippet: string;
  content: string;
  image_url: string;
  author: string;
  author_avatar: string;
  author_title: string;
  published_date: string;
  read_time: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category_id: string;
  category_name: string;
  category_icon: string;
};

// Define type for game from the games table
type Game = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  date: string;
  venue: string;
  home_score: number | null;
  away_score: number | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  home_team?: {
    id: string;
    name: string;
    logo_url: string;
  };
  away_team?: {
    id: string;
    name: string;
    logo_url: string;
  };
};

// Define type for tournament
type Tournament = {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  status: string;
  image_url: string;
  max_teams: number;
  registered_teams: number;
  prize_pool: number;
  entry_fee: number;
  created_at: string;
  updated_at: string;
};

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<any>>(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // State for news data
  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  
  // State for today's match
  const [todayMatch, setTodayMatch] = useState<Game | null>(null);
  const [matchLoading, setMatchLoading] = useState(true);
  const [matchError, setMatchError] = useState<string | null>(null);
  
  // State for carousel data
  const [carouselData, setCarouselData] = useState<CarouselItem[]>(initialCarouselData);
  const [carouselLoading, setCarouselLoading] = useState(true);
  
  // State for upcoming events
  const [upcomingEvents, setUpcomingEvents] = useState<Tournament[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Animation values for staggered animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  
  // Fetch latest news from Supabase
  const fetchLatestNews = async () => {
    try {
      setNewsLoading(true);
      setNewsError(null);
      
      const { data, error } = await supabase
        .from('news_articles_view')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (error) {
        console.error('Error fetching news:', error.message);
        setNewsError(error.message);
      } else {
        setNewsData(data || []);
      }
    } catch (err: any) {
      console.error('Unexpected error fetching news:', err.message);
      setNewsError(err.message);
    } finally {
      setNewsLoading(false);
    }
  };
  
  // Fetch today's match from Supabase
  const fetchTodayMatch = async () => {
    try {
      setMatchLoading(true);
      setMatchError(null);
      
      // Get today's date in ISO format and set time to start of day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();
      
      // Get tomorrow's date in ISO format
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString();
      
      // Fetch games scheduled for today with team information
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          home_team:home_team_id(id, name, logo_url),
          away_team:away_team_id(id, name, logo_url)
        `)
        .gte('date', todayStr)
        .lt('date', tomorrowStr)
        .order('date', { ascending: true })
        .limit(1);
      
      if (error) {
        console.error('Error fetching today\'s match:', error.message);
        setMatchError(error.message);
      } else if (data && data.length > 0) {
        setTodayMatch(data[0] as Game);
      } else {
        // If no match today, get the next upcoming match
        const { data: upcomingData, error: upcomingError } = await supabase
          .from('games')
          .select(`
            *,
            home_team:home_team_id(id, name, logo_url),
            away_team:away_team_id(id, name, logo_url)
          `)
          .gte('date', todayStr)
          .order('date', { ascending: true })
          .limit(1);
          
        if (upcomingError) {
          console.error('Error fetching upcoming match:', upcomingError.message);
          setMatchError(upcomingError.message);
        } else if (upcomingData && upcomingData.length > 0) {
          setTodayMatch(upcomingData[0] as Game);
        }
      }
    } catch (err: any) {
      console.error('Unexpected error fetching match:', err.message);
      setMatchError(err.message);
    } finally {
      setMatchLoading(false);
    }
  };
  
  // Fetch data for carousel (live matches, tournament registrations, latest news)
  const fetchCarouselData = async () => {
    try {
      setCarouselLoading(true);
      const carouselItems: CarouselItem[] = [];
      
      // 1. Fetch live matches
      const { data: liveMatches, error: liveMatchesError } = await supabase
        .from('games')
        .select(`
          *,
          home_team:home_team_id(id, name, logo_url),
          away_team:away_team_id(id, name, logo_url)
        `)
        .eq('status', 'in_progress')
        .limit(1);
      
      if (!liveMatchesError && liveMatches && liveMatches.length > 0) {
        const match = liveMatches[0] as Game;
        carouselItems.push({
          id: match.id,
          title: 'LIVE: Hockey Match',
          subtitle: `${match.home_team?.name || 'Home Team'} vs ${match.away_team?.name || 'Away Team'}`,
          imageUrl: 'https://via.placeholder.com/300x150/0066CC/FFFFFF?text=Live+Match',
          type: 'match',
          navigationParams: { matchId: match.id }
        });
      }
      
      // 2. Fetch open tournament registrations
      const { data: tournaments, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'registration_open')
        .limit(1);
      
      if (!tournamentsError && tournaments && tournaments.length > 0) {
        const tournament = tournaments[0] as Tournament;
        const deadline = new Date(tournament.end_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        
        carouselItems.push({
          id: tournament.id,
          title: 'Tournament Registration',
          subtitle: `Deadline: ${deadline}`,
          imageUrl: tournament.image_url || 'https://via.placeholder.com/300x150/FF6600/FFFFFF?text=Tournament+Registration',
          type: 'registration',
          navigationParams: { tournamentId: tournament.id }
        });
      }
      
      // 3. Add latest news if available
      if (newsData && newsData.length > 0) {
        const latestNews = newsData[0];
        carouselItems.push({
          id: latestNews.id,
          title: 'Latest Hockey News',
          subtitle: latestNews.title,
          imageUrl: latestNews.image_url || 'https://via.placeholder.com/300x150/00A651/FFFFFF?text=Hockey+News',
          type: 'news',
          navigationParams: { newsId: latestNews.id }
        });
      }
      
      // If we have no real data, add placeholder items
      if (carouselItems.length === 0) {
        carouselItems.push(
          {
            id: '1',
            title: 'LIVE: Finals Match',
            subtitle: 'Maple Leafs vs Bruins',
            imageUrl: 'https://via.placeholder.com/300x150/0066CC/FFFFFF?text=Live+Match',
            type: 'match'
          },
          {
            id: '2',
            title: 'Tournament Registration',
            subtitle: 'Deadline: May 15, 2025',
            imageUrl: 'https://via.placeholder.com/300x150/FF6600/FFFFFF?text=Tournament+Registration',
            type: 'registration'
          },
          {
            id: '3',
            title: 'Latest Hockey News',
            subtitle: 'Season highlights and player interviews',
            imageUrl: 'https://via.placeholder.com/300x150/00A651/FFFFFF?text=Hockey+News',
            type: 'news'
          }
        );
      }
      
      setCarouselData(carouselItems);
    } catch (err: any) {
      console.error('Error fetching carousel data:', err.message);
    } finally {
      setCarouselLoading(false);
    }
  };
  
  // Fetch upcoming events/tournaments
  const fetchUpcomingEvents = async () => {
    try {
      setEventsLoading(true);
      
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .or('status.eq.registration_open,status.eq.upcoming')
        .order('start_date', { ascending: true })
        .limit(3);
      
      if (error) {
        console.error('Error fetching upcoming events:', error.message);
      } else {
        setUpcomingEvents(data as Tournament[] || []);
      }
    } catch (err: any) {
      console.error('Unexpected error fetching events:', err.message);
    } finally {
      setEventsLoading(false);
    }
  };
  
  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    // Fetch all data
    Promise.all([
      fetchLatestNews(),
      fetchTodayMatch(),
      fetchUpcomingEvents()
    ]).then(() => {
      fetchCarouselData();
      setRefreshing(false);
    }).catch(() => {
      setRefreshing(false);
    });
  };
  
  // Create animation values for carousel items
  const [carouselAnimations, setCarouselAnimations] = useState<Array<{
    scale: Animated.Value;
    opacity: Animated.Value;
  }>>([]);
  
  // Update carousel animations when carousel data changes
  useEffect(() => {
    if (carouselData.length > 0) {
      const newAnimations = carouselData.map(() => ({
        scale: new Animated.Value(0.9),
        opacity: new Animated.Value(0.8)
      }));
      setCarouselAnimations(newAnimations);
    }
  }, [carouselData]);
  
  // Pre-create animation values for quick access tiles
  const tileAnimations = quickAccessData.map((_, index) => ({
    scale: useRef(new Animated.Value(0.8)).current,
    opacity: useRef(new Animated.Value(0)).current,
    delay: 300 + (index * 100)
  }));
  
  // Animation values for news items
  const [newsAnimValues, setNewsAnimValues] = useState<Array<{
    scale: Animated.Value;
    opacity: Animated.Value;
    translateX: Animated.Value;
    delay: number;
  }>>([]);
  
  // Fetch data and run entrance animations when component mounts
  useEffect(() => {
    // Fetch all data
    fetchLatestNews();
    fetchTodayMatch();
    fetchUpcomingEvents();
    
    // Run entrance animations
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
  
  // Fetch carousel data when news, match, or events data changes
  useEffect(() => {
    if (!newsLoading && !matchLoading && !eventsLoading) {
      fetchCarouselData();
    }
  }, [newsData, todayMatch, upcomingEvents]);
  
  // Run animations for carousel items, tiles, and news items
  useEffect(() => {
    // Animate carousel items if they exist
    if (carouselAnimations.length > 0) {
      carouselAnimations.forEach((anim) => {
        Animated.parallel([
          Animated.timing(anim.scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
          })
        ]).start();
      });
    }
    
    // Animate quick access tiles
    tileAnimations.forEach((anim) => {
      Animated.parallel([
        Animated.timing(anim.scale, {
          toValue: 1,
          duration: 400,
          delay: anim.delay,
          useNativeDriver: true
        }),
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 400,
          delay: anim.delay,
          useNativeDriver: true
        })
      ]).start();
    });
    
    // Animate news items if available
    if (newsAnimValues.length > 0) {
      newsAnimValues.forEach((anim) => {
        Animated.parallel([
          Animated.timing(anim.scale, {
            toValue: 1,
            duration: 400,
            delay: anim.delay,
            useNativeDriver: true
          }),
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 400,
            delay: anim.delay,
            useNativeDriver: true
          }),
          Animated.timing(anim.translateX, {
            toValue: 0,
            duration: 400,
            delay: anim.delay,
            useNativeDriver: true
          })
        ]).start();
      });
    }
  }, []);
  
  // Auto-scroll carousel
  useEffect(() => {
    // Only set up auto-scroll if we have carousel data
    if (carouselData.length === 0) return;
    
    const timer = setInterval(() => {
      if (flatListRef.current) {
        const nextIndex = (activeIndex + 1) % carouselData.length;
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true
        });
        setActiveIndex(nextIndex);
      }
    }, 5000);
    
    return () => clearInterval(timer);
  }, [activeIndex, carouselData.length]);

  // Handle scroll event for carousel
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );
  
  // Handle main scroll event for parallax effects
  const handleMainScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  // Render carousel item with animations
  const renderCarouselItem = ({ item, index }: { item: any, index: number }) => {
    // Get animation values if available, or create default ones
    const { scale, opacity } = carouselAnimations[index] || {
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1)
    };
    
    // Calculate position for parallax effect
    const position = Animated.subtract(index * width, scrollX);
    const isDisappearing = -width;
    const isLeft = 0;
    const isRight = width;
    const isAppearing = width * 2;
    
    // Parallax effect
    const translateX = position.interpolate({
      inputRange: [isDisappearing, isLeft, isRight, isAppearing],
      outputRange: [-50, 0, 50, 250],
      extrapolate: 'clamp'
    });
    
    // Scale effect based on position
    const itemScale = position.interpolate({
      inputRange: [isDisappearing, isLeft, isRight, isAppearing],
      outputRange: [0.8, 1, 0.8, 0.8],
      extrapolate: 'clamp'
    });
    
    // Opacity effect based on position
    const itemOpacity = position.interpolate({
      inputRange: [isDisappearing, isLeft, isRight, isAppearing],
      outputRange: [0.8, 1, 0.8, 0],
      extrapolate: 'clamp'
    });
    
    // Define badge color based on item type
    const badgeColor = item.type === 'match' ? '#FF3B30' : 
                      item.type === 'registration' ? '#FF6600' : 
                      '#00A651';
    
    return (
      <Animated.View 
        style={[
          styles.carouselItem, 
          { 
            transform: [{ scale: itemScale }, { translateX }],
            opacity: itemOpacity
          }
        ]}
      >
        <Card style={styles.carouselCard}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.carouselImage}
            resizeMode="cover"
          />
          
          {/* Badge for item type */}
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>
              {item.type === 'match' ? 'LIVE' : 
               item.type === 'registration' ? 'REGISTER' : 'NEWS'}
            </Text>
          </View>
          
          {/* Gradient overlay for better text visibility */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.8)']}
            style={styles.carouselGradient}
          >
            <View style={styles.carouselContent}>
              <Title style={styles.carouselTitle}>{item.title}</Title>
              <Paragraph style={styles.carouselSubtitle}>{item.subtitle}</Paragraph>
              
              {/* Action button */}
              <TouchableOpacity 
                style={styles.carouselButton}
                onPress={() => navigation.navigate(item.type === 'match' ? 'LiveMatch' : 
                                               item.type === 'registration' ? 'Registration' : 'News')}
              >
                <Text style={styles.carouselButtonText}>
                  {item.type === 'match' ? 'Watch Now' : 
                   item.type === 'registration' ? 'Register' : 'Read More'}
                </Text>
                <Icon name="chevron-right" size={16} color="white" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Card>
      </Animated.View>
    );
  };

  // Render quick access tile with animation
  const renderQuickAccessTile = ({ item, index }: { item: any, index: number }) => {
    // Get pre-created animation values
    const { scale: tileScale, opacity: tileOpacity } = tileAnimations[index];
    
    // Handle tile press based on item id/title
    const handleTilePress = () => {
      switch(item.id) {
        case '1': // Tournaments
          navigation.navigate('Tournaments');
          break;
        case '2': // News
          navigation.navigate('News');
          break;
        case '3': // Teams
          navigation.navigate('Teams');
          break;
        case '4': // Tickets
          navigation.navigate('Tickets');
          break;
        case '5': // League
          navigation.navigate('League');
          break;
        case '6': // Register
          navigation.navigate('Register');
          break;
        default:
          break;
      }
    };
    
    return (
      <Animated.View 
        key={`quick-access-${item.id}`}
        style={{
          opacity: tileOpacity,
          transform: [{ scale: tileScale }]
        }}
      >
        <TouchableOpacity 
          style={styles.quickAccessTile}
          onPress={handleTilePress}
        >
          <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
            <Icon name={item.icon} size={24} color="white" />
          </View>
          <Text style={styles.tileTitle}>{item.title}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Create animation values for news items when data changes
  useEffect(() => {
    if (newsData.length > 0) {
      // Create new animation values for each news item
      const newAnimValues = newsData.map((_, index) => ({
        scale: new Animated.Value(0.9),
        opacity: new Animated.Value(0),
        translateX: new Animated.Value(20),
        delay: 500 + (index * 150)
      }));
      
      setNewsAnimValues(newAnimValues);
      
      // Start animations for each news item
      newAnimValues.forEach((anim) => {
        Animated.parallel([
          Animated.timing(anim.scale, {
            toValue: 1,
            duration: 400,
            delay: anim.delay,
            useNativeDriver: true
          }),
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 400,
            delay: anim.delay,
            useNativeDriver: true
          }),
          Animated.timing(anim.translateX, {
            toValue: 0,
            duration: 400,
            delay: anim.delay,
            useNativeDriver: true
          })
        ]).start();
      });
    }
  }, [newsData]);
  
  // Render news item with animation
  const renderNewsItem = ({ item, index }: { item: NewsArticle, index: number }) => {
    // Use animation values if available, or create default ones
    const animValues = (newsAnimValues && newsAnimValues[index]) || {
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1)
    };
    
    // Format date
    const formattedDate = item.created_at 
      ? new Date(item.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      : '';
    
    return (
      <Animated.View 
        key={`news-item-${item.id}`}
        style={{
          opacity: animValues.opacity, 
          transform: [{ scale: animValues.scale }],
          marginBottom: 16
        }}
      >
        <Card style={styles.newsCard} onPress={() => navigation.navigate('NewsDetail', { newsId: item.id })}>
          <View style={styles.newsCardContent}>
            <Image
              source={{ uri: item.image_url || 'https://via.placeholder.com/80x80/0066CC/FFFFFF?text=News' }}
              style={styles.newsImage}
              resizeMode="cover"
            />
            <View style={styles.newsTextContainer}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Icon name="clock-outline" size={12} color="#0066CC" style={{ marginRight: 4 }} />
                  <Text style={styles.newsDate}>{formattedDate}</Text>
                  {item.category_name && (
                    <Chip 
                      style={styles.categoryChip} 
                      textStyle={styles.categoryChipText}
                    >
                      {item.category_name}
                    </Chip>
                  )}
                </View>
                <Title style={styles.newsTitle}>{item.title}</Title>
                <Paragraph style={styles.newsSnippet} numberOfLines={2}>{item.snippet}</Paragraph>
              </View>
              <TouchableOpacity 
                style={styles.readMoreButton}
                onPress={() => navigation.navigate('NewsDetail', { newsId: item.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.readMore}>Read More</Text>
                <Icon name="arrow-right" size={14} color="#0066CC" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* Animated Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: scrollY.interpolate({
                inputRange: [0, 100],
                outputRange: [0, -10],
                extrapolate: 'clamp'
              })}]
            }
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Image source={require('../../assets/images/logo.png')} style={styles.headerLogo} resizeMode="contain" />
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Badge visible={true} size={8} style={{ position: 'absolute', top: 10, right: 10 }} />
                <Icon name="bell-outline" size={22} color="#333333" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <Icon name="account-circle-outline" size={22} color="#333333" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
        
        {/* Main Content */}
        <Animated.ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={handleMainScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0066CC']}
              tintColor={'#0066CC'}
            />
          }
        >
          {/* Welcome Card */}
          <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY }],
            marginHorizontal: 16,
            marginTop: 16,
            marginBottom: 8
          }}>
            <Card style={styles.welcomeCard}>
              <LinearGradient
                colors={['#0066CC', '#004999']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.welcomeGradient}
              >
                <View style={styles.welcomeContent}>
                  <View style={styles.welcomeTextContainer}>
                    <Text style={styles.welcomeTitle}>Today's Match</Text>
                    {matchLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : matchError ? (
                      <Text style={styles.welcomeError}>Could not load match data</Text>
                    ) : todayMatch ? (
                      <>
                        <Text style={styles.welcomeSubtitle}>
                          {todayMatch.home_team?.name || 'Home Team'} vs {todayMatch.away_team?.name || 'Away Team'}
                        </Text>
                        <Text style={styles.welcomeTime}>
                          {todayMatch.date ? new Date(todayMatch.date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          }) : 'Time TBD'} 
                          {todayMatch.status === 'in_progress' && <Text style={styles.liveIndicator}> • LIVE</Text>}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.welcomeSubtitle}>No matches scheduled for today</Text>
                    )}
                  </View>
                  <TouchableOpacity 
                    style={styles.welcomeButton}
                    onPress={() => {
                      if (todayMatch) {
                        navigation.navigate('GameDetail', { 
                          gameId: todayMatch.id
                        });
                      } else {
                        navigation.navigate('Tournaments');
                      }
                    }}
                  >
                    <Text style={styles.welcomeButtonText}>{todayMatch ? 'View Details' : 'See Schedule'}</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Card>
          </Animated.View>
          
          {/* Carousel */}
          <Animated.View 
            style={[
              styles.carouselContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY }]
              }
            ]}
          >
            {carouselLoading ? (
              <View style={styles.carouselLoadingContainer}>
                <ActivityIndicator size="small" color="#0066CC" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : carouselData.length > 0 ? (
              <FlatList
                ref={flatListRef}
                data={carouselData}
                renderItem={renderCarouselItem}
                keyExtractor={item => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                initialNumToRender={1}
                maxToRenderPerBatch={1}
                windowSize={3}
              />
            ) : (
              <View style={styles.emptyCarouselContainer}>
                <Icon name="information-outline" size={32} color="#AAAAAA" />
                <Text style={styles.emptyText}>No featured content available</Text>
              </View>
            )}
            
            {/* Pagination dots */}
            {carouselData.length > 0 && (
              <View style={styles.paginationContainer}>
                {carouselData.map((_, index) => {
                  const inputRange = [
                    (index - 1) * width,
                    index * width,
                    (index + 1) * width
                  ];
                  
                  const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [8, 16, 8],
                    extrapolate: 'clamp'
                  });
                  
                  const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp'
                  });
                  
                  return (
                    <Animated.View
                      key={index}
                      style={[styles.dot, { width: dotWidth, opacity }]}
                    />
                  );
                })}
              </View>
            )}
          </Animated.View>
          
          {/* Quick Access Section */}
          <Animated.View 
            style={[
              styles.sectionContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY }]
              }
            ]}
          >
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Quick Access</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16 }}
            >
              {quickAccessData.map((item, index) => renderQuickAccessTile({ item, index }))}
            </ScrollView>
          </Animated.View>
          
          {/* News Section */}
          <Animated.View 
            style={[
              styles.newsSection,
              { 
                opacity: fadeAnim,
                transform: [{ translateY }]
              }
            ]}
          >
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Latest News</Text>
              <TouchableOpacity onPress={() => navigation.navigate('News')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {newsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0066CC" />
                <Text style={styles.loadingText}>Loading news...</Text>
              </View>
            ) : newsError ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle-outline" size={24} color="#FF6B6B" />
                <Text style={styles.errorText}>Could not load news</Text>
                <Button 
                  mode="contained" 
                  onPress={fetchLatestNews}
                  style={styles.retryButton}
                  labelStyle={styles.retryButtonLabel}
                >
                  Retry
                </Button>
              </View>
            ) : newsData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="newspaper-variant-outline" size={32} color="#AAAAAA" />
                <Text style={styles.emptyText}>No news articles available</Text>
              </View>
            ) : (
              newsData.map((item, index) => renderNewsItem({ item, index }))
            )}
          </Animated.View>
          
          {/* Upcoming Events Section */}
          <Animated.View 
            style={[
              styles.sectionContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY }],
                paddingBottom: 30
              }
            ]}
          >
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Tournaments')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {eventsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0066CC" />
                <Text style={styles.loadingText}>Loading events...</Text>
              </View>
            ) : upcomingEvents.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="calendar-blank-outline" size={32} color="#AAAAAA" />
                <Text style={styles.emptyText}>No upcoming events</Text>
              </View>
            ) : (
              upcomingEvents.map((event) => {
                // Format date
                const eventDate = new Date(event.start_date);
                const month = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                const day = eventDate.getDate();
                
                return (
                  <Card 
                    key={event.id} 
                    style={styles.eventCard}
                    onPress={() => navigation.navigate('TournamentDetail', { tournamentId: event.id })}
                  >
                    <View style={styles.eventDateContainer}>
                      <Text style={styles.eventMonth}>{month}</Text>
                      <Text style={styles.eventDay}>{day}</Text>
                    </View>
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <View style={styles.eventInfo}>
                        <Icon name="map-marker" size={14} color="#0066CC" style={{ marginRight: 4 }} />
                        <Text style={styles.eventLocation}>{event.location}</Text>
                      </View>
                      <View style={styles.eventInfo}>
                        <Icon name="clock-outline" size={14} color="#0066CC" style={{ marginRight: 4 }} />
                        <Text style={styles.eventTime}>
                          {new Date(event.start_date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Text>
                      </View>
                      <Chip 
                        style={styles.eventStatusChip} 
                        textStyle={styles.eventStatusText}
                      >
                        {event.status === 'registration_open' ? 'Registration Open' : 'Upcoming'}
                      </Chip>
                    </View>
                  </Card>
                );
              })
            )}
          </Animated.View>
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  // Loading, error, and empty state styles
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666666',
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 8,
    marginBottom: 12,
    color: '#FF6B6B',
    fontSize: 14,
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
  },
  retryButtonLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    color: '#999999',
    fontSize: 14,
    textAlign: 'center',
  },
  // Category chip styles
  categoryChip: {
    height: 20,
    marginLeft: 8,
    paddingHorizontal: 6,
    backgroundColor: '#E3F2FD',
  },
  categoryChipText: {
    fontSize: 10,
    color: '#0066CC',
    marginVertical: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 100,
    height: 70,
    marginRight: 10,
  },
  headerTextContainer: {
    flexDirection: 'column',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: '#F5F5F5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appBarTitle: {
    fontWeight: 'bold',
    fontSize: 26,
    color: '#333333',
    letterSpacing: 0.5,
  },
  appBarSubtitle: {
    fontSize: 13,
    color: '#666666',
    letterSpacing: 0.2,
  },
  scrollView: {
    flex: 1,
  },
  // Welcome card styles
  welcomeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  welcomeGradient: {
    padding: 20,
    borderRadius: 16,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  welcomeTextContainer: {
    flex: 1,
    marginRight: 10,
    minWidth: 200,
  },
  welcomeTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeError: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
  },
  welcomeSubtitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4,
    opacity: 0.9,
  },
  liveIndicator: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  welcomeTime: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  welcomeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  welcomeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  // Carousel styles
  carouselContainer: {
    height: 280,
    marginVertical: 16,
  },
  carouselItem: {
    width: Dimensions.get('window').width,
    justifyContent: 'center',
  },
  carouselLoadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    marginHorizontal: 16,
  },
  emptyCarouselContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    marginHorizontal: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    height: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066CC', // Primary color
    marginHorizontal: 4,
  },
  carouselCard: {
    width: Dimensions.get('window').width - 32,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  carouselImage: {
    height: 180,
    width: '100%',
  },
  carouselGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    justifyContent: 'flex-end',
  },
  carouselContent: {
    padding: 16,
    paddingBottom: 20,
  },
  carouselTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  carouselSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 12,
  },
  carouselButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  carouselButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    zIndex: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Section styles
  sectionContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
    letterSpacing: 0.3,
  },
  seeAllText: {
    color: '#0066CC', // Primary color
    fontSize: 14,
    fontWeight: '600',
  },
  newsSection: {
    paddingTop: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    paddingBottom: 10,
  },
  // Quick access tiles
  quickAccessTile: {
    alignItems: 'center',
    marginRight: 24,
    width: 80,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tileTitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#333333',
    fontWeight: '500',
  },
  // News card styles
  newsCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 2,
  },
  newsCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 16,
  },
  newsTextContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.1,
  },
  readMore: {
    color: '#0066CC', // Primary color
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  readMoreButton: {
    paddingVertical: 5,
    paddingHorizontal: 0,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Event card styles
  eventCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 2,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  eventDateContainer: {
    position: 'absolute',
    left: 16,
    top: 16,
    width: 50,
    backgroundColor: '#0066CC', // Primary color
    borderRadius: 8,
    alignItems: 'center',
    padding: 8,
  },
  eventMonth: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventDay: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDetails: {
    padding: 16,
    paddingLeft: 80,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222222',
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventLocation: {
    fontSize: 14,
    color: '#444444',
  },
  eventTime: {
    fontSize: 14,
    color: '#444444',
  },
  eventStatusChip: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    alignSelf: 'flex-start',
    height: 28,
  },
  eventStatusText: {
    color: '#0066CC', // Primary color
    fontSize: 12,
    fontWeight: '600',
  }
});

export default HomeScreen;
