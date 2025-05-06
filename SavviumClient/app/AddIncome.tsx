import React, { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useFocusEffect, router } from "expo-router";
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
    <View style={styles.container}>
      <Text style={styles.title}>Add Income</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#111827" },
  title: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 20 },
  input: {
    backgroundColor: "#1F2937",
    color: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
