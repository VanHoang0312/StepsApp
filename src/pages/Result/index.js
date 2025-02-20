import React, { useEffect, useState } from "react";
import { StatusBar, Text, StyleSheet, View, Modal, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { openDB } from "../../../Database/database";
import { createTable, loadStepsFromSQLite, getAllActivityData } from "../../../Database/DailyDatabase";
import StepComparisonChart from '../../component/ChartResult'

function Result() {
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState();
  const [alldata, setAlldata] = useState();
  const [db, setDb] = useState();


  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const initDatabase = async () => {
      try {
        const Database = await openDB()
        setDb(Database)
        await createTable(Database)
        const loadData = await loadStepsFromSQLite(Database, today)
        if (loadData) {
          setData(loadData.steps)
        }

        const getAlldata = await getAllActivityData(Database)
        if (getAlldata) {
          const stepsArray = getAlldata.map(item => item.steps);
          setAlldata(stepsArray);
          console.log("Tất cả dữ liệu bước chân:", stepsArray);
        }

      } catch (error) {
        console.error("InitDb false:", error)
      }

    };
    initDatabase();

  }, [])

  const average = alldata && alldata.length > 0 ? (alldata.reduce((sum, steps) => sum + steps, 0) / alldata.length).toFixed(0) : 0;

  const options = [
    { label: "Bước" },
    { label: "Calo" },
    { label: "Khoảng cách" },
    { label: "Thời gian" },
  ];

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
          {/* Giao diện chính */}
          <View style={{ marginTop: -5 }}>
            <Text style={styles.title}>Thông tin chi tiết</Text>
            <Text style={styles.subtitle}>Xu hướng. Tổng số. Hồ sơ.</Text>

            <View style={styles.card}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.label}>HÔM NAY</Text>
                  <Text style={styles.todaySteps}>{data}</Text>
                </View>
                <View>
                  <Text style={styles.label}>THƯỜNG</Text>
                  <Text style={styles.averageSteps}>{average}</Text>
                </View>
              </View>

              <StepComparisonChart average={average} />

              <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.buttonText}>Bước</Text>
              </TouchableOpacity>

              <Text style={styles.note}>
                {data >= average
                  ? "Chúc mừng, bạn đã đi nhiều bước hơn thường lệ."
                  : "Cho đến giờ, bạn đã đi ít bước hơn thường lệ."}
              </Text>
            </View>

          </View>

          {/* Modal */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Ngày của tôi</Text>

                <FlatList
                  data={options}
                  keyExtractor={(item) => item.label}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.option}>
                      <Text style={styles.optionText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,

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
  card: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: "#8C8C8C",
    marginBottom: 5,
  },
  todaySteps: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF4D4F",
  },
  averageSteps: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
  },
  chart: {
    marginVertical: 20,
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#FF4D4F",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  note: {
    fontSize: 12,
    color: "#8C8C8C",
    textAlign: "center",
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000",
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  optionText: {
    fontSize: 16,
    color: "#000",
  },
  proBadge: {
    color: "#4096FF",
    fontWeight: "bold",
    marginLeft: 5,
  },
  closeButton: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "#1E90FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Result;