import React, { useState } from "react";
import { View, Text, Switch, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const Notification = () => {
  const [goals, setGoals] = useState({
    steps: true,
    calories: false,
    distance: false,
    time: false,
  });

  const [moreOptions, setMoreOptions] = useState({
    weeklyReport: true,
    weeklyProgress: true,
  });

  const toggleGoal = (key) => {
    setGoals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleMoreOption = (key) => {
    setMoreOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Đã hoàn thành mục tiêu</Text>
      {Object.keys(goals).map((key) => (
        <View style={styles.row} key={key}>
          <View style={styles.labelContainer}>
            <Icon
              name={
                key === "steps"
                  ? "walk-outline"
                  : key === "calories"
                    ? "flame-outline"
                    : key === "distance"
                      ? "map-outline"
                      : "time-outline"
              }
              size={20}
              color="#555"
              style={styles.icon}
            />
            <Text style={styles.label}>
              {key === "steps"
                ? "Bước"
                : key === "calories"
                  ? "Calo"
                  : key === "distance"
                    ? "Khoảng cách"
                    : "Thời gian"}
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={goals[key] ? "#81b0ff" : "#f4f3f4"}
            onValueChange={() => toggleGoal(key)}
            value={goals[key]}
          />
        </View>
      ))}

      <Text style={styles.header}>Thêm nữa</Text>
      {Object.keys(moreOptions).map((key) => (
        <View style={styles.row} key={key}>
          <View style={styles.labelContainer}>
            <Icon
              name={
                key === "weeklyReport"
                  ? "document-text-outline"
                  : "stats-chart-outline"
              }
              size={20}
              color="#555"
              style={styles.icon}
            />
            <Text style={styles.label}>
              {key === "weeklyReport"
                ? "Báo cáo theo Tuần"
                : "Tiến độ Hàng tuần"}
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={moreOptions[key] ? "#81b0ff" : "#f4f3f4"}
            onValueChange={() => toggleMoreOption(key)}
            value={moreOptions[key]}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    color: "#555",
  },
});

export default Notification;