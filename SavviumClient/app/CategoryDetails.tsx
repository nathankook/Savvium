import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LOCAL_HOST } from '../environment';

export default function CategoryDetailsScreen() {
  const { id, name, budget } = useLocalSearchParams<{ id: string, name: string, budget: string }>();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${LOCAL_HOST}/expenses/${id}`);
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addExpense = async () => {
    if (!expenseName || !expenseAmount) {
      Alert.alert('Please fill out both fields.');
      return;
    }

    try {
      const response = await fetch(`${LOCAL_HOST}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: Number(id),
          name: expenseName,
          amount: parseFloat(expenseAmount),
        })
      });

      if (response.ok) {
        setExpenseName('');
        setExpenseAmount('');
        fetchExpenses();
      } else {
        Alert.alert('Failed to add expense.');
      }
    } catch (err) {
      Alert.alert('Error adding expense.');
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const response = await fetch(`${LOCAL_HOST}/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.replace('/Dashboard');
      } else {
        Alert.alert('Failed to delete category.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error deleting category.');
    }
  };

  return (
    <View style={styles.container}>
      {/* NAVBAR */}
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
          <TouchableOpacity onPress={() => { setDropdownVisible(false); setConfirmDeleteVisible(true); }}>
            <Text style={styles.dropdownItem}>Delete Category</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.categoryBudget}>${parseFloat(budget).toFixed(2)}</Text>

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
        <Text style={styles.saveText}>Add Expense</Text>
      </TouchableOpacity>

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

      {confirmDeleteVisible && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Deleting this category will also delete all associated expenses. Are you sure?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setConfirmDeleteVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#111' }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleDeleteCategory}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827", paddingHorizontal: 20, paddingTop: 20 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    backgroundColor: '#111827',
  },
  menuButton: { padding: 8 },
  nameDropdown: { flexDirection: 'row', alignItems: 'center' },
  categoryName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginLeft: 6 },
  dropdownMenu: { position: 'absolute', top: 70, right: 20, backgroundColor: '#1F2937', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 15, zIndex: 10 },
  dropdownItem: { color: '#fff', paddingVertical: 5 },
  categoryBudget: { fontSize: 20, fontWeight: 'bold', color: '#10B981', textAlign: 'center', marginVertical: 10 },
  input: { backgroundColor: '#1F2937', color: '#fff', borderRadius: 8, padding: 12, marginBottom: 16 },
  saveButton: { backgroundColor: '#4F46E5', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  expenseItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomColor: '#374151', borderBottomWidth: 1 },
  expenseName: { color: '#fff', fontSize: 16 },
  expenseAmount: { color: '#10B981', fontSize: 16 },
  modalContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
  modalText: { fontSize: 16, color: '#111', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 1, marginHorizontal: 5, backgroundColor: '#EF4444', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  modalButtonText: { color: '#fff', fontWeight: 'bold' },
});
