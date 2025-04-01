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

// Giữ splash screen hiển thị trong khi ứng dụng đang tải
SplashScreen.preventAutoHideAsync();

// Tùy chọn animation cho splash screen (tùy chọn)
SplashScreen.setOptions({
  duration: 1000, // Thời gian animation (ms)
  fade: true,     // Hiệu ứng mờ dần
});

const store = createStore(allReducer);

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Thực hiện các tác vụ khởi tạo
        await registerBackgroundTask(); // Giả sử đây là promise, nếu không thì bỏ await
        // Bạn có thể thêm các tác vụ khác như tải font, API calls, v.v.
        // Ví dụ: await Font.loadAsync({...});

        // Tạm trì hoãn 2 giây để mô phỏng quá trình tải (có thể xóa nếu không cần)
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn('Error during app preparation:', e);
      } finally {
        // Đánh dấu ứng dụng đã sẵn sàng
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      // Ẩn splash screen khi root view đã render xong
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // Nếu ứng dụng chưa sẵn sàng, không render gì cả
  if (!appIsReady) {
    return null;
  }

  // Render giao diện chính khi đã sẵn sàng
  return (
    <Provider store={store}>
      <AuthProvider>
        <View
          style={{ flex: 1 }} // Đảm bảo View bao quanh toàn bộ nội dung
          onLayout={onLayoutRootView} // Gắn sự kiện onLayout
        >
          <NavigationContainer>
            <TabLayout />
          </NavigationContainer>
        </View>
      </AuthProvider>
    </Provider>
  );
}