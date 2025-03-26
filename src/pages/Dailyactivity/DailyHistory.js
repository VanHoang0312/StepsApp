import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from '@expo/vector-icons';
import { openDB } from "../../../Database/database";
import { useAuth } from "../../helpers/AuthContext";

function DailyHistory() {
  const [dailyData, setDailyData] = useState([]);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchDailyData = async () => {
      const db = await openDB();
      const today = new Date();
      const days = [];

      // Lấy dữ liệu của 7 ngày gần nhất
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const formatDate = (date) => {
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${year}-${month}-${day}`;
        };

        const dbDate = formatDate(date); // Định dạng cho truy vấn SQLite
        const displayDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`; // Định dạng hiển thị

        const result = await db.executeSql(
          `SELECT 
            COALESCE(steps, 0) AS steps,
            COALESCE(calories, 0) AS calories,
            COALESCE(distance, 0) AS distance,
            COALESCE(activeTime, 0) AS activeTime
          FROM activity
          WHERE userId = ? AND day = ?`,
          [userId, dbDate]
        );

        let data;
        if (result[0].rows.length > 0) {
          data = result[0].rows.item(0);
        } else {
          // Nếu không có dữ liệu cho ngày đó, trả về giá trị mặc định
          data = { steps: 0, calories: 0, distance: 0, activeTime: 0 };
        }

        days.push({
          date: displayDate,
          steps: data.steps,
          calories: data.calories,
          distance: data.distance.toFixed(2),
          activeTime: data.activeTime
        });
      }

      setDailyData(days);
    };

    fetchDailyData();
  }, [userId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {dailyData.map((dayData, index) => (
          <View key={index} style={styles.stepCounter}>
            <View style={styles.stepDisplay}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{dayData.date}</Text>
              </View>
              <View style={styles.stepsContainer}>
                <Text style={styles.stepsText}>{dayData.steps}</Text>
                <FontAwesome5 name="walking" size={24} color="#000" style={styles.stepIcon} />
              </View>
              <View style={styles.activityDaily}>
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>CALORIES</Text>
                  <Text style={styles.activityValue}>{dayData.calories} kcal</Text>
                </View>
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>KHOẢNG CÁCH</Text>
                  <Text style={styles.activityValue}>{dayData.distance} km</Text>
                </View>
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>THỜI GIAN{'\n'}HOẠT ĐỘNG</Text>
                  <Text style={styles.activityValue}>{dayData.activeTime} phút</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  stepCounter: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    padding: 16,
    width: "100%",
    marginTop: 10,
    marginBottom: 20
  },
  stepDisplay: {
    width: '100%',
  },
  dateContainer: {
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#555",
  },
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  stepsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: "#333",
    marginRight: 8,
  },
  stepIcon: {
    marginTop: 2,
  },
  activityDaily: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderTopWidth: 1,
    borderColor: "#E0E0E0",
    paddingTop: 12,
  },
  activityItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  activityValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
});

export default DailyHistory;