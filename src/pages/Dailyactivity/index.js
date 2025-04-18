import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, Platform, StatusBar, PermissionsAndroid, TouchableOpacity, RefreshControl } from 'react-native';
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
import { createTable, saveStepsToSQLite, loadStepsFromSQLite, assignUserIdToOldData, deleteAllActivityData, deleteLatestActivityData } from "../../../Database/DailyDatabase"
import { loadGoalFromSQLite, createGoalsTable, loadLatestGoalFromSQLite } from '../../../Database/GoalsDatabase'
import { loadBodyFromSQLite, loadLatestBodyFromSQLite } from '../../../Database/BodyDatabase';
import { useAuth } from '../../helpers/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Hàm lấy tên ngày hiện tại
const getDayName = () => {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return days[new Date().getDay()];
};
// Hàm lấy định dạng ngày YYYY-MM-DD
const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
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
  const [refreshing, setRefreshing] = useState(false);
  const { userId } = useAuth()
  const today = getTodayDate();
  const navigation = useNavigation();
  const [chartKey, setChartKey] = useState(0);
  const handleDailyhistory = () => navigation.navigate('Lịch sử ngày');

  const reloadChart = () => {
    setChartKey(prev => prev + 1); 
  };
  // Hàm làm mới dữ liệu
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (db) {
        await fetchGoal(db);
        const savedData = await loadStepsFromSQLite(db, userId, today);
        setStepCount(savedData.steps);
        setCalories(savedData.calories);
        setDistance(savedData.distance);
        setActiveTime(savedData.activeTime);
        reloadChart();
      }
    } catch (error) {
      console.error("Lỗi khi làm mới dữ liệu:", error);
    } finally {
      setRefreshing(false);
    }
  };


  // Lưu số bước vào SQLite
  const saveSteps = async (updatedSteps, database, bodyData, userIdFromContext) => {
    const { stepLength = 60, weight = 60 } = bodyData || {};

    const updatedDistance = ((updatedSteps * stepLength) / 100000).toFixed(2); // km
    const updatedCalories = (updatedDistance * weight * 0.75).toFixed(2); // kcal
    const updatedActiveTime = Math.floor(updatedSteps / 100); // phút

    setDistance(updatedDistance);
    setCalories(updatedCalories);
    setActiveTime(updatedActiveTime);

    const currentDay = getDayName();
    if (currentDay !== lastDay) {
      setStepCount(0);
      setActiveTime(0);
      setDistance(0);
      setCalories(0);
      setLastDay(currentDay);
    } else {
      const now = Date.now();
      setLastSavedTime(now);
      await saveStepsToSQLite(database, userIdFromContext, updatedSteps, updatedDistance, updatedCalories, updatedActiveTime);
    }
  };

  // Hàm theo dõi bước chân
  const subscribe = async (database, currentUserId) => {
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) {
      return;
    }

    let savedData = await loadStepsFromSQLite(database, currentUserId, today);
    console.log("✅ Dữ liệu đã lưu từ SQLite:", savedData);
    setStepCount(savedData.steps);
    setCalories(savedData.calories);
    setDistance(savedData.distance);
    setActiveTime(savedData.activeTime);

    let lastSteps = savedData.steps; // Khởi tạo từ dữ liệu đã lưu
    let isFirstReading = true; // Cờ để bỏ qua lần đọc đầu tiên từ cảm biến
    console.log("⏳ Chờ cảm biến cập nhật...");

    if (subscription) {
      subscription.remove();
    }

    const pedometerSubscription = Pedometer.watchStepCount(async (result) => {
      console.log("👣 Cảm biến đếm:", result.steps);

    
      if (isFirstReading) {
        
        lastSteps = result.steps;
        isFirstReading = false;
        console.log("🔄 Đồng bộ lastSteps với cảm biến ban đầu:", lastSteps);
        return;
      }

      if (result.steps < lastSteps) {
        console.warn("⚠️ Số bước cảm biến nhỏ hơn lastSteps. Đồng bộ lại!");
        lastSteps = result.steps;
        return;
      }

      const stepsToAdd = result.steps - lastSteps;
      if (stepsToAdd > 0) {
        setStepCount((prev) => {
          const updatedSteps = prev + stepsToAdd;
          console.log(`📊 Đếm thêm: ${stepsToAdd}, Tổng bước: ${updatedSteps}`);

          loadBodyFromSQLite(database, currentUserId, today)
            .then((bodyData) => bodyData || loadLatestBodyFromSQLite(database, currentUserId, today))
            .then((bodyData) => {
              console.log("✅ Dữ liệu body được sử dụng:", bodyData || "Mặc định");
              saveSteps(updatedSteps, database, bodyData, currentUserId); // Truyền userId hiện tại
            })
            .catch((error) => console.error("🚨 Lỗi khi tải body:", error));

          return updatedSteps;
        });
        lastSteps = result.steps;
      }
    });

    setSubscription(pedometerSubscription);
  };


  const requestActivityPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        
      } else {
        console.log("Permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const fetchGoal = async (database) => {
    try {
      if (!database) {
        setGoalSteps(6000);
        setGoalCalories(200);
        setGoalDistance(3);
        setGoalActiveTime(30);
        return;
      }
      // Load mục tiêu theo userId và ngày hiện tại
      const goal = await loadGoalFromSQLite(database, userId, today);
      if (goal) {
        setGoalSteps(goal.steps || 6000);
        setGoalCalories(goal.calories || 200);
        setGoalDistance(goal.distance || 3);
        setGoalActiveTime(goal.activeTime || 30);
      } else {
        const latestGoal = await loadLatestGoalFromSQLite(database, userId, today);
        if (latestGoal) {
          setGoalSteps(latestGoal.steps || 6000);
          setGoalCalories(latestGoal.calories || 200);
          setGoalDistance(latestGoal.distance || 3);
          setGoalActiveTime(latestGoal.activeTime || 30);
        } else {
          setGoalSteps(6000);
          setGoalCalories(200);
          setGoalDistance(3);
          setGoalActiveTime(30);
        }
      }
    } catch (error) {
      setGoalSteps(6000);
      setGoalCalories(200);
      setGoalDistance(3);
      setGoalActiveTime(30);
    }
  };

  useEffect(() => {
    const initializeDB = async () => {
      try {
        const database = await openDB();
        setDb(database);
        await createTable(database);
        await createGoalsTable(database);
        await fetchGoal(database);
        if (userId) { 
          await subscribe(database, userId);
        }
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
        setSubscription(null);
      }
    };
  }, [userId]);

  // Reload dữ liệu khi userId thay đổi (đăng nhập/đăng xuất)
  useEffect(() => {
    if (!db) return;

    const reloadData = async () => {
      
      if (userId) {
        await assignUserIdToOldData(db, userId);
        const savedData = await loadStepsFromSQLite(db, userId, today);
        setStepCount(savedData.steps);
        setCalories(savedData.calories);
        setDistance(savedData.distance);
        setActiveTime(savedData.activeTime);
      } else {
        await db.transaction(async (tx) => {
          await tx.executeSql(
            'UPDATE activity SET userId = NULL WHERE day != ? AND userId IS NOT NULL',
            [today]
          );
        });
      }
      await fetchGoal(db);
    };
    reloadData();
  }, [db, userId]);

  // useEffect(() => {
  //   console.log('Step count updated for UI:', stepCount);
  // }, [stepCount]);

  // Cập nhật mục tiêu khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      if (!db) return;
      fetchGoal(db);
      //reloadChart();
    }, [db, userId])
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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#00BFFF"]} // Màu của vòng xoay khi làm mới
              tintColor="#00BFFF" // Màu trên iOS
            />
          }
        >
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
              <TouchableOpacity
                style={styles.historyButton}
                onPress={handleDailyhistory} // Chuyển đến màn hình lịch sử
              >
                <FontAwesome5 name="history" size={24} color="#00BFFF" />
                <Text style={styles.historyButtonText}>Lịch sử</Text>
              </TouchableOpacity>

              <View style={styles.textdesign}>
                <View style={styles.textItem}>
                  <Text style={styles.text}>KHOẢNG CÁCH</Text>
                  <Text style={[styles.text, { fontWeight: 'bold', color: '#000000', fontSize: 20 }]}>
                    {distance} km
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
              <Linechart userId={userId} db={db} key={chartKey} reloadChart={reloadChart} />
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
    marginTop: 15,
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

  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    justifyContent: "center"
  },
  historyButtonText: {
    marginLeft: 5,
    color: '#00BFFF',
    fontWeight: 'bold',
  },
});

export default Dailyactivity;