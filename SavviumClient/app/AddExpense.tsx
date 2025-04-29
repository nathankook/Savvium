import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { LOCAL_HOST } from "../environment";
import type { Category } from "./Dashboard";
import { Picker } from "@react-native-picker/picker";

export default function AddExpenseScreen() {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${LOCAL_HOST}/categories`);
                if (!response.ok) {
                    console.error(`HTTP error! status: ${response.status}`);
                    return;
                }
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await response.json();
                    setCategories(data);
                } else {
                    console.error("Response is not JSON");
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    const handleAddExpense = async () => {
        if (!selectedCategory) {
            alert("Please select a category.");
            return;
        }
        try {
            const response = await fetch(`${LOCAL_HOST}/expenses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    amount: parseFloat(amount),
                    category_id: selectedCategory,
                }),
            });
            if (response.ok) {
                router.back();
            } else {
                console.error("Failed to add expense");
            }
        } catch (error) {
            console.error("Error adding expense:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Expense</Text>
            <TextInput
                style={styles.input}
                placeholder="Expense Name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Amount"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
            />
            <Picker
                selectedValue={selectedCategory}
                onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                style={styles.input}
            >
                <Picker.Item label="Select a Category" value={null} />
                {categories.map((category) => (
                    <Picker.Item
                        key={category.id}
                        label={category.name || "Unnamed Category"}
                        value={category.id}
                    />
                ))}
            </Picker>
            <TouchableOpacity style={styles.button} onPress={handleAddExpense}>
                <Text style={styles.buttonText}>Add Expense</Text>
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
