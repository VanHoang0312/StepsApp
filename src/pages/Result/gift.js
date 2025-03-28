import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity } from "react-native";
import * as Progress from 'react-native-progress';
import { getGiftbyId } from "../../services/giftService";
import { useAuth } from "../../helpers/AuthContext";
import { openDB } from '../../../Database/database';
import {
  createTable,
  loadStepsFromSQLite,
} from '../../../Database/DailyDatabase';
import {
  createGoalsTable,
  loadGoalFromSQLite,
  loadLatestGoalFromSQLite,
} from '../../../Database/GoalsDatabase';
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const BASE_URL = "http://192.168.1.172:3002";

const BadgeItem = ({ item }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.badgeContainer}
      onPress={() => navigation.navigate("BadgeDetail", { badge: item })}
    >
      <Image
        source={{ uri: `${BASE_URL}${item.icon.replace("app/public", "")}` }}
        style={styles.badgeImage}
        tintColor={item.status ? "#FFD700" : "#A0A0A0"}
      />
      <Text style={styles.badgeText}>{item.giftname}</Text>
      <Progress.Bar
        progress={item.progress || 0}
        width={80}
        height={5}
        color="#6C63FF"
        unfilledColor="#DDD"
        borderWidth={0}
        borderRadius={5}
      />
      <Text style={styles.progressText}>
        {Math.round(item.progress * item.targetSteps)} / {item.targetSteps} bước
      </Text>
    </TouchableOpacity>
  );
};

function Gift() {
  const [gifts, setGifts] = useState([]);
  const { userId, loading } = useAuth();
  const [currentSteps, setCurrentSteps] = useState(0);
  const [userGoalSteps, setUserGoalSteps] = useState(0);
  const [db, setDb] = useState(null);

  // Khởi tạo database SQLite
  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB();
        await createTable(database);
        await createGoalsTable(database);
        setDb(database);
        console.log("Database initialized");
      } catch (error) {
        console.error("Error initializing database:", error);
      }
    };
    initDB();
  }, []);

  // Load dữ liệu bước chân từ bảng activity
  const loadSteps = async () => {
    if (db && userId) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const data = await loadStepsFromSQLite(db, userId, today);
        setCurrentSteps(data.steps || 0);
        console.log("Current steps loaded from SQLite:", data.steps);
      } catch (error) {
        console.error("Error loading steps:", error);
      }
    }
  };

  // Load mục tiêu từ bảng goals
  const loadGoal = async () => {
    if (db && userId) {
      try {
        const today = new Date().toISOString().split('T')[0];
        let goal = await loadGoalFromSQLite(db, userId, today);
        if (!goal) {
          // Nếu không có mục tiêu hôm nay, lấy mục tiêu gần nhất
          goal = await loadLatestGoalFromSQLite(db, userId, today);
        }
        const goalSteps = goal ? goal.steps : 6000;
        setUserGoalSteps(goalSteps);
        console.log("User goal steps loaded from SQLite:", goalSteps);
      } catch (error) {
        console.error("Error loading goal:", error);
      }
    }
  };

  // Tính targetSteps dựa trên mục tiêu người dùng
  const getTargetSteps = (giftname) => {
    if (giftname.includes("5k Bước")) return 5000;
    if (giftname.includes("10k Bước")) return 10000;
    if (giftname.includes("20k Bước")) return 20000;
    if (giftname.includes("Mục tiêu 200%")) return userGoalSteps * 2;
    if (giftname.includes("Mục tiêu 300%")) return userGoalSteps * 3;
    if (giftname.includes("Huy hiệu cảnh binh")) return userGoalSteps;
    return 0;
  };

  // Fetch dữ liệu phần thưởng từ API
  const fetchApi = async () => {
    try {
      if (userId) {
        const response = await getGiftbyId(userId);
        if (response && Array.isArray(response)) {
          const formattedGifts = response.map(gift => {
            const targetSteps = getTargetSteps(gift.giftname);
            const progress = targetSteps > 0 ? Math.min(currentSteps / targetSteps, 1) : 0;
            const status = currentSteps >= targetSteps;
            return {
              ...gift,
              giftname: gift.giftname || "Phần thưởng không tên",
              icon: gift.icon || null,
              targetSteps,
              progress,
              status,
            };
          });
          setGifts(formattedGifts);
        } else {
          setGifts([]);
        }
      } else {
        console.log("Chưa đăng nhập");
      }
    } catch (error) {
      console.error("Lỗi khi lấy phần thưởng:", error);
      setGifts([]);
    }
  };

  // Load dữ liệu khi db, userId thay đổi
  useEffect(() => {
    if (!loading && db) {
      loadSteps();
      loadGoal();
    }
  }, [userId, loading, db]);

  // Cập nhật mục tiêu khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      if (!db) return;
      loadGoal(db);
    }, [db, userId])
  );

  // Fetch API khi currentSteps hoặc userGoalSteps thay đổi
  useEffect(() => {
    if (!loading && db) {
      fetchApi();
    }
  }, [userId, loading, currentSteps, userGoalSteps, db]);

  if (loading || !db) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Phần thưởng</Text>
      <Text style={styles.subtitle}>Đếm Bước. Nhận Huy hiệu.</Text>
      <Text style={styles.subtitle1}>Đang thực hiện</Text>
      {userId ? (
        <FlatList
          data={gifts}
          renderItem={({ item }) => <BadgeItem item={item} />}
          keyExtractor={(item) => item._id.toString()}
          numColumns={3}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text>Không có phần thưởng nào</Text>}
        />
      ) : (
        <Text>Vui lòng đăng nhập để xem phần thưởng!!!</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 15,
  },
  subtitle: {
    fontSize: 18,
    color: "#8C8C8C",
    marginBottom: 20,
    marginLeft: 15,
  },
  listContainer: {
    alignItems: 'center',
  },
  badgeContainer: {
    alignItems: 'center',
    margin: 20,
  },
  badgeImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  badgeText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 5,
  },
  progressText: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  subtitle1: {
    marginTop: 50,
    color: "#909090",
    fontWeight: 'bold',
    marginLeft: 15,
  },
});

export default Gift;