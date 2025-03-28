import { View, Text, StyleSheet, Button, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

type Transaction = {
  transaction_id: string;
  name: string;
  amount: number;
};

export default function DashboardScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {name}!</Text>

      <Button title="Connect to Bank" onPress={() => console.log("Button pressed")} />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.transaction_id}
        renderItem={({ item }) => (
          <View style={styles.transaction}>
            <Text style={styles.transactionName}>{item.name}</Text>
            <Text style={styles.transactionAmount}>
              ${item.amount.toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noTransactions}>No transactions loaded.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  transaction: {
    paddingVertical: 12,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  transactionName: {
    fontSize: 16,
  },
  transactionAmount: {
    fontSize: 16,
    color: "green",
  },
  noTransactions: {
    marginTop: 20,
    textAlign: "center",
    color: "#888",
  },
});
