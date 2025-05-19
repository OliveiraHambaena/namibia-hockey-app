import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Menu,
  Searchbar,
  SegmentedButtons,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const NotificationsScreen = ({ navigation }: { navigation: any }) => {
  // Get screen dimensions for responsive design
  const { width, height } = useWindowDimensions();
  const isTablet = width > 768;

  // State for active filter
  const [activeFilter, setActiveFilter] = useState('all');
  
  // State for menu visibility
  const [menuVisible, setMenuVisible] = useState(false);
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);

  // Mock notifications data
  const notificationsData = [
    {
      id: '1',
      type: 'game',
      title: 'Game Reminder',
      message: 'Your game against Ice Hawks starts in 2 hours. Don\'t forget your equipment!',
      time: '2 hours ago',
      read: false,
      actionable: true,
      action: 'View Game Details',
      icon: 'hockey-sticks',
      color: '#1565C0',
    },
    {
      id: '2',
      type: 'team',
      title: 'Team Update',
      message: 'Coach Smith has added a new practice session for tomorrow at 6:00 PM.',
      time: '5 hours ago',
      read: false,
      actionable: true,
      action: 'View Schedule',
      icon: 'account-group',
      color: '#00A651',
    },
    {
      id: '3',
      type: 'news',
      title: 'League News',
      message: 'The playoff schedule has been announced. Check out the full schedule now!',
      time: 'Yesterday',
      read: true,
      actionable: true,
      action: 'Read More',
      icon: 'newspaper',
      color: '#0066CC',
    },
    {
      id: '4',
      type: 'system',
      title: 'App Update',
      message: 'A new version of the app is available with improved features and bug fixes.',
      time: '2 days ago',
      read: true,
      actionable: false,
      icon: 'cellphone-arrow-down',
      color: '#9C27B0',
    },
    {
      id: '5',
      type: 'game',
      title: 'Game Result',
      message: 'Congratulations! Your team won against Polar Bears 5-2.',
      time: '3 days ago',
      read: true,
      actionable: true,
      action: 'View Stats',
      icon: 'trophy',
      color: '#FF9800',
    },
    {
      id: '6',
      type: 'team',
      title: 'New Team Member',
      message: 'Welcome Mike Johnson to the Thunderbolts! Say hello to our new defenseman.',
      time: '4 days ago',
      read: true,
      actionable: true,
      action: 'View Profile',
      icon: 'account-plus',
      color: '#00A651',
    },
    {
      id: '7',
      type: 'news',
      title: 'Community Event',
      message: 'Join us for the annual charity hockey tournament on June 15th.',
      time: '5 days ago',
      read: true,
      actionable: true,
      action: 'Register Now',
      icon: 'calendar-star',
      color: '#0066CC',
    },
  ];

  // Filter notifications based on active filter
  const filteredNotifications = notificationsData.filter(notification => {
    // Apply search filter if search is active
    if (searchActive && searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (notification.title.toLowerCase().includes(query) || 
        notification.message.toLowerCase().includes(query)) &&
        (activeFilter === 'all' || notification.type === activeFilter)
      );
    }
    
    // Apply type filter
    if (activeFilter === 'all') {
      return true;
    } else if (activeFilter === 'unread') {
      return !notification.read;
    } else {
      return notification.type === activeFilter;
    }
  });

  // Count unread notifications
  const unreadCount = notificationsData.filter(notification => !notification.read).length;

  // Render notification item
  const renderNotificationItem = (notification: any) => {
    return (
      <Card 
        key={notification.id} 
        style={[
          styles.notificationCard, 
          notification.read ? styles.readCard : styles.unreadCard
        ]}
        mode="elevated"
      >
        <View style={styles.notificationContent}>
          <View style={[styles.iconContainer, { backgroundColor: notification.color }]}>
            <MaterialCommunityIcons name={notification.icon as any} size={24} color="white" />
          </View>
          
          <View style={styles.textContainer}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
            
            <Text style={styles.notificationMessage}>{notification.message}</Text>
            
            {notification.actionable && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleNotificationAction(notification)}
              >
                <Text style={styles.actionText}>{notification.action}</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color="#1565C0" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {!notification.read && (
          <View style={styles.unreadIndicator} />
        )}
      </Card>
    );
  };

  // Handle notification action
  const handleNotificationAction = (notification: any) => {
    // Mark as read
    // In a real app, you would update the notification status in your database
    console.log(`Action triggered for notification: ${notification.id}`);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'game':
        // Navigate to game details
        break;
      case 'team':
        // Navigate to team screen
        break;
      case 'news':
        // Navigate to news article
        break;
      default:
        break;
    }
  };

  // Mark all as read
  const markAllAsRead = () => {
    // In a real app, you would update all notifications as read in your database
    console.log('Marked all notifications as read');
    setMenuVisible(false);
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    // In a real app, you would clear all notifications in your database
    console.log('Cleared all notifications');
    setMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1565C0', '#0D47A1']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <IconButton
              icon="arrow-left"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
          
          <View style={styles.headerRight}>
            {!searchActive ? (
              <>
                <IconButton
                  icon="magnify"
                  iconColor="white"
                  size={24}
                  onPress={() => setSearchActive(true)}
                />
                
                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <IconButton
                      icon="dots-vertical"
                      iconColor="white"
                      size={24}
                      onPress={() => setMenuVisible(true)}
                    />
                  }
                  contentStyle={styles.menuContent}
                >
                  <Menu.Item 
                    onPress={markAllAsRead} 
                    title="Mark all as read"
                    leadingIcon="check-all"
                  />
                  <Divider />
                  <Menu.Item 
                    onPress={clearAllNotifications} 
                    title="Clear all notifications"
                    leadingIcon="delete-sweep"
                  />
                </Menu>
              </>
            ) : (
              <IconButton
                icon="close"
                iconColor="white"
                size={24}
                onPress={() => {
                  setSearchActive(false);
                  setSearchQuery('');
                }}
              />
            )}
          </View>
        </View>
        
        {searchActive ? (
          <Searchbar
            placeholder="Search notifications"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor="#1565C0"
            placeholderTextColor="#757575"
          />
        ) : (
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{notificationsData.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{unreadCount}</Text>
              <Text style={styles.statLabel}>Unread</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{notificationsData.filter(n => n.type === 'game').length}</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
          </View>
        )}
      </LinearGradient>
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <SegmentedButtons
            value={activeFilter}
            onValueChange={setActiveFilter}
            buttons={[
              { value: 'all', label: 'All' },
              { value: 'unread', label: 'Unread' },
              { value: 'game', label: 'Games' },
              { value: 'team', label: 'Team' },
              { value: 'news', label: 'News' },
              { value: 'system', label: 'System' },
            ]}
            style={styles.filterButtons}
            density="medium"
          />
        </ScrollView>
      </View>
      
      {/* Notifications List */}
      <ScrollView 
        style={styles.notificationsContainer}
        contentContainerStyle={styles.notificationsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => renderNotificationItem(notification))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bell-off-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyMessage}>
              {searchActive 
                ? "No notifications match your search criteria" 
                : "You don't have any notifications at the moment"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  searchBar: {
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
  },
  menuContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
  },
  filterContainer: {
    paddingVertical: 16,
    marginTop: -16,
    zIndex: 1,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButtons: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    padding: 8,
  },
  notificationsContainer: {
    flex: 1,
  },
  notificationsContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  notificationCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  readCard: {
    backgroundColor: 'white',
  },
  unreadCard: {
    backgroundColor: 'white',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#1565C0',
    fontWeight: '500',
    marginRight: 4,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    backgroundColor: '#1565C0',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#757575',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },
});

export default NotificationsScreen;
