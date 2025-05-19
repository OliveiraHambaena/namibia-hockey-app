import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// Get screen dimensions
const { width } = Dimensions.get('window');

// Define tab item interface
interface TabItemProps {
  label: string;
  icon: string;
  activeIcon?: string;
  onPress: () => void;
  isFocused: boolean;
  showBadge?: boolean;
  badgeCount?: number;
  animatedValue: Animated.Value;
}

// Tab item component
const TabItem = ({
  label,
  icon,
  activeIcon,
  onPress,
  isFocused,
  showBadge = false,
  badgeCount = 0,
  animatedValue,
}: TabItemProps) => {
  const theme = useTheme();
  const iconToUse = isFocused && activeIcon ? activeIcon : icon;
  
  // Animations
  const scale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });
  
  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });
  
  const labelOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });
  
  const labelScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.tabItemContainer}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={iconToUse as any}
            size={24}
            color={isFocused ? theme.colors.primary : '#757575'}
          />
          
          {showBadge && (
            <View style={styles.badgeContainer}>
              {badgeCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                  <Text style={styles.badgeText}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Text>
                </View>
              ) : (
                <View style={[styles.dotBadge, { backgroundColor: theme.colors.error }]} />
              )}
            </View>
          )}
        </Animated.View>
        
        <Animated.Text
          style={[
            styles.tabLabel,
            {
              color: isFocused ? theme.colors.primary : '#757575',
              opacity: labelOpacity,
              transform: [{ scale: labelScale }],
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>
        
        {isFocused && (
          <Animated.View
            style={[
              styles.activeIndicator,
              {
                backgroundColor: theme.colors.primary,
                opacity: animatedValue,
              },
            ]}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

// Custom Tab Bar component
const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  
  // Animation values for each tab
  const [animatedValues] = useState(() =>
    state.routes.map(() => new Animated.Value(0))
  );
  
  // Update animations when focused tab changes
  useEffect(() => {
    // Animate all tabs out
    const animations = state.routes.map((_, i) => {
      return Animated.timing(animatedValues[i], {
        toValue: i === state.index ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      });
    });
    
    Animated.parallel(animations).start();
  }, [state.index]);
  
  // Calculate tab bar width based on screen size
  const tabBarWidth = isTablet ? width * 0.7 : width * 0.9;
  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.99)']}
        style={[styles.gradient, { width: tabBarWidth }]}
      >
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel.toString()
                : options.title !== undefined
                ? options.title
                : route.name;
                
            const icon = options.tabBarIcon
              ? (options.tabBarIcon as any)({ focused: false, color: '', size: 0 })
              : 'circle';
              
            const activeIcon = options.tabBarIcon
              ? (options.tabBarIcon as any)({ focused: true, color: '', size: 0 })
              : icon;
            
            const showBadge = options.tabBarBadge !== undefined;
            const badgeCount = typeof options.tabBarBadge === 'number' 
              ? options.tabBarBadge 
              : 0;
            
            const isFocused = state.index === index;
            
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };
            
            return (
              <TabItem
                key={route.key}
                label={label as string}
                icon={icon}
                activeIcon={activeIcon}
                onPress={onPress}
                isFocused={isFocused}
                showBadge={showBadge}
                badgeCount={badgeCount}
                animatedValue={animatedValues[index]}
              />
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  gradient: {
    borderRadius: 30,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 24,
    width: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 20,
    height: 3,
    borderRadius: 1.5,
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -8,
  },
  badge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dotBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default CustomTabBar;
