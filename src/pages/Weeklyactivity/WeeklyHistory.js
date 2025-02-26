import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from '@expo/vector-icons';
import { openDB } from "../../../Database/database";

function WeeklyHistory() {
  const [stepsWeekly, setStepWeekly] = useState();
  const [week, setWeek] = useState("");


  useEffect(() => {
    const stepData = async () => {
      const db = await openDB();
      const today = new Date();
      // Tính toán ngày đầu tuần (Thứ Hai) và ngày cuối tuần (Chủ Nhật)
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay() + 1); // Tính ngày Thứ Hai

      const lastDayOfWeek = new Date(today);
      lastDayOfWeek.setDate(today.getDate() - today.getDay() + 7); // Tính ngày Chủ Nhật

      // Định dạng ngày
      const formatDate = (date, includeYear = true) => {
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        if (includeYear) {
          return `${day} ${month}, ${year}`;
        } else {
          return `${day}`;
        }
      };
      setWeek(`${formatDate(firstDayOfWeek, false)} - ${formatDate(lastDayOfWeek)}`);

      // Lấy các ngày trong tuần
      const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - today.getDay() + i + 1); // Lấy ngày từ thứ 2 - CN
        return date.toISOString().split("T")[0];
      });


    };

    stepData()
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

        <View style={styles.stepCounter}>
          <View style={styles.stepDisplay}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{week}</Text>
            </View>

            <View style={styles.stepsContainer}>
              <Text style={styles.stepsText}>20000</Text>
              <FontAwesome5 name="walking" size={24} color="#00000" style={styles.stepIcon} />
            </View>
            <View style={styles.activityWeekly}>
              <View style={styles.activityItem}>
                <Text style={styles.activityTitle}>CALORIES</Text>
                <Text style={styles.activityValue}>500 kcal</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityTitle}>KHOẢNG CÁCH</Text>
                <Text style={styles.activityValue}>8.2 km</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityTitle}>THỜI GIAN{'\n'}HOẠT ĐỘNG</Text>
                <Text style={styles.activityValue}>60 phút</Text>
              </View>
            </View>
          </View>
        </View>


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
    marginTop: 5,
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
