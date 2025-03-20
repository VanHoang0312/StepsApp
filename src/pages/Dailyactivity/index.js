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
import { createTable, saveStepsToSQLite, loadStepsFromSQLite, assignUserIdToOldData } from "../../../Database/DailyDatabase"
import { loadGoalFromSQLite, createGoalsTable, loadLatestGoalFromSQLite } from '../../../Database/GoalsDatabase'
import { loadBodyFromSQLite, loadLatestBodyFromSQLite } from '../../../Database/BodyDatabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentData } from '../../services/userService';

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
  const [userId, setUserId] = useState(null);

  // Lưu số bước vào SQLite
  // const saveSteps = (updatedSteps, database) => {
  //   const updatedDistance = (updatedSteps / 1300).toFixed(2);
  //   const updatedCalories = (updatedDistance * 60).toFixed(2);
  //   const updatedActiveTime = Math.floor(updatedSteps / 80);

  //   setDistance(updatedDistance);
  //   setCalories(updatedCalories);
  //   setActiveTime(updatedActiveTime);

  //   const today = getDayName();
  //   if (today !== lastDay) {
  //     setStepCount(0);
  //     setActiveTime(0);
  //     setDistance(0);
  //     setCalories(0);
  //     setLastDay(today);
  //   } else {
  //     const now = Date.now();
  //     if (now - lastSavedTime > 3000) {  // Chỉ lưu sau mỗi 3 giây
  //       setLastSavedTime(now);
  //       saveStepsToSQLite(database, updatedSteps, updatedDistance, updatedCalories, updatedActiveTime);
  //     }
  //   }
  // };

  const saveSteps = (updatedSteps, database, bodyData) => {
    if (!bodyData) {
      console.error("Body data is missing!");
      return;
    }
    const { stepLength, weight } = bodyData;

    // Tính toán lại giá trị chính xác
    const updatedDistance = ((updatedSteps * stepLength) / 100000).toFixed(2); // km
    const updatedCalories = (updatedDistance * weight * 0.75).toFixed(2); // kcal
    const updatedActiveTime = Math.floor(updatedSteps / 100); // phút

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
      if (now - lastSavedTime > 3000) { // Chỉ lưu sau mỗi 3 giây
        setLastSavedTime(now);
        saveStepsToSQLite(database, userId, updatedSteps, updatedDistance, updatedCalories, updatedActiveTime);
      }
    }
  };

  const getUserId = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const response = await getCurrentData(token);
        if (response && response.message && response.message._id) {
          const newUserId = response.message._id; // "67c7cc4ad8af9d25b88924f7"
          console.log("✅ UserId lấy từ API:", newUserId);
          setUserId(newUserId);
          if (db) {
            await assignUserIdToOldData(db, newUserId); // Gắn userId vào dữ liệu cũ
          }
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

  // Hàm theo dõi bước chân
  // const subscribe = async (database) => {
  //   const isAvailable = await Pedometer.isAvailableAsync();
  //   if (!isAvailable) {
  //     console.warn("Cảm biến bước chân không khả dụng!");
  //     return;
  //   }
  //   let savedData = await loadStepsFromSQLite(database);
  //   if (!savedData) {
  //     savedData = { steps: 0, calories: 0, distance: 0, activeTime: 0 };
  //   }
  //   console.log("Dữ liệu đã lưu từ SQLite:", savedData);
  //   setStepCount(savedData.steps);
  //   setCalories(savedData.calories);
  //   setDistance(savedData.distance);
  //   setActiveTime(savedData.activeTime);

  //   let lastSteps = null; // Để `null` ban đầu để kiểm tra cảm biến
  //   console.log("Chờ cảm biến cập nhật...");

  //   const pedometerSubscription = Pedometer.watchStepCount((result) => {
  //     console.log("Cảm biến đếm:", result.steps);

  //     if (lastSteps === null) {
  //       // Lần đầu tiên, đồng bộ `lastSteps` với cảm biến
  //       lastSteps = result.steps;
  //       console.log("Đồng bộ lastSteps với cảm biến:", lastSteps);
  //       return;
  //     }

  //     if (result.steps < lastSteps) {
  //       console.warn(" Số bước cảm biến nhỏ hơn lastSteps. Đồng bộ lại!");
  //       lastSteps = result.steps;
  //       return;
  //     }

  //     const stepsToAdd = result.steps - lastSteps;
  //     if (stepsToAdd > 0) {
  //       setStepCount((prev) => {
  //         const updatedSteps = prev + stepsToAdd;
  //         console.log(` Đếm thêm: ${stepsToAdd}, Tổng bước: ${updatedSteps}`);

  //         loadBodyFromSQLite(database, getDayName()).then((bodyData) => {
  //           console.log("📅 Tên ngày lấy được:", getDayName());
  //           if (bodyData) {
  //             saveSteps(updatedSteps, database, bodyData);
  //           } else {
  //             console.error("Không thể tải dữ liệu body!");
  //           }
  //         });
  //         // Lưu ngay vào SQLite sau khi UI cập nhật
  //         //saveSteps(updatedSteps, database);
  //         return updatedSteps;
  //       });
  //     }

  //     lastSteps = result.steps; // Cập nhật lastSteps
  //   });

  //   setSubscription(pedometerSubscription);
  // };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Trả về 'YYYY-MM-DD'
  };

  const subscribe = async (database) => {
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) {
      console.warn("🚫 Cảm biến bước chân không khả dụng!");
      return;
    }

    let savedData = await loadStepsFromSQLite(database);
    if (!savedData) {
      savedData = { steps: 0, calories: 0, distance: 0, activeTime: 0 };
    }
    console.log("✅ Dữ liệu đã lưu từ SQLite:", savedData);

    setStepCount(savedData.steps);
    setCalories(savedData.calories);
    setDistance(savedData.distance);
    setActiveTime(savedData.activeTime);
    setUserId(savedData.userId);

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

          const today = getTodayDate();
          console.log("📅 Ngày hiện tại:", today);

          loadBodyFromSQLite(database, userId, today)
            .then((bodyData) => {
              if (!bodyData) {
                console.warn(`⚠️ Không có dữ liệu cho ${today}, thử lấy dữ liệu gần nhất...`);
                return loadLatestBodyFromSQLite(database, userId, today);
              }
              return bodyData;
            })
            .then((bodyData) => {
              if (bodyData) {
                console.log("✅ Dữ liệu body được sử dụng:", bodyData);
                saveSteps(updatedSteps, database, bodyData);
              } else {
                console.error("❌ Không thể tải dữ liệu body!");
              }
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

  // const fetchGoal = async (db) => {
  //   try {
  //     const today = new Date().toISOString().split('T')[0];
  //     const goal = await loadGoalFromSQLite(db, today);

  //     if (goal) {
  //       setGoalSteps(goal.steps ?? 0);
  //       setGoalCalories(goal.calories ?? 0);
  //       setGoalDistance(goal.distance ?? 0);
  //       setGoalActiveTime(goal.activeTime ?? 0);

  //       console.log('Mục tiêu tải từ SQLite:', goal);
  //     } else {
  //       console.log('Không có mục tiêu cho hôm nay.');
  //     }

  //   } catch (error) {
  //     console.error('Lỗi khi tải mục tiêu:', error);
  //   }
  // };

  const fetchGoal = async (database, currentUserId) => {
    try {
      if (!database || !currentUserId) {
        console.warn("⚠️ Thiếu database hoặc userId, sử dụng giá trị mặc định.");
        setGoalSteps(6000);
        setGoalCalories(200);
        setGoalDistance(3);
        setGoalActiveTime(30);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      console.log("📅 Ngày load mục tiêu:", today, "với userId:", currentUserId);

      // Load mục tiêu theo userId và ngày hiện tại
      const goal = await loadGoalFromSQLite(database, currentUserId, today);

      if (goal) {
        setGoalSteps(goal.steps ?? 6000);
        setGoalCalories(goal.calories ?? 200);
        setGoalDistance(goal.distance ?? 3);
        setGoalActiveTime(goal.activeTime ?? 30);
        console.log('✅ Mục tiêu tải từ SQLite:', goal);
      } else {
        console.log('⚠️ Không có mục tiêu cho hôm nay, thử lấy mục tiêu gần nhất...');
        const latestGoal = await loadLatestGoalFromSQLite(database, currentUserId, today);
        if (latestGoal) {
          setGoalSteps(latestGoal.steps ?? 6000);
          setGoalCalories(latestGoal.calories ?? 200);
          setGoalDistance(latestGoal.distance ?? 3);
          setGoalActiveTime(latestGoal.activeTime ?? 30);
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
      // Fallback về giá trị mặc định nếu có lỗi
      setGoalSteps(6000);
      setGoalCalories(200);
      setGoalDistance(3);
      setGoalActiveTime(30);
    }
  };

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token"); // Lấy token từ AsyncStorage
      if (token) {
        const response = await getCurrentData(token)
        if (response) {
          console.log("respoense:", response)
        }
        console.log("✅ Token lấy được:", token);
      } else {
        console.log("Không tìm thấy token trong AsyncStorage");
      }
      return token; // Trả về token nếu cần dùng ở nơi khác
    } catch (error) {
      console.error("Lỗi khi lấy token:", error);
      return null;
    }
  };

  getToken();


  // const getAllStorageData = async () => {
  //   try {
  //     const keys = await AsyncStorage.getAllKeys(); // Lấy tất cả các key
  //     if (keys.length === 0) {
  //       console.log("AsyncStorage is empty");
  //       return;
  //     }

  //     const stores = await AsyncStorage.multiGet(keys); // Lấy tất cả các giá trị tương ứng
  //     const storageData = stores.map(([key, value]) => ({ key, value })); // Chuyển thành mảng đối tượng

  //     console.log("🔹 Tất cả dữ liệu trong AsyncStorage:", storageData);
  //   } catch (error) {
  //     console.error("Lỗi khi lấy dữ liệu từ AsyncStorage:", error);
  //   }
  // };

  // // Gọi hàm để kiểm tra dữ liệu
  // getAllStorageData();


  useEffect(() => {
    const initializeDB = async () => {
      try {
        const database = await openDB();
        setDb(database);
        await createTable(database);
        await createGoalsTable(database)

        const currentUserId = await getUserId();
        if (currentUserId) {
          setUserId(currentUserId); // Cập nhật state userId
          await fetchGoal(database, currentUserId);
          await subscribe(database);
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
      }
    };
  }, []);


  useEffect(() => {
    console.log('Step count updated for UI:', stepCount);
  }, [stepCount]);

  useFocusEffect(
    useCallback(() => {
      if (db && userId) {
        fetchGoal(db, userId); // Truyền cả db và userId
        loadStepsFromSQLite(db, userId).then((data) => {
          if (data) {
            setStepCount(data.steps);
            setCalories(data.calories);
            setDistance(data.distance);
            setActiveTime(data.activeTime);
          }
        });
      } else {
        console.warn("⚠️ Chưa có db hoặc userId khi focus, bỏ qua fetchGoal.");
      }
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