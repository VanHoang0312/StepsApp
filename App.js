import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabLayout from './app/(tabs)/_layout';
import { registerBackgroundTask } from './Chayngam/backgroundTask';
import allReducer from './src/reducers/index'
import { createStore } from 'redux';
import { Provider } from 'react-redux';

const store = createStore(allReducer)

export default function App() {
  useEffect(() => {
    registerBackgroundTask()
  }, [])
  return (
    <Provider store={store}>
      <NavigationContainer>
        <TabLayout />
      </NavigationContainer>
    </Provider>

  );
}
