import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { LOCAL_HOST } from '../environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignUpScreen() {
  const [checkingLogin, setCheckingLogin] = useState(true);

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState({ email: false, phone: false });
  const [errors, setErrors] = useState({ email: false, phone: false });

  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (isLoggedIn === 'true') {
        router.replace('/Dashboard');
      } else {
        setCheckingLogin(false);
      }
    };
    checkLoginStatus();
  }, []);

  if (checkingLogin) {
    return null;
  }

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (touchedFields.email) {
      setErrors(prev => ({ ...prev, email: !isValidEmail(text) }));
    }
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    if (touchedFields.phone) {
      setErrors(prev => ({ ...prev, phone: !isValidPhone(text) }));
    }
  };

  const handleBlur = (field: 'email' | 'phone') => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    if (field === 'email') setErrors(prev => ({ ...prev, email: !isValidEmail(email) }));
    if (field === 'phone') setErrors(prev => ({ ...prev, phone: !isValidPhone(phone) }));
    setFocusedInput(null);
  };

  const isFormValid = () => isValidEmail(email) && isValidPhone(phone) && name && lastName && password;

  const handleSignUp = async () => {
    setTouchedFields({ email: true, phone: true });
    const emailError = !isValidEmail(email);
    const phoneError = !isValidPhone(phone);
    setErrors({ email: emailError, phone: phoneError });

    if (emailError || phoneError || !name || !lastName || !password) {
      alert('Please correct the errors before submitting');
      return;
    }

    try {
      const response = await fetch(`${LOCAL_HOST}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, last_name: lastName, phone, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message || 'Signed up successfully');
        router.push('/Login');
      } else {
        alert(data.message || 'Failed to sign up');
      }
    } catch (error) {
      alert('Something went wrong');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>
        <View style={styles.formContainer}>
          <TextInput placeholder="Name" placeholderTextColor="#E6F0FF" style={[styles.input, focusedInput === 'name' && styles.inputFocused]} onChangeText={setName} onFocus={() => setFocusedInput('name')} onBlur={() => setFocusedInput(null)} />
          <TextInput placeholder="Last Name" placeholderTextColor="#E6F0FF" style={[styles.input, focusedInput === 'lastName' && styles.inputFocused]} onChangeText={setLastName} onFocus={() => setFocusedInput('lastName')} onBlur={() => setFocusedInput(null)} />
          <TextInput placeholder="Phone Number" placeholderTextColor="#E6F0FF" style={[styles.input, focusedInput === 'phone' && styles.inputFocused, touchedFields.phone && errors.phone && styles.inputError]} keyboardType="phone-pad" onChangeText={handlePhoneChange} onFocus={() => setFocusedInput('phone')} onBlur={() => handleBlur('phone')} />
          {touchedFields.phone && errors.phone && (<Text style={styles.errorText}>Please enter a valid phone number</Text>)}
          <TextInput placeholder="Email" placeholderTextColor="#E6F0FF" style={[styles.input, focusedInput === 'email' && styles.inputFocused, touchedFields.email && errors.email && styles.inputError]} keyboardType="email-address" onChangeText={handleEmailChange} onFocus={() => setFocusedInput('email')} onBlur={() => handleBlur('email')} />
          {touchedFields.email && errors.email && (<Text style={styles.errorText}>Please enter a valid email address</Text>)}
          <TextInput placeholder="Password" placeholderTextColor="#E6F0FF" style={[styles.input, focusedInput === 'password' && styles.inputFocused]} secureTextEntry onChangeText={setPassword} onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)} />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginLink} onPress={() => router.push('/Login')}>Log In</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#111827' },
  container: { flex: 1, backgroundColor: '#111827', paddingHorizontal: 20, justifyContent: 'center' },
  title: { fontSize: width > 600 ? 36 : 32, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12, textAlign: 'center' },
  formContainer: { width: width > 600 ? '70%' : '100%', marginBottom: 24, alignSelf: 'center' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', marginBottom: 12, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#1F2937', color: '#FFFFFF', fontSize: 16 },
  inputFocused: { borderColor: '#4F46E5', borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.15)' },
  inputError: { borderColor: '#FF6B6B', borderWidth: 2 },
  errorText: { color: '#FF6B6B', fontSize: 14, marginBottom: 12, marginTop: -8, alignSelf: 'flex-start', paddingLeft: 5 },
  buttonContainer: { width: width > 600 ? '70%' : '100%', alignItems: 'center', alignSelf: 'center' },
  signupButton: { backgroundColor: '#4F46E5', borderRadius: 10, width: '100%', height: 54, justifyContent: 'center', alignItems: 'center' },
  signupButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  loginText: { color: '#E6F0FF', marginTop: 20, fontSize: 16 },
  loginLink: { color: '#4F46E5', fontWeight: 'bold' },
});
