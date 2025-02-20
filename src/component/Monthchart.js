import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { openDB } from "../../Database/database"; // Đảm bảo đường dẫn đúng

const screenWidth = Dimensions.get("window").width;

const MonthlyStepsChart = () => {
  const [weeklySteps, setWeeklySteps] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const fetchWeeklySteps = async () => {
      const db = await openDB();
      db.transaction((tx) => {
        tx.executeSql(
          `WITH weeks AS (
              SELECT DISTINCT strftime('%W', day) AS week, strftime('%m', day) AS month
              FROM activity
              WHERE day >= date('now', '-3 months')
          )
          SELECT w.week, w.month, COALESCE(SUM(s.steps), 0) AS total_steps
          FROM weeks w
          LEFT JOIN activity s 
          ON strftime('%W', s.day) = w.week AND strftime('%m', s.day) = w.month
          GROUP BY w.month, w.week
          ORDER BY w.month ASC, w.week ASC;`,
          [],
          (_, result) => {
            console.log("Kết quả trả về:", result);
            // Kiểm tra dữ liệu trả về từ truy vấn
            if (result.rows && result.rows.length > 0) {
              console.log("Dữ liệu truy vấn:", result.rows);
              let fetchedData = [];
              for (let i = 0; i < result.rows.length; i++) {
                fetchedData.push(result.rows.item(i)); // Dùng item để lấy bản ghi
              }

              // Xác định các tháng xuất hiện trong dữ liệu
              const uniqueMonths = [...new Set(fetchedData.map((row) => row.month))];

              // Mảng chứa dữ liệu theo tuần
              let weeklyData = [];
              let dynamicLabels = [];

              uniqueMonths.forEach((month) => {
                // Lấy số tuần của từng tháng
                const monthWeeks = fetchedData.filter((row) => row.month === month);

                monthWeeks.forEach((row, weekIndex) => {
                  weeklyData.push(row.total_steps);
                  // Hiển thị tên tháng chỉ một lần cho mỗi tháng
                  dynamicLabels.push(weekIndex === 0 ? `Tháng ${parseInt(month)}` : "");
                });
              });

              setWeeklySteps(weeklyData);
              setLabels(dynamicLabels);
            } else {
              console.log("Không có dữ liệu trả về hoặc dữ liệu không hợp lệ");
            }
          },
          (_, error) => {
            console.log("Lỗi khi truy vấn:", error);
          }
        );
      });
    };

    fetchWeeklySteps();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thống kê bước chân theo tuần</Text>
      <LineChart
        data={{
          labels: labels, // Gán nhãn động theo từng tháng
          datasets: [{ data: weeklySteps }],
        }}
        width={screenWidth - 40}
        height={220}
        yAxisSuffix=" bước"
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: "6", strokeWidth: "2", stroke: "#0000ff" },
        }}
        bezier
        style={{ marginVertical: 10, borderRadius: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default MonthlyStepsChart;
