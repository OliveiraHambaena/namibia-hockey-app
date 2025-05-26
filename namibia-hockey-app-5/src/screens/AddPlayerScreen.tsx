import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Appbar, HelperText, Snackbar, Chip, Menu, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../utils/supabase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Define types for navigation and route props
interface AddPlayerScreenProps {
  route: { params: { teamId?: string } };
  navigation: any;
}

// Define player positions for selection
const PLAYER_POSITIONS = ['C', 'LW', 'RW', 'D', 'G'];

const AddPlayerScreen = ({ route, navigation }: AddPlayerScreenProps) => {
  const { teamId } = route.params || {};
  
  // Form state
  const [name, setName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState('');
  const [goals, setGoals] = useState('0');
  const [assists, setAssists] = useState('0');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [positionMenuVisible, setPositionMenuVisible] = useState(false);
  
  // Form validation
  const [nameError, setNameError] = useState('');
  const [jerseyNumberError, setJerseyNumberError] = useState('');
  const [positionError, setPositionError] = useState('');
  
  // Team details
  const [teamName, setTeamName] = useState('');
  
  // Fetch team details
  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!teamId) {
        setSnackbarMessage('Team ID is missing');
        setSnackbarVisible(true);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('name')
          .eq('id', teamId)
          .single();
          
        if (error) {
          console.error('Error fetching team details:', error.message);
          return;
        }
        
        if (data) {
          setTeamName(data.name);
        }
      } catch (err: any) {
        console.error('Unexpected error fetching team details:', err.message);
      }
    };
    
    fetchTeamDetails();
  }, [teamId]);
  
  // Validate form
  const validateForm = () => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError('Player name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    if (!jerseyNumber.trim()) {
      setJerseyNumberError('Jersey number is required');
      isValid = false;
    } else if (!/^\d{1,2}$/.test(jerseyNumber)) {
      setJerseyNumberError('Jersey number must be 1-2 digits');
      isValid = false;
    } else {
      setJerseyNumberError('');
    }
    
    if (!position) {
      setPositionError('Position is required');
      isValid = false;
    } else {
      setPositionError('');
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
      // Calculate points (goals + assists)
      const goalsNum = parseInt(goals) || 0;
      const assistsNum = parseInt(assists) || 0;
      const points = goalsNum + assistsNum;
      
      // Insert player into database
      const { data, error } = await supabase
        .from('players')
        .insert([
          {
            team_id: teamId,
            name,
            jersey_number: jerseyNumber,
            position,
            goals: goalsNum,
            assists: assistsNum,
            points
          }
        ])
        .select();
        
      if (error) {
        console.error('Error adding player:', error.message);
        setSnackbarMessage(`Failed to add player: ${error.message}`);
        setSnackbarVisible(true);
        return;
      }
      
      if (data) {
        Alert.alert(
          'Success',
          `Player ${name} has been added to the team.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('TeamDetail', { teamId })
            }
          ]
        );
      }
    } catch (err: any) {
      console.error('Unexpected error adding player:', err.message);
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
        <Appbar.Content title="Add Player" subtitle={teamName ? `Team: ${teamName}` : undefined} />
      </Appbar.Header>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Player Information</Text>
            
            <TextInput
              label="Player Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
              error={!!nameError}
              disabled={loading}
            />
            {nameError ? <HelperText type="error">{nameError}</HelperText> : null}
            
            <TextInput
              label="Jersey Number"
              value={jerseyNumber}
              onChangeText={setJerseyNumber}
              style={styles.input}
              mode="outlined"
              error={!!jerseyNumberError}
              keyboardType="numeric"
              disabled={loading}
            />
            {jerseyNumberError ? <HelperText type="error">{jerseyNumberError}</HelperText> : null}
            
            <View style={styles.positionContainer}>
              <Text style={styles.inputLabel}>Position</Text>
              <TouchableOpacity
                style={[
                  styles.positionSelector,
                  !!positionError && styles.inputError
                ]}
                onPress={() => setPositionMenuVisible(true)}
                disabled={loading}
              >
                <Text style={position ? styles.positionText : styles.positionPlaceholder}>
                  {position || 'Select Position'}
                </Text>
                <Icon name="chevron-down" size={20} color="#666666" />
              </TouchableOpacity>
              {positionError ? <HelperText type="error">{positionError}</HelperText> : null}
              
              <Menu
                visible={positionMenuVisible}
                onDismiss={() => setPositionMenuVisible(false)}
                anchor={{ x: 0, y: 0 }}
                style={styles.positionMenu}
              >
                {PLAYER_POSITIONS.map((pos) => (
                  <Menu.Item
                    key={pos}
                    title={`${pos} - ${getPositionFullName(pos)}`}
                    onPress={() => {
                      setPosition(pos);
                      setPositionMenuVisible(false);
                    }}
                  />
                ))}
              </Menu>
            </View>
            
            <Divider style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Player Statistics</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statsCol}>
                <TextInput
                  label="Goals"
                  value={goals}
                  onChangeText={setGoals}
                  style={styles.statsInput}
                  mode="outlined"
                  keyboardType="numeric"
                  disabled={loading}
                />
              </View>
              <View style={styles.statsCol}>
                <TextInput
                  label="Assists"
                  value={assists}
                  onChangeText={setAssists}
                  style={styles.statsInput}
                  mode="outlined"
                  keyboardType="numeric"
                  disabled={loading}
                />
              </View>
              <View style={styles.statsCol}>
                <TextInput
                  label="Points"
                  value={String(parseInt(goals) + parseInt(assists))}
                  style={styles.statsInput}
                  mode="outlined"
                  disabled={true}
                />
              </View>
            </View>
            
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={loading}
              disabled={loading}
            >
              Add Player
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

// Helper function to get full position name
const getPositionFullName = (position: string) => {
  switch (position) {
    case 'C': return 'Center';
    case 'LW': return 'Left Wing';
    case 'RW': return 'Right Wing';
    case 'D': return 'Defense';
    case 'G': return 'Goalie';
    default: return position;
  }
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
  input: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  positionContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  positionSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#B00020',
  },
  positionText: {
    color: '#333333',
  },
  positionPlaceholder: {
    color: '#999999',
  },
  positionMenu: {
    width: '80%',
  },
  divider: {
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsCol: {
    flex: 1,
    marginHorizontal: 4,
  },
  statsInput: {
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#0066CC',
    paddingVertical: 8,
  },
});

export default AddPlayerScreen;
