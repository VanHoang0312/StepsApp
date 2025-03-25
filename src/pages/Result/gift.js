import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, SafeAreaView, FlatList, Image } from "react-native";
import * as Progress from 'react-native-progress';
import { useNavigation } from "@react-navigation/native";
import { getGiftbyId } from "../../services/giftService";
import { useAuth } from "../../helpers/AuthContext";

const BASE_URL = "http://172.20.10.4:3002";

const BadgeItem = ({ item }) => (
  <View style={styles.badgeContainer}>
    {item.icon ? (
      <Image
        source={{ uri: `${BASE_URL}${item.icon.replace("app/public", "")}` }}
        style={styles.badgeImage}
        onError={(e) => console.log("Lỗi tải ảnh:", e.nativeEvent.error)}
      />
    ) : (
      <Text>Không có ảnh</Text>
    )}
    <Text style={styles.badgeText}>{item.giftname}</Text>
    <Progress.Bar
      progress={item.progress || 0}
      width={80}
      height={5}
      color="#6C63FF"
      unfilledColor="#DDD"
      borderWidth={0}
      borderRadius={5}
    />
    <Text style={styles.progressText}>
      {Math.round(item.progress * item.targetSteps)} / {item.targetSteps} bước
    </Text>
  </View>
);

function Gift() {
  const [gifts, setGifts] = useState([]);
  const { userId, loading } = useAuth();
  const navigation = useNavigation();
  const [currentSteps, setCurrentSteps] = useState(2500); // Giả lập số bước hiện tại, thay bằng dữ liệu thực tế

  const getTargetSteps = (giftname) => {
    if (giftname.includes("5k Bước")) return 5000;
    if (giftname.includes("10k Bước")) return 10000;
    if (giftname.includes("20k Bước")) return 20000;
    if (giftname.includes("Mục tiêu 200%")) return 10000; // Giả sử mục tiêu cơ bản là 5000
    if (giftname.includes("Mục tiêu 300%")) return 15000;
    if (giftname.includes("Đạt được mục tiêu")) return 5000;
    return 0;
  };

  const fetchApi = async () => {
    try {
      if (userId) {
        const response = await getGiftbyId(userId);
        console.log("API response:", response);
        if (response && Array.isArray(response)) {
          const formattedGifts = response.map(gift => {
            const targetSteps = getTargetSteps(gift.giftname);
            const progress = targetSteps > 0 ? Math.min(currentSteps / targetSteps, 1) : 0;
            return {
              ...gift,
              giftname: gift.giftname || "Phần thưởng không tên",
              icon: gift.icon || null, // Giữ nguyên đường dẫn
              targetSteps,
              progress,
            };
          });
          setGifts(formattedGifts);
        } else {
          setGifts([]);
        }
      } else {
        console.log("Chưa đăng nhập");
      }
    } catch (error) {
      console.error("Lỗi khi lấy phần thưởng:", error);
      setGifts([]);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchApi();
    }
  }, [userId, loading, currentSteps]); // Thêm currentSteps để cập nhật khi bước thay đổi

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Phần thưởng</Text>
      <Text style={styles.subtitle}>Đếm Bước. Nhận Huy hiệu.</Text>
      <Text style={styles.subtitle1}>Đang thực hiện</Text>
      {userId ? (
        <FlatList
          data={gifts}
          renderItem={({ item }) => <BadgeItem item={item} />}
          keyExtractor={(item) => item._id.toString()}
          numColumns={3}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text>Không có phần thưởng nào</Text>}
        />
      ) : (
        <Text>Vui lòng đăng nhập để xem phần thưởng!!!</Text>
      )}
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
    marginLeft: 15,
  },
  subtitle: {
    fontSize: 18,
    color: "#8C8C8C",
    marginBottom: 20,
    marginLeft: 15,
  },
  listContainer: {
    alignItems: 'center',
  },
  badgeContainer: {
    alignItems: 'center',
    margin: 20,
  },
  badgeImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    color: " #A0A0A0"
  },
  badgeText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 5,
  },
  progressText: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  subtitle1: {
    marginTop: 20,
    color: "#909090",
    fontWeight: 'bold',
    marginLeft: 15,
  },
});

export default Gift;