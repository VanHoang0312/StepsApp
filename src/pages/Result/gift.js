import React from "react";
import { Text, View, StyleSheet, SafeAreaView, ScrollView } from "react-native";


function Gift() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View >
          <Text style={styles.title}>Phần thưởng</Text>
          <Text style={styles.subtitle}>Đếm Bước. Kiếm Phần thưởng.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#8C8C8C",
    marginBottom: 20,
  },
})

export default Gift;