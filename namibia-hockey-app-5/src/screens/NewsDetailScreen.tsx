import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Dimensions, Animated, StatusBar, Share, ActivityIndicator } from 'react-native';
import { Text, Chip, Divider, Avatar, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../utils/supabase';

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

// Define type for related article
type RelatedArticle = {
  id: string;
  title: string;
  image_url: string;
  published_date: string;
};

// Define type for tag
type NewsTag = {
  id: string;
  name: string;
};

// Define types for navigation and route props
type NewsDetailProps = {
  route: { params: { newsId?: string } };
  navigation: any; // Using 'any' for simplicity, but ideally should use proper navigation type
};

const NewsDetailScreen = ({ route, navigation }: NewsDetailProps) => {
  const { newsId } = route.params;
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [tags, setTags] = useState<NewsTag[]>([]);
  
  const { width } = Dimensions.get('window');
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Fetch article data
  useEffect(() => {
    const fetchArticleData = async () => {
      if (!newsId) {
        setError('No article ID provided');
        setLoading(false);
        return;
      }
      
      try {
        // Fetch article details
        const { data, error } = await supabase
          .from('news_articles_view')
          .select('*')
          .eq('id', newsId)
          .single();
          
        if (error) {
          console.error('Error fetching article:', error.message);
          setError('Failed to load article');
          setLoading(false);
          return;
        }
        
        if (data) {
          setArticle(data);
          
          // Fetch related articles
          fetchRelatedArticles(data.category_id);
          
          // Fetch article tags
          fetchArticleTags(data.id);
        } else {
          setError('Article not found');
        }
      } catch (err: any) {
        console.error('Unexpected error:', err.message);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticleData();
    
    // Run entrance animation once when component mounts
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [newsId]);
  
  // Fetch related articles
  const fetchRelatedArticles = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('news_articles_view')
        .select('id, title, image_url, published_date')
        .eq('category_id', categoryId)
        .neq('id', newsId)
        .limit(3);
        
      if (error) {
        console.error('Error fetching related articles:', error.message);
        return;
      }
      
      if (data) {
        setRelatedArticles(data);
      }
    } catch (err: any) {
      console.error('Unexpected error fetching related articles:', err.message);
    }
  };
  
  // Fetch article tags
  const fetchArticleTags = async (articleId: string) => {
    try {
      const { data, error } = await supabase
        .from('news_article_tags')
        .select('tag_id')
        .eq('article_id', articleId);
        
      if (error) {
        console.error('Error fetching article tags:', error.message);
        return;
      }
      
      if (data && data.length > 0) {
        const tagIds = data.map(item => item.tag_id);
        
        // Fetch tag details
        const { data: tagsData, error: tagsError } = await supabase
          .from('news_tags')
          .select('id, name')
          .in('id', tagIds);
          
        if (tagsError) {
          console.error('Error fetching tags:', tagsError.message);
          return;
        }
        
        if (tagsData) {
          setTags(tagsData);
        }
      }
    } catch (err: any) {
      console.error('Unexpected error fetching tags:', err.message);
    }
  };
  
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
    if (!article) return;
    
    try {
      await Share.share({
        message: `Check out this article: ${article.title} - Hockey App`,
        title: article.title,
      });
    } catch (error) {
      console.error(error);
    }
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
  
  // Format article content with proper paragraphs
  const formattedContent = article?.content.split('\n\n').map((paragraph, index) => (
    <Text key={index} style={styles.paragraph}>
      {paragraph}
    </Text>
  ));
  
  // If loading, show loading indicator
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading article...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // If error, show error message
  if (error || !article) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={60} color="#FF6B6B" />
          <Text style={styles.errorText}>{error || 'Article not found'}</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.goBack()}
            style={styles.backToNewsButton}
          >
            Back to News
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
            source={{ uri: article.image_url || 'https://via.placeholder.com/800x400/0066CC/FFFFFF?text=No+Image' }}
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
            <Text style={styles.categoryChipText}>{article.category_name}</Text>
          </Chip>
          
          {/* Article Title */}
          <Text style={styles.articleTitle}>{article.title}</Text>
          
          {/* Author Info */}
          <View style={styles.authorContainer}>
            <Avatar.Image 
              source={{ uri: article.author_avatar || 'https://via.placeholder.com/40x40' }} 
              size={40} 
              style={styles.authorAvatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{article.author}</Text>
              <Text style={styles.authorTitle}>{article.author_title || 'Author'}</Text>
            </View>
            <View style={styles.articleMeta}>
              <View style={styles.metaItem}>
                <Icon name="calendar" size={14} color="#666666" style={{ marginRight: 4 }} />
                <Text style={styles.metaText}>{formatDate(article.published_date)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="clock-outline" size={14} color="#666666" style={{ marginRight: 4 }} />
                <Text style={styles.metaText}>{article.read_time || '5 min read'}</Text>
              </View>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Article Content */}
          <View style={styles.contentContainer}>
            {formattedContent}
          </View>
          
          {/* Tags */}
          {tags.length > 0 && (
            <>
              <View style={styles.tagsContainer}>
                <Text style={styles.tagsTitle}>Tags</Text>
                <View style={styles.tagsList}>
                  {tags.map((tag) => (
                    <Chip 
                      key={tag.id} 
                      style={styles.tagChip}
                      onPress={() => {}}
                    >
                      <Text style={styles.tagChipText}>{tag.name}</Text>
                    </Chip>
                  ))}
                </View>
              </View>
              <Divider style={styles.divider} />
            </>
          )}
          
          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <View style={styles.relatedContainer}>
              <Text style={styles.relatedTitle}>Related Articles</Text>
              {relatedArticles.map((related) => (
                <TouchableOpacity 
                  key={related.id}
                  style={styles.relatedItem}
                  onPress={() => navigation.navigate('NewsDetail', { newsId: related.id })}
                >
                  <Image 
                    source={{ uri: related.image_url || 'https://via.placeholder.com/120x80/CCCCCC/666666?text=No+Image' }} 
                    style={styles.relatedImage}
                    resizeMode="cover"
                  />
                  <View style={styles.relatedContent}>
                    <Text style={styles.relatedItemTitle}>{related.title}</Text>
                    <Text style={styles.relatedItemDate}>{formatDate(related.published_date)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  backToNewsButton: {
    marginTop: 10,
    backgroundColor: '#0066CC',
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
