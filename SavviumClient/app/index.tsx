import { View, Text, StyleSheet, Image, SafeAreaView} from 'react-native';
import { router } from 'expo-router';
import CustomButton from './components/CustomButton';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Image 
            source={require('../assets/images/SavviumLogo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          
          <Text style={styles.welcomeText}>Welcome to Savvium</Text>
          <Text style={styles.tagline}>Your journey to financial freedom starts here</Text>
          
          <View style={styles.buttonContainer}>
            <CustomButton 
              title="Log In" 
              onPress={() => router.push('/Login')} 
              style={styles.loginButton} 
            />
            <CustomButton 
              title="Sign Up" 
              onPress={() => router.push('/SignUp')} 
              style={styles.signupButton} 
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 48,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
  },
  loginButton: {
    marginBottom: 16,
    backgroundColor: '#007BFF',
  },
  signupButton: {
    backgroundColor: '#6c757d',
  },
});