import React, { useEffect, useState } from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { openDB } from '../../Database/database'; 


const Linechart = () => {
  const defaultWeekDays = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const [weeklySteps, setWeeklySteps] = useState(new Array(7).fill(0));
  const [rotatedLabels, setRotatedLabels] = useState(defaultWeekDays);

  const loadWeeklyStepsFromSQLite = async () => {
    try {
      const db = await openDB(); // Mở database
      const today = new Date();
      const days = [];

      // Lấy dữ liệu của 7 ngày gần nhất
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dayString = date.toISOString().split('T')[0]; // YYYY-MM-DD
        days.push(dayString);
      }

      db.transaction((tx) => {
        tx.executeSql(
          `SELECT day, steps FROM activity WHERE day IN (?, ?, ?, ?, ?, ?, ?) ORDER BY day ASC`,
          days,
          (_, results) => {
            const data = new Array(7).fill(0); // Mặc định 0 bước
            for (let i = 0; i < results.rows.length; i++) {
              const row = results.rows.item(i);
              const index = days.indexOf(row.day);
              if (index !== -1) {
                data[index] = row.steps; // Gán số bước tương ứng
              }
            }

            // Xoay dữ liệu theo ngày hiện tại
            const todayIndex = today.getDay();
            const rotatedData = [...data.slice(todayIndex + 1), ...data.slice(0, todayIndex + 1)];
            const rotatedDays = [...defaultWeekDays.slice(todayIndex + 1), ...defaultWeekDays.slice(0, todayIndex + 1)];

            setWeeklySteps(rotatedData);
            setRotatedLabels(rotatedDays);
          },
          (tx, error) => console.error('Error fetching steps data:', error)
        );
      });
    } catch (error) {
      console.error('Error loading steps from SQLite:', error);
    }
  };

  useEffect(() => {
    loadWeeklyStepsFromSQLite();
  }, []);

  return (
    <View style={{ marginTop: 30 }}>
      <LineChart
        data={{
          labels: rotatedLabels,
          datasets: [
            {
              data: weeklySteps,
              color: (opacity = 1) => `rgba(0, 191, 255, ${opacity})`,
              strokeWidth: 2,
            },
          ],
        }}
        width={Dimensions.get("window").width - 20}
        height={220}
        yAxisInterval={1}
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
        withHorizontalLabels={false}
        withDots={true}
      />
    </View>
  );
};

export default Linechart;
