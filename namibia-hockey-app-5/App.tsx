import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from './src/utils/theme';
import HomeScreen from './src/screens/HomeScreen';
import TournamentsScreen from './src/screens/TournamentsScreen';
import TournamentDetailScreen from './src/screens/TournamentDetailScreen';
import CreateTournamentScreen from './src/screens/CreateTournamentScreen';
import NewsScreen from './src/screens/NewsScreen';
import NewsDetailScreen from './src/screens/NewsDetailScreen';
import CreateNewsScreen from './src/screens/CreateNewsScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import TeamDetailScreen from './src/screens/TeamDetailScreen';
import CreateTeamScreen from './src/screens/CreateTeamScreen';
import AddPlayerScreen from './src/screens/AddPlayerScreen';
import AddGameScreen from './src/screens/AddGameScreen';
import AddCoachScreen from './src/screens/AddCoachScreen';
import TicketsScreen from './src/screens/TicketsScreen';
import TicketDetailScreen from './src/screens/TicketDetailScreen';
import MyTicketDetailScreen from './src/screens/MyTicketDetailScreen';
import LeagueScreen from './src/screens/LeagueScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { AuthProvider } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar style="light" />
              <Stack.Navigator
                initialRouteName="SignIn"
                screenOptions={{
                  headerShown: false,
                }}
              >
              <Stack.Screen name="TabHome" component={TabNavigator} />
              <Stack.Screen name="Tournaments" component={TournamentsScreen} />
              <Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} />
              <Stack.Screen name="CreateTournament" component={CreateTournamentScreen} />
              <Stack.Screen name="News" component={NewsScreen} />
              <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
              <Stack.Screen name="CreateNews" component={CreateNewsScreen} />
              <Stack.Screen name="Teams" component={TeamsScreen} />
              <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
              <Stack.Screen name="CreateTeam" component={CreateTeamScreen} />
              <Stack.Screen name="AddPlayer" component={AddPlayerScreen} />
              <Stack.Screen name="AddGame" component={AddGameScreen} />
              <Stack.Screen name="AddCoach" component={AddCoachScreen} />
              <Stack.Screen name="Tickets" component={TicketsScreen} />
              <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
              <Stack.Screen name="MyTicketDetail" component={MyTicketDetailScreen} />
              <Stack.Screen name="League" component={LeagueScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="SignIn" component={SignInScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
            </NavigationContainer>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
