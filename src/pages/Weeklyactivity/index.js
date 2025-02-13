import React from "react";
import { View, Text, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { LineChart } from 'react-native-chart-kit';

function Weeklyactivity() {
  const data = [15, 0, 0, 0, 0, 0, 0]; // Dữ liệu số bước mỗi ngày
  const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']; // Tên các ngày
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.weekLabel}>Tuần này</Text>
          <Text style={styles.stepCount}>15</Text>
        </View>

        {/* Thanh số liệu */}
        <View horizontal style={styles.dayBar}>
          {labels.map((label, index) => (
            <View key={index} style={styles.dayItem}>
              <Text style={styles.dayLabel}>{label}</Text>
              <View
                style={[
                  styles.stepBar,
                  { height: data[index] * 10 || 5, backgroundColor: data[index] > 0 ? '#00BFFF' : '#e0e0e0' },
                ]}
              />
              <Text style={styles.stepCountDay}>{data[index]}</Text>
            </View>
          ))}
        </View>

        {/* Thông tin bên dưới */}
        <View style={styles.infoContainer}>
          <View style={styles.infoBox}>
            <Text style={styles.infoValue}>1 kcal</Text>
            <Text style={styles.infoLabel}>CALO</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoValue}>10,3 m</Text>
            <Text style={styles.infoLabel}>KHOẢNG CÁCH</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoValue}>0 phút</Text>
            <Text style={styles.infoLabel}>THỜI GIAN HOẠT ĐỘNG</Text>
          </View>
        </View>

        {/* Biểu đồ */}
        <LineChart
          data={{
            labels,
            datasets: [{ data }],
          }}
          width={400}
          height={250}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          bezier
          withHorizontalLabels={false}
          style={styles.chart}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    //justifyContent: 'center',
  },
  header: { alignItems: 'flex-start', marginBottom: 20, marginTop: 10, marginLeft: 10 },
  weekLabel: { fontSize: 15, color: '#555' },
  stepCount: { fontSize: 24, fontWeight: 'bold' },
  dayBar: { flexDirection: 'row', marginBottom: 40 },
  dayItem: { alignItems: 'center', marginHorizontal: 20 },
  dayLabel: { fontSize: 12, color: '#555' },
  stepBar: { width: 10, borderRadius: 5, marginVertical: 10 },
  stepCountDay: { fontSize: 14, fontWeight: 'bold' },
  chart: { alignSelf: 'center', marginVertical: 40 },
  infoContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  infoBox: { alignItems: 'center' },
  infoValue: { fontSize: 18, fontWeight: 'bold' },
  infoLabel: { fontSize: 12, color: '#555' },

})

export default Weeklyactivity;