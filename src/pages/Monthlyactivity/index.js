import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

function Monthlyactivity() {
  const chartData = {
    labels: ['Thg 4', 'Thg 6', 'Thg 8', 'Thg 10', 'Thg 12', 'Thg 2'],
    datasets: [
      {
        data: [0, 0, 1, 4, 3, 0],
        color: () => '#4A90E2',
        strokeWidth: 2,
      },
    ],
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.month}>thg 2 2025</Text>
          <Text style={styles.steps}>1.785</Text>
        </View>

        {/* Calendar */}
        <View  style={styles.calendar}>
          <Text style={styles.weekdays}>T2 T3 T4 T5 T6 T7 CN</Text>
          <View style={styles.dates}>
            {[...Array(28).keys()].map((day) => (
              <View
                key={day + 1}
                style={[
                  styles.date,
                  day + 1 === 3 && styles.selectedDate,
                ]}
              >
                <Text>{day + 1}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailValue, { fontWeight: 'bold', color: '#000000', fontSize: 20 }]}>67 kcal</Text>
            <Text style={styles.detailLabel}>CALORIES</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailValue, { fontWeight: 'bold', color: '#000000', fontSize: 20 }]}>1,2 km</Text>
            <Text style={styles.detailLabel}>KHOẢNG CÁCH</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailValue, { fontWeight: 'bold', color: '#000000', fontSize: 20 }]}>18 phút</Text>
            <Text style={styles.detailLabel}>THỜI GIAN HOẠT ĐỘNG</Text>
          </View>
        </View>

        {/* Chart */}
        <LineChart
          data={chartData}
          width={screenWidth}
          height={250}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: () => '#4A90E2',
            labelColor: () => '#000',
          }}
          bezier
          withHorizontalLabels={false}
          style={styles.chart}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    justifyContent: 'flex-start',
  },
  header: { alignItems: 'flex-start', marginTop: 10, marginLeft: 10 },
  steps: { fontSize: 24, fontWeight: 'bold' },
  month: { fontSize: 15, color: '#555' },
  calendar: { padding: 20 },
  weekdays: {
    flexDirection: 'row', // Đặt flexDirection là row để các ngày nằm ngang
    justifyContent: 'space-between', // Dàn đều các ngày
    color: '#555',
  },
  dates: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  date: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  selectedDate: { backgroundColor: '#4A90E2', color: '#fff' },
  details: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  detailItem: { alignItems: 'center' },
  detailValue: { fontSize: 18, fontWeight: 'bold' },
  detailLabel: {     fontSize: 12,
    color: "#808080",
    fontWeight: "bold", },
  chart: { marginVertical: 20 },

})

export default Monthlyactivity;