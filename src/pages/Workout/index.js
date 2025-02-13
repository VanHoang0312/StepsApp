import React, { useState } from "react";
import { Text, View, StyleSheet, Modal, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

function Workout() {
  const [isModalVisible, setModalVisible] = useState(false);

  const handleShowReport = () => {
    setModalVisible(true);
  };

  const handleCloseReport = () => {
    setModalVisible(false);
  };


  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Có tiến độ hàng tuần</Text>
            <Text style={styles.subtitle}>Đang là giữa tuần. Xem bạn đã thực hiện đến đâu rồi.</Text>


            <View style={styles.statList}>
              <View style={styles.statRow}>
                <Icon name="walk-outline" size={20} color="#000" />
                <Text style={styles.statText}>2.338 Bước</Text>
                <Text style={styles.percentRed}>5%</Text>
              </View>
              <View style={styles.statRow}>
                <Icon name="flame-outline" size={20} color="#000" />
                <Text style={styles.statText}>92 kcal</Text>
                <Text style={styles.percentRed}>4%</Text>
              </View>
              <View style={styles.statRow}>
                <Icon name="navigate-outline" size={20} color="#000" />
                <Text style={styles.statText}>1,6 km</Text>
                <Text style={styles.percentRed}>8%</Text>
              </View>
              <View style={styles.statRow}>
                <Icon name="time-outline" size={20} color="#000" />
                <Text style={styles.statText}>24 phút</Text>
                <Text style={styles.percentRed}>12%</Text>
              </View>

            </View>

            <TouchableOpacity style={styles.button} onPress={handleShowReport}>
              <Text style={styles.buttonText}>Hiển thị báo cáo</Text>
            </TouchableOpacity>
          </View>


          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={handleCloseReport}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Tiến độ Hàng tuần</Text>
                <Text style={styles.modalSubtitle}>
                  Đã giữa tuần rồi mà bạn mới đạt được 5% trên 42.000 bước thôi.
                </Text>


                <View style={styles.statList}>
                  <View style={styles.statRow}>
                    <Icon name="walk-outline" size={20} color="#000" />
                    <Text style={styles.statText}>2.338 Bước</Text>
                    <Text style={styles.percentRed}>5%</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Icon name="flame-outline" size={20} color="#000" />
                    <Text style={styles.statText}>92 kcal</Text>
                    <Text style={styles.percentRed}>4%</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Icon name="navigate-outline" size={20} color="#000" />
                    <Text style={styles.statText}>1,6 km</Text>
                    <Text style={styles.percentRed}>8%</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Icon name="time-outline" size={20} color="#000" />
                    <Text style={styles.statText}>24 phút</Text>
                    <Text style={styles.percentRed}>12%</Text>
                  </View>
                </View>

                <View style={styles.shareRow}>
                  <Icon name="logo-instagram" size={30} color="#E1306C" />
                  <Icon name="logo-facebook" size={30} color="#4267B2" />
                  <Icon name="ellipsis-horizontal-circle-outline" size={30} color="#888" />
                </View>

                <TouchableOpacity style={styles.doneButton} onPress={handleCloseReport}>
                  <Text style={styles.doneButtonText}>Làm xong</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  statList: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  statText: {
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
  },
  percentRed: {
    color: 'red',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: "center"
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
    marginBottom: 20,
    alignSelf: 'center',
  },
  doneButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    width: '100%',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});


export default Workout;