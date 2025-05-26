import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Text, TextInput, Button, Appbar, HelperText, Snackbar, Menu, Divider, Switch, RadioButton, Portal, Dialog } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../utils/supabase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

// Define types for navigation and route props
interface AddGameScreenProps {
  route: { params: { teamId?: string } };
  navigation: any;
}

// Define game status options
const GAME_STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled'];

const AddGameScreen = ({ route, navigation }: AddGameScreenProps) => {
  const { teamId } = route.params || {};
  
  // Form state
  const [opposingTeams, setOpposingTeams] = useState<any[]>([]);
  const [selectedOpposingTeamId, setSelectedOpposingTeamId] = useState('');
  const [isHomeTeam, setIsHomeTeam] = useState(true);
  const [gameDate, setGameDate] = useState(new Date());
  const [showDatePickerDialog, setShowDatePickerDialog] = useState(false);
  const [showTimePickerDialog, setShowTimePickerDialog] = useState(false);
  const [venue, setVenue] = useState('');
  const [status, setStatus] = useState('scheduled');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [showScores, setShowScores] = useState(false);
  
  // Date picker state
  const [selectedYear, setSelectedYear] = useState(gameDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(gameDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(gameDate.getDate());
  const [selectedHour, setSelectedHour] = useState(gameDate.getHours());
  const [selectedMinute, setSelectedMinute] = useState(gameDate.getMinutes());
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [teamMenuVisible, setTeamMenuVisible] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  
  // Form validation
  const [opposingTeamError, setOpposingTeamError] = useState('');
  const [venueError, setVenueError] = useState('');
  const [dateError, setDateError] = useState('');
  
  // Team details
  const [teamName, setTeamName] = useState('');
  
  // Fetch team details and opposing teams
  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!teamId) {
        setSnackbarMessage('Team ID is missing');
        setSnackbarVisible(true);
        return;
      }
      
      try {
        // Fetch current team details
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('name')
          .eq('id', teamId)
          .single();
          
        if (teamError) {
          console.error('Error fetching team details:', teamError.message);
          return;
        }
        
        if (teamData) {
          setTeamName(teamData.name);
        }
        
        // Fetch all other teams for opponent selection
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('id, name, logo_url')
          .neq('id', teamId);
          
        if (teamsError) {
          console.error('Error fetching opposing teams:', teamsError.message);
          return;
        }
        
        if (teamsData) {
          setOpposingTeams(teamsData);
        }
      } catch (err: any) {
        console.error('Unexpected error fetching data:', err.message);
      }
    };
    
    fetchTeamDetails();
  }, [teamId]);
  
  // Handle date change
  const onDateChange = () => {
    const newDate = new Date(gameDate);
    newDate.setFullYear(selectedYear);
    newDate.setMonth(selectedMonth);
    newDate.setDate(selectedDay);
    setGameDate(newDate);
    setShowDatePickerDialog(false);
  };

  // Handle time change
  const onTimeChange = () => {
    const newDate = new Date(gameDate);
    newDate.setHours(selectedHour);
    newDate.setMinutes(selectedMinute);
    setGameDate(newDate);
    setShowTimePickerDialog(false);
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'MMMM d, yyyy');
  };
  
  // Format time for display
  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };
  
  // Get opposing team name
  const getOpposingTeamName = (id: string) => {
    const team = opposingTeams.find(team => team.id === id);
    return team ? team.name : 'Select Opponent';
  };
  
  // Validate form
  const validateForm = () => {
    let isValid = true;
    
    if (!selectedOpposingTeamId) {
      setOpposingTeamError('Opposing team is required');
      isValid = false;
    } else {
      setOpposingTeamError('');
    }
    
    if (!venue.trim()) {
      setVenueError('Venue is required');
      isValid = false;
    } else {
      setVenueError('');
    }
    
    if (!gameDate) {
      setDateError('Game date and time are required');
      isValid = false;
    } else {
      setDateError('');
    }
    
    // If status is completed, scores are required
    if (status === 'completed') {
      if (!homeScore.trim() || !awayScore.trim()) {
        setSnackbarMessage('Scores are required for completed games');
        setSnackbarVisible(true);
        isValid = false;
      }
    }
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    if (!teamId) {
      setSnackbarMessage('Team ID is missing');
      setSnackbarVisible(true);
      return;
    }
    
    setLoading(true);
    
    try {
      // Determine home and away team IDs based on isHomeTeam
      const homeTeamId = isHomeTeam ? teamId : selectedOpposingTeamId;
      const awayTeamId = isHomeTeam ? selectedOpposingTeamId : teamId;
      
      // Convert scores to numbers if provided
      const homeScoreNum = homeScore.trim() ? parseInt(homeScore) : null;
      const awayScoreNum = awayScore.trim() ? parseInt(awayScore) : null;
      
      // Insert game into database
      const { data, error } = await supabase
        .from('games')
        .insert([
          {
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
            date: gameDate.toISOString(),
            venue,
            home_score: homeScoreNum,
            away_score: awayScoreNum,
            status
          }
        ])
        .select();
        
      if (error) {
        console.error('Error adding game:', error.message);
        setSnackbarMessage(`Failed to add game: ${error.message}`);
        setSnackbarVisible(true);
        return;
      }
      
      if (data) {
        Alert.alert(
          'Success',
          `Game has been scheduled successfully.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('TeamDetail', { teamId })
            }
          ]
        );
      }
    } catch (err: any) {
      console.error('Unexpected error adding game:', err.message);
      setSnackbarMessage(`An unexpected error occurred: ${err.message}`);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Schedule Game" subtitle={teamName ? `Team: ${teamName}` : undefined} />
      </Appbar.Header>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Game Information</Text>
            
            {/* Opposing Team Selector */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Opposing Team</Text>
              <TouchableOpacity
                style={[
                  styles.selector,
                  !!opposingTeamError && styles.inputError
                ]}
                onPress={() => setTeamMenuVisible(true)}
                disabled={loading}
              >
                <Text style={selectedOpposingTeamId ? styles.selectorText : styles.selectorPlaceholder}>
                  {selectedOpposingTeamId ? getOpposingTeamName(selectedOpposingTeamId) : 'Select Opponent'}
                </Text>
                <Icon name="chevron-down" size={20} color="#666666" />
              </TouchableOpacity>
              {opposingTeamError ? <HelperText type="error">{opposingTeamError}</HelperText> : null}
              
              <Menu
                visible={teamMenuVisible}
                onDismiss={() => setTeamMenuVisible(false)}
                anchor={{ x: 0, y: 0 }}
                style={styles.menu}
              >
                {opposingTeams.map((team) => (
                  <Menu.Item
                    key={team.id}
                    title={team.name}
                    onPress={() => {
                      setSelectedOpposingTeamId(team.id);
                      setTeamMenuVisible(false);
                    }}
                  />
                ))}
              </Menu>
            </View>
            
            {/* Home/Away Selection */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Game Location:</Text>
              <View style={styles.switchOptions}>
                <Text style={isHomeTeam ? styles.activeOption : styles.inactiveOption}>Away</Text>
                <Switch
                  value={isHomeTeam}
                  onValueChange={setIsHomeTeam}
                  color="#0066CC"
                  style={styles.switch}
                  disabled={loading}
                />
                <Text style={isHomeTeam ? styles.activeOption : styles.inactiveOption}>Home</Text>
              </View>
            </View>
            
            {/* Venue */}
            <TextInput
              label="Venue"
              value={venue}
              onChangeText={setVenue}
              style={styles.input}
              mode="outlined"
              error={!!venueError}
              disabled={loading}
            />
            {venueError ? <HelperText type="error">{venueError}</HelperText> : null}
            
            {/* Date and Time */}
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateContainer}>
                <Text style={styles.inputLabel}>Date</Text>
                <TouchableOpacity
                  style={[styles.dateTimeButton, !!dateError && styles.inputError]}
                  onPress={() => setShowDatePickerDialog(true)}
                  disabled={loading}
                >
                  <Icon name="calendar" size={20} color="#666666" style={styles.dateTimeIcon} />
                  <Text style={styles.dateTimeText}>{formatDate(gameDate)}</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.timeContainer}>
                <Text style={styles.inputLabel}>Time</Text>
                <TouchableOpacity
                  style={[styles.dateTimeButton, !!dateError && styles.inputError]}
                  onPress={() => setShowTimePickerDialog(true)}
                  disabled={loading}
                >
                  <Icon name="clock-outline" size={20} color="#666666" style={styles.dateTimeIcon} />
                  <Text style={styles.dateTimeText}>{formatTime(gameDate)}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {dateError ? <HelperText type="error">{dateError}</HelperText> : null}
            
            {/* Date Picker Dialog */}
            <Portal>
              <Dialog visible={showDatePickerDialog} onDismiss={() => setShowDatePickerDialog(false)}>
                <Dialog.Title>Select Date</Dialog.Title>
                <Dialog.Content>
                  <View style={styles.datePickerContainer}>
                    {/* Year Picker */}
                    <View style={styles.pickerColumn}>
                      <Text style={styles.pickerLabel}>Year</Text>
                      <ScrollView style={styles.pickerScrollView}>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(year => (
                          <TouchableOpacity 
                            key={year} 
                            style={[styles.pickerItem, selectedYear === year && styles.selectedPickerItem]}
                            onPress={() => setSelectedYear(year)}
                          >
                            <Text style={[styles.pickerItemText, selectedYear === year && styles.selectedPickerItemText]}>{year}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    
                    {/* Month Picker */}
                    <View style={styles.pickerColumn}>
                      <Text style={styles.pickerLabel}>Month</Text>
                      <ScrollView style={styles.pickerScrollView}>
                        {Array.from({ length: 12 }, (_, i) => i).map(month => (
                          <TouchableOpacity 
                            key={month} 
                            style={[styles.pickerItem, selectedMonth === month && styles.selectedPickerItem]}
                            onPress={() => setSelectedMonth(month)}
                          >
                            <Text style={[styles.pickerItemText, selectedMonth === month && styles.selectedPickerItemText]}>
                              {format(new Date(2000, month, 1), 'MMM')}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    
                    {/* Day Picker */}
                    <View style={styles.pickerColumn}>
                      <Text style={styles.pickerLabel}>Day</Text>
                      <ScrollView style={styles.pickerScrollView}>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <TouchableOpacity 
                            key={day} 
                            style={[styles.pickerItem, selectedDay === day && styles.selectedPickerItem]}
                            onPress={() => setSelectedDay(day)}
                          >
                            <Text style={[styles.pickerItemText, selectedDay === day && styles.selectedPickerItemText]}>{day}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setShowDatePickerDialog(false)}>Cancel</Button>
                  <Button onPress={onDateChange}>Confirm</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
            
            {/* Time Picker Dialog */}
            <Portal>
              <Dialog visible={showTimePickerDialog} onDismiss={() => setShowTimePickerDialog(false)}>
                <Dialog.Title>Select Time</Dialog.Title>
                <Dialog.Content>
                  <View style={styles.datePickerContainer}>
                    {/* Hour Picker */}
                    <View style={styles.pickerColumn}>
                      <Text style={styles.pickerLabel}>Hour</Text>
                      <ScrollView style={styles.pickerScrollView}>
                        {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                          <TouchableOpacity 
                            key={hour} 
                            style={[styles.pickerItem, selectedHour === hour && styles.selectedPickerItem]}
                            onPress={() => setSelectedHour(hour)}
                          >
                            <Text style={[styles.pickerItemText, selectedHour === hour && styles.selectedPickerItemText]}>
                              {hour.toString().padStart(2, '0')}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    
                    {/* Minute Picker */}
                    <View style={styles.pickerColumn}>
                      <Text style={styles.pickerLabel}>Minute</Text>
                      <ScrollView style={styles.pickerScrollView}>
                        {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                          <TouchableOpacity 
                            key={minute} 
                            style={[styles.pickerItem, selectedMinute === minute && styles.selectedPickerItem]}
                            onPress={() => setSelectedMinute(minute)}
                          >
                            <Text style={[styles.pickerItemText, selectedMinute === minute && styles.selectedPickerItemText]}>
                              {minute.toString().padStart(2, '0')}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setShowTimePickerDialog(false)}>Cancel</Button>
                  <Button onPress={onTimeChange}>Confirm</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
            
            <Divider style={styles.divider} />
            
            {/* Game Status */}
            <Text style={styles.sectionTitle}>Game Status</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Status</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setStatusMenuVisible(true)}
                disabled={loading}
              >
                <Text style={styles.selectorText}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
                <Icon name="chevron-down" size={20} color="#666666" />
              </TouchableOpacity>
              
              <Menu
                visible={statusMenuVisible}
                onDismiss={() => setStatusMenuVisible(false)}
                anchor={{ x: 0, y: 0 }}
                style={styles.menu}
              >
                {GAME_STATUSES.map((statusOption) => (
                  <Menu.Item
                    key={statusOption}
                    title={statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                    onPress={() => {
                      setStatus(statusOption);
                      setShowScores(statusOption === 'completed' || statusOption === 'in_progress');
                      setStatusMenuVisible(false);
                    }}
                  />
                ))}
              </Menu>
            </View>
            
            {/* Scores (only shown for completed or in-progress games) */}
            {showScores && (
              <View style={styles.scoresContainer}>
                <Text style={styles.inputLabel}>Game Score</Text>
                <View style={styles.scoreInputsContainer}>
                  <View style={styles.scoreTeam}>
                    <Text style={styles.scoreTeamName}>
                      {isHomeTeam ? teamName : getOpposingTeamName(selectedOpposingTeamId)}
                    </Text>
                    <TextInput
                      label="Home"
                      value={homeScore}
                      onChangeText={setHomeScore}
                      style={styles.scoreInput}
                      mode="outlined"
                      keyboardType="numeric"
                      disabled={loading}
                    />
                  </View>
                  
                  <Text style={styles.scoreVs}>vs</Text>
                  
                  <View style={styles.scoreTeam}>
                    <Text style={styles.scoreTeamName}>
                      {isHomeTeam ? getOpposingTeamName(selectedOpposingTeamId) : teamName}
                    </Text>
                    <TextInput
                      label="Away"
                      value={awayScore}
                      onChangeText={setAwayScore}
                      style={styles.scoreInput}
                      mode="outlined"
                      keyboardType="numeric"
                      disabled={loading}
                    />
                  </View>
                </View>
              </View>
            )}
            
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={loading}
              disabled={loading}
            >
              Schedule Game
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666666',
  },
  input: {
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#B00020',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  selectorText: {
    fontSize: 16,
    color: '#333333',
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: '#999999',
  },
  menu: {
    width: '80%',
    marginTop: 50,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 16,
  },
  switchOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switch: {
    marginHorizontal: 8,
  },
  activeOption: {
    fontSize: 14,
    color: '#0066CC',
  },
  inactiveOption: {
    fontSize: 14,
    color: '#999999',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateContainer: {
    flex: 1,
    marginRight: 8,
  },
  timeContainer: {
    flex: 1,
    marginLeft: 8,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  dateTimeIcon: {
    marginRight: 8,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333333',
  },
  divider: {
    marginVertical: 16,
  },
  scoresContainer: {
    marginBottom: 16,
  },
  scoreInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreTeam: {
    flex: 1,
    alignItems: 'center',
  },
  scoreTeamName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreInput: {
    width: '80%',
    backgroundColor: '#FFFFFF',
  },
  scoreVs: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    color: '#666666',
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#0066CC',
    paddingVertical: 8,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 200,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666666',
  },
  pickerScrollView: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    height: 160,
  },
  pickerItem: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPickerItem: {
    backgroundColor: '#E3F2FD',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333333',
  },
  selectedPickerItemText: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
});

export default AddGameScreen;
