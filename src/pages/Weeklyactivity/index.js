import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { LineChart, BarChart } from 'react-native-chart-kit';
import { openDB } from "../../../Database/database";
import { useNavigation } from '@react-navigation/native';
import { loadLatestBodyFromSQLite } from "../../../Database/BodyDatabase";
import { useAuth } from "../../helpers/AuthContext";


function WeeklyActivity() {
  const [stepsData, setStepsData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [weekRange, setWeekRange] = useState("");
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [activeTime, setActiveTime] = useState(0);
  const { userId } = useAuth()
  const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const navigation = useNavigation();

  useEffect(() => {
    const fetchStepsData = async () => {
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
      setWeekRange(`${formatDate(firstDayOfWeek, false)} - ${formatDate(lastDayOfWeek)}`);

      // Lấy các ngày trong tuần
      const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - today.getDay() + i + 1); // Lấy ngày từ thứ 2 - CN
        return date.toISOString().split("T")[0];
      });
      console.log(daysOfWeek);

      try {
        const steps = await Promise.all(
          daysOfWeek.map(async (date) => {
            return new Promise((resolve, reject) => {
              db.transaction(tx => {
                tx.executeSql(
                  "SELECT SUM(steps) as totalSteps FROM activity WHERE day = ? AND (userId = ? OR userId IS NULL)",
                  [date, userId],
                  (_, { rows }) => {
                    resolve(rows.item(0).totalSteps || 0);
                  },
                  (_, error) => reject(error)
                );
              });
            });
          })
        );

        setStepsData(steps);

        const totalSteps = steps.reduce((a, b) => a + b, 0);
        // Lấy dữ liệu body gần nhất từ BodyDatabase
        const bodyData = await loadLatestBodyFromSQLite(db, userId, daysOfWeek[6]); // Dùng ngày cuối tuần để lấy dữ liệu gần nhất
        if (bodyData) {
          console.log("Dữ liệu body gần nhất:", bodyData);
          const { stepLength, weight } = bodyData;

          // Tính toán chính xác
          const calculatedDistance = ((totalSteps * stepLength) / 100000).toFixed(2); // km
          const calculatedCalories = (calculatedDistance * weight * 0.75).toFixed(2); // kcal
          const calculatedActiveTime = Math.floor(totalSteps / 100); // phút

          setDistance(calculatedDistance);
          setCalories(calculatedCalories);
          setActiveTime(calculatedActiveTime);
        } else {
          console.warn("Không tìm thấy dữ liệu body, dùng giá trị mặc định");
          // Dùng công thức mặc định nếu không có body data
          setDistance((totalSteps / 1300).toFixed(2));
          setCalories((totalSteps / 1300 * 60).toFixed(2));
          setActiveTime(Math.floor(totalSteps / 80));
        }

      } catch (error) {
        console.error("Lỗi lấy dữ liệu bước chân:", error);
      }
    };

    fetchStepsData();
  }, [userId]);


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.weekLabel}>{weekRange}</Text>
            <TouchableOpacity style={styles.historyButton} onPress={() => navigation.navigate('WeeklyHistory')}>
              <Text style={styles.historyButtonText}>Lịch sử tuần</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.stepCount}>{stepsData.reduce((a, b) => a + b, 0)}</Text>
        </View>

        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels,
              datasets: [{ data: stepsData }],
            }}
            width={Dimensions.get("window").width}
            height={250}
            yAxisLabel=""
            yAxisSuffix=" bước"
            fromZero={true}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              barPercentage: 0.5, // Điều chỉnh độ rộng của cột
            }}
            verticalLabelRotation={0}
            showBarTops={true}
            withHorizontalLabels={true}
            style={styles.chart}
          />
        </View>

        {/* Thông tin bên dưới */}
        <View style={styles.infoContainer}>
          <View style={styles.infoBox}>
            <Text style={[styles.infoValue, { fontWeight: 'bold', color: '#000000', fontSize: 20 }]}>{calories} kcal</Text>
            <Text style={styles.infoLabel}>CALORIES</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={[styles.infoValue, { fontWeight: 'bold', color: '#000000', fontSize: 20 }]}>{distance} m</Text>
            <Text style={styles.infoLabel}>KHOẢNG CÁCH</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={[styles.infoValue, { fontWeight: 'bold', color: '#000000', fontSize: 20 }]}>{activeTime} phút</Text>
            <Text style={styles.infoLabel}>THỜI GIAN HOẠT ĐỘNG</Text>
          </View>
        </View>

        {/* Biểu đồ */}
        <LineChart
          data={{
            labels,
            datasets: [
              {
                data: stepsData,
                color: (opacity = 1) => `rgba(0, 191, 255, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          }}
          width={Dimensions.get("window").width}
          height={250}
          yAxisInterval={1}
          yAxisSuffix=" bước"
          chartConfig={{
            backgroundColor: "#FFFFFF",
            backgroundGradientFrom: "#FFFFFF",
            backgroundGradientTo: "#FFFFFF",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: "5", strokeWidth: "2", stroke: "#00BFFF" },
          }}
          bezier
          style={{ borderRadius: 16 }}
          withHorizontalLabels={true}
          withDots={true}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    //alignItems: 'center',
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 5,
    marginTop: 10,
    marginLeft: 10,

  },
  weekLabel: {
    fontSize: 16,
    color: "#808080",
    fontWeight: "bold"
  },
  stepCount: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  stepCountDay: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginLeft: 10,
    marginBottom: 20,
    marginTop: 15
  },
  infoValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: "#808080",
  },
  infoLabel: {
    fontSize: 12,
    color: "#808080",
    fontWeight: "bold",
    flexWrap: 'wrap',
    width: 90,
    alignItems: 'center'
  },
  chartContainer: {
    alignItems: 'flex-start',
    width: '100%'
  },
  chart: {
    marginVertical: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
    paddingRight: 15
  },
  historyButton: {
    backgroundColor: '#6495ED',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000', // Đổ bóng (iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WeeklyActivity;