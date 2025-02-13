import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

function Start({ navigation }) {
  return (
    <>
      <View style={styles.container}>
        <Text>Start Screen</Text>
        <TouchableOpacity style={styles.button}
          onPress={() => navigation.replace('Home')}
        >
          <Text style={styles.text}>Bắt đầu</Text>
        </TouchableOpacity>
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
  },
  button: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5
  },
  text: {
    color: '#fff'
  }
});

export default Start