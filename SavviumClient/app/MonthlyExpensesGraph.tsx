import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
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
        <View style={styles.container}>
            <Text style={styles.title}>Monthly Expenses</Text>
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
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#111827" },
    title: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 20 },
    chart: { marginVertical: 10 },
});
