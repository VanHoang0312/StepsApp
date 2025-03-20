import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { Button, Divider, TextInput } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { createBodyTable, loadBodyFromSQLite, loadLatestBodyFromSQLite, saveBodyToSQLite, assignUserIdToOldBody } from "../../../Database/BodyDatabase";
import { openDB } from "../../../Database/database";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentData } from '../../services/userService';

function Body() {
  const [gender, setGender] = useState("male");
  const [bodysize, setBodysize] = useState(170);
  const [stepLength, setStepLength] = useState(60);
  const [weight, setWeight] = useState(60);
  const [birthYear, setBirthYear] = useState(2000);
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null); 

  const today = new Date().toISOString().split('T')[0];

  // Lấy userId từ AsyncStorage hoặc API
  const getUserId = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const response = await getCurrentData(token);
        if (response && response.message && response.message._id) {
          const newUserId = response.message._id; 
          console.log("✅ UserId body lấy từ API:", newUserId);
          setUserId(newUserId);
          return newUserId;
        }
      }
      console.log("⚠️ Không tìm thấy userId");
      return null;
    } catch (error) {
      console.error("❌ Lỗi khi lấy userId:", error);
      return null;
    }
  };

  const loadBodyData = async (database, currentUserId) => {
    // Tải dữ liệu body hôm nay
    const loadBody = await loadBodyFromSQLite(database, currentUserId, today);
    if (loadBody) {
      setGender(loadBody.gender);
      setBodysize(loadBody.bodysize);
      setStepLength(loadBody.stepLength);
      setWeight(loadBody.weight);
      setBirthYear(loadBody.birthYear);
    } else {
      // Nếu chưa có dữ liệu hôm nay, lấy dữ liệu gần nhất
      const latestBody = await loadLatestBodyFromSQLite(database, currentUserId, today);
      if (latestBody) {
        setGender(latestBody.gender);
        setBodysize(latestBody.bodysize);
        setStepLength(latestBody.stepLength);
        setWeight(latestBody.weight);
        setBirthYear(latestBody.birthYear);
        // Lưu lại dữ liệu đó cho ngày hôm nay với userId
        await saveBodyToSQLite(database, currentUserId, today, latestBody.gender, latestBody.bodysize, latestBody.stepLength, latestBody.weight, latestBody.birthYear);
      } else {
        // Nếu chưa có dữ liệu cũ, dùng giá trị mặc định và lưu vào DB
        await saveBodyToSQLite(database, currentUserId, today, gender, bodysize, stepLength, weight, birthYear);
      }
    }
  }

  // Hàm xóa userId khỏi database khi đăng xuất
  const removeUserIdFromBody = async (database) => {
    try {
      await database.transaction(async (tx) => {
        await tx.executeSql(
          'UPDATE body SET userId = NULL WHERE day = ?',
          [today],
          () => console.log(`Removed userId from body for ${today}`),
          (_, error) => console.error('Error removing userId:', error)
        );
      });
    } catch (error) {
      console.error('Error removing userId from body:', error);
    }
  };


  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB();
        setDb(database);
        await createBodyTable(database);
        const currentUserId = await getUserId(); // Lấy userId khi khởi động
        setUserId(currentUserId)
        await loadBodyData(database, currentUserId)
      } catch (error) {
        console.error('initDB failed:', error);
      }
    };
    initDB();
  }, []);

  const handleSave = () => {
    if (db) {
      saveBodyToSQLite(db, userId, today, gender, bodysize, stepLength, weight, birthYear);
      alert("Dữ liệu đã được lưu!");
    } else {
      console.error("Database not initialized!");
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.subtitle}>
            Số đo cơ thể của bạn là rất quan trọng để có thể theo dõi số bước đi, khoảng cách và calo chính xác.
          </Text>

          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderContainer}>
              <Button mode={gender === "male" ? "contained" : "outlined"} onPress={() => setGender("male")}>
                Nam
              </Button>
              <Button mode={gender === "female" ? "contained" : "outlined"} onPress={() => setGender("female")}>
                Nữ
              </Button>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Cỡ cơ thể (cm)</Text>
            <TextInput mode="outlined" keyboardType="numeric" value={bodysize.toString()} onChangeText={setBodysize} />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Độ dài bước (cm)</Text>
            <TextInput mode="outlined" keyboardType="numeric" value={stepLength.toString()} onChangeText={setStepLength} />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Cân nặng (kg)</Text>
            <TextInput mode="outlined" keyboardType="numeric" value={weight.toString()} onChangeText={setWeight} />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Năm sinh</Text>
            <Picker selectedValue={birthYear} onValueChange={(value) => setBirthYear(value)}>
              {[...Array(100)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return <Picker.Item key={year} label={year.toString()} value={year} />;
              })}
            </Picker>
          </View>

          <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
            Lưu
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9F9F9",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  divider: {
    marginVertical: 10,
  },
  row: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    marginTop: 20,
  },
});

export default Body;