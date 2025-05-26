import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Dimensions, Animated, StatusBar, RefreshControl, FlatList } from 'react-native';
import { Card, Title, Paragraph, Text, useTheme, Button, Chip, Divider, Avatar, Badge, Searchbar, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../utils/supabase';

// Define type for news categories
type NewsCategory = {
  id: string;
  name: string;
  icon: string;
};

// Initial categories - will be replaced with data from the database
const initialCategories: NewsCategory[] = [
  { id: 'all', name: 'All', icon: 'newspaper' }
];

// Define types for the component props
type NewsScreenProps = {
  navigation: any;
};

// Define types for news article from the news_articles_view
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

const NewsScreen = ({ navigation }: NewsScreenProps) => {
  const { user } = useAuth();
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  
  // State for news data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // Default to 'All'
  const [categories, setCategories] = useState<NewsCategory[]>(initialCategories);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | null>(null);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Create animation values for each news item
  const [newsAnimations, setNewsAnimations] = useState<Array<{
    scale: Animated.Value;
    opacity: Animated.Value;
    translateY: Animated.Value;
  }>>([]);
  
  // Fetch news categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('news_categories')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching categories:', error.message);
        return;
      }
      
      if (data) {
        // Add 'All' category at the beginning
        const allCategories = [
          { id: 'all', name: 'All', icon: 'newspaper' },
          ...data
        ];
        setCategories(allCategories);
      }
    } catch (err: any) {
      console.error('Unexpected error fetching categories:', err.message);
    }
  };
  
  // Fetch news articles
  const fetchNewsArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('news_articles_view')
        .select('*')
        .order('published_date', { ascending: false });
        
      if (error) {
        console.error('Error fetching news articles:', error.message);
        setError('Failed to load news articles');
        return;
      }
      
      if (data) {
        // Find featured article
        const featured = data.find(article => article.is_featured);
        if (featured) {
          setFeaturedArticle(featured);
        }
        
        // Set all articles
        setNewsArticles(data);
        
        // Initialize animations for news items
        const animations = data.map(() => ({
          scale: new Animated.Value(1),
          opacity: new Animated.Value(0),
          translateY: new Animated.Value(50)
        }));
        
        setNewsAnimations(animations);
        
        // Animate news items in sequence
        animations.forEach((anim, index) => {
          Animated.sequence([
            Animated.delay(100 * index),
            Animated.parallel([
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
              }),
              Animated.timing(anim.translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
              })
            ])
          ]).start();
        });
      }
    } catch (err: any) {
      console.error('Unexpected error fetching news articles:', err.message);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Load data on mount and set up real-time subscription
  useEffect(() => {
    fetchCategories();
    fetchNewsArticles();
    
    // Set up scroll listener for header animations
    scrollY.addListener(({ value }) => {
      // Fade out header as user scrolls down
      fadeAnim.setValue(value < 50 ? 1 - (value / 50) : 0);
      translateY.setValue(value < 30 ? -value / 3 : -10);
    });
    
    // Set up real-time subscription to news_articles table
    const subscription = supabase
      .channel('news_changes')
      .on('postgres_changes', {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'news_articles'
      }, (payload) => {
        console.log('Real-time update received:', payload);
        // Refresh news articles when changes occur
        fetchNewsArticles();
      })
      .subscribe();
    
    return () => {
      scrollY.removeAllListeners();
      // Unsubscribe from real-time updates when component unmounts
      subscription.unsubscribe();
    };
  }, []);
  
  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchNewsArticles();
  };
  
  // Handle search
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };
  
  // Filter news based on search query and category
  const filterNews = (query: string, categoryId: string) => {
    let filtered = [...newsArticles];
    
    // Filter by category
    if (categoryId !== 'all') { // If not 'All'
      filtered = filtered.filter(item => item.category_id === categoryId);
    }
    
    // Filter by search query
    if (query) {
      const lowercasedQuery = query.toLowerCase();
      filtered = filtered.filter(
        item => 
          item.title.toLowerCase().includes(lowercasedQuery) ||
          item.snippet.toLowerCase().includes(lowercasedQuery) ||
          item.author.toLowerCase().includes(lowercasedQuery)
      );
    }
    
    return filtered;
  };
  
  // Render news category
  const renderNewsCategory = ({ item }: { item: NewsCategory }) => {
    const isActive = activeCategory === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryButton,
          isActive && styles.activeCategoryButton
        ]}
        onPress={() => handleCategoryChange(item.id)}
      >
        <Icon 
          name={item.icon} 
          size={18} 
          color={isActive ? 'white' : '#0066CC'} 
        />
        <Text 
          style={[
            styles.categoryText,
            isActive && styles.activeCategoryText
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Format as 'MMM d, yyyy' (e.g., 'May 25, 2025')
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return dateString;
    }
  };
  
  // Render news article
  const renderNewsArticle = ({ item, index }: { item: NewsArticle, index: number }) => {
    // Initialize default animation values in case newsAnimations isn't ready yet
    const defaultAnim = {
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
      translateY: new Animated.Value(0)
    };
    
    // Get pre-created animation values with fallback
    const anim = newsAnimations.length > 0 && index < newsAnimations.length 
      ? newsAnimations[index] 
      : defaultAnim;
    
    const { scale, opacity, translateY: itemTranslateY } = anim;
    
    return (
      <Animated.View 
        style={{
          opacity,
          transform: [{ scale }, { translateY: itemTranslateY }],
          marginBottom: 16
        }}
      >
        <Card 
          style={styles.newsCard}
          onPress={() => navigation.navigate('NewsDetail', { newsId: item.id })}
        >
          <Image
            source={{ uri: item.image_url || 'https://via.placeholder.com/400x200/CCCCCC/666666?text=No+Image' }}
            style={styles.newsImage}
            resizeMode="cover"
          />
          
          <Card.Content style={styles.newsContent}>
            <View style={styles.newsMetaRow}>
              <View style={styles.authorContainer}>
                <Avatar.Image 
                  size={24} 
                  source={{ uri: item.author_avatar || 'https://via.placeholder.com/40x40' }} 
                  style={styles.authorAvatar}
                />
                <Text style={styles.authorName}>{item.author}</Text>
              </View>
              <View style={styles.dateContainer}>
                <Icon name="calendar-outline" size={14} color="#666666" style={{ marginRight: 4 }} />
                <Text style={styles.dateText}>{formatDate(item.published_date)}</Text>
              </View>
            </View>
            
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsSnippet} numberOfLines={2}>{item.snippet}</Text>
            
            <View style={styles.newsFooter}>
              <Chip 
                style={styles.categoryChip} 
                textStyle={styles.categoryChipText}
              >
                {item.category_name}
              </Chip>
              <View style={styles.readTimeContainer}>
                <Icon name="book-outline" size={14} color="#666666" style={{ marginRight: 4 }} />
                <Text style={styles.readTimeText}>{item.read_time}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };
  
  // Filter news based on active category and search query
  const filteredNews = filterNews(searchQuery, activeCategory);
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
            <Text style={styles.loadingText}>Loading news...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={60} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
            <Button 
              mode="contained" 
              onPress={fetchNewsArticles}
              style={styles.retryButton}
            >
              Retry
            </Button>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#0066CC']}
                tintColor="#0066CC"
              />
            }
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <View>
                  <Text style={styles.headerTitle}>News</Text>
                  <Text style={styles.headerSubtitle}>Latest hockey updates</Text>
                </View>
                {user && user.role === 'admin' && (
                  <TouchableOpacity 
                    style={styles.createButton}
                    onPress={() => navigation.navigate('CreateNews')}
                  >
                    <Icon name="plus" size={16} color="white" style={{ marginRight: 4 }} />
                    <Text style={styles.createButtonText}>Create News</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {/* Search bar */}
            <View style={styles.searchContainer}>
              <Searchbar
                placeholder="Search news..."
                onChangeText={onChangeSearch}
                value={searchQuery}
                style={styles.searchBar}
                iconColor="#666666"
              />
            </View>
            
            {/* Categories */}
            <View style={styles.categoriesContainer}>
              <FlatList
                data={categories}
                renderItem={renderNewsCategory}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
              />
            </View>
            
            {/* Featured News */}
            {featuredArticle && (
              <View style={styles.featuredContainer}>
                <TouchableOpacity 
                  style={styles.featuredCard}
                  onPress={() => navigation.navigate('NewsDetail', { newsId: featuredArticle.id })}
                >
                  <Image
                    source={{ uri: featuredArticle.image_url || 'https://via.placeholder.com/600x300/0066CC/FFFFFF?text=Featured+News' }}
                    style={styles.featuredImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.featuredGradient}
                  />
                  <View style={styles.featuredContent}>
                    <Chip 
                      style={styles.featuredChip} 
                      textStyle={styles.featuredChipText}
                    >
                      {featuredArticle.category_name}
                    </Chip>
                    <Text style={styles.featuredTitle}>{featuredArticle.title}</Text>
                    <View style={styles.featuredMeta}>
                      <View style={styles.featuredAuthor}>
                        <Avatar.Image 
                          size={24} 
                          source={{ uri: featuredArticle.author_avatar || 'https://via.placeholder.com/40x40' }} 
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.featuredAuthorName}>{featuredArticle.author}</Text>
                      </View>
                      <View style={styles.featuredDate}>
                        <Icon name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" style={{ marginRight: 4 }} />
                        <Text style={styles.featuredDateText}>{formatDate(featuredArticle.published_date)}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Latest News */}
            <View style={styles.latestNewsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Latest News</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              
              {filteredNews.length > 0 ? (
                filteredNews.map((item, index) => (
                  <View key={item.id}>
                    {renderNewsArticle({ item, index })}
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Icon name="newspaper-variant-outline" size={60} color="#CCCCCC" />
                  <Text style={styles.emptyText}>No news found</Text>
                  <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
      
      {/* Floating action button for creating news */}
      {user && user.role === 'admin' && !loading && !error && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('CreateNews')}
        >
          <Icon name="plus" size={24} color="white" />
        </TouchableOpacity>
      )}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
    backgroundColor: '#0066CC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1565C0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 48,
  },
  categoriesContainer: {
    marginVertical: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
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
  featuredContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
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
  featuredChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 8,
    height: 28,
    alignSelf: 'flex-start',
  },
  featuredChipText: {
    color: 'white',
    fontSize: 12,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredAuthorName: {
    color: 'white',
    fontSize: 12,
  },
  featuredDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredDateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  latestNewsSection: {
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
  newsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  newsImage: {
    height: 160,
    width: '100%',
  },
  newsContent: {
    padding: 16,
  },
  newsMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    marginRight: 8,
  },
  authorName: {
    fontSize: 12,
    color: '#666666',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#666666',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
    lineHeight: 22,
  },
  newsSnippet: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    height: 28,
  },
  categoryChipText: {
    color: '#0066CC',
    fontSize: 12,
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTimeText: {
    fontSize: 12,
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
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  }
});

export default NewsScreen;
