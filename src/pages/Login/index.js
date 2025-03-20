import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as user from "../../services/userService";
import { useDispatch } from "react-redux";
import { checkLogin } from "../../action/login"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from '../../helpers/AuthContext';


const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
      return;
    }
    setLoading(true);
    try {
      const result = await user.login({ name, email, password });
      console.log("hh", result)
      if (result) {
        await AsyncStorage.setItem("token", result?.token); // Lưu userId vào AsyncStorage
        console.log("Token:", result?.token)
        dispatch(checkLogin(true));

        Alert.alert("Thành công", "Đăng nhập thành công!", [
          { text: "OK", onPress: () => navigation.navigate("Setting") },
        ]);
      } else {
        Alert.alert("Lỗi", result?.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối đến server. Vui lòng thử lại!");
      console.error("Login error:", error);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : null}
    >

      <TextInput
        mode="outlined"
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        mode="outlined"
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        mode="outlined"
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button mode="contained" style={styles.loginButton} onPress={handleLogin} loading={loading}>
        Đăng nhập
      </Button>

      <Text style={styles.orText}>hoặc</Text>

      <Button mode="contained" onPress={() => navigation.navigate('Register')}>
        Đăng kí
      </Button>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginTop: 30
  },
  input: {
    marginBottom: 10,
  },
  loginButton: {
    marginTop: 10,
    backgroundColor: '#4A90E2',
  },
  orText: {
    alignSelf: 'center',
    marginVertical: 10,
  },
});

export default Login;
