import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Setting from '../../src/pages/Setting';
import Login from '../../src/pages/Login';
import Body from '../../src/pages/Body'
import Register from '../../src/pages/register';


const Stack = createStackNavigator();

function SettingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Setting" component={Setting} options={{ title: 'Cài đặt' }} />
      <Stack.Screen name="Login" component={Login} options={{ title: 'Đăng nhập' }} />
      <Stack.Screen name="Register" component={Register} options={{ title: 'Đăng ký' }} />
      <Stack.Screen name='Body' component={Body} options={{ title: 'Số đo cơ thể' }} />
    </Stack.Navigator>
  );
}

export default SettingStack;