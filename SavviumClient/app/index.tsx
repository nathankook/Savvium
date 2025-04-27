import { View, Text, StyleSheet, Image, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from './components/CustomButton';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#0A2463', '#3E92CC']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../assets/images/SavviumLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.welcomeText}>Welcome to Savvium</Text>
          <Text style={styles.tagline}>Your journey to financial freedom starts here</Text>
          
          <View style={styles.featuresContainer}>
            <FeatureItem 
              icon="wallet-outline" 
              title="Budget Tracking" 
              description="Easily track your expenses and income"
            />
            <FeatureItem 
              icon="trending-up-outline" 
              title="Financial Growth" 
              description="Watch your finances grow over time"
            />
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Log In"
            onPress={() => router.push('/Login')}
            style={styles.loginButton}
            textStyle={styles.loginButtonText}
          />
          
          <CustomButton
            title="Create Account"
            onPress={() => router.push('/SignUp')}
            style={styles.signupButton}
            textStyle={styles.signupButtonText}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// Feature item component
const FeatureItem = ({ icon, title, description }) => {
  return (
    <View style={styles.featureItem}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color="#0A2463" />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: '#E6F0FF',
    marginBottom: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 16,
    flexWrap: 'wrap',
  },
  featureItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: width > 600 ? '30%' : '100%',
    marginBottom: width > 600 ? 0 : 16,
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    backgroundColor: '#E6F0FF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A2463',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 12,
    width: '80%',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    width: '80%',
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});