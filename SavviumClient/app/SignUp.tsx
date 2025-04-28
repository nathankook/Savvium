import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { LOCAL_HOST } from '../environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignUpScreen() {
  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (isLoggedIn === 'true') {
        router.replace('/Dashboard');
      }
    };
    checkLoginStatus();
  }, []);

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Track which input is focused
  const [focusedInput, setFocusedInput] = useState(null);

  // Validation state variables
  // touchedFields: Tracks which fields the user has interacted with
  // Errors will only show up after a field is "touched"
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    phone: false
  });
  // Tracks validation errors for each field
  const [errors, setErrors] = useState({
    email: false,
    phone: false
  });

  // Validation functions
  const isValidEmail = (email: string): boolean => {
    // Regex pattern validates standard email format (something@something.com)
    const emailRegex =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    // Regex pattern validates standard phone number format (1234567890)
    const phoneRegex =  /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  };
  
  // Handles validation when input fields are changed
  // Update email state
  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Only update error state if field has already been touched
    if (touchedFields.email && text) {
      setErrors({
        ...errors,
        email: !isValidEmail(text)
      });
    } else if (touchedFields.email && !text) {
      // If the field is emptied, remove the error
      setErrors({
        ...errors,
        email: false
      });
    }
  };
  // Update phone state
  const handlePhoneChange = (text: string) => {
    setPhone(text);
    // Only update error state if field has already been touched
    if (touchedFields.phone && text) {
      setErrors({
        ...errors,
        phone: !isValidPhone(text)
      });
    } else if (touchedFields.phone && !text) {
      // If the field is emptied, remove the error
      setErrors({
        ...errors,
        phone: false
      });
    }
  };

  // Handles field blur event (when user moves focus away from field)
  const handleBlur = (field: 'email' | 'phone') => {
    setTouchedFields({
      ...touchedFields,
      [field]: true
    });
    
    // Only show errors after the field loses focus AND has content
    if (field === 'email' && email) {
      setErrors({
        ...errors,
        email: !isValidEmail(email)
      });
    } else if (field === 'phone' && phone) {
      setErrors({
        ...errors,
        phone: !isValidPhone(phone)
      });
    }
    
    setFocusedInput(null);
  };

  // Checks if all form fields are valid
  const isFormValid = () => {
    return isValidEmail(email) && isValidPhone(phone) && name && lastName && password;
  };

  // Handles sign up process with validation
  const handleSignUp = async () => {
    // Mark all fields as touched
    setTouchedFields({
      email: true,
      phone: true
    });
    
    // Update error states for all fields
    const emailError = !isValidEmail(email);
    const phoneError = !isValidPhone(phone);
    
    setErrors({
      email: emailError,
      phone: phoneError
    });
    
    // Prevents submission if form has any validation errors
    if (emailError || phoneError || !name || !lastName || !password) {
      alert('Please correct the errors before submitting');
      return;
    }
    
    // Submit form data to backend
    try {
      const response = await fetch(`${LOCAL_HOST}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          last_name: lastName,
          phone,
          email,
          password,
        }),
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

  // Input fields
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content"></StatusBar>
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>
        <View style={styles.formContainer}>
          <TextInput 
            placeholder="Name" 
            placeholderTextColor="#E6F0FF" 
            style={[
              styles.input, 
              focusedInput === 'name' && styles.inputFocused
            ]}
            onChangeText={setName}
            onFocus={() => setFocusedInput('name')}
            onBlur={() => setFocusedInput(null)} 
          />

          <TextInput 
            placeholder="Last Name" 
            placeholderTextColor="#E6F0FF" 
            style={[
              styles.input, 
              focusedInput === 'lastName' && styles.inputFocused
            ]} 
            onChangeText={setLastName}
            onFocus={() => setFocusedInput('lastName')}
            onBlur={() => setFocusedInput(null)}
          />

          <TextInput 
            placeholder="Phone Number" 
            placeholderTextColor="#E6F0FF" 
            style={[
              styles.input, 
              focusedInput === 'phone' && styles.inputFocused,
              (touchedFields.phone && errors.phone) && styles.inputError
            ]} 
            keyboardType="phone-pad" 
            onChangeText={handlePhoneChange} 
            onFocus={() => setFocusedInput('phone')}
            onBlur={() => {
              handleBlur('phone');
              setFocusedInput(null);
            }}
          />
          {(touchedFields.phone && errors.phone) && (
          <Text style={styles.errorText}>
            Please enter a valid phone number
          </Text>)}

          <TextInput 
            placeholder="Email" 
            placeholderTextColor="#E6F0FF" 
            style={[
              styles.input, 
              focusedInput === 'email' && styles.inputFocused,
              (touchedFields.email && errors.email) && styles.inputError
            ]} 
            keyboardType="email-address" 
            onChangeText={handleEmailChange}
            onFocus={() => setFocusedInput('email')}
            onBlur={() => {
              handleBlur('email');
              setFocusedInput(null);
            }}
          />
          {(touchedFields.email && errors.email) && (
            <Text style={styles.errorText}>Please enter a valid email address</Text>
          )}

          <TextInput 
            placeholder="Password" 
            placeholderTextColor="#E6F0FF" 
            style={[
              styles.input, 
              focusedInput === 'password' && styles.inputFocused
            ]} 
            secureTextEntry 
            onChangeText={setPassword}
            onFocus={() => setFocusedInput('password')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignUp}
          >
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>
          
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginLink} onPress={() => router.push('/Login')}>
              Log In
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
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 12,
    marginTop: -8,
    alignSelf: 'flex-start',
    paddingLeft: 5,
  },
  buttonContainer: {
    width: width > 600 ? '70%' : '100%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  signupButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    width: '100%',
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginText: {
    color: '#E6F0FF',
    marginTop: 20,
    fontSize: 16,
  },
  loginLink: {
    color: '#4F46E5',
    fontWeight: 'bold',
  },
});
