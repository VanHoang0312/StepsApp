import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { openDB } from "../../../Database/database";
import { loadBodyFromSQLite } from "../../../Database/BodyDatabase";
import { useAuth } from "../../helpers/AuthContext";


function GoalWeight() {
  const [weight, setWeight] = useState(0);
  const [bodysize, setBodysize] = useState(0)
  const [db, setDb] = useState()
  const { userId } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB()
        setDb(database)
        const loadWeight = await loadBodyFromSQLite(database, userId, today)
        setWeight(loadWeight.weight || 0);
        setBodysize(loadWeight.bodysize || 0)
      } catch (error) {
        console.error('initDB failed:', error);
      }
    }
    initDB()
  }, [userId])


  const increaseSteps = () => setWeight((prev) => Math.max(prev + 1, 0));
  const decreaseSteps = () => setWeight((prev) => Math.max(prev - 1, 0));

  // Hàm tính BMI
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return 0;
    return (weight / ((height / 100) ** 2)).toFixed(1);
  };

  const bmiValue = calculateBMI(weight, bodysize);
  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return { status: "Thiếu Cân", color: "#FFA500", range: "< 18.5" };
    if (bmi >= 18.5 && bmi <= 24.9) return { status: "Bình Thường", color: "#57A8FF", range: "18.5 - 24.9" };
    if (bmi >= 25 && bmi <= 29.9) return { status: "Thừa Cân", color: "#FF4500", range: "25 - 29.9" };
    return { status: "Béo Phì", color: "#DC143C", range: "≥ 30" };
  };


  const { status, color, range } = getBMIStatus(bmiValue);

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.header}>Cân Nặng</Text>
          <Text style={styles.subHeader}>Đặt Mục tiêu. Theo Dõi Cân Nặng.</Text>

          {/* Bộ đếm cân nặng */}
          <View style={styles.weightCounter}>
            <TouchableOpacity onPress={decreaseSteps} style={styles.iconButton}>
              <Icon name="remove" size={20} color="#000" />
            </TouchableOpacity>

            <View style={styles.weightDisplay}>
              <Text style={styles.weightUnit}>BMI {bmiValue}</Text>
              <Text style={styles.weightText}>{weight} kg</Text>
            </View>

            <TouchableOpacity onPress={increaseSteps} style={styles.iconButton}>
              <Icon name="add" size={20} color="#000" />
            </TouchableOpacity>
          </View>


          <View style={styles.bmiContainer}>
            <Text style={styles.bmiTitle}>BMI {bmiValue}</Text>


            <View style={[styles.bmiStatus, { backgroundColor: color }]}>
              <Text style={styles.bmiRange}>{range}</Text>
              <Text style={styles.bmiLabel}>{status}</Text>
            </View>

            <Text style={styles.bmiDescription}>
              Chỉ số khối cơ thể (BMI) là một chỉ báo về tỷ lệ mỡ cơ thể của bạn.
              Nó được tính từ chiều cao và cân nặng của bạn, và có thể cho biết liệu bạn thiếu cân, bình thường, thừa cân hay béo phì.
              Nó cũng có thể giúp bạn xác định nguy cơ mắc các bệnh liên quan đến tỷ lệ mỡ cơ thể cao hơn (giữ ở mức xanh nhé 😃).
            </Text>
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
    padding: 16
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 18,
    color: "#6C757D",
    marginBottom: 20,
  },
  weightCounter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    padding: 16,
    width: "100%",
    justifyContent: "space-between",
    marginTop: 15
  },
  iconButton: {
    padding: 10,
    backgroundColor: "#F1F3F5",
    borderRadius: 50,
  },
  weightText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  weightDisplay: {
    alignItems: "center",
  },
  weightUnit: {
    fontSize: 14,
    color: "#A0A0A0",
    fontWeight: "bold",
  },

  bmiContainer: {
    marginTop: 20,
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  bmiTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bmiStatus: {
    backgroundColor: "#57A8FF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  bmiRange: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  bmiLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  bmiDescription: {
    fontSize: 14,
    color: "#6C757D",
    textAlign: "justify",
  },
});

export default GoalWeight;
