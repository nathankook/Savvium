import { View, Text, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { useState } from 'react';
import CustomButton from './components/CustomButton';
import { LOCAL_HOST } from '../environment';

export default function SignUpScreen() {
  // State variables to store user info
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    if (touchedFields.email) {
      setErrors({
        ...errors,
        email: !isValidEmail(text)
      });
    }
  };
  // Update phone state
  const handlePhoneChange = (text: string) => {
    setPhone(text);
    // Only update error state if field has already been touched
    if (touchedFields.phone) {
      setErrors({
        ...errors,
        phone: !isValidPhone(text)
      });
    }
  };

  // Handles field blur event (when user moves focus away from field)
  const handleBlur = (field: 'email' | 'phone') => {
    setTouchedFields({
      ...touchedFields,
      [field]: true
    });
  };

  // Checks if all form fields are valid
  const isFormValid = () => {
    return isValidEmail(email) && isValidPhone(phone) && name && lastName && password;
  };

  // Handles sign up process with validation
  const handleSignUp = async () => {

    setTouchedFields({
      email: true,
      phone: true
    });
    
    // Prevents submission if form has any validation errors
    if (!isFormValid()) {
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
      alert(data.message || 'Signed up successfully');
    } catch (error) {
      alert('Something went wrong');
    }
  };

  // Input fields
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput placeholder="Name" placeholderTextColor="#9E9E9E" style={styles.input} onChangeText={setName} />
        <TextInput placeholder="Last Name" placeholderTextColor="#9E9E9E" style={styles.input} onChangeText={setLastName} />
        <TextInput placeholder="Phone Number" placeholderTextColor="#9E9E9E" style={[styles.input, (touchedFields.phone && errors.phone) && styles.inputError]} keyboardType="phone-pad" onChangeText={handlePhoneChange} onBlur={() => handleBlur('phone')}/>
          {(touchedFields.phone && errors.phone) && (<Text style={styles.errorText}>Please enter a valid phone number</Text>)}
        <TextInput placeholder="Email" placeholderTextColor="#9E9E9E" style={[styles.input, (touchedFields.email && errors.email) && styles.inputError]} keyboardType="email-address" onChangeText={handleEmailChange} onBlur={() => handleBlur('email')}/>
          {(touchedFields.email && errors.email) && (<Text style={styles.errorText}>Please enter a valid email address</Text>)}
        <TextInput placeholder="Password" placeholderTextColor="#9E9E9E" style={styles.input} secureTextEntry onChangeText={setPassword} />
        <CustomButton title="Sign Up" onPress={() => {
          setTouchedFields({
            email: true,
            phone: true
          });
          handleSignUp();
        }}/>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
    paddingLeft: 5,
  },
});
