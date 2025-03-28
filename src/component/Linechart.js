import React, { useEffect, useState } from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { openDB } from '../../Database/database';


const Linechart = ({ userId, db }) => {
  const defaultWeekDays = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const [weeklySteps, setWeeklySteps] = useState(new Array(7).fill(0));
  const [rotatedLabels, setRotatedLabels] = useState(defaultWeekDays);

  const loadWeeklyStepsFromSQLite = async () => {
    try {
      //const db = await openDB(); // Mở database
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
            const dataMap = new Map(days.map(d => [d, 0])); // Map mặc định 0 bước

            // Điền dữ liệu từ DB vào Map
            for (let i = 0; i < results.rows.length; i++) {
              const row = results.rows.item(i);
              dataMap.set(row.day, row.steps);
            }

            // Chuyển Map về mảng dữ liệu đúng thứ tự
            const sortedData = Array.from(dataMap.values());

            // Gán nhãn ngày thực tế (để khớp với dữ liệu)
            const sortedLabels = days.map(date => {
              const d = new Date(date);
              return defaultWeekDays[d.getDay()]; // Lấy tên thứ tương ứng
            });

            setWeeklySteps(sortedData);
            setRotatedLabels(sortedLabels);
          },
          (tx, error) => console.error('Error fetching steps data:', error)
        );
      });
    } catch (error) {
      console.error('Error loading steps from SQLite:', error);
    }
  };


  useEffect(() => {
    if (db && userId) {
      loadWeeklyStepsFromSQLite(db);
    }
  }, [db, userId]); // Tải lại khi db hoặc userId thay đổi

  return (
    <View style={{ marginTop: 40 }}>
      <LineChart
        data={{
          labels: rotatedLabels,
          datasets: [
            {
              data: weeklySteps,
              color: (opacity = 1) => `rgba(0, 191, 255, ${opacity})`,
              strokeWidth: 4,
            },
          ],
        }}
        width={Dimensions.get("window").width}
        height={220}
        yAxisInterval={1}
        yAxisSuffix=" bước"
        withShadow={true}
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
    </View>
  );
};

export default Linechart;
