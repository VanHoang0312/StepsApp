import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, ScrollView, StatusBar, RefreshControl } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { openDB } from '../../../Database/database';
import {
  getAllActivityData,
} from '../../../Database/DailyDatabase';
import {
  getAllGoalsData,
} from '../../../Database/GoalsDatabase';
import { useAuth } from '../../helpers/AuthContext';

function Workout() {
  const [notifications, setNotifications] = useState([]); // Mảng lưu thông báo
  const [db, setDb] = useState(null); // Kết nối database
  const [activitySum, setActivitySum] = useState({ steps: 0, calories: 0, distance: 0, activeTime: 0 }); // Tổng hoạt động
  const [goalSum, setGoalSum] = useState({ steps: 6000, calories: 300, distance: 5, activeTime: 30 }); // Mục tiêu hiện tại
  const [refreshing, setRefreshing] = useState(false); // Trạng thái làm mới
  const { userId } = useAuth();

  // Hàm tính số tuần trong năm
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Hàm lấy ngày đầu tuần (Thứ Hai)
  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Điều chỉnh về Thứ Hai
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  };

  // Hàm tính tổng dữ liệu tuần từ Thứ Hai đến ngày hiện tại (hoặc Thứ Tư nếu giữa tuần)
  const getWeeklyActivitySum = async (db, userId, startDate, endDate) => {
    try {
      const allActivity = await getAllActivityData(db);
      console.log("🔍 All activity data:", allActivity); // Debug toàn bộ dữ liệu
      const weeklyData = allActivity.filter(
        (item) => item.day >= startDate && item.day <= endDate && (item.userId === userId || item.userId === null)
      );
      console.log(`🔍 Filtered activity từ ${startDate} đến ${endDate}:`, weeklyData); // Debug dữ liệu lọc

      const total = weeklyData.reduce(
        (sum, item) => ({
          steps: sum.steps + (item.steps || 0),
          calories: sum.calories + (item.calories || 0),
          distance: sum.distance + (item.distance || 0),
          activeTime: sum.activeTime + (item.activeTime || 0),
        }),
        { steps: 0, calories: 0, distance: 0, activeTime: 0 }
      );

      console.log(`🔍 Tổng dữ liệu từ ${startDate} đến ${endDate}:`, total);
      return total;
    } catch (error) {
      console.error("Error calculating weekly activity sum:", error);
      return { steps: 0, calories: 0, distance: 0, activeTime: 0 };
    }
  };

  // Hàm lấy mục tiêu hiện tại (ngày hôm nay)
  const getCurrentGoal = async (db, userId, currentDate) => {
    try {
      const allGoals = await getAllGoalsData(db);
      console.log("🎯 All goals data:", allGoals); // Debug toàn bộ mục tiêu
      const currentGoal = allGoals.find(
        (item) => item.day === currentDate && (item.userId === userId || item.userId === null)
      );
      console.log(`🎯 Mục tiêu ngày ${currentDate}:`, currentGoal); // Debug mục tiêu hôm nay

      if (!currentGoal) {
        console.log("🎯 Không có mục tiêu hôm nay, dùng mặc định");
        return { steps: 6000, calories: 300, distance: 5, activeTime: 30 }; // Mặc định
      }

      return {
        steps: currentGoal.steps || 6000,
        calories: currentGoal.calories || 300,
        distance: currentGoal.distance || 5,
        activeTime: currentGoal.activeTime || 30,
      };
    } catch (error) {
      console.error("Error fetching current goal:", error);
      return { steps: 6000, calories: 300, distance: 5, activeTime: 30 };
    }
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Hàm kiểm tra ngày và cập nhật thông báo
  const checkDayAndNotify = async () => {
    if (!db) {
      console.log("⏳ Chưa có db, bỏ qua checkDayAndNotify");
      return;
    }

    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekNumber = getWeekNumber(today);
    const todayStr = today.toISOString().split('T')[0];
    const mondayStr = getMonday(today);

    // Lấy tuần đã lưu từ AsyncStorage
    const storedWeek = await AsyncStorage.getItem('currentWeek');
    const parsedStoredWeek = storedWeek ? parseInt(storedWeek, 10) : null;

    let newNotifications = [...notifications];

    // Tính tổng hoạt động và lấy mục tiêu hiện tại
    let endDate = todayStr;
    if (dayOfWeek === 3) {
      // Giữa tuần: Chỉ lấy từ Thứ Hai đến Thứ Tư
      const wednesday = new Date(today);
      wednesday.setDate(today.getDate() - (dayOfWeek - 3));
      endDate = wednesday.toISOString().split('T')[0];
    }
    const activityTotal = await getWeeklyActivitySum(db, userId, mondayStr, endDate);
    const currentGoal = await getCurrentGoal(db, userId, todayStr);

    // Cập nhật state trước khi xử lý thông báo
    setActivitySum(activityTotal);
    setGoalSum(currentGoal);

    // Nếu tuần mới và có thông báo mới, xóa thông báo cũ ngay lập tức
    if (parsedStoredWeek !== weekNumber && (dayOfWeek === 3 || dayOfWeek === 6 || dayOfWeek === 0)) {
      newNotifications = []; // Xóa tất cả thông báo cũ
      await AsyncStorage.setItem('currentWeek', weekNumber.toString());
      console.log("📅 Tuần mới bắt đầu, xóa thông báo cũ và cập nhật tuần:", weekNumber);
    }

    // Thêm thông báo mới dựa trên ngày
    if (dayOfWeek === 3) { // Thứ Tư - giữa tuần
      const title = "Thông báo giữa tuần";
      const message = `Đã giữa tuần rồi! Bạn đạt ${Math.round((activityTotal.steps / currentGoal.steps) * 100)}% mục tiêu. Cố lên nhé!`;
      if (!newNotifications.some(notif => notif.title === title)) {
        newNotifications.push({ title, message });
      }
    } else if (dayOfWeek === 6 || dayOfWeek === 0) { // Thứ Bảy hoặc Chủ Nhật - cuối tuần
      const title = "Thông báo cuối tuần";
      const message = `Cuối tuần rồi (${formatDate(todayStr)})! Bạn đạt ${Math.round((activityTotal.steps / currentGoal.steps) * 100)}% mục tiêu. Nghỉ ngơi hoặc tăng tốc nào!`;
      if (!newNotifications.some(notif => notif.title === title)) {
        newNotifications.push({ title, message });
      }
    }

    setNotifications(newNotifications);
    console.log("📅 Kiểm tra ngày:", todayStr, "Tuần:", weekNumber, "Thông báo hiện tại:", newNotifications);
    console.log("🔍 Tổng hoạt động tuần:", activityTotal);
    console.log("🎯 Mục tiêu hiện tại:", currentGoal);
  };

  // Hàm làm mới dữ liệu
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (db) {
        await checkDayAndNotify(); // Tái sử dụng hàm để làm mới dữ liệu
        console.log("✅ Dữ liệu đã được làm mới");
      }
    } catch (error) {
      console.error("🚨 Lỗi khi làm mới dữ liệu:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Khởi tạo database khi mount
  useEffect(() => {
    const initializeDB = async () => {
      const database = await openDB();
      console.log("🔗 Đã mở database:", database ? "Có" : "Không");
      setDb(database);
    };
    initializeDB();
  }, []);

  // Chạy checkDayAndNotify khi db thay đổi
  useEffect(() => {
    if (db) {
      checkDayAndNotify();
    }
  }, [db]);

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.card}>
            {/* Hiển thị tất cả thông báo trong card */}
            {notifications.length > 0 && (
              <View style={styles.notificationContainer}>
                {notifications.map((notif, index) => (
                  <View key={index} style={styles.notificationItem}>
                    <Text style={styles.notificationTitle}>{notif.title}</Text>
                    <Text style={styles.notificationMessage}>{notif.message}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.statList}>
              <View style={styles.statRow}>
                <Icon name="walk-outline" size={20} color="#000" />
                <Text style={styles.statText}>{activitySum.steps} bước</Text>
                <Text style={[styles.percent, activitySum.steps >= goalSum.steps ? styles.percentGreen : styles.percentRed]}>
                  {Math.round((activitySum.steps / goalSum.steps) * 100)}%
                </Text>
              </View>
              <View style={styles.statRow}>
                <Icon name="flame-outline" size={20} color="#000" />
                <Text style={styles.statText}>{activitySum.calories} kcal</Text>
                <Text style={[styles.percent, activitySum.calories >= goalSum.calories ? styles.percentGreen : styles.percentRed]}>
                  {Math.round((activitySum.calories / goalSum.calories) * 100)}%
                </Text>
              </View>
              <View style={styles.statRow}>
                <Icon name="navigate-outline" size={20} color="#000" />
                <Text style={styles.statText}>{activitySum.distance} km</Text>
                <Text style={[styles.percent, activitySum.distance >= goalSum.distance ? styles.percentGreen : styles.percentRed]}>
                  {Math.round((activitySum.distance / goalSum.distance) * 100)}%
                </Text>
              </View>
              <View style={styles.statRow}>
                <Icon name="time-outline" size={20} color="#000" />
                <Text style={styles.statText}>{activitySum.activeTime} phút</Text>
                <Text style={[styles.percent, activitySum.activeTime >= goalSum.activeTime ? styles.percentGreen : styles.percentRed]}>
                  {Math.round((activitySum.activeTime / goalSum.activeTime) * 100)}%
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 16,
  },
  notificationContainer: {
    marginBottom: 16,
  },
  notificationItem: {
    backgroundColor: '#E6F3FF',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  statList: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statText: {
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
  },
  percent: {
    fontSize: 14,
  },
  percentRed: {
    color: 'red',
  },
  percentGreen: {
    color: 'green',
  },
});

export default Workout;