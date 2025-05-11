import React, { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOCAL_HOST } from "../environment";
import type { Category } from "./Dashboard";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from '@expo/vector-icons';

export default function AddExpenseScreen() {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    const fetchCategories = async (id: string) => {
        try {
            const response = await fetch(`${LOCAL_HOST}/users/${id}/categories`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const initializeData = async () => {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
            setUserId(storedUserId);
            await fetchCategories(storedUserId);
        }
    };

    useFocusEffect(
        useCallback(() => {
            initializeData();
        }, [])
    );


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
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.navBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.menuButton}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Add Expense</Text>
                </View>
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
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#111827" },
    container: { flex: 1, padding: 20, backgroundColor: "#111827" },
    title: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 20 },
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
