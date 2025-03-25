import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabLayout from './app/(tabs)/_layout';
import { registerBackgroundTask } from './Chayngam/backgroundTask';
import allReducer from './src/reducers/index'
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { AuthProvider } from './src/helpers/AuthContext';


const store = createStore(allReducer)

export default function App() {
  useEffect(() => {
    registerBackgroundTask()
  }, [])
  return (
    <Provider store={store}>
      <AuthProvider>
        <NavigationContainer>
          <TabLayout />
        </NavigationContainer>
      </AuthProvider>
    </Provider>

  );
}


// import React, { useEffect } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import TabLayout from './app/(tabs)/_layout';
// import { registerBackgroundTask } from './Chayngam/backgroundTask';
// import allReducer from './src/reducers/index';
// import { createStore, applyMiddleware } from 'redux';
// import { Provider, useDispatch } from 'react-redux';
// import thunk from 'redux-thunk'; // Thêm middleware để xử lý async actions
// import { AuthProvider, useAuth } from './src/helpers/AuthContext';
// import { checkLogin, loadBodyData } from './src/actions/index'; // Import actions

// const store = createStore(allReducer, applyMiddleware(thunk));

// // Component bọc để theo dõi userId và reload dữ liệu
// function AppContent() {
//   const { userId, loading } = useAuth();
//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (!loading) { // Đợi AuthContext kiểm tra token xong
//       console.log("🔄 UserId changed:", userId);
//       dispatch(checkLogin(!!userId)); // Cập nhật trạng thái đăng nhập trong Redux
//       dispatch(loadBodyData(userId)); // Reload dữ liệu Body
//       // Thêm các dispatch khác nếu cần reload dữ liệu cho các màn hình khác
//     }
//   }, [userId, loading, dispatch]);

//   useEffect(() => {
//     registerBackgroundTask();
//   }, []);

//   return (
//     <NavigationContainer>
//       <TabLayout />
//     </NavigationContainer>
//   );
// }

// export default function App() {
//   return (
//     <Provider store={store}>
//       <AuthProvider>
//         <AppContent />
//       </AuthProvider>
//     </Provider>
//   );
// }
