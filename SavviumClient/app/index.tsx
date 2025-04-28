import { View, Text, StyleSheet, Image, SafeAreaView, StatusBar, Dimensions, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from './components/CustomButton';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (isLoggedIn === 'true') {
        router.replace('/Dashboard');
      }
    };
    checkLoginStatus();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../assets/images/SavviumLogo.png')}
            style={[styles.logo, { tintColor: '#FFFFFF' }]}
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
          <TouchableOpacity
            onPress={() => router.push('/Login')}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
            
          <TouchableOpacity
            onPress={() => router.push('/SignUp')}
            style={styles.signupButton}
          >
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>
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
        <Ionicons name={icon} size={24} color="#4F46E5" />
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
    backgroundColor: '#111827',
  },
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    justifyContent: 'center',
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
    fontSize: width > 600 ? 36 : 32,
    fontWeight: 'bold',
    color: '#E6F0FF',
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    fontSize: width > 600 ? 20 : 18,
    color: '#E6F0FF',
    marginBottom: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  featuresContainer: {
    flexDirection: width > 600 ? 'row' : 'column',
    justifyContent: width > 600 ? 'space-between' : 'center',
    width: '100%',
    marginVertical: 16,
  },
  featureItem: {
    backgroundColor: '#2c3441',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: width > 600 ? '48%' : '100%',
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: '#374151',
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
    color: '#E6F0FF',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#E6F0FF',
    opacity: 0.6,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 40,
    alignItems: 'center',
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    width: width > 600 ? '70%' : '100%',
    height: 54,
    marginBottom: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    width: width > 600 ? '70%' : '100%',
    height: 54,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});