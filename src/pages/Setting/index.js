import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, SafeAreaView, ScrollView, Switch, TouchableOpacity, Button } from "react-native";
import { Avatar, Text, List, RadioButton } from 'react-native-paper';
import { openDB } from "../../../Database/database";
import { getAllGoalsData } from "../../../Database/GoalsDatabase";
import { getAllActivityData } from "../../../Database/DailyDatabase"
import { getAllbodyData } from "../../../Database/BodyDatabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentData } from "../../services/userService";
import { useDispatch } from "react-redux";
import { checkLogin } from "../../action/login";

function Setting() {
  const [theme, setTheme] = useState('light');
  const [iconColor, setIconColor] = useState('#00BFFF');
  const [isIconTinted, setIsIconTinted] = useState(false);
  const [userName, setUserName] = useState(null);
  const navigation = useNavigation()
  const dispatch = useDispatch()


  const handleLogData = async () => {
    const db = await openDB();
    await getAllActivityData(db);
  };
  const handleLogDataGoals = async () => {
    const db = await openDB();
    await getAllGoalsData(db);
  };

  const handleLogDataBody = async () => {
    const db = await openDB();
    await getAllbodyData(db)
  }

  const getUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const response = await getCurrentData(token);
        if (response?.message?.name) {
          setUserName(response.message.name);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getUserInfo();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token"); // Xóa token đăng nhập
      setUserName(null);
      dispatch(checkLogin(false))
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView style={{ flex: 1, backgroundColor: '#F8F8F8', padding: 10 }}>
          {/* Account Section */}
          <List.Section>
            <List.Subheader>Account</List.Subheader>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#FFF', borderRadius: 10 }}
              onPress={() => !userName && navigation.navigate('Login')} // Nếu đã đăng nhập, không chuyển hướng
            >
              <Avatar.Text size={50} style={{ backgroundColor: '#E57373' }} />
              <View style={{ marginLeft: 15 }}>
                <Text variant="titleMedium">
                  {userName ? userName : "Create Free Account"} {/* Hiển thị tên hoặc 'Create Free Account' */}
                </Text>
                {!userName && <Text variant="bodySmall" style={{ color: 'gray' }}>or Sign-In</Text>}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                marginTop: 10,
                backgroundColor: "#0000FF",
                padding: 10,
                borderRadius: 10,
                alignItems: "center",
              }}
              onPress={handleLogout}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Đăng xuất</Text>
            </TouchableOpacity>
          </List.Section>


          {/* Theme Selection */}
          <List.Section>
            <List.Subheader>Giao diện</List.Subheader>
            <View style={{ backgroundColor: '#FFF', padding: 10, borderRadius: 10 }}>
              <RadioButton.Group onValueChange={setTheme} value={theme}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <RadioButton.Item label="Hệ thống" value="system" />
                  <RadioButton.Item label="Tối" value="dark" />
                  <RadioButton.Item label="Sáng" value="light" />
                </View>
              </RadioButton.Group>

              {/* Icon Color Selection */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                {['red', 'orange', 'green', '#00BFFF', 'purple', 'pink'].map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={{
                      width: 30, height: 30, borderRadius: 15, backgroundColor: color,
                      borderWidth: iconColor === color ? 3 : 0, borderColor: 'black'
                    }}
                    onPress={() => setIconColor(color)}
                  />
                ))}
              </View>

              {/* Toggle Icon Tint */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                <Text>Nhuộm màu Biểu tượng Ứng dụng</Text>
                <Switch value={isIconTinted} onValueChange={setIsIconTinted} />
              </View>
            </View>
          </List.Section>

          {/* General Settings */}
          <List.Section>
            <List.Subheader>Chung</List.Subheader>
            <TouchableOpacity onPress={() => navigation.navigate('Body')} >
              <List.Item title="Số đo cơ thể" left={() => <List.Icon icon="human-male-height" color={iconColor} />} />
            </TouchableOpacity>
            <TouchableOpacity>
              <List.Item title="Chung" left={() => <List.Icon icon="tune" color={iconColor} />} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Mục tiêu', { screen: 'Thông báo' })} >
              <List.Item title="Thông báo" left={() => <List.Icon icon="bell-outline" color={iconColor} />} />
            </TouchableOpacity>
          </List.Section>


        </ScrollView>
      </SafeAreaView>

      <View>
        <Button title="Hiển thị dữ liệu SQLite activity" onPress={handleLogData} />
      </View>
      <View>
        <Button title="Hiển thị dữ liệu SQLite goals" onPress={handleLogDataGoals} />
      </View>
      <View>
        <Button title="Hiển thị dữ liệu SQLite body" onPress={handleLogDataBody} />
      </View>
    </>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
  },

})

export default Setting;