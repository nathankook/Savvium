import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useState } from 'react';
import CustomButton from './components/CustomButton';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      const response = await fetch('http://192.168.1.153:5000/signup', {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput placeholder="Name" placeholderTextColor="#9E9E9E" style={styles.input} onChangeText={setName} />
      <TextInput placeholder="Last Name" placeholderTextColor="#9E9E9E" style={styles.input} onChangeText={setLastName} />
      <TextInput placeholder="Phone Number" placeholderTextColor="#9E9E9E" style={styles.input} keyboardType="phone-pad" onChangeText={setPhone} />
      <TextInput placeholder="Email" placeholderTextColor="#9E9E9E" style={styles.input} keyboardType="email-address" onChangeText={setEmail} />
      <TextInput placeholder="Password" placeholderTextColor="#9E9E9E" style={styles.input} secureTextEntry onChangeText={setPassword} />
      <CustomButton title="Sign Up" onPress={handleSignUp} />
    </View>
  );
}

const styles = StyleSheet.create({
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
});
