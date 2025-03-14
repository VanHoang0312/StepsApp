import React from "react";
import { Text, View, StyleSheet, SafeAreaView, ScrollView, FlatList } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5';
import * as Progress from 'react-native-progress';

const badges = [
  { id: '1', title: '5k Bước', icon: 'shoe-prints', progress: 0.3 },
  { id: '2', title: 'Đạt được Mục tiêu', icon: 'star', progress: 0.5 },
  { id: '3', title: '10k Bước', icon: 'shoe-prints', progress: 0.8 },
  { id: '4', title: 'Mục tiêu 200%', icon: 'bullseye', progress: 0.2 },
  { id: '5', title: '20k Bước', icon: 'shoe-prints', progress: 0.1 },
  { id: '6', title: 'Mục tiêu 300%', icon: 'star-of-life', progress: 0.2 },
];

const BadgeItem = ({ item }) => (
  <View style={styles.badgeContainer}>
    <Icon name={item.icon} size={40} color="#D3D3D3" />
    <Text style={styles.badgeText}>{item.title}</Text>
    <Progress.Bar
      progress={item.progress}
      width={80}
      height={5}
      color="#6C63FF"
      unfilledColor="#DDD"
      borderWidth={0}
      borderRadius={5}
    />
  </View>
);

function Gift() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Phần thưởng</Text>
      <Text style={styles.subtitle}>Đếm Bước. Nhận Huy hiệu.</Text>
      <Text style={styles.subtitle1}>Đang thực hiện</Text>
      <FlatList
        data={badges}
        renderItem={({ item }) => <BadgeItem item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
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
    fontSize: 18,
    color: "#8C8C8C",
    marginBottom: 20,
  },
  listContainer: {
    alignItems: 'center',
  },
  badgeContainer: {
    alignItems: 'center',
    margin: 20,
  },
  badgeText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 5,
  },
  subtitle1: {
    marginTop: 20,
    color: "#909090",
    fontWeight: 'bold'
  }
});

export default Gift;