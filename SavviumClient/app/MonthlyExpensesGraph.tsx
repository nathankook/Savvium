import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { LOCAL_HOST } from "../environment";

const screenWidth = Dimensions.get("window").width;

type ExpenseData = {
    date: string;
    amount: number;
    category_name: string;
};

export default function MonthlyExpensesGraph() {
    const [data, setData] = useState<ExpenseData[]>([]);

    useEffect(() => {
        const fetchMonthlyExpenses = async () => {
            try {
                const response = await fetch(`${LOCAL_HOST}/expenses/monthly`);
                const result: ExpenseData[] = await response.json();
                setData(result);
            } catch (error) {
                console.error("Error fetching monthly expenses:", error);
            }
        };

        fetchMonthlyExpenses();
    }, []);

    const chartData = {
        labels: data.map((item) => item.category_name), // Use category names as labels
        datasets: [{ data: data.map((item) => item.amount) }],
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.navBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.menuButton}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Monthly Expenses</Text>
                </View>
                <BarChart
                    data={{
                        labels: data.map((item) => item.date),
                        datasets: [{ data: data.map((item) => item.amount) }],
                    }}
                    width={screenWidth - 40}
                    height={220}
                    yAxisLabel="$"
                    yAxisSuffix=""
                    chartConfig={{
                        backgroundGradientFrom: "#1F2937",
                        backgroundGradientTo: "#1F2937",
                        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    }}
                    style={styles.chart}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#111827" },
    container: { flex: 1, padding: 20, backgroundColor: "#111827" },
    title: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 20 },
    chart: { marginVertical: 10 },
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
});
