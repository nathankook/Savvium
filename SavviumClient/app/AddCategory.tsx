import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LOCAL_HOST } from '../environment';

const presetColors = ['#7C3AED', '#0EA5E9', '#F59E0B', '#EF4444', '#10B981'];

export default function AddCategoryScreen() {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedColor, setSelectedColor] = useState(presetColors[0]);

  const handleSave = async () => {
    if (!name || !budget) {
      Alert.alert('Please fill in all fields.');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('User not logged in.');
        return;
      }

      const response = await fetch(`${LOCAL_HOST}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          name,
          budget: parseFloat(budget),
          color: selectedColor,
        })
      });

      const data = await response.json();

      if (response.ok) {
        router.replace('/Dashboard');
      } else {
        Alert.alert(data.message || 'Failed to create category');
      }
    } catch (err) {
      Alert.alert('Something went wrong.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Nav */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.menuButton}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Category</Text>
        </View>

        {/* Category Name Input */}
        <TextInput
          style={styles.input}
          placeholder="Category Name"
          placeholderTextColor="#9E9E9E"
          onChangeText={setName}
          value={name}
        />

        {/* Budget Input */}
        <TextInput
          style={styles.input}
          placeholder="Monthly Budget"
          placeholderTextColor="#9E9E9E"
          keyboardType="numeric"
          onChangeText={setBudget}
          value={budget}
        />

        {/* Color Picker */}
        <Text style={styles.label}>Choose a Color</Text>
        <View style={styles.colorPicker}>
          {presetColors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorCircle,
                { backgroundColor: color },
                selectedColor === color && styles.selectedCircle
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111827",
  },
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    backgroundColor: '#111827',
  },
  menuButton: {
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#1F2937',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    marginTop: 20,
  },
  label: {
    color: '#E5E7EB',
    marginBottom: 8,
    marginTop: 10,
  },
  colorPicker: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCircle: {
    borderColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
