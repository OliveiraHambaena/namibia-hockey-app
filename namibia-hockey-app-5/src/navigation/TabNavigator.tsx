import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import TeamsScreen from '../screens/TeamsScreen';
import NewsScreen from '../screens/NewsScreen';
import LeagueScreen from '../screens/LeagueScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Import custom tab bar
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#757575',
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => 
            focused ? 'home' : 'home-outline',
        }}
      />
      <Tab.Screen 
        name="TeamsTab" 
        component={TeamsScreen} 
        options={{
          tabBarLabel: 'Teams',
          tabBarIcon: ({ focused }) => 
            focused ? 'account-group' : 'account-group-outline',
        }}
      />
      <Tab.Screen 
        name="NewsTab" 
        component={NewsScreen} 
        options={{
          tabBarLabel: 'News',
          tabBarIcon: ({ focused }) => 
            focused ? 'newspaper-variant' : 'newspaper-variant-outline',
          tabBarBadge: 3,
        }}
      />
      <Tab.Screen 
        name="LeagueTab" 
        component={LeagueScreen} 
        options={{
          tabBarLabel: 'League',
          tabBarIcon: ({ focused }) => 
            focused ? 'trophy' : 'trophy-outline',
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => 
            focused ? 'account' : 'account-outline',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
