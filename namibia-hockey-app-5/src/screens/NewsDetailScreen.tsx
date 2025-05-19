import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Dimensions, Animated, StatusBar, Share } from 'react-native';
import { Text, Chip, Divider, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data for a detailed news article
const articleData = {
  id: 'featured1',
  title: 'NHL Announces Major Rule Changes for Next Season',
  content: `The National Hockey League (NHL) has announced several significant rule changes that will take effect starting next season, following a unanimous vote by the Board of Governors.

The most notable change involves the overtime format, which will now extend to 10 minutes of 3-on-3 play before proceeding to a shootout. This extension aims to reduce the number of games decided by shootouts and allow more games to be settled during continuous play.

"We believe this change will enhance the excitement of overtime and provide fans with more of the 3-on-3 action they've come to enjoy," said NHL Commissioner Gary Bettman during the press conference.

Additionally, the league is implementing a new "coach's challenge" rule for goaltender interference calls. Coaches will now have the ability to challenge goaltender interference decisions even when a goal is disallowed by the on-ice officials. Previously, challenges were only permitted when goals were scored.

The NHL is also modifying the shootout procedure. Teams will now be allowed to select any player for each round of the shootout, removing the previous restriction that prevented players from shooting twice until all eligible skaters had taken a turn.

Other changes include:

• A revised video review process that allows officials to consult with the NHL's Situation Room on major penalties
• Stricter enforcement of face-off violations
• Adjustments to equipment regulations, particularly regarding goaltender pad sizes
• New protocols for concussion evaluation and player safety

These changes come after extensive consultation with players, coaches, officials, and the NHL Players' Association. The league hopes these modifications will improve game flow, increase scoring opportunities, and enhance overall fan enjoyment.

The rule changes will be implemented at the start of the 2025-2026 NHL season, with a period of adjustment expected during preseason games.

Player reactions have been mixed, with veterans generally expressing caution while younger players seem more enthusiastic about the extended overtime format. Team captains will meet next month to discuss implementation strategies and provide feedback to the league office.`,
  imageUrl: 'https://via.placeholder.com/800x400/0066CC/FFFFFF?text=NHL+Rule+Changes',
  author: 'Sarah Johnson',
  authorAvatar: 'https://via.placeholder.com/40x40',
  authorTitle: 'Senior Hockey Correspondent',
  date: 'May 10, 2025',
  readTime: '5 min read',
  category: 'Latest',
  tags: ['NHL', 'Rules', 'Overtime', 'Shootout', 'Coach\'s Challenge'],
  relatedArticles: [
    {
      id: 'related1',
      title: 'How Rule Changes Have Affected NHL Scoring Over the Past Decade',
      imageUrl: 'https://via.placeholder.com/120x80/FF6600/FFFFFF?text=NHL+Scoring',
      date: 'April 28, 2025'
    },
    {
      id: 'related2',
      title: 'Players\' Association Response to Proposed Rule Changes',
      imageUrl: 'https://via.placeholder.com/120x80/00A651/FFFFFF?text=Players+Association',
      date: 'May 5, 2025'
    },
    {
      id: 'related3',
      title: 'Fan Reactions: Will Extended Overtime Improve the Game?',
      imageUrl: 'https://via.placeholder.com/120x80/9C27B0/FFFFFF?text=Fan+Reactions',
      date: 'May 8, 2025'
    }
  ]
};

// Define types for navigation and route props
type NewsDetailProps = {
  route: { params: { newsId?: string } };
  navigation: any; // Using 'any' for simplicity, but ideally should use proper navigation type
};

const NewsDetailScreen = ({ route, navigation }: NewsDetailProps) => {
  // In a real app, you would fetch the article details based on the ID
  // const { newsId } = route.params;
  const article = articleData; // For mock purposes
  
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
  
  // Share article
  const shareArticle = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${article.title} - Hockey App`,
        title: article.title,
      });
    } catch (error) {
      console.error(error);
    }
  };
  
  // Format article content with proper paragraphs
  const formattedContent = article.content.split('\n\n').map((paragraph, index) => (
    <Text key={index} style={styles.paragraph}>
      {paragraph}
    </Text>
  ));
  
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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {article.title}
          </Text>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={shareArticle}
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
            source={{ uri: article.imageUrl }}
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
            onPress={shareArticle}
          >
            <Icon name="share-variant" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Article Content */}
        <Animated.View 
          style={[
            styles.articleContainer,
            { opacity: fadeAnim }
          ]}
        >
          {/* Category Chip */}
          <Chip style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{article.category}</Text>
          </Chip>
          
          {/* Article Title */}
          <Text style={styles.articleTitle}>{article.title}</Text>
          
          {/* Author Info */}
          <View style={styles.authorContainer}>
            <Avatar.Image 
              source={{ uri: article.authorAvatar }} 
              size={40} 
              style={styles.authorAvatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{article.author}</Text>
              <Text style={styles.authorTitle}>{article.authorTitle}</Text>
            </View>
            <View style={styles.articleMeta}>
              <View style={styles.metaItem}>
                <Icon name="calendar" size={14} color="#666666" style={{ marginRight: 4 }} />
                <Text style={styles.metaText}>{article.date}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="clock-outline" size={14} color="#666666" style={{ marginRight: 4 }} />
                <Text style={styles.metaText}>{article.readTime}</Text>
              </View>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Article Content */}
          <View style={styles.contentContainer}>
            {formattedContent}
          </View>
          
          {/* Tags */}
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsTitle}>Tags</Text>
            <View style={styles.tagsList}>
              {article.tags.map((tag, index) => (
                <Chip 
                  key={index} 
                  style={styles.tagChip}
                  onPress={() => {}}
                >
                  <Text style={styles.tagChipText}>{tag}</Text>
                </Chip>
              ))}
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Related Articles */}
          <View style={styles.relatedContainer}>
            <Text style={styles.relatedTitle}>Related Articles</Text>
            {article.relatedArticles.map((related, index) => (
              <TouchableOpacity 
                key={related.id}
                style={styles.relatedItem}
                onPress={() => navigation.navigate('NewsDetail', { newsId: related.id })}
              >
                <Image 
                  source={{ uri: related.imageUrl }} 
                  style={styles.relatedImage}
                  resizeMode="cover"
                />
                <View style={styles.relatedContent}>
                  <Text style={styles.relatedItemTitle}>{related.title}</Text>
                  <Text style={styles.relatedItemDate}>{related.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.ScrollView>
      
      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarButton}>
          <Icon name="thumb-up-outline" size={24} color="#0066CC" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton}>
          <Icon name="comment-outline" size={24} color="#666666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton}>
          <Icon name="bookmark-outline" size={24} color="#666666" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.shareButton2}
          onPress={shareArticle}
        >
          <Icon name="share-variant" size={18} color="white" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  heroContainer: {
    height: 250,
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
  articleContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  categoryChip: {
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryChipText: {
    color: '#0066CC',
    fontSize: 12,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 32,
    marginBottom: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorAvatar: {
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  authorTitle: {
    fontSize: 12,
    color: '#666666',
  },
  articleMeta: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666666',
  },
  divider: {
    backgroundColor: '#EEEEEE',
    height: 1,
    marginVertical: 16,
  },
  contentContainer: {
    marginBottom: 24,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444444',
    marginBottom: 16,
  },
  tagsContainer: {
    marginBottom: 24,
  },
  tagsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: '#F5F7FA',
    marginRight: 8,
    marginBottom: 8,
  },
  tagChipText: {
    color: '#666666',
    fontSize: 12,
  },
  relatedContainer: {
    marginBottom: 24,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  relatedItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    overflow: 'hidden',
  },
  relatedImage: {
    width: 100,
    height: 70,
  },
  relatedContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  relatedItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  relatedItemDate: {
    fontSize: 12,
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
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  bottomBarButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton2: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 6,
  }
});

export default NewsDetailScreen;
