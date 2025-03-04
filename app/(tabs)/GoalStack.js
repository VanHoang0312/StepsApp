import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Goal from '../../src/pages/Goal/index';
import Notification from '../../src/pages/Goal/Notification'

const Stack = createStackNavigator();

export default function GoalStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="GoalMain" component={Goal} options={{ headerShown: false }} />
      <Stack.Screen name="Thông báo" component={Notification} />
    </Stack.Navigator>
  );
}
