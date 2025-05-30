import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  FlatList,
  Dimensions,
  SafeAreaView,
  ScrollView
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { useState, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LOCAL_HOST } from "../environment";
import { ProgressChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export type Category = {
  id: number;
  user_id?: number;
  name?: string;
  budget?: number;
  color?: string;
};

export type Expense = {
  id: number;
  category_id: number;
  name: string;
  amount: number;
  category_name: string;
  date: string;
};

export type Income = {
  id: number;
  user_id: number;
  name: string;
  amount: number;
  date: string;
};

export default function DashboardScreen() {
  const { name, refresh } = useLocalSearchParams<{
    name?: string;
    refresh?: string;
  }>();
  const sidebarX = useRef(new Animated.Value(-250)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

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

  const fetchExpenses = async (userId: string) => {
    try {
      const response = await fetch(`${LOCAL_HOST}/users/${userId}/expenses`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const expensesWithDates = data.map((expense: Expense) => {
        if (!expense.date) {
          console.log("Found expense without date:", expense.id);
          return { ...expense, date: new Date().toISOString() };
        }
        return expense;
      });
      
      const sortedExpenses = expensesWithDates.sort((a: Expense, b: Expense) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      setExpenses(sortedExpenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const fetchIncomes = async (userId: string) => {
    try {
      const response = await fetch(`${LOCAL_HOST}/users/${userId}/incomes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const sortedIncomes = data.sort((a: Income, b: Income) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      setIncomes(sortedIncomes);
    } catch (error) {
      console.error("Error fetching incomes:", error);
    }
  };

  const initializeData = async () => {
    const storedUserId = await AsyncStorage.getItem("userId");
    const storedUserName = await AsyncStorage.getItem("userName");
    if (storedUserId) {
      setUserId(storedUserId);
      if (storedUserName) {
        setUserName(storedUserName);
      }
      await fetchCategories(storedUserId);
      await fetchExpenses(storedUserId);
      await fetchIncomes(storedUserId); 
    }
  };

  useFocusEffect(
    useCallback(() => {
      initializeData();
    }, [refresh])
  );

  const openSidebar = () => {
    setIsSidebarOpen(true);
    Animated.timing(sidebarX, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(sidebarX, {
      toValue: -250,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsSidebarOpen(false);
    });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("isLoggedIn");
      await AsyncStorage.removeItem("userId");
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAddCategory = () => {
    router.push("/AddCategory");
  };

  const handleCategoryClick = (category: Category) => {
    router.push({
      pathname: "/CategoryDetails",
      params: {
        id: category.id.toString(),
        name: category.name!,
        budget: category.budget!.toString(),
      },
    });
  };

  const handleAddExpense = () => {
    router.push("/AddExpense");
  };

  const handleAddRecurringExpense = () => {
    router.push("/AddRecurringExpense");
  };

  const handleMonthlyExpensesGraph = () => {
    router.push("/MonthlyExpensesGraph");
  };

  const handleAddIncome = () => {
    router.push("/AddIncome");
  };

  const totalBudget = categories.reduce(
    (sum, cat) => sum + (cat.budget ?? 0),
    0
  );

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

  const isAnyCategoryOverBudget = categories.some((category) => {
    const categoryExpenses = expenses.filter(
      (expense) => expense.category_id === category.id
    );
    const totalCategorySpent = categoryExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    return (
      category.budget !== undefined && totalCategorySpent > category.budget
    );
  });

  const overBudgetCategory = categories.find((category) => {
    const categoryExpenses = expenses.filter(
      (expense) => expense.category_id === category.id
    );
    const totalCategorySpent = categoryExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    return (
      category.budget !== undefined && totalCategorySpent > category.budget
    );
  });

  const overBudgetAmount = overBudgetCategory
    ? expenses
        .filter((expense) => expense.category_id === overBudgetCategory.id)
        .reduce((sum, exp) => sum + exp.amount, 0) -
      (overBudgetCategory.budget ?? 0)
    : 0;

  const progress = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0;

  const displayedSpent = Number.isFinite(totalSpent)
    ? totalSpent.toFixed(2)
    : "0.00";
  const displayedBudget =
    Number.isFinite(totalBudget) && totalBudget !== 0
      ? totalBudget.toFixed(2)
      : "0.00";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const scrollableWidth = Math.max(
    0,
    (categories.length + 1) * 100 - screenWidth
  );

  const needsScroll = scrollableWidth > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Nav */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={openSidebar} style={styles.menuButton}>
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.userName}>{name || userName || "User"}</Text>
        </View>

        {/* Sidebar */}
        <Animated.View
          style={[styles.sidebar, { transform: [{ translateX: sidebarX }] }]}
        >
          <TouchableOpacity onPress={closeSidebar}>
            <Ionicons
              name="close"
              size={28}
              color="white"
              style={{ alignSelf: "flex-end" }}
            />
          </TouchableOpacity>
          <Text style={styles.sidebarTitle}>Menu</Text>

          <View style={styles.userInfo}>
            <Ionicons name="person-circle" size={40} color="white" />
            <Text style={styles.userNameSidebar}>
              {name || userName || "User"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleMonthlyExpensesGraph}
            style={styles.sidebarButton}
          >
            <Text style={styles.sidebarButtonText}>Monthly Expenses Graph</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <View style={styles.logoutContainer}>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {isSidebarOpen && (
          <TouchableOpacity style={styles.backdrop} onPress={closeSidebar} />
        )}

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Summary Section */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Ionicons name="wallet-outline" size={24} color="#10B981" />
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={[styles.summaryAmount, { color: '#10B981' }]}>
              ${totalIncome.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="card-outline" size={24} color="#EF4444" />
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={[styles.summaryAmount, { color: '#EF4444' }]}>
              ${totalSpent.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Progress Ring Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Budget Progress</Text>
          
          <View style={styles.chartRing}>
            <ProgressChart
              data={{
                labels: [],
                data: [progress],
              }}
              width={200}
              height={200}
              strokeWidth={16}
              radius={80}
              chartConfig={{
                backgroundGradientFrom: "#111827",
                backgroundGradientTo: "#111827",
                color: (opacity = 1) =>
                  isAnyCategoryOverBudget
                    ? `rgba(251, 146, 60, ${opacity})`
                    : `rgba(16, 185, 129, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              hideLegend={true}
            />
            <View style={styles.chartTextContainer}>
              <View style={styles.chartAmountContainer}>
                <Text style={styles.chartAmountSpent}>
                  ${displayedSpent}
                </Text>
                <Text style={styles.chartAmountOf}>of</Text>
                <Text style={styles.chartAmountBudget}>
                  ${displayedBudget}
                </Text>
              </View>
            </View>
          </View>

          {overBudgetCategory && (
            <Text style={styles.overBudgetText}>
              Over budget by ${overBudgetAmount.toFixed(2)} in{" "}
              {overBudgetCategory.name}
            </Text>
          )}
        </View>

        {/* Category Carousel */}
        <View style={styles.carouselContainer}>
          <Animated.FlatList
            data={[{ id: -1 }, ...categories]}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[styles.categoryList, { paddingBottom: 10 }]}
            showsHorizontalScrollIndicator={true}
            scrollIndicatorInsets={{ top: 0, left: 0, bottom: -5, right: 0 }}
            scrollEventThrottle={16}
            pagingEnabled={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            renderItem={({ item }) =>
              item.id === -1 ? (
                <TouchableOpacity
                  style={styles.addCategoryCard}
                  onPress={handleAddCategory}
                >
                  <Ionicons name="add" size={36} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.categoryCard,
                    { backgroundColor: item.color || "#4F46E5" },
                  ]}
                  onPress={() => handleCategoryClick(item)}
                >
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categoryBudget}>
                    ${(item.budget ?? 0).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              )
            }
          />
        </View>

        {/* Expenses List */}
        <Text style={styles.sectionTitle}>Recent Expenses</Text>
        <View style={styles.addSectionContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/AddExpense")}
          >
            <Ionicons name="receipt-outline" size={36} color="white" />
            <Text style={styles.addExpenseText}>Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addRecurringExpenseButton}
            onPress={() => router.push("/AddRecurringExpense")}
          >
            <Ionicons name="repeat" size={36} color="white" />
            <Text style={styles.addExpenseText}>Add Recurring{"\n"}Expense</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
          style={{ height: expenses.length * 80 }}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.expenseCategory}>{item.category_name}</Text>
                <Text style={styles.itemDate}>
                  <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                  {" "}{formatDate(item.date)}
                </Text>
              </View>
              <Text style={[styles.itemAmount, { color: "#EF4444" }]}>
                -${item.amount.toFixed(2)}
              </Text>
            </View>
          )}
        />

        {/* Income List */}
        <Text style={styles.sectionTitle}>Recent Income</Text>
        <View style={styles.addSectionContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/AddIncome")}
          >
            <Ionicons name="cash-outline" size={36} color="white" />
            <Text style={styles.addExpenseText}>Add Income</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={incomes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
          style={{ height: incomes.length * 70 }}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDate}>
                  <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                  {" "}{formatDate(item.date)}
                </Text>
              </View>
              <Text style={[styles.itemAmount, { color: "#10B981" }]}>
                +${item.amount.toFixed(2)}
              </Text>
            </View>
          )}
        />

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#111827" },
  container: { flex: 1, backgroundColor: "#111827" },
  navBar: {
    height: 60,
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  menuButton: { padding: 8 },
  userName: { fontSize: 18, fontWeight: "bold", color: "white" },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 250,
    height: "100%",
    backgroundColor: "#111827",
    paddingTop: 60,
    paddingHorizontal: 20,
    zIndex: 5,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 20,
    color: "white",
  },
  sidebarButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#1F2937",
    borderRadius: 8,
    alignItems: "center",
  },
  sidebarButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    marginHorizontal: 20,
  },
  chartContainer: {
    alignItems: "center", 
    marginVertical: 20
  },
  chartTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
    textAlign: "center",
  },
  chartRing: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 110,
    padding: 10,
  },
  chartTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  chartAmountContainer: {
    alignItems: "center"
  },
  chartAmountSpent: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white"
  },
  chartAmountOf: {
    fontSize: 16,
    color: "white"
  },
  chartAmountBudget: {
    fontSize: 18,
    color: "white"
  },
  overBudgetText: {
    fontSize: 16,
    color: "orange",
    marginTop: 10
  },
  summaryCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    width: "45%",
  },
  summaryLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 5,
  },
  summaryAmount: {
    fontSize: 18, 
    fontWeight: "bold",
    marginTop: 5,
  },
  logoutButton: { marginTop: 20 },
  logoutText: { fontSize: 18, color: "red" },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: screenWidth,
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 4,
  },
  carouselContainer: { marginTop: 10 },
  categoryList: { paddingHorizontal: 10 },
  addCategoryCard: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 2,
    borderColor: "white",
    borderStyle: "dashed",
  },
  categoryCard: {
    width: 90,
    height: 90,
    borderRadius: 12,
    padding: 8,
    justifyContent: "space-between",
    marginRight: 10,
  },
  categoryName: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  categoryBudget: { color: "#fff", fontSize: 12 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginLeft: 20,
    color: "#E6F0FF",
  },
  listContainer: { paddingHorizontal: 20, paddingTop: 10 },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomColor: "#374151",
    borderBottomWidth: 1,
  },
  itemName: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#E6F0FF",
    marginBottom: 2
  },
  expenseCategory: { 
    fontSize: 12, 
    color: "#9CA3AF",
    marginBottom: 2
  },
  itemAmount: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#10B981" 
  },
  itemDate: { 
    fontSize: 12, 
    color: "#9CA3AF",
    flexDirection: "row",
    alignItems: "center",
  },
  addSectionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  addButton: {
    width: 140,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    borderStyle: "solid",
  },
  addRecurringExpenseButton: {
    width: 140,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    borderStyle: "solid",
  },
  addExpenseText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "center",
  },
  userInfo: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  userNameSidebar: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginLeft: 10,
  },
  logoutContainer: {
    paddingBottom: 30,
  },
});