import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Dailyactivity from '../../src/pages/Dailyactivity';
import WeeklyHistory from '../../src/pages/Weeklyactivity/WeeklyHistory';


const Stack = createStackNavigator();

function DailyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dailyactivity" component={Dailyactivity} options={{ headerShown: false }} />
      <Stack.Screen name="WeeklyHistory" component={WeeklyHistory} options={{ title: 'Lịch sử tuần' }} />
    </Stack.Navigator>
  );
}

export default DailyStack;
