import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import CustomButton from './components/CustomButton';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/SavviumLogo.png')} style={styles.logo} />
      <View style={styles.buttonContainer}>
        <CustomButton title="Login" onPress={() => router.push('/Login')} style={styles.button} />
        <CustomButton title="Sign Up" onPress={() => router.push('/SignUp')} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logo: {
    width: 350,
    height: 350,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    marginBottom: 20,
  },
});
