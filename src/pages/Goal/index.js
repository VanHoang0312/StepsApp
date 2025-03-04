import React, { useState, useEffect } from 'react';
import { Button, View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, ScrollView, Switch } from 'react-native';
import SwitchGoal from '../../component/SwitchGoal';
import GoalWeight from './GoalWeight';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { openDB } from '../../../Database/database';
import { saveGoalToSQLite, loadGoalFromSQLite, createGoalsTable, loadLatestGoalFromSQLite } from '../../../Database/GoalsDatabase';

function Goal() {
  const [goalTab, setGoalTab] = useState(1);
  const [steps, setSteps] = useState(6000);
  const [calories, setCalories] = useState(200);
  const [distance, setDistance] = useState(3);
  const [activeTime, setActiveTime] = useState(30)
  const [isEnabled, setIsEnabled] = useState(false);
  const [db, setDb] = useState(null);

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const navigation = useNavigation();

  const handleNotificationPress = () => {
    navigation.navigate('Thông báo');
  };

  const today = new Date().toISOString().split('T')[0];

  const saveGoal = async (updatedSteps, updatedDistance, updatedCalories, updatedActiveTime) => {
    try {
      const database = await openDB();
      if (!database) {
        console.error('Database not initialized!');
        return;
      }
      await saveGoalToSQLite(database, today, updatedSteps, updatedDistance, updatedCalories, updatedActiveTime);

    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB();
        setDb(database);
        await createGoalsTable(database);

        const savedGoal = await loadGoalFromSQLite(database, today);

        if (savedGoal) {
          setSteps(savedGoal.steps);
          setCalories(savedGoal.calories);
          setDistance(savedGoal.distance);
          setActiveTime(savedGoal.activeTime);
        } else {
          // Nếu chưa có mục tiêu hôm nay, lấy mục tiêu gần nhất
          const latestGoal = await loadLatestGoalFromSQLite(database, today);

          if (latestGoal) {
            setSteps(latestGoal.steps);
            setCalories(latestGoal.calories);
            setDistance(latestGoal.distance);
            setActiveTime(latestGoal.activeTime);

            // Lưu lại mục tiêu đó cho ngày hôm nay
            await saveGoalToSQLite(database, today, latestGoal.steps, latestGoal.distance, latestGoal.calories, latestGoal.activeTime);
          } else {
            // Nếu chưa có dữ liệu cũ, dùng giá trị mặc định và lưu vào DB
            await saveGoalToSQLite(database, today, steps, distance, calories, activeTime);
          }
        }
      } catch (error) {
        console.error('initDB failed:', error);
      }
    };

    initDB();
  }, []);

  useEffect(() => {
    if (db) {
      saveGoal(steps, distance, calories, activeTime); // Tự động lưu khi các giá trị thay đổi
    }
  }, [steps, distance, calories, activeTime]);

  const increaseSteps = () => setSteps((prev) => Math.max(prev + 500, 0));
  const decreaseSteps = () => setSteps((prev) => Math.max(prev - 500, 0));

  const increaseCalo = () => setCalories((prev) => Math.max(prev + 100, 0));
  const decreaseCalo = () => setCalories((prev) => Math.max(prev - 100, 0));

  const increaseKilomet = () => setDistance((prev) => Math.max(prev + 1, 0));
  const decreaseKilomet = () => setDistance((prev) => Math.max(prev - 1, 0));

  const increaseMinutes = () => setActiveTime((prev) => Math.max(prev + 30, 0));
  const decreaseMinutes = () => setActiveTime((prev) => Math.max(prev - 30, 0));


  const onSelectSwitch = (value) => {
    setGoalTab(value)
  }
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={{ alignItems: 'center' }} >
          <SwitchGoal
            selectionMode={1}
            option1="Mục tiêu"
            option2="Cân nặng"
            onSelectSwitch={onSelectSwitch}
          />
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}>
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


              <TouchableOpacity
                style={styles.notification}
                onPress={handleNotificationPress}
              >
                <Icon name="notifications" size={25} color="#007BFF" />
                <Text style={styles.notificationText}>Thông báo</Text>
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
            </View>
          )}

          {goalTab === 2 && <GoalWeight />}

        </ScrollView>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // safeArea: {
  //   paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  // },
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
  goalItem: {
    fontSize: 16,
    color: "#6C757D",
    marginBottom: 8,
  },
})

export default Goal;