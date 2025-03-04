import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, View, SafeAreaView, ScrollView, Switch, TouchableOpacity, Button } from "react-native";
import { Avatar, Text, List, RadioButton } from 'react-native-paper';
import { openDB } from "../../../Database/database";
import { getAllGoalsData } from "../../../Database/GoalsDatabase";
import { getAllActivityData } from "../../../Database/DailyDatabase"
import { getAllbodyData } from "../../../Database/BodyDatabase";

function Setting() {
  const [theme, setTheme] = useState('light');
  const [iconColor, setIconColor] = useState('#00BFFF');
  const [isIconTinted, setIsIconTinted] = useState(false);
  const navigation = useNavigation()
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

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView style={{ flex: 1, backgroundColor: '#F8F8F8', padding: 10 }}>
          {/* Account Section */}
          <List.Section>
            <List.Subheader>Account</List.Subheader>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#FFF', borderRadius: 10 }}
              onPress={() => navigation.navigate('Login')}
            >
              <Avatar.Text size={50} style={{ backgroundColor: '#E57373' }} />
              <View style={{ marginLeft: 15 }}>
                <Text variant="titleMedium">Create Free Account</Text>
                <Text variant="bodySmall" style={{ color: 'gray' }}>or Sign-In</Text>
              </View>
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