import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, Platform, StatusBar, PermissionsAndroid } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CircularProgress from 'react-native-circular-progress-indicator';
import { Bar } from 'react-native-progress';
import CustomSwitch from '../../component/CustomSwitch';
import Weeklyactivity from '../Weeklyactivity';
import Monthlyactivity from '../Monthlyactivity';
import Linechart from '../../component/Linechart';
import { openDB } from '../../../Database/database';
import { createTable, saveStepsToSQLite, loadStepsFromSQLite } from "../../../Database/DailyDatabase"
import { loadGoalFromSQLite, createGoalsTable } from '../../../Database/GoalsDatabase'

// Hàm lấy tên ngày hiện tại
const getDayName = () => {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return days[new Date().getDay()];
};

const Dailyactivity = () => {
  const [stepCount, setStepCount] = useState(0);
  const [activeTime, setActiveTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [dateTab, setDateTab] = useState(1);
  const [subscription, setSubscription] = useState(null);
  const [lastDay, setLastDay] = useState(getDayName());
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const [goalSteps, setGoalSteps] = useState(6000);
  const [goalCalories, setGoalCalories] = useState(200);
  const [goalDistance, setGoalDistance] = useState(3);
  const [goalActiveTime, setGoalActiveTime] = useState(30);
  const [db, setDb] = useState(null);

  // Lưu số bước vào SQLite
  const saveSteps = (updatedSteps, database) => {
    const updatedDistance = (updatedSteps / 1300).toFixed(2);
    const updatedCalories = (updatedDistance * 60).toFixed(2);
    const updatedActiveTime = Math.floor(updatedSteps / 80);

    setDistance(updatedDistance);
    setCalories(updatedCalories);
    setActiveTime(updatedActiveTime);

    const today = getDayName();
    if (today !== lastDay) {
      setStepCount(0);
      setActiveTime(0);
      setDistance(0);
      setCalories(0);
      setLastDay(today);
    } else {
      const now = Date.now();
      if (now - lastSavedTime > 3000) {  // Chỉ lưu sau mỗi 3 giây
        setLastSavedTime(now);
        saveStepsToSQLite(database, updatedSteps, updatedDistance, updatedCalories, updatedActiveTime);
      }
    }
  };


  // Hàm theo dõi bước chân
  const subscribe = async (database) => {
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) {
      console.warn("Cảm biến bước chân không khả dụng!");
      return;
    }
    let savedData = await loadStepsFromSQLite(database);
    if (!savedData) {
      savedData = { steps: 0, calories: 0, distance: 0, activeTime: 0 };
    }
    console.log("Dữ liệu đã lưu từ SQLite:", savedData);
    setStepCount(savedData.steps);
    setCalories(savedData.calories);
    setDistance(savedData.distance);
    setActiveTime(savedData.activeTime);

    let lastSteps = null; // Để `null` ban đầu để kiểm tra cảm biến
    console.log("Chờ cảm biến cập nhật...");

    const pedometerSubscription = Pedometer.watchStepCount((result) => {
      console.log("Cảm biến đếm:", result.steps);

      if (lastSteps === null) {
        // Lần đầu tiên, đồng bộ `lastSteps` với cảm biến
        lastSteps = result.steps;
        console.log("Đồng bộ lastSteps với cảm biến:", lastSteps);
        return;
      }

      if (result.steps < lastSteps) {
        console.warn(" Số bước cảm biến nhỏ hơn lastSteps. Đồng bộ lại!");
        lastSteps = result.steps;
        //setStepCount(lastSteps);
        return;
      }

      const stepsToAdd = result.steps - lastSteps;
      if (stepsToAdd > 0) {
        setStepCount((prev) => {
          const updatedSteps = prev + stepsToAdd;
          console.log(` Đếm thêm: ${stepsToAdd}, Tổng bước: ${updatedSteps}`);

          // Lưu ngay vào SQLite sau khi UI cập nhật
          saveSteps(updatedSteps, database);
          return updatedSteps;
        });
      }

      lastSteps = result.steps; // Cập nhật lastSteps
    });

    setSubscription(pedometerSubscription);
  };


  const requestActivityPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Permission granted");
      } else {
        console.log("Permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const fetchGoal = async (db) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const goal = await loadGoalFromSQLite(db, today);

      if (goal) {
        setGoalSteps(goal.steps ?? 0);
        setGoalCalories(goal.calories ?? 0);
        setGoalDistance(goal.distance ?? 0);
        setGoalActiveTime(goal.activeTime ?? 0);

        console.log('Mục tiêu tải từ SQLite:', goal);
      } else {
        console.log('Không có mục tiêu cho hôm nay.');
      }
    } catch (error) {
      console.error('Lỗi khi tải mục tiêu:', error);
    }
  };


  useEffect(() => {
    const initializeDB = async () => {
      try {
        const database = await openDB();
        setDb(database);
        await createTable(database);
        await createGoalsTable(database)
        loadStepsFromSQLite(database, setStepCount);
        fetchGoal(database);
        subscribe(database);
      } catch (error) {
        console.error('Database initialization failed:', error);
      }
    };

    initializeDB();
    if (Platform.OS === 'android') {
      requestActivityPermission();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);


  useEffect(() => {
    console.log('Step count updated for UI:', stepCount);
  }, [stepCount]);

  useFocusEffect(
    useCallback(() => {
      if (db) {
        fetchGoal(db); // Gọi lại hàm lấy mục tiêu khi màn hình focus
        loadStepsFromSQLite(db, setStepCount);
      }
    }, [db])
  );

  //Cập nhật vòng tròn tiến trình
  useEffect(() => {
    if (goalSteps > 0 && stepCount >= 0) {
      console.log(`Cập nhật tiến trình: ${stepCount}/${goalSteps}`);
    }
  }, [goalSteps, stepCount]);


  const onSelectSwitch = (value) => {
    setDateTab(value);
  };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} >
        <View>
          <CustomSwitch
            selectionMode={1}
            option1="Ngày"
            option2="Tuần"
            option3="Tháng"
            onSelectSwitch={onSelectSwitch}
          />
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {dateTab === 1 && (
            <View>
              <View style={styles.circular}>
                <CircularProgress
                  key={`${stepCount}-${goalSteps}`}
                  value={stepCount}
                  maxValue={goalSteps > 0 ? goalSteps : 1}
                  radius={160}
                  textColor={'#000000'}
                  activeStrokeColor={'#00BFFF'}
                  inActiveStrokeColor={'#B0B0B0'}
                  inActiveStrokeOpacity={0.5}
                  inActiveStrokeWidth={6}
                  activeStrokeWidth={10}
                  title={getDayName()}
                  titleColor={'#A9A9A9'}
                  titleStyle={{
                    fontWeight: 'bold',
                    fontSize: 18,
                  }}
                />
                <Text style={styles.goalText}>Mục tiêu {goalSteps}</Text>
                <FontAwesome5 name="walking" size={24} color="#00BFFF" style={styles.stepIcon} />
              </View>

              <View style={styles.textdesign}>
                <View style={styles.textItem}>
                  <Text style={styles.text}>KHOẢNG CÁCH</Text>
                  <Text style={[styles.text, { fontWeight: 'bold', color: '#000000', fontSize: 20 }]}>
                    {distance} m
                  </Text>
                  <Bar
                    progress={distance / goalDistance}
                    width={90}
                    height={3}
                    color="#00BFFF"
                    unfilledColor="#D3D3D3"
                    borderWidth={0}
                    style={{ marginTop: 4 }}
                  />
                </View>
                <View style={styles.textItem}>
                  <Text style={styles.text}>CALORIES</Text>
                  <Text style={[styles.text, { fontWeight: 'bold', color: '#000000', fontSize: 20 }]}>
                    {calories} kcal
                  </Text>
                  <Bar
                    progress={calories / goalCalories}
                    width={90}
                    height={3}
                    color="#00BFFF"
                    unfilledColor="#D3D3D3"
                    borderWidth={0}
                    style={{ marginTop: 4 }}
                  />
                </View>
                <View style={styles.textItem}>
                  <Text style={styles.text}>THỜI GIAN HOẠT ĐỘNG </Text>
                  <Text style={[styles.text, { fontWeight: 'bold', color: '#000000', fontSize: 20 }]}>
                    {activeTime} phút
                  </Text>
                  <Bar
                    progress={activeTime / goalActiveTime}
                    width={90}
                    height={3}
                    color="#00BFFF"
                    unfilledColor="#D3D3D3"
                    borderWidth={0}
                    style={{ marginTop: 4 }}
                  />
                </View>
              </View>
              <Linechart />
            </View>
          )}

          {dateTab === 2 && <Weeklyactivity />}
          {dateTab === 3 && <Monthlyactivity />}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  circular: {
    marginTop: 20,
    alignItems: 'center',
  },
  textdesign: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 40,
    width: '100%',
  },
  textItem: {
    alignItems: 'center',
  },
  text: {
    color: "#808080",
    fontWeight: "bold",
    fontSize: 12,
  },
  // safeArea: {
  //   paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  // },
  goalText: {
    position: 'absolute',
    top: '72%',
    fontSize: 12,
    color: '#A9A9A9',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  stepIcon: {
    position: 'absolute',
    top: '19%',
    fontSize: 35,
  },
});

export default Dailyactivity;