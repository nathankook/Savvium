import React, { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOCAL_HOST } from "../environment";

export default function AddIncomeScreen() {
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const init = async () => {
    const id = await AsyncStorage.getItem("userId");
    setUserId(id);
  };

  useFocusEffect(useCallback(() => {
    init();
  }, []));

  const handleAddIncome = async () => {
    if (!source || !amount) {
      Alert.alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(`${LOCAL_HOST}/incomes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: parseInt(userId!),
            name: source,
            amount: parseFloat(amount),
          }),
          
      });

      if (response.ok) {
        router.back();
      } else {
        Alert.alert("Failed to add income.");
      }
    } catch (error) {
      Alert.alert("Error adding income.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.menuButton}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Income</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Source (e.g. Salary)"
          placeholderTextColor="#9CA3AF"
          value={source}
          onChangeText={setSource}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddIncome}>
          <Text style={styles.buttonText}>Save Income</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#111827" },
  container: { flex: 1, padding: 20, backgroundColor: "#111827" },
  title: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 20 },
  input: {
    backgroundColor: "#1F2937",
    color: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
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
  button: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
