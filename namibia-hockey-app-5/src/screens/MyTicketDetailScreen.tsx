import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Animated,
  StatusBar,
  SafeAreaView,
  Share
} from 'react-native';
import { Card, Button, Divider, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

// Types
interface MyTicketDetailProps {
  route: {
    params: {
      ticket: any;
    };
  };
  navigation: any;
}

const MyTicketDetailScreen = ({ route, navigation }: MyTicketDetailProps) => {
  const { ticket } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  
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
    ]).start();
  }, []);
  
  const handleShareTicket = async () => {
    try {
      await Share.share({
        message: `Check out my ticket for ${ticket.homeTeam} vs ${ticket.awayTeam} on ${ticket.date} at ${ticket.venue}!`,
        title: 'My Hockey Ticket'
      });
    } catch (error) {
      console.log('Error sharing ticket:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket Details</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShareTicket}>
          <Icon name="share-variant" size={24} color="#333333" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY }] }
          ]}
        >
          {/* Ticket Card */}
          <Card style={styles.ticketCard}>
            <LinearGradient
              colors={ticket.used ? ['#BBBBBB', '#999999'] : ['#0066CC', '#004999']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ticketGradient}
            >
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketTypeText}>{ticket.ticketType} Ticket</Text>
                {ticket.used && (
                  <View style={styles.usedBadge}>
                    <Text style={styles.usedBadgeText}>Used</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.ticketGameInfo}>
                <Text style={styles.ticketDateText}>{ticket.date}</Text>
                <Text style={styles.ticketTimeText}>{ticket.time}</Text>
                <Text style={styles.ticketVenueText}>{ticket.venue}</Text>
              </View>
              
              <View style={styles.ticketTeamsContainer}>
                <View style={styles.ticketTeam}>
                  <Image 
                    source={{ uri: ticket.homeTeamLogo }} 
                    style={styles.ticketTeamLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.ticketTeamName}>{ticket.homeTeam}</Text>
                  <Text style={styles.ticketHomeText}>HOME</Text>
                </View>
                
                <Text style={styles.ticketVsText}>VS</Text>
                
                <View style={styles.ticketTeam}>
                  <Image 
                    source={{ uri: ticket.awayTeamLogo }} 
                    style={styles.ticketTeamLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.ticketTeamName}>{ticket.awayTeam}</Text>
                  <Text style={styles.ticketAwayText}>AWAY</Text>
                </View>
              </View>
              
              <Divider style={styles.ticketDivider} />
              
              <View style={styles.ticketSeatInfo}>
                <View style={styles.seatInfoItem}>
                  <Text style={styles.seatInfoLabel}>Section</Text>
                  <Text style={styles.seatInfoValue}>{ticket.section}</Text>
                </View>
                
                <View style={styles.seatInfoDivider} />
                
                <View style={styles.seatInfoItem}>
                  <Text style={styles.seatInfoLabel}>Row</Text>
                  <Text style={styles.seatInfoValue}>{ticket.row}</Text>
                </View>
                
                <View style={styles.seatInfoDivider} />
                
                <View style={styles.seatInfoItem}>
                  <Text style={styles.seatInfoLabel}>Seat</Text>
                  <Text style={styles.seatInfoValue}>{ticket.seat}</Text>
                </View>
              </View>
            </LinearGradient>
          </Card>
          
          {/* QR Code */}
          <Card style={styles.qrCard}>
            <Card.Content style={styles.qrContent}>
              <Text style={styles.qrTitle}>Scan at Entry</Text>
              <Image 
                source={{ uri: ticket.qrCode }} 
                style={styles.qrImage}
                resizeMode="contain"
              />
              <Text style={styles.qrNote}>
                Please have this QR code ready to be scanned at the venue entrance
              </Text>
            </Card.Content>
          </Card>
          
          {/* Venue Information */}
          <Card style={styles.venueCard}>
            <Card.Content>
              <Text style={styles.venueTitle}>Venue Information</Text>
              
              <View style={styles.venueInfoItem}>
                <Icon name="map-marker" size={20} color="#0066CC" style={styles.venueInfoIcon} />
                <View>
                  <Text style={styles.venueInfoTitle}>{ticket.venue}</Text>
                  <Text style={styles.venueInfoText}>123 Hockey Street, Swakopmund, Namibia</Text>
                </View>
              </View>
              
              <View style={styles.venueInfoItem}>
                <Icon name="clock-outline" size={20} color="#0066CC" style={styles.venueInfoIcon} />
                <View>
                  <Text style={styles.venueInfoTitle}>Gates Open</Text>
                  <Text style={styles.venueInfoText}>1 hour before game time</Text>
                </View>
              </View>
              
              <View style={styles.venueInfoItem}>
                <Icon name="information-outline" size={20} color="#0066CC" style={styles.venueInfoIcon} />
                <View>
                  <Text style={styles.venueInfoTitle}>Important Information</Text>
                  <Text style={styles.venueInfoText}>No outside food or drinks allowed. Bag checks in effect.</Text>
                </View>
              </View>
              
              <Button 
                mode="outlined" 
                style={styles.directionsButton}
                labelStyle={styles.directionsButtonLabel}
                icon="directions"
                onPress={() => {}}
              >
                Get Directions
              </Button>
            </Card.Content>
          </Card>
          
          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Button 
              mode="contained" 
              style={styles.addToWalletButton}
              labelStyle={styles.addToWalletButtonLabel}
              icon="wallet"
              onPress={() => {}}
            >
              Add to Mobile Wallet
            </Button>
            
            <Button 
              mode="outlined" 
              style={styles.transferButton}
              labelStyle={styles.transferButtonLabel}
              icon="account-arrow-right"
              onPress={() => {}}
            >
              Transfer Ticket
            </Button>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  ticketCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    marginBottom: 24,
  },
  ticketGradient: {
    padding: 20,
    borderRadius: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ticketTypeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  usedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  usedBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  ticketGameInfo: {
    marginBottom: 20,
  },
  ticketDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ticketTimeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  ticketVenueText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  ticketTeamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  ticketTeam: {
    flex: 2,
    alignItems: 'center',
  },
  ticketTeamLogo: {
    width: 70,
    height: 70,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 35,
  },
  ticketTeamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  ticketHomeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  ticketAwayText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  ticketVsText: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  ticketDivider: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    height: 1,
    marginBottom: 20,
  },
  ticketSeatInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  seatInfoItem: {
    alignItems: 'center',
  },
  seatInfoLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  seatInfoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seatInfoDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  qrCard: {
    borderRadius: 16,
    elevation: 2,
    marginBottom: 24,
  },
  qrContent: {
    alignItems: 'center',
    padding: 20,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  qrNote: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  venueCard: {
    borderRadius: 16,
    elevation: 2,
    marginBottom: 24,
  },
  venueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  venueInfoItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  venueInfoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  venueInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  venueInfoText: {
    fontSize: 14,
    color: '#666666',
  },
  directionsButton: {
    marginTop: 8,
    borderColor: '#0066CC',
    borderRadius: 8,
  },
  directionsButtonLabel: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsContainer: {
    marginBottom: 32,
  },
  addToWalletButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    marginBottom: 12,
  },
  addToWalletButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 2,
  },
  transferButton: {
    borderColor: '#0066CC',
    borderRadius: 8,
  },
  transferButtonLabel: {
    color: '#0066CC',
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 2,
  }
});

export default MyTicketDetailScreen;
