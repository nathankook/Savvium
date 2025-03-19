import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import CustomButton from './components/CustomButton';

type RootStackParamList = {
  Home: undefined;
  SignUp: undefined;
  Login: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/SavviumLogo.png')} style={styles.logo} />
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Login"
          onPress={() => navigation.navigate('Login')}
          style={styles.button} // Add this style
        />
        <CustomButton
          title="Sign Up"
          onPress={() => navigation.navigate('SignUp')}
          style={styles.button} // Add this style
        />
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
