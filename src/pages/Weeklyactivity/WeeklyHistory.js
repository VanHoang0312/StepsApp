import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from '@expo/vector-icons';
import { openDB } from "../../../Database/database";

function WeeklyHistory() {
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      const db = await openDB();
      const today = new Date();
      const weeks = [];

      for (let i = 0; i < 7; i++) {
        const lastDayOfWeek = new Date(today);
        lastDayOfWeek.setDate(today.getDate() - today.getDay() + 7 - (i * 7));

        const firstDayOfWeek = new Date(lastDayOfWeek);
        firstDayOfWeek.setDate(lastDayOfWeek.getDate() - 6);

        const formatDate = (date) => {
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${year}-${month}-${day}`;
        };

        const displayDate = `${firstDayOfWeek.getDate()}/${firstDayOfWeek.getMonth() + 1} - ${lastDayOfWeek.getDate()}/${lastDayOfWeek.getMonth() + 1}/${lastDayOfWeek.getFullYear()}`;

        const startDate = formatDate(firstDayOfWeek);
        const endDate = formatDate(lastDayOfWeek);

        const result = await db.executeSql(
          `SELECT 
            COALESCE(SUM(steps), 0) AS totalSteps,
            COALESCE(SUM(calories), 0) AS totalCalories,
            COALESCE(SUM(distance), 0) AS totalDistance,
            COALESCE(SUM(activeTime), 0) AS totalActiveTime
          FROM activity
          WHERE day BETWEEN ? AND ?`, [startDate, endDate]
        );

        const data = result[0].rows.item(0);
        weeks.unshift({
          week: displayDate,
          steps: data.totalSteps,
          calories: data.totalCalories,
          distance: data.totalDistance.toFixed(2),
          activeTime: data.totalActiveTime
        });
      }

      setWeeklyData(weeks.reverse());
    };

    fetchWeeklyData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {weeklyData.map((weekData, index) => (
          <View key={index} style={styles.stepCounter}>
            <View style={styles.stepDisplay}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{weekData.week}</Text>
              </View>
              <View style={styles.stepsContainer}>
                <Text style={styles.stepsText}>{weekData.steps}</Text>
                <FontAwesome5 name="walking" size={24} color="#000" style={styles.stepIcon} />
              </View>
              <View style={styles.activityWeekly}>
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>CALORIES</Text>
                  <Text style={styles.activityValue}>{weekData.calories} kcal</Text>
                </View>
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>KHOẢNG CÁCH</Text>
                  <Text style={styles.activityValue}>{weekData.distance} m</Text>
                </View>
                <View style={styles.activityItem}>
                  <Text style={styles.activityTitle}>THỜI GIAN{'\n'}HOẠT ĐỘNG</Text>
                  <Text style={styles.activityValue}>{weekData.activeTime} phút</Text>
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
  activityWeekly: {
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

export default WeeklyHistory;
