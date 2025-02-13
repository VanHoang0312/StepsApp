import React from "react";
import { Text, StyleSheet, View } from "react-native";


function Login(){
    
    return(
        <>
        <View style = {styles.container}>
        <Text>Trang Đăng nhập</Text>
        </View>
            
        </>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    }
  })

export default Login;