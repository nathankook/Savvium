import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LOCAL_HOST } from '../environment';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (isLoggedIn === 'true') {
        router.replace('/Dashboard');
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch(`${LOCAL_HOST}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Save login state and userId into AsyncStorage
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('userId', data.user.id.toString());

        // Redirect to Dashboard, passing name (optional)
        router.replace({
          pathname: '/Dashboard',
          params: { name: data.user.name }
        });
      } else {
        Alert.alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Something went wrong.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <View style={styles.formContainer}>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'email' && styles.inputFocused
            ]}
            placeholder="Email"
            placeholderTextColor="#E6F0FF"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
          />

          <TextInput
            style={[
              styles.input,
              focusedInput === 'password' && styles.inputFocused
            ]}
            placeholder="Password"
            placeholderTextColor="#E6F0FF"
            onChangeText={setPassword}
            value={password}
            secureTextEntry
            onFocus={() => setFocusedInput('password')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          
          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupLink} onPress={() => router.push('/SignUp')}>
              Sign Up
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
  title: {
    fontSize: width > 600 ? 36 : 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  formContainer: {
    width: width > 600 ? '70%' : '100%',
    marginBottom: 24,
    alignSelf: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#1F2937',
    color: '#FFFFFF',
    fontSize: 16,
  },
  inputFocused: {
    borderColor: '#4F46E5',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  buttonContainer: {
    width: width > 600 ? '70%' : '100%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    width: '100%',
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signupText: {
    color: '#E6F0FF',
    marginTop: 20,
    fontSize: 16,
  },
  signupLink: {
    color: '#4F46E5',
    fontWeight: 'bold',
  },
});
