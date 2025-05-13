import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  SafeAreaView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOCAL_HOST } from "../environment";
import { Ionicons } from "@expo/vector-icons";

export default function AddRecurringExpenseScreen() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [recurringExpenses, setRecurringExpenses] = useState<any[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  const [dropdownVisibleId, setDropdownVisibleId] = useState<number | null>(
    null
  );
  const [editDateVisible, setEditDateVisible] = useState(false);
  const [editAmountVisible, setEditAmountVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [selectedBill, setSelectedBill] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const getUserId = async () => {
        const id = await AsyncStorage.getItem("userId");
        if (id) setUserId(parseInt(id));
      };
      getUserId();
    }, [])
  );

  const handleAddExpense = async () => {
    if (!name || !amount || !selectedDate || !userId) {
      Alert.alert("Please fill in all fields and select a due date.");
      return;
    }

    try {
      const response = await fetch(`${LOCAL_HOST}/recurring-expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name,
          amount: parseFloat(amount),
          category_id: 1,
          due_day: parseInt(selectedDate.split("-")[2]),
        }),
      });

      if (response.ok) {
        setName("");
        setAmount("");
        setSelectedDate("");
        setCalendarVisible(false);
        fetchRecurringExpenses();
      } else {
        Alert.alert("Failed to add recurring expense.");
      }
    } catch (error) {
      console.error("Error adding recurring expense:", error);
      Alert.alert("Server error.");
    }
  };

  const fetchRecurringExpenses = async () => {
  if (!userId) return;

  try {
    const response = await fetch(`${LOCAL_HOST}/recurring-expenses?user_id=${userId}`);
    const data = await response.json();
    setRecurringExpenses(data);
  } catch (error) {
    console.error("Error fetching recurring expenses:", error);
  }
};


  useEffect(() => {
    fetchRecurringExpenses();
  }, []);

  const getUpcomingDueDate = (dueDay: number): string => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const dueDateThisMonth = new Date(currentYear, currentMonth, dueDay);
    const nextDue =
      today > dueDateThisMonth
        ? new Date(currentYear, currentMonth + 1, dueDay)
        : dueDateThisMonth;
    return nextDue.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  };

  const formatDateDisplay = (isoDate: string) => {
    const [year, month, day] = isoDate.split("-").map(Number);
    return `${new Date(Date.UTC(year, month - 1, day)).toLocaleString("en-US", {
      month: "long",
    })} ${day}`;
  };

  const handleSaveDate = async () => {
    const due_day = parseInt(newDate.split("-")[2]);
    await fetch(`${LOCAL_HOST}/recurring-expenses/${selectedBill.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ due_day }),
    });
    setEditDateVisible(false);
    fetchRecurringExpenses();
  };

  const handleSaveAmount = async () => {
    await fetch(`${LOCAL_HOST}/recurring-expenses/${selectedBill.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(newAmount) }),
    });
    setEditAmountVisible(false);
    fetchRecurringExpenses();
  };

  const handleDelete = async () => {
    await fetch(`${LOCAL_HOST}/recurring-expenses/${selectedBill.id}`, {
      method: "DELETE",
    });
    setConfirmDeleteVisible(false);
    fetchRecurringExpenses();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.menuButton}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Recurring Expense</Text>
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

        <TouchableOpacity
          onPress={() => setCalendarVisible(!calendarVisible)}
          style={styles.datePickerInput}
        >
          <Text style={{ color: selectedDate ? "white" : "#9CA3AF" }}>
            {selectedDate ? formatDateDisplay(selectedDate) : "Select Due Date"}
          </Text>
        </TouchableOpacity>

        {calendarVisible && (
          <Calendar
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setCalendarVisible(false);
            }}
            markedDates={
              selectedDate
                ? { [selectedDate]: { selected: true, selectedColor: "#4F46E5" } }
                : {}
            }
            theme={{
              calendarBackground: "#1F2937",
              dayTextColor: "#FFF",
              monthTextColor: "#FFF",
              arrowColor: "#FFF",
            }}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleAddExpense}>
          <Text style={styles.buttonText}>Save Recurring Expense</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { marginTop: 20 }]}>Recurring Bills</Text>
        <FlatList
          data={recurringExpenses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.recurringItem}>
              <TouchableOpacity
                onPress={() =>
                  setDropdownVisibleId(
                    dropdownVisibleId === item.id ? null : item.id
                  )
                }
              >
                <View style={styles.billHeader}>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Ionicons name="chevron-down-outline" size={16} color="white" style={{ marginRight: 6 }} />
      <Text style={styles.billNameText}>{item.name}</Text>
    </View>
  </View>

                <Text style={styles.recurringText}>
                  ${item.amount.toFixed(2)}
                </Text>
                <Text style={styles.recurringText}>
                  Due: {getUpcomingDueDate(item.due_day)}
                </Text>
              </TouchableOpacity>
              {dropdownVisibleId === item.id && (
                <View style={{ marginTop: 10 }}>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => {
                      setSelectedBill(item);
                      setEditDateVisible(true);
                    }}
                  >
                    <Text style={styles.dropdownButtonText}>Edit Date</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => {
                      setSelectedBill(item);
                      setNewAmount(item.amount.toString());
                      setEditAmountVisible(true);
                    }}
                  >
                    <Text style={styles.dropdownButtonText}>Edit Amount</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => {
                      setSelectedBill(item);
                      setConfirmDeleteVisible(true);
                    }}
                  >
                    <Text style={[styles.dropdownButtonText, { color: "red" }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />

        {/* Edit Date Modal */}
        <Modal visible={editDateVisible} transparent animationType="none">
          <View style={styles.modalBackground}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Edit Due Date</Text>
              <Calendar
                onDayPress={(day) => setNewDate(day.dateString)}
                markedDates={{
                  [newDate]: { selected: true, selectedColor: "#4F46E5" },
                }}
                theme={{ calendarBackground: "#1F2937", dayTextColor: "#FFF" }}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveDate}>
                  <Text style={styles.modalBtnText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setEditDateVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Amount Modal */}
        <Modal visible={editAmountVisible} transparent animationType="none">
          <View style={styles.modalBackground}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Edit Amount</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={newAmount}
                onChangeText={setNewAmount}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveAmount}
                >
                  <Text style={styles.modalBtnText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setEditAmountVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Confirm Delete Modal */}
        <Modal visible={confirmDeleteVisible} transparent animationType="none">
          <View style={styles.modalBackground}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>
                Are you sure you want to delete this bill?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleDelete}>
                  <Text style={styles.modalBtnText}>Continue</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setConfirmDeleteVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#111827" },
  container: { flex: 1, padding: 20, backgroundColor: "#111827" },
  dropdownButton: {
    backgroundColor: "#374151",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  dropdownButtonText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
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
  title: { fontSize: 20, fontWeight: "bold", color: "white", marginBottom: 10 },
  input: {
    backgroundColor: "#1F2937",
    color: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  datePickerInput: {
    backgroundColor: "#1F2937",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  recurringItem: {
    padding: 12,
    backgroundColor: "#1F2937",
    borderRadius: 8,
    marginBottom: 10,
  },
  recurringText: { color: "white", fontSize: 14 },
  billHeader: {
    borderBottomColor: "#374151",
    borderBottomWidth: 1,
    paddingBottom: 4,
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  billNameText: { color: "white", fontSize: 14, fontWeight: "bold" },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modal: {
    backgroundColor: "#1F2937",
    padding: 20,
    borderRadius: 10,
    width: "85%",
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  saveBtn: {
    backgroundColor: "#4F46E5",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#6B7280",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  modalBtnText: { color: "white", fontWeight: "bold" },
});
