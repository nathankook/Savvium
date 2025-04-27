import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  FlatList,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { useState, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LOCAL_HOST } from "../environment";

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

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
  const { name, refresh } = useLocalSearchParams<{ name?: string; refresh?: string }>();
  const sidebarX = useRef(new Animated.Value(-250)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const trackWidth = screenWidth * 0.9;
  const indicatorWidth = trackWidth * 0.2;

  const fetchCategories = async (id: string) => {
    try {
      const response = await fetch(`${LOCAL_HOST}/categories/${id}`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchExpenses = async (id: string) => {
    try {
      const response = await fetch(`${LOCAL_HOST}/expenses/${id}`);
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const initializeData = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
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
      router.replace("/Login");
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

  const totalExpenses = categories.reduce(
    (sum, cat) => sum + (cat.budget ?? 0),
    0
  );

  const scrollableWidth = Math.max(
    0,
    (categories.length + 1) * 100 - screenWidth
  );

  const needsScroll = scrollableWidth > 0;

  return (
    <View style={styles.container}>
      {/* Top Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={openSidebar} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.userName}>{name}</Text>
      </View>

      {/* Sidebar */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: sidebarX }] }]}
      >
        <TouchableOpacity onPress={closeSidebar}>
          <Ionicons
            name="close"
            size={28}
            color="black"
            style={{ alignSelf: "flex-end" }}
          />
        </TouchableOpacity>
        <Text style={styles.sidebarTitle}>Menu</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

      {isSidebarOpen && (
        <TouchableOpacity style={styles.backdrop} onPress={closeSidebar} />
      )}

      {/* Total Expenses */}
      <Text style={styles.totalExpenses}>${totalExpenses.toFixed(2)}</Text>

      {/* Category Carousel */}
      <View style={styles.carouselContainer}>
        <Animated.FlatList
          data={[{ id: -1 }, ...categories]}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.categoryList}
          showsHorizontalScrollIndicator={false}
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
                <Ionicons name="add" size={36} color="black" />
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
            <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  navBar: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    elevation: 4,
  },
  menuButton: { padding: 8 },
  userName: { fontSize: 18, fontWeight: "bold" },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 250,
    height: "100%",
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
    zIndex: 5,
  },
  sidebarTitle: { fontSize: 20, fontWeight: "bold", marginVertical: 20 },
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
  totalExpenses: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
    marginVertical: 20,
  },
  carouselContainer: { marginTop: 10 },
  categoryList: { paddingHorizontal: 10 },
  addCategoryCard: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 2,
    borderColor: "black",
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
  scrollBarContainer: {
    height: 4,
    backgroundColor: "transparent",
    width: "90%",
    alignSelf: "center",
    marginTop: 10,
    position: "relative",
  },
  scrollBarBackground: {
    position: "absolute",
    height: 4,
    backgroundColor: "#ccc",
    width: "100%",
    borderRadius: 2,
  },
  scrollBarIndicator: {
    position: "absolute",
    height: 4,
    backgroundColor: "black",
    borderRadius: 2,
  },
  expensesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginLeft: 20,
    color: "#111",
  },
  expenseList: { paddingHorizontal: 20, paddingTop: 10 },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  expenseName: { fontSize: 16, fontWeight: "bold", color: "#111" },
  expenseCategory: { fontSize: 12, color: "#666" },
  expenseAmount: { fontSize: 16, fontWeight: "bold", color: "#10B981" },
});
