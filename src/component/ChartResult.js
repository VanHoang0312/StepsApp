import React, { useState, useEffect } from "react";
import { View, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { openDB } from "../../Database/database";
import { createTable, loadStepsFromSQLite } from "../../Database/DailyDatabase";
import { useAuth } from "../helpers/AuthContext";

const screenWidth = Dimensions.get("window").width;

const StepComparisonChart = ({ average }) => {
  const [labels, setLabels] = useState(["0:00", "", "00:00"]);
  const [dataSteps, setDataSteps] = useState([0, 0, 0]);
  const today = new Date().toISOString().split("T")[0];
  const { userId } = useAuth()

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const db = await openDB();
        await createTable(db);
        const loadData = await loadStepsFromSQLite(db, userId, today);
        const steps = loadData?.steps ?? 0;

        const now = new Date();
        const currentTimeLabel = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        setLabels(["0:00", currentTimeLabel, "00:00"]);
        setDataSteps([0, steps, 0]);
      } catch (error) {
        setDataSteps([0, 0, 0]);
      }
    };

    fetchSteps();
    const interval = setInterval(fetchSteps, 60000); // Cập nhật mỗi phút
    return () => clearInterval(interval); // Clear khi unmount
  }, []);

  const averageSteps = [0, average, 0]; // Số bước trung bình thường ngày
  const lineColor = dataSteps[1] >= average ? "rgba(75, 192, 192, 1)" : "rgba(255, 99, 132, 1)"; // Xanh nếu đạt, đỏ nếu không

  const data = {
    labels,
    datasets: [
      {
        data: dataSteps, // Hôm nay
        color: (opacity = 1) => lineColor,
        strokeWidth: 3,
      },
      {
        data: averageSteps, // Thường ngày
        color: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`, // Xám
        strokeWidth: 2,
        strokeDashArray: [5, 5],
      },
    ],
  };

  return (
    <View style={{ alignItems: "center", marginRight: 20 }}>
      <LineChart
        data={data}
        width={screenWidth - 60}
        height={240}
        bezier
        withDots
        withShadow={true}
        withInnerLines={false}
        withOuterLines={true}
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#fff",
          },
        }}
        style={{ borderRadius: 16 }}
        withHorizontalLabels={true}
        fromZero
      />
    </View>
  );
};

export default StepComparisonChart;
