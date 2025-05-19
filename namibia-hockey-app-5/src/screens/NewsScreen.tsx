import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Dimensions, Animated, StatusBar, RefreshControl, FlatList } from 'react-native';
import { Card, Title, Paragraph, Text, useTheme, Button, Chip, Divider, Avatar, Badge, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data for news categories
const newsCategories = [
  { id: '1', name: 'All', icon: 'newspaper' },
  { id: '2', name: 'Latest', icon: 'clock-outline' },
  { id: '3', name: 'Teams', icon: 'account-group' },
  { id: '4', name: 'Players', icon: 'hockey-sticks' },
  { id: '5', name: 'Events', icon: 'calendar' }
];

// Mock data for featured news
const featuredNews = {
  id: 'featured1',
  title: 'NHL Announces Major Rule Changes for Next Season',
  snippet: 'The NHL has announced several rule changes that will take effect starting next season, including modifications to overtime and shootout procedures.',
  imageUrl: 'https://via.placeholder.com/600x300/0066CC/FFFFFF?text=NHL+Rule+Changes',
  author: 'Sarah Johnson',
  authorAvatar: 'https://via.placeholder.com/40x40',
  date: 'May 10, 2025',
  readTime: '5 min read',
  category: 'Latest'
};

// Mock data for news articles
const newsData = [
  {
    id: '1',
    title: 'Player of the Month Announced',
    snippet: 'Connor McDavid wins Player of the Month for the third consecutive time this season with an impressive 25 points in 12 games.',
    imageUrl: 'https://via.placeholder.com/400x200/0066CC/FFFFFF?text=Player+of+Month',
    author: 'Mike Richards',
    authorAvatar: 'https://via.placeholder.com/40x40',
    date: 'May 10, 2025',
    readTime: '3 min read',
    category: 'Players',
    featured: false
  },
  {
    id: '2',
    title: 'New Training Facility Opening',
    snippet: 'State-of-the-art training facility to open next month with advanced technologies including VR training systems and AI-powered analytics.',
    imageUrl: 'https://via.placeholder.com/400x200/FF6600/FFFFFF?text=Training+Facility',
    author: 'Jennifer Smith',
    authorAvatar: 'https://via.placeholder.com/40x40',
    date: 'May 8, 2025',
    readTime: '4 min read',
    category: 'Teams',
    featured: false
  },
  {
    id: '3',
    title: 'Youth Hockey Program Expands',
    snippet: 'Local youth hockey program to add three new age groups starting this fall, providing opportunities for more young players to join the sport.',
    imageUrl: 'https://via.placeholder.com/400x200/00A651/FFFFFF?text=Youth+Program',
    author: 'David Wilson',
    authorAvatar: 'https://via.placeholder.com/40x40',
    date: 'May 5, 2025',
    readTime: '2 min read',
    category: 'Events',
    featured: false
  },
  {
    id: '4',
    title: 'Interview: Rising Star Talks About First Season',
    snippet: 'Rookie sensation Alex Chen discusses his first NHL season, challenges faced, and goals for the future in an exclusive interview.',
    imageUrl: 'https://via.placeholder.com/400x200/9C27B0/FFFFFF?text=Player+Interview',
    author: 'Lisa Thompson',
    authorAvatar: 'https://via.placeholder.com/40x40',
    date: 'May 3, 2025',
    readTime: '6 min read',
    category: 'Players',
    featured: false
  },
  {
    id: '5',
    title: 'Championship Finals Set to Begin Next Week',
    snippet: 'After an exciting playoff season, the championship finals are set to begin next week with the top two teams facing off in a best-of-seven series.',
    imageUrl: 'https://via.placeholder.com/400x200/2196F3/FFFFFF?text=Championship+Finals',
    author: 'Robert Brown',
    authorAvatar: 'https://via.placeholder.com/40x40',
    date: 'May 1, 2025',
    readTime: '4 min read',
    category: 'Events',
    featured: false
  },
  {
    id: '6',
    title: 'Team Trade Deadline: Winners and Losers',
    snippet: 'A comprehensive analysis of this season\'s trade deadline moves, highlighting which teams improved their rosters and which ones missed opportunities.',
    imageUrl: 'https://via.placeholder.com/400x200/FF9800/FFFFFF?text=Trade+Deadline',
    author: 'Chris Davis',
    authorAvatar: 'https://via.placeholder.com/40x40',
    date: 'April 28, 2025',
    readTime: '7 min read',
    category: 'Teams',
    featured: false
  }
];

// Define types for the component props
type NewsScreenProps = {
  navigation: any; // Using 'any' for simplicity, but ideally should use proper navigation type
};

// Define types for news article
type NewsArticle = {
  id: string;
  title: string;
  snippet: string;
  imageUrl: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  category: string;
  featured?: boolean;
};

const NewsScreen = ({ navigation }: NewsScreenProps) => {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('1'); // Default to 'All'
  const [filteredNews, setFilteredNews] = useState(newsData);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  
  // Pre-create animation values for news items
  const newsAnimations = newsData.map((_, index) => ({
    scale: useRef(new Animated.Value(0.95)).current,
    opacity: useRef(new Animated.Value(0)).current,
    translateY: useRef(new Animated.Value(20)).current,
    delay: 300 + (index * 100)
  }));
  
  // Featured news animation values
  const featuredScale = useRef(new Animated.Value(0.95)).current;
  const featuredOpacity = useRef(new Animated.Value(0)).current;
  
  // Run entrance animations when component mounts
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
    
    // Animate news items
    newsAnimations.forEach((anim) => {
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
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 500,
          delay: anim.delay,
          useNativeDriver: true
        })
      ]).start();
    });
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
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    filterNews(query, activeCategory);
  };
  
  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    filterNews(searchQuery, categoryId);
  };
  
  // Filter news based on search query and category
  const filterNews = (query: string, categoryId: string) => {
    let filtered = newsData;
    
    // Apply search filter
    if (query) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.snippet.toLowerCase().includes(query.toLowerCase()) ||
        article.author.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryId !== '1') { // If not 'All'
      const categoryName = newsCategories.find(cat => cat.id === categoryId)?.name;
      if (categoryName) {
        filtered = filtered.filter(article => article.category === categoryName);
      }
    }
    
    setFilteredNews(filtered);
  };
  
  // Render news category
  const renderNewsCategory = ({ item }: { item: { id: string, name: string, icon: string } }) => (
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
  
  // Render news article
  const renderNewsArticle = ({ item, index }: { item: NewsArticle, index: number }) => {
    // Get pre-created animation values
    const { scale, opacity, translateY: itemTranslateY } = newsAnimations[index < newsAnimations.length ? index : 0];
    
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
            source={{ uri: item.imageUrl }}
            style={styles.newsImage}
            resizeMode="cover"
          />
          
          <Card.Content style={styles.newsContent}>
            <View style={styles.newsMetaRow}>
              <View style={styles.authorContainer}>
                <Avatar.Image 
                  source={{ uri: item.authorAvatar }} 
                  size={24} 
                  style={styles.authorAvatar}
                />
                <Text style={styles.authorName}>{item.author}</Text>
              </View>
              <View style={styles.dateContainer}>
                <Icon name="clock-outline" size={14} color="#666666" style={{ marginRight: 4 }} />
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
            </View>
            
            <Title style={styles.newsTitle}>{item.title}</Title>
            <Paragraph style={styles.newsSnippet}>{item.snippet}</Paragraph>
            
            <View style={styles.newsFooter}>
              <Chip style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{item.category}</Text>
              </Chip>
              <View style={styles.readTimeContainer}>
                <Icon name="book-outline" size={14} color="#666666" style={{ marginRight: 4 }} />
                <Text style={styles.readTimeText}>{item.readTime}</Text>
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
              <Text style={styles.headerTitle}>News</Text>
              <Text style={styles.headerSubtitle}>Latest hockey updates</Text>
            </View>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="bookmark-outline" size={24} color="#333333" />
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
            placeholder="Search news"
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
            data={newsCategories}
            renderItem={renderNewsCategory}
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
              tintColor={'#0066CC'}
            />
          }
        >
          {/* Featured News */}
          <Animated.View 
            style={{
              opacity: featuredOpacity,
              transform: [{ scale: featuredScale }],
              marginBottom: 24,
              paddingHorizontal: 16
            }}
          >
            <Text style={styles.sectionTitle}>Featured</Text>
            <Card 
              style={styles.featuredCard}
              onPress={() => navigation.navigate('NewsDetail', { newsId: featuredNews.id })}
            >
              <Image
                source={{ uri: featuredNews.imageUrl }}
                style={styles.featuredImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.featuredGradient}
              />
              <View style={styles.featuredContent}>
                <Chip style={styles.featuredChip}>
                  <Text style={styles.featuredChipText}>{featuredNews.category}</Text>
                </Chip>
                <Text style={styles.featuredTitle}>{featuredNews.title}</Text>
                <View style={styles.featuredMeta}>
                  <View style={styles.featuredAuthor}>
                    <Avatar.Image 
                      source={{ uri: featuredNews.authorAvatar }} 
                      size={24} 
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.featuredAuthorName}>{featuredNews.author}</Text>
                  </View>
                  <View style={styles.featuredDate}>
                    <Icon name="clock-outline" size={14} color="rgba(255,255,255,0.8)" style={{ marginRight: 4 }} />
                    <Text style={styles.featuredDateText}>{featuredNews.date}</Text>
                  </View>
                </View>
              </View>
            </Card>
          </Animated.View>
          
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
  }
});

export default NewsScreen;
