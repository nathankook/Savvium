import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from './components/CustomButton';
import { LOCAL_HOST } from '../environment';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const checkIfLoggedIn = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        if (isLoggedIn === 'true') {
          console.log('Already logged in, redirecting...');
          router.replace('/Dashboard');
        }
      } catch (error) {
        console.error('Error checking login state', error);
      }
    };

    checkIfLoggedIn();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${LOCAL_HOST}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        console.log('Navigating to /dashboard with name:', data.name);
        
        // Save login state
        await AsyncStorage.setItem('isLoggedIn', 'true');

        router.replace({ pathname: '/Dashboard', params: { name: data.name } });
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login fetch error:', error);
      alert('Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#9E9E9E"
        style={styles.input}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#9E9E9E"
        style={styles.input}
        secureTextEntry
        onChangeText={setPassword}
      />
      <CustomButton title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#111827',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  input: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#1F2937',
    color: '#fff',
  },
});
