import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Switch } from 'react-native';
import SwitchGoal from '../../component/SwitchGoal';
import GoalWeight from './GoalWeight';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { openDB } from '../../../Database/database';
import { saveGoalToSQLite, loadGoalFromSQLite, createGoalsTable, loadLatestGoalFromSQLite, assignUserIdToOldGoals, deleteAllGoals } from '../../../Database/GoalsDatabase';
import { useAuth } from '../../helpers/AuthContext';

function Goal() {
  const [goalTab, setGoalTab] = useState(1);
  const [steps, setSteps] = useState(6000);
  const [calories, setCalories] = useState(200);
  const [distance, setDistance] = useState(3);
  const [activeTime, setActiveTime] = useState(30);
  const [isEnabled, setIsEnabled] = useState(false);
  const [db, setDb] = useState(null);
  const { userId } = useAuth();

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const navigation = useNavigation();
 

  const handleNotificationPress = () => navigation.navigate('Thông báo');
  const handleSpo2Press = () => navigation.navigate('SPO2');

  const today = new Date().toISOString().split('T')[0];

  // Hàm xóa toàn bộ dữ liệu
  // const handleDeleteAllGoals = async () => {
  //   try {
  //     if (db) {
  //       await deleteAllGoals(db);
  //       // Reset state về giá trị mặc định sau khi xóa
  //       setSteps(6000);
  //       setCalories(200);
  //       setDistance(3);
  //       setActiveTime(30);
  //     }
  //   } catch (error) {
  //     console.error('Error deleting all goals:', error);
  //   }
  // };

  // Hàm lưu mục tiêu với userId
  const saveGoal = async (updatedSteps, updatedDistance, updatedCalories, updatedActiveTime) => {
    try {
      const database = await openDB();
      if (!database) {
        console.error('Database not initialized!');
        return;
      }

      await saveGoalToSQLite(database, userId, today, updatedSteps, updatedDistance, updatedCalories, updatedActiveTime);
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const loadGoalData = async (database, currentUserId) => {
    const savedGoal = await loadGoalFromSQLite(database, currentUserId, today);
    if (savedGoal) {
      setSteps(savedGoal.steps);
      setCalories(savedGoal.calories);
      setDistance(savedGoal.distance);
      setActiveTime(savedGoal.activeTime);
    } else {
      const latestGoal = await loadLatestGoalFromSQLite(database, currentUserId, today);
      if (latestGoal) {
        setSteps(latestGoal.steps);
        setCalories(latestGoal.calories);
        setDistance(latestGoal.distance);
        setActiveTime(latestGoal.activeTime);
        await saveGoalToSQLite(database, currentUserId, today, latestGoal.steps, latestGoal.distance, latestGoal.calories, latestGoal.activeTime);
      } else {
        await saveGoalToSQLite(database, currentUserId, today, steps, distance, calories, activeTime);
      }
    }
  };

  // Khởi tạo database
  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB();
        setDb(database);
        await createGoalsTable(database);
        await loadGoalData(database, userId);
      } catch (error) {
        console.error('initDB failed:', error);
      }
    };
    initDB();
  }, []);

  // Lắng nghe thay đổi userId để reload dữ liệu
  useEffect(() => {
    if (db) {
      const reloadData = async () => {
        if (userId) {
          await assignUserIdToOldGoals(db, userId);
        } else {
          await db.transaction(async (tx) => {
            await tx.executeSql('UPDATE goals SET userId = NULL WHERE day = ?', [today]);
          });
        }
        await loadGoalData(db, userId);
      };
      reloadData();
    }
  }, [userId, db]);

  useEffect(() => {
    if (db) {
      saveGoal(steps, distance, calories, activeTime);
    }
  }, [steps, distance, calories, activeTime, db]);

  const increaseSteps = () => setSteps((prev) => Math.max(prev + 500, 0));
  const decreaseSteps = () => setSteps((prev) => Math.max(prev - 500, 0));

  const increaseCalo = () => setCalories((prev) => Math.max(prev + 100, 0));
  const decreaseCalo = () => setCalories((prev) => Math.max(prev - 100, 0));

  const increaseKilomet = () => setDistance((prev) => Math.max(prev + 1, 0));
  const decreaseKilomet = () => setDistance((prev) => Math.max(prev - 1, 0));

  const increaseMinutes = () => setActiveTime((prev) => Math.max(prev + 30, 0));
  const decreaseMinutes = () => setActiveTime((prev) => Math.max(prev - 30, 0));

  const onSelectSwitch = (value) => setGoalTab(value);

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={{ alignItems: 'center' }}>
          <SwitchGoal
            selectionMode={1}
            option1="Mục tiêu"
            option2="Cân nặng"
            onSelectSwitch={onSelectSwitch}
          />
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {goalTab === 1 && (
            <View style={{ padding: 16 }}>
              <Text style={styles.header}>Mục tiêu</Text>
              <Text style={styles.subHeader}>Đặt Mục tiêu. Đếm Bước chân. Đốt.</Text>

              <View style={styles.stepCounter}>
                <TouchableOpacity onPress={decreaseSteps} style={styles.iconButton}>
                  <Icon name="remove" size={20} color="#000" />
                </TouchableOpacity>
                <View style={styles.stepDisplay}>
                  <Text style={styles.stepText}>{steps.toLocaleString("vi-VN")}</Text>
                  <Text style={styles.stepUnit}>Bước</Text>
                </View>
                <TouchableOpacity onPress={increaseSteps} style={styles.iconButton}>
                  <Icon name="add" size={20} color="#000" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.notification} onPress={handleNotificationPress}>
                <Icon name="notifications" size={25} color="#007BFF" />
                <Text style={styles.notificationText}>Thông báo</Text>
                <Icon name="chevron-right" size={25} color="#6C757D" style={styles.arrowIcon} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.Spo2} onPress={handleSpo2Press}>
                <Icon name="favorite" size={25} color="#007BFF" />
                <Text style={styles.notificationText}>SPO2</Text>
                <Icon name="chevron-right" size={25} color="#6C757D" style={styles.arrowIcon} />
              </TouchableOpacity>

              <View style={styles.moreGoalsContainer}>
                <View style={styles.moreGoalsHeader}>
                  <Icon name="star" size={25} color="#007BFF" />
                  <Text style={styles.moreGoalsText}>Nhiều mục tiêu hơn</Text>
                  <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isEnabled ? "#81b0ff" : "#f4f3f4"}
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                  />
                </View>
                {isEnabled && (
                  <View style={styles.extraGoals}>
                    <View style={styles.stepCounter}>
                      <TouchableOpacity onPress={decreaseCalo} style={styles.iconButton}>
                        <Icon name="remove" size={20} color="#000" />
                      </TouchableOpacity>
                      <View style={styles.stepDisplay}>
                        <Text style={styles.stepText}>{calories.toLocaleString("vi-VN")}</Text>
                        <Text style={styles.stepUnit}>Kcal</Text>
                      </View>
                      <TouchableOpacity onPress={increaseCalo} style={styles.iconButton}>
                        <Icon name="add" size={20} color="#000" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.stepCounter}>
                      <TouchableOpacity onPress={decreaseKilomet} style={styles.iconButton}>
                        <Icon name="remove" size={20} color="#000" />
                      </TouchableOpacity>
                      <View style={styles.stepDisplay}>
                        <Text style={styles.stepText}>{distance.toLocaleString("vi-VN")}</Text>
                        <Text style={styles.stepUnit}>Km</Text>
                      </View>
                      <TouchableOpacity onPress={increaseKilomet} style={styles.iconButton}>
                        <Icon name="add" size={20} color="#000" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.stepCounter}>
                      <TouchableOpacity onPress={decreaseMinutes} style={styles.iconButton}>
                        <Icon name="remove" size={20} color="#000" />
                      </TouchableOpacity>
                      <View style={styles.stepDisplay}>
                        <Text style={styles.stepText}>{activeTime.toLocaleString("vi-VN")}</Text>
                        <Text style={styles.stepUnit}>Phút</Text>
                      </View>
                      <TouchableOpacity onPress={increaseMinutes} style={styles.iconButton}>
                        <Icon name="add" size={20} color="#000" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
              {/* <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAllGoals}>
                <Text style={styles.deleteButtonText}>Xóa toàn bộ mục tiêu</Text>
              </TouchableOpacity> */}
            </View>
          )}
          {goalTab === 2 && <GoalWeight />}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  stepCounter: {
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
  stepDisplay: {
    alignItems: "center",
  },
  stepText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  stepUnit: {
    fontSize: 14,
    color: "#6C757D",
  },
  notification: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    justifyContent: "space-between"
  },
  Spo2: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
    justifyContent: "space-between"
  },
  notificationText: {
    fontSize: 18,
    marginLeft: 8,
    color: "#000",
    flex: 1,
  },
  arrowIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  moreGoalsContainer: {
    marginTop: 20,
  },
  moreGoalsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  moreGoalsText: {
    fontSize: 18,
    marginLeft: 8,
    color: "#000",
    flex: 1,
  },
  extraGoals: {
    marginTop: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 10,
  },
});

export default Goal;