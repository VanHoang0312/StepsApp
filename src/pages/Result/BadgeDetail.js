import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import * as Progress from 'react-native-progress';

const BASE_URL = "http://172.20.10.7:3002";

const BadgeDetail = () => {
  const route = useRoute();
  const { badge } = route.params;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: `${BASE_URL}${badge.icon.replace("app/public", "")}` }}
        style={[styles.image, { tintColor: badge.status ? "#FFD700" : "#A0A0A0" }]}
      />
      <Progress.Bar
        progress={badge.progress}
        width={65}
        height={6}
        color="#6C63FF"
        unfilledColor="#DDD"
        borderWidth={0}
        borderRadius={5}
      />
      <Text style={styles.title}>{badge.giftname}</Text>

      <Text style={styles.description}>
        {badge.description || `Đạt được hơn ${badge.targetSteps} bước chân trong một ngày.`}
      </Text>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
    alignItems: "center",
  },
  image: {
    width: 180,
    height: 200,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 12
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginHorizontal: 30,
    //marginBottom: 10,
    marginTop: 10
  },
  progressText: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
});

export default BadgeDetail;
