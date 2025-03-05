import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Goal from '../../src/pages/Goal/index';
import Notification from '../../src/pages/Goal/Notification'
import Spo2 from '../../src/pages/Spo2';

const Stack = createStackNavigator();

export default function GoalStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="GoalMain" component={Goal} options={{ headerShown: false }} />
      <Stack.Screen name="Thông báo" component={Notification} />
      <Stack.Screen name="SPO2" component={Spo2} />
    </Stack.Navigator>
  );
}
