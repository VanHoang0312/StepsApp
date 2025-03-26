import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, Platform, StatusBar, PermissionsAndroid, TouchableOpacity } from 'react-native';
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
import { createTable, saveStepsToSQLite, loadStepsFromSQLite, assignUserIdToOldData, deleteAllActivityData } from "../../../Database/DailyDatabase"
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
  const { userId } = useAuth()
  const today = getTodayDate();
  const navigation = useNavigation();
  const handleDailyhistory = () => navigation.navigate('Lịch sử ngày');

  // Lưu số bước vào SQLite
  const saveSteps = async (updatedSteps, database, bodyData) => {
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
      console.log("⏱️ Thời gian kể từ lần lưu cuối: ", now - lastSavedTime);
      setLastSavedTime(now);
      console.log("💾 Đang lưu dữ liệu vào SQLite với userId", userId);
      await saveStepsToSQLite(database, userId, updatedSteps, updatedDistance, updatedCalories, updatedActiveTime);
    }
  };

  // Hàm theo dõi bước chân
  const subscribe = async (database) => {
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) {
      console.warn("🚫 Cảm biến bước chân không khả dụng!");
      return;
    }

    let savedData = await loadStepsFromSQLite(database, userId, today);
    console.log("✅ Dữ liệu đã lưu từ SQLite:", savedData);
    setStepCount(savedData.steps);
    setCalories(savedData.calories);
    setDistance(savedData.distance);
    setActiveTime(savedData.activeTime);


    let lastSteps = null;
    console.log("⏳ Chờ cảm biến cập nhật...");

    const pedometerSubscription = Pedometer.watchStepCount(async (result) => {
      console.log("👣 Cảm biến đếm:", result.steps);

      if (lastSteps === null) {
        lastSteps = result.steps;
        console.log("🔄 Đồng bộ lastSteps với cảm biến:", lastSteps);
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

          loadBodyFromSQLite(database, userId, today)
            .then((bodyData) => bodyData || loadLatestBodyFromSQLite(database, userId, today))
            .then((bodyData) => {
              console.log("✅ Dữ liệu body được sử dụng:", bodyData || "Mặc định");
              saveSteps(updatedSteps, database, bodyData);
            })
            .catch((error) => console.error("🚨 Lỗi khi tải body:", error));

          return updatedSteps;
        });
      }

      lastSteps = result.steps;
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

  const fetchGoal = async (database) => {
    try {
      if (!database) {
        console.warn("⚠️ Thiếu database hoặc userId, sử dụng giá trị mặc định.");
        setGoalSteps(6000);
        setGoalCalories(200);
        setGoalDistance(3);
        setGoalActiveTime(30);
        return;
      }

      console.log(`🔍 Đang tải mục tiêu với userId: ${userId}, ngày: ${today}`);
      // Load mục tiêu theo userId và ngày hiện tại
      const goal = await loadGoalFromSQLite(database, userId, today);
      if (goal) {
        setGoalSteps(goal.steps || 6000);
        setGoalCalories(goal.calories || 200);
        setGoalDistance(goal.distance || 3);
        setGoalActiveTime(goal.activeTime || 30);
        console.log('✅ Mục tiêu tải từ SQLite:', goal);
      } else {
        console.log('⚠️ Không có mục tiêu cho hôm nay, thử lấy mục tiêu gần nhất...');
        const latestGoal = await loadLatestGoalFromSQLite(database, userId, today);
        if (latestGoal) {
          setGoalSteps(latestGoal.steps || 6000);
          setGoalCalories(latestGoal.calories || 200);
          setGoalDistance(latestGoal.distance || 3);
          setGoalActiveTime(latestGoal.activeTime || 30);
          console.log('✅ Mục tiêu gần nhất tải từ SQLite:', latestGoal);
        } else {
          console.log('⚠️ Không có mục tiêu nào, dùng giá trị mặc định.');
          setGoalSteps(6000);
          setGoalCalories(200);
          setGoalDistance(3);
          setGoalActiveTime(30);
        }
      }
    } catch (error) {
      console.error('🚨 Lỗi khi tải mục tiêu:', error);
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
        await createGoalsTable(database)
        //await deleteAllActivityData(database);
        await fetchGoal(database);
        await subscribe(database);
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
  }, []);

  // Reload dữ liệu khi userId thay đổi (đăng nhập/đăng xuất)
  useEffect(() => {
    if (!db) return;

    const reloadData = async () => {
      console.log("🔄 Reload dữ liệu với userId:", userId);
      if (userId) {
        // Gán userId cho dữ liệu cũ khi đăng nhập
        await assignUserIdToOldData(db, userId);
      } else {
        // Đặt userId về NULL khi đăng xuất
        await db.transaction(async (tx) => {
          await tx.executeSql('UPDATE activity SET userId = NULL WHERE day = ?', [today]);
        });
      }
      // Tải lại dữ liệu sau khi cập nhật userId
      await fetchGoal(db);
      const savedData = await loadStepsFromSQLite(db, userId, today);
      console.log("✅ Dữ liệu đã lưu từ SQLite sau reload:", savedData);
      setStepCount(savedData.steps);
      setCalories(savedData.calories);
      setDistance(savedData.distance);
      setActiveTime(savedData.activeTime);
      if (subscription) {
        subscription.remove();
      }
      await subscribe(db);
    };
    reloadData();
  }, [db, userId]);

  useEffect(() => {
    console.log('Step count updated for UI:', stepCount);
  }, [stepCount]);

  // Cập nhật mục tiêu khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      if (!db) return;
      console.log("🔄 Focus màn hình Dailyactivity với userId:", userId);
      fetchGoal(db);
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