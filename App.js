// import React, { useEffect } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import TabLayout from './app/(tabs)/_layout';
// import { registerBackgroundTask } from './Chayngam/backgroundTask';
// import allReducer from './src/reducers/index'
// import { createStore } from 'redux';
// import { Provider } from 'react-redux';
// import { AuthProvider } from './src/helpers/AuthContext';
// //import * as SplashScreen from 'expo-splash-screen';

// const store = createStore(allReducer)

// //SplashScreen.hideAsync();
// export default function App() {
//   useEffect(() => {
//     registerBackgroundTask()

//   }, [])
//   return (
//     <Provider store={store}>
//       <AuthProvider>
//         <NavigationContainer>
//           <TabLayout />
//         </NavigationContainer>
//       </AuthProvider>
//     </Provider>

//   );
// }

import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View } from 'react-native'; // Thêm View để dùng trong onLayout
import TabLayout from './app/(tabs)/_layout';
import { registerBackgroundTask } from './Chayngam/backgroundTask';
import allReducer from './src/reducers/index';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { AuthProvider } from './src/helpers/AuthContext';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

// Tùy chọn animation cho splash screen (tùy chọn)
SplashScreen.setOptions({
  duration: 5000, // Thời gian animation (ms)
  fade: true,     // Hiệu ứng mờ dần
});

const store = createStore(allReducer);

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await registerBackgroundTask();

      } catch (e) {
        console.warn('Error during app preparation:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {

      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <Provider store={store}>
      <AuthProvider>
        <View
          style={{ flex: 1 }}
          onLayout={onLayoutRootView}
        >
          <NavigationContainer>
            <TabLayout />
          </NavigationContainer>
        </View>
      </AuthProvider>
    </Provider>
  );
}