import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Dimensions,
  SafeAreaView
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ProgressChart } from "react-native-chart-kit";
import { Calendar } from "react-native-calendars";
import { BlurView } from "expo-blur";
import { LOCAL_HOST } from "../environment";

const screenWidth = Dimensions.get("window").width;

export default function CategoryDetailsScreen() {
  const { id, name, budget } = useLocalSearchParams<{
    id: string;
    name: string;
    budget: string;
  }>();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [editBudgetVisible, setEditBudgetVisible] = useState(false);
  const [newBudget, setNewBudget] = useState("");
  const [currentBudget, setCurrentBudget] = useState(parseFloat(budget));
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${LOCAL_HOST}/categories/${id}/expenses`);
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  const openCalendar = () => {
    setCalendarVisible(true);
  };

  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setCalendarVisible(false);
  };

  const addExpense = async () => {
    if (!expenseName || !expenseAmount || !selectedDate) {
      Alert.alert("Please fill out all fields.");
      return;
    }
    try {
      const response = await fetch(`${LOCAL_HOST}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: Number(id),
          name: expenseName,
          amount: parseFloat(expenseAmount),
          date: selectedDate,
        }),
      });
      if (response.ok) {
        setExpenseName("");
        setExpenseAmount("");
        setSelectedDate(null);
        fetchExpenses();
      } else {
        Alert.alert("Failed to add expense.");
      }
    } catch (err) {
      Alert.alert("Error adding expense.");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const response = await fetch(`${LOCAL_HOST}/categories/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.replace("/Dashboard");
      } else {
        Alert.alert("Failed to delete category.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error deleting category.");
    }
  };

  const handleEditBudget = async () => {
    if (!newBudget) {
      Alert.alert("Please enter a new budget.");
      return;
    }
    try {
      const response = await fetch(`${LOCAL_HOST}/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: parseFloat(newBudget) }),
      });
      if (response.ok) {
        setEditBudgetVisible(false);
        setCurrentBudget(parseFloat(newBudget));
        setNewBudget("");
        await fetchExpenses();
      } else {
        Alert.alert("Failed to update budget.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error updating budget.");
    }
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const progress = currentBudget > 0 ? Math.min(totalSpent / currentBudget, 1) : 0;
  const isOverBudget = totalSpent > currentBudget;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.menuButton}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)} style={styles.nameDropdown}>
            <Ionicons name="chevron-down-outline" size={20} color="white" />
            <Text style={styles.categoryName}>{name}</Text>
          </TouchableOpacity>
        </View>

        {dropdownVisible && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity onPress={() => { setDropdownVisible(false); setEditBudgetVisible(true); }}>
              <Text style={styles.dropdownItem}>Edit Budget</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setDropdownVisible(false); setConfirmDeleteVisible(true); }}>
              <Text style={styles.dropdownItem}>Delete Category</Text>
            </TouchableOpacity>
          </View>
        )}

        {calendarVisible && (
          <Calendar
            onDayPress={onDayPress}
            markedDates={{ [selectedDate ?? ""]: { selected: true, selectedColor: "#4F46E5" } }}
          />
        )}

        {selectedDate && (
          <>
            <Text style={{ color: "#fff", textAlign: "center", marginTop: 10 }}>Selected Date: {selectedDate}</Text>
            <TextInput
              style={styles.input}
              placeholder="Expense Name"
              placeholderTextColor="#9E9E9E"
              value={expenseName}
              onChangeText={setExpenseName}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor="#9E9E9E"
              keyboardType="numeric"
              value={expenseAmount}
              onChangeText={setExpenseAmount}
            />
            <TouchableOpacity style={styles.saveButton} onPress={addExpense}>
              <Text style={styles.saveText}>Save Expense</Text>
            </TouchableOpacity>
          </>
        )}

  {!calendarVisible && !selectedDate && (
    <TouchableOpacity style={styles.addExpenseButton} onPress={openCalendar}>
      <Text style={styles.addExpenseText}>Add Expense</Text>
    </TouchableOpacity>
  )}


        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <View style={{ width: 220, height: 220, justifyContent: "center", alignItems: "center" }}>
            <ProgressChart
              data={{ labels: [], data: [progress] }}
              width={220}
              height={220}
              strokeWidth={16}
              radius={80}
              chartConfig={{
                backgroundGradientFrom: "#111827",
                backgroundGradientTo: "#111827",
                color: (opacity = 1) => isOverBudget ? `rgba(239,68,68,${opacity})` : `rgba(16,185,129,${opacity})`,
                labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
              }}
              hideLegend
            />
            <View style={{ position: "absolute", justifyContent: "center", alignItems: "center", top: 0, bottom: 0, left: 0, right: 0 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>${totalSpent.toFixed(2)}</Text>
              <Text style={{ fontSize: 16, color: "white" }}>of</Text>
              <Text style={{ fontSize: 18, color: "white" }}>${currentBudget.toFixed(2)}</Text>
            </View>
          </View>
          {isOverBudget && (
            <Text style={{ fontSize: 16, color: "red", marginTop: 10 }}>
              You are ${Math.abs(totalSpent - currentBudget).toFixed(2)} over budget.
            </Text>
          )}
        </View>

        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 20 }}
          renderItem={({ item }) => (
            <View style={styles.expenseItem}>
              <Text style={styles.expenseName}>{item.name}</Text>
              <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
            </View>
          )}
        />

        {(confirmDeleteVisible || editBudgetVisible) && (
          <View style={StyleSheet.absoluteFillObject}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
              <View style={styles.modalOverlay}>
                <View style={styles.modal}>
                  {confirmDeleteVisible && (
                    <>
                      <Text style={styles.modalText}>Are you sure you want to delete this category?</Text>
                      <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.modalButton} onPress={handleDeleteCategory}>
                          <Text style={styles.modalButtonText}>Yes, Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setConfirmDeleteVisible(false)}>
                          <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                  {editBudgetVisible && (
                    <>
                      <Text style={styles.modalText}>Enter a new budget:</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="New Budget"
                        placeholderTextColor="#9E9E9E"
                        keyboardType="numeric"
                        value={newBudget}
                        onChangeText={setNewBudget}
                      />
                      <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.modalButton} onPress={handleEditBudget}>
                          <Text style={styles.modalButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setEditBudgetVisible(false)}>
                          <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </BlurView>
          </View>
        )}
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
    backgroundColor: "#111827",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    backgroundColor: "#111827",
  },
  menuButton: { padding: 8 },
  nameDropdown: { flexDirection: "row", alignItems: "center" },
  categoryName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 6,
  },
  dropdownMenu: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "#1F2937",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    minWidth: 180,
    zIndex: 10,
  },
  dropdownItem: { color: "#fff", paddingVertical: 10, fontSize: 18 },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomColor: "#374151",
    borderBottomWidth: 1,
  },
  expenseName: { color: "#fff", fontSize: 16 },
  expenseAmount: { color: "#10B981", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#1F2937",
    padding: 25,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 15,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  modalButton: {
    backgroundColor: "#4F46E5",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    flex: 1,
  },
  modalButtonCancel: {
    backgroundColor: "#6B7280",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    flex: 1,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1F2937",
    color: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: "100%",
  },
  addExpenseButton: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  addExpenseText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
