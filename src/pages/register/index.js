import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as user from "../../services/userService"
const Register = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('')
  const [password, setPassword] = useState('');
  // const [age, setAge] = useState('')
  // const [gender, setGender] = useState('')
  // const [weight, setWeight] = useState('')
  // const [height, setHeight] = useState('')

  const handleRegister = async () => {
    // Kiểm tra dữ liệu trước khi đăng ký
    if (!name || !email || !password) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }
    try {
      const result = await user.createUser({ name, email, password });
      if (result) {
        Alert.alert("Thành công", "Đăng ký thành công!", [
          { text: "OK", onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert("Lỗi", result.message || "Đăng ký thất bại, vui lòng thử lại!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi, vui lòng thử lại sau!");
    }

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
      />

      <TextInput
        mode="outlined"
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {/* <TextInput
        mode="outlined"
        label="Tuổi"
        value={age}
        onChangeText={setAge}
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        mode="outlined"
        label="Giới tính"
        value={gender}
        onChangeText={setGender}
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        mode="outlined"
        label="Cân nặng"
        value={weight}
        onChangeText={setWeight}
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        mode="outlined"
        label="Chiều cao"
        value={height}
        onChangeText={setHeight}
        secureTextEntry
        style={styles.input}
      /> */}


      <Button mode="contained" style={styles.registerButton} onPress={handleRegister}>
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
  registerButton: {
    marginTop: 10,
    backgroundColor: '#4A90E2',
  },

});

export default Register;