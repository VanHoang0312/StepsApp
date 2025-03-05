import React from "react";
import { View, Text, SafeAreaView, ScrollView, StyleSheet } from "react-native";


function Spo2() {
  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View>
            <Text>Đo nồng độ Oxi trong máu</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
  },

})

export default Spo2;