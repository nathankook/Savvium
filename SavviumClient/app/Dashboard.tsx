import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  FlatList,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { useState, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LOCAL_HOST } from "../environment";
import { ProgressChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

type Category = {
  id: number;
  user_id?: number;
  name?: string;
  budget?: number;
  color?: string;
};

type Expense = {
  id: number;
  category_id: number;
  name: string;
  amount: number;
  category_name: string;
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
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const fetchCategories = async (id: string) => {
    try {
      const response = await fetch(`${LOCAL_HOST}/categories/${id}`);
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
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const initializeData = async () => {
    const storedUserId = await AsyncStorage.getItem("userId");
    const storedUserName = await AsyncStorage.getItem('userName');
    if (storedUserId) {
      setUserId(storedUserId);
      if (storedUserName) {
        setUserName(storedUserName);
      }
      await fetchCategories(storedUserId);
      await fetchExpenses(storedUserId);
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

  const totalBudget = categories.reduce(
    (sum, cat) => sum + (cat.budget ?? 0),
    0
  );

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

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
            <Text style={styles.userNameSidebar}>{name || userName || "User"}</Text>
          </View>

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

        {/* Progress Ring Chart */}
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <View
            style={{
              width: 220,
              height: 220,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#111827",
              borderRadius: 110,
              padding: 10,
            }}
          >
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
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{ fontSize: 20, fontWeight: "bold", color: "white" }}
                >
                  ${displayedSpent}
                </Text>
                <Text style={{ fontSize: 16, color: "white" }}>of</Text>
                <Text style={{ fontSize: 18, color: "white" }}>
                  ${displayedBudget}
                </Text>
              </View>
            </View>
          </View>

          {overBudgetCategory && (
            <Text style={{ fontSize: 16, color: "orange", marginTop: 10 }}>
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
        <Text style={styles.expensesTitle}>Recent Expenses</Text>
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.expenseList}
          renderItem={({ item }) => (
            <View style={styles.expenseItem}>
              <View>
                <Text style={styles.expenseName}>{item.name}</Text>
                <Text style={styles.expenseCategory}>{item.category_name}</Text>
              </View>
              <Text style={styles.expenseAmount}>
                ${item.amount.toFixed(2)}
              </Text>
            </View>
          )}
        />
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
  categoryList: { paddingHorizontal: 10,  },
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
  expensesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginLeft: 20,
    color: "#E6F0FF",
  },
  expenseList: { paddingHorizontal: 20, paddingTop: 10 },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#374151",
    borderBottomWidth: 1,
  },
  expenseName: { fontSize: 16, fontWeight: "bold", color: "#E6F0FF" },
  expenseCategory: { fontSize: 12, color: "#9CA3AF" },
  expenseAmount: { fontSize: 16, fontWeight: "bold", color: "#10B981" },
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
