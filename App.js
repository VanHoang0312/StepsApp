import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabLayout from './app/(tabs)/_layout'; 

export default function App() {
  return (
    <NavigationContainer>
      <TabLayout />
    </NavigationContainer>
  );
}
