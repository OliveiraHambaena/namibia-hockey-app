import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Dimensions,
  useWindowDimensions,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Button, RadioButton, Divider, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

// Types
interface TicketDetailProps {
  route: {
    params: {
      game: any;
    };
  };
  navigation: any;
}

// Mock data for ticket types
const ticketTypes = [
  {
    id: 'standard',
    name: 'Standard',
    price: 'N$120',
    description: 'General seating with good views of the ice',
    available: true,
    benefits: ['Access to concessions', 'Standard seating']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'N$200',
    description: 'Enhanced views with better seating options',
    available: true,
    benefits: ['Access to concessions', 'Premium seating', 'Free program']
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 'N$350',
    description: 'Best seats in the house with exclusive benefits',
    available: true,
    benefits: ['Access to VIP lounge', 'Premium seating', 'Free program', 'Complimentary refreshments']
  }
];

// Mock data for seating sections
const seatingOptions = {
  standard: ['A', 'B', 'C', 'D'],
  premium: ['E', 'F', 'G'],
  vip: ['H', 'J']
};

const TicketDetailScreen = ({ route, navigation }: TicketDetailProps) => {
  const { game } = route.params;
  const [selectedTicketType, setSelectedTicketType] = useState('standard');
  const [selectedSection, setSelectedSection] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState(1);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  
  // Get safe area insets
  const insets = useSafeAreaInsets();
  
  // Get window dimensions for responsive layout
  const { width, height } = useWindowDimensions();
  
  // Determine if device is in landscape orientation
  const isLandscape = width > height;
  
  // Calculate dynamic sizes based on screen dimensions
  const contentWidth = isLandscape ? width * 0.8 : width * 0.92;
  const cardPadding = width > 600 ? 24 : 16;
  
  // Responsive styles based on screen size
  const responsiveStyles = useMemo(() => ({
    container: {
      padding: width > 600 ? 24 : 16,
      paddingBottom: 100,
      alignItems: isLandscape ? 'center' as const : 'stretch' as const,
      maxWidth: 800,
      alignSelf: 'center' as const,
      width: '100%'
    },
    gameCard: {
      width: isLandscape ? contentWidth * 0.8 : contentWidth,
      alignSelf: 'center' as const
    },
    teamLogo: {
      width: width * 0.12 > 60 ? 60 : width * 0.12 < 40 ? 40 : width * 0.12,
      height: width * 0.12 > 60 ? 60 : width * 0.12 < 40 ? 40 : width * 0.12,
    },
    sectionsGrid: {
      justifyContent: isLandscape ? 'center' as const : 'flex-start' as const,
    }
  }), [width, height, isLandscape, contentWidth]);
  
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
  
  useEffect(() => {
    // Reset selected section when ticket type changes
    setSelectedSection('');
  }, [selectedTicketType]);
  
  const incrementQuantity = () => {
    if (quantity < 8) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const getSubtotal = () => {
    const selectedTicket = ticketTypes.find(ticket => ticket.id === selectedTicketType);
    if (!selectedTicket) return 'N$0';
    
    const price = parseInt(selectedTicket.price.replace('N$', ''));
    return `N$${price * quantity}`;
  };
  
  const getFees = () => {
    const selectedTicket = ticketTypes.find(ticket => ticket.id === selectedTicketType);
    if (!selectedTicket) return 'N$0';
    
    const price = parseInt(selectedTicket.price.replace('N$', ''));
    const fees = Math.round(price * 0.1) * quantity; // 10% fees
    return `N$${fees}`;
  };
  
  const getTotal = () => {
    const subtotal = parseInt(getSubtotal().replace('N$', ''));
    const fees = parseInt(getFees().replace('N$', ''));
    return `N$${subtotal + fees}`;
  };
  
  const handleContinue = () => {
    if (step === 1 && selectedTicketType) {
      setStep(2);
    } else if (step === 2 && selectedSection) {
      // Navigate to payment screen or show confirmation
      navigation.navigate('PaymentScreen', {
        game,
        ticketType: ticketTypes.find(ticket => ticket.id === selectedTicketType),
        section: selectedSection,
        quantity,
        total: getTotal()
      });
    }
  };
  
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigation.goBack();
    }
  };
  
  return (
    <SafeAreaView style={[styles.safeArea, { 
      paddingTop: Platform.OS === 'android' ? insets.top : 0,
      paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
      paddingLeft: Platform.OS === 'android' ? insets.left : 0,
      paddingRight: Platform.OS === 'android' ? insets.right : 0
    }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-left" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 1 ? 'Select Tickets' : 'Choose Section'}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.container,
            responsiveStyles.container,
            { opacity: fadeAnim, transform: [{ translateY }] }
          ]}
        >
          {/* Game Info Card */}
          <Card style={[styles.gameCard, responsiveStyles.gameCard]}>
            <Card.Content>
              <View style={styles.gameHeader}>
                <Text style={styles.gameDate}>{game.date}</Text>
                <Text style={styles.gameTime}>{game.time}</Text>
                <Text style={styles.gameVenue}>{game.venue}</Text>
              </View>
              
              <View style={styles.teamsContainer}>
                <View style={styles.teamContainer}>
                  <Image 
                    source={{ uri: game.homeTeamLogo }} 
                    style={[styles.teamLogo, responsiveStyles.teamLogo]}
                    resizeMode="contain"
                  />
                  <Text style={styles.teamName}>{game.homeTeam}</Text>
                  <Text style={styles.homeText}>HOME</Text>
                </View>
                
                <View style={styles.vsContainer}>
                  <Text style={styles.vsText}>VS</Text>
                </View>
                
                <View style={styles.teamContainer}>
                  <Image 
                    source={{ uri: game.awayTeamLogo }} 
                    style={[styles.teamLogo, responsiveStyles.teamLogo]}
                    resizeMode="contain"
                  />
                  <Text style={styles.teamName}>{game.awayTeam}</Text>
                  <Text style={styles.awayText}>AWAY</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          {/* Step Indicator */}
          <View style={styles.stepContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, step >= 1 && styles.activeStepCircle]}>
                <Text style={[styles.stepNumber, step >= 1 && styles.activeStepNumber]}>1</Text>
              </View>
              <Text style={[styles.stepText, step >= 1 && styles.activeStepText]}>Select Tickets</Text>
            </View>
            
            <View style={styles.stepLine} />
            
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, step >= 2 && styles.activeStepCircle]}>
                <Text style={[styles.stepNumber, step >= 2 && styles.activeStepNumber]}>2</Text>
              </View>
              <Text style={[styles.stepText, step >= 2 && styles.activeStepText]}>Choose Section</Text>
            </View>
            
            <View style={styles.stepLine} />
            
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, step >= 3 && styles.activeStepCircle]}>
                <Text style={[styles.stepNumber, step >= 3 && styles.activeStepNumber]}>3</Text>
              </View>
              <Text style={[styles.stepText, step >= 3 && styles.activeStepText]}>Payment</Text>
            </View>
          </View>
          
          {step === 1 ? (
            /* Step 1: Select Ticket Type */
            <View style={styles.stepContent}>
              <Text style={styles.sectionTitle}>Select Ticket Type</Text>
              
              <RadioButton.Group 
                onValueChange={value => setSelectedTicketType(value)} 
                value={selectedTicketType}
              >
                {ticketTypes.map((ticket) => (
                  <Card 
                    key={ticket.id} 
                    style={[
                      styles.ticketTypeCard,
                      selectedTicketType === ticket.id && styles.selectedTicketTypeCard
                    ]}
                    onPress={() => setSelectedTicketType(ticket.id)}
                  >
                    <Card.Content style={styles.ticketTypeContent}>
                      <View style={styles.ticketTypeInfo}>
                        <View style={styles.ticketTypeHeader}>
                          <Text style={styles.ticketTypeName}>{ticket.name}</Text>
                          <Text style={styles.ticketTypePrice}>{ticket.price}</Text>
                        </View>
                        <Text style={styles.ticketTypeDescription}>{ticket.description}</Text>
                        
                        <View style={styles.benefitsContainer}>
                          {ticket.benefits.map((benefit, index) => (
                            <View key={index} style={styles.benefitItem}>
                              <Icon name="check-circle" size={16} color="#0066CC" style={styles.benefitIcon} />
                              <Text style={styles.benefitText}>{benefit}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      
                      <RadioButton 
                        value={ticket.id} 
                        color="#0066CC"
                      />
                    </Card.Content>
                  </Card>
                ))}
              </RadioButton.Group>
              
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityTitle}>Quantity</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={[styles.quantityButton, quantity <= 1 && styles.disabledButton]} 
                    onPress={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Icon name="minus" size={20} color={quantity <= 1 ? "#CCCCCC" : "#333333"} />
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  
                  <TouchableOpacity 
                    style={[styles.quantityButton, quantity >= 8 && styles.disabledButton]} 
                    onPress={incrementQuantity}
                    disabled={quantity >= 8}
                  >
                    <Icon name="plus" size={20} color={quantity >= 8 ? "#CCCCCC" : "#333333"} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            /* Step 2: Choose Section */
            <View style={styles.stepContent}>
              <Text style={styles.sectionTitle}>Choose Section</Text>
              
              <View style={styles.sectionContainer}>
                <Image 
                  source={{ uri: 'https://via.placeholder.com/800x500/EEEEEE/999999?text=Arena+Seating+Chart' }} 
                  style={styles.seatingChart}
                  resizeMode="contain"
                />
                
                <Text style={styles.sectionSubtitle}>Available Sections</Text>
                
                <View style={[styles.sectionsGrid, responsiveStyles.sectionsGrid]}>
                  {seatingOptions[selectedTicketType as keyof typeof seatingOptions].map((section) => (
                    <TouchableOpacity
                      key={section}
                      style={[
                        styles.sectionButton,
                        selectedSection === section && styles.selectedSectionButton
                      ]}
                      onPress={() => setSelectedSection(section)}
                    >
                      <Text 
                        style={[
                          styles.sectionButtonText,
                          selectedSection === section && styles.selectedSectionButtonText
                        ]}
                      >
                        {section}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={styles.sectionNote}>
                  * Exact seat numbers will be assigned at checkout
                </Text>
              </View>
            </View>
          )}
          
          {/* Summary */}
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ticket Type</Text>
                <Text style={styles.summaryValue}>
                  {ticketTypes.find(ticket => ticket.id === selectedTicketType)?.name || 'Standard'}
                </Text>
              </View>
              
              {step === 2 && selectedSection && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Section</Text>
                  <Text style={styles.summaryValue}>{selectedSection}</Text>
                </View>
              )}
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Quantity</Text>
                <Text style={styles.summaryValue}>{quantity}</Text>
              </View>
              
              <Divider style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{getSubtotal()}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service Fees</Text>
                <Text style={styles.summaryValue}>{getFees()}</Text>
              </View>
              
              <Divider style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{getTotal()}</Text>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      </ScrollView>
      
      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <Button 
          mode="contained" 
          style={styles.continueButton}
          labelStyle={styles.continueButtonLabel}
          onPress={handleContinue}
          disabled={step === 1 ? !selectedTicketType : !selectedSection}
        >
          {step === 1 ? 'Continue' : 'Proceed to Payment'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    // SafeAreaView handles iOS safe areas automatically, but we add padding for Android in the component
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
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 100,
    width: '100%',
  },
  gameCard: {
    borderRadius: 16,
    elevation: 2,
    marginBottom: 24,
    alignSelf: 'center',
  },
  gameHeader: {
    marginBottom: 16,
  },
  gameDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  gameTime: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  gameVenue: {
    fontSize: 14,
    color: '#666666',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamContainer: {
    flex: 2,
    alignItems: 'center',
  },
  teamLogo: {
    width: 60,
    height: 60,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 4,
  },
  homeText: {
    fontSize: 12,
    color: '#0066CC',
    fontWeight: '500',
  },
  awayText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  vsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999999',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStepCircle: {
    backgroundColor: '#0066CC',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999999',
  },
  activeStepNumber: {
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
  activeStepText: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  stepLine: {
    height: 1,
    backgroundColor: '#DDDDDD',
    flex: 1,
    marginHorizontal: 8,
  },
  stepContent: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  ticketTypeCard: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 600,
  },
  selectedTicketTypeCard: {
    borderColor: '#0066CC',
    borderWidth: 2,
  },
  ticketTypeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketTypeInfo: {
    flex: 1,
  },
  ticketTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketTypeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  ticketTypePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  ticketTypeDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  benefitsContainer: {
    marginTop: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  benefitIcon: {
    marginRight: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#666666',
  },
  quantityContainer: {
    marginTop: 24,
  },
  quantityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#F5F5F5',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginHorizontal: 24,
  },
  sectionContainer: {
    alignItems: 'center',
  },
  seatingChart: {
    width: '100%',
    height: 200,
    marginBottom: 24,
    borderRadius: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  sectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  sectionButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    minWidth: '15%',
    maxWidth: 80,
  },
  selectedSectionButton: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  sectionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  selectedSectionButtonText: {
    color: '#FFFFFF',
  },
  sectionNote: {
    fontSize: 12,
    color: '#999999',
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  summaryCard: {
    borderRadius: 16,
    elevation: 2,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 600,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  summaryDivider: {
    backgroundColor: '#EEEEEE',
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 16, // Will be adjusted dynamically with insets
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  continueButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 2,
  }
});

export default TicketDetailScreen;
