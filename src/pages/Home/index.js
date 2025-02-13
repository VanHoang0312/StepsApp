import React from 'react';
import { Button, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Goal from '../Goal';
import Workout from '../Workout';
import Dailyactivity from '../Dailyactivity';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Setting from '../Setting';
import Result from '../Result';


const Tab = createBottomTabNavigator();

function Home() {
  return (
    <>
      <Tab.Navigator
        initialRouteName='Bước'
        screenOptions={{
          tabBarActiveTintColor: '#00BFFF', // Màu biểu tượng khi được chọn
          tabBarInactiveTintColor: '#8e8e93', // Màu biểu tượng khi không được chọn
          tabBarStyle: {
            backgroundColor: '#F0F0F0',
          },
        }}
      >
        <Tab.Screen name='Tập thể dục' component={Workout} options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name='map' size={size} color={color} />
          )
        }} />

        <Tab.Screen name='Mục tiêu' component={Goal} options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name='flag' size={size} color={color} />
          )
        }} />

        <Tab.Screen name='Bước' component={Dailyactivity} options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.floatingIcon, focused && styles.focusedIcon]}>
              <Icon name='directions-walk' size={30} color={color} />
            </View>
          )
        }} />

        <Tab.Screen name='Kết quả' component={Result} options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name='assessment' size={size} color={color} />
          )
        }} />

        <Tab.Screen name='Cài đặt' component={Setting} options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name='settings' size={size} color={color} />
          )
        }} />
      </Tab.Navigator>

    </>
  )
}

const styles = StyleSheet.create({
  floatingIcon: {
    width: 50,
    height: 50,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30, // Tạo khoảng cách cho tab nhô lên
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2, // Bóng trên Android
  },
  focusedIcon: {
    backgroundColor: '#FFFAFA', // Đổi màu khi được chọn
  },
});



export default Home;