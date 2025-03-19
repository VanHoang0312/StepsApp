import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, PermissionsAndroid, Platform, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { BleManager } from "react-native-ble-plx";
import { ActivityIndicator } from "react-native";
import base64 from "react-native-base64"
import { encode as btoa } from "react-native-base64";
import { Buffer } from "buffer";


const manager = new BleManager();

function Spo2() {
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null)
  const [isSpo2ModalVisible, setIsSpo2ModalVisible] = useState(false);
  const [loading, setLoading] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [spo2Rate, setSpO2Rate] = useState(null)



  useEffect(() => {
    requestBluetoothPermission();
  }, []);

  // Xin quyền BLE trên Android
  const requestBluetoothPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const permissions = [];

        if (Platform.Version < 31) {
          // Dành cho Android 11 trở xuống
          if (PermissionsAndroid.PERMISSIONS.BLUETOOTH) {
            permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH);
          }
          if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN) {
            permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN);
          }
          permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        } else {
          // Dành cho Android 12 trở lên
          permissions.push(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
        }

        if (permissions.length === 0) return;

        console.log("Đang yêu cầu quyền:", permissions);

        const granted = await PermissionsAndroid.requestMultiple(permissions);

        let neverAskAgainPermissions = [];
        let deniedPermissions = [];

        Object.entries(granted).forEach(([permission, result]) => {
          if (result === PermissionsAndroid.RESULTS.DENIED) {
            deniedPermissions.push(permission);
          }
          if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            neverAskAgainPermissions.push(permission);
          }
        });

        if (neverAskAgainPermissions.length > 0) {
          Alert.alert(
            "Cần cấp quyền Bluetooth",
            "Bạn đã từ chối một số quyền quan trọng. Hãy mở Cài đặt để cấp quyền.",
            [
              { text: "Hủy", style: "cancel" },
              { text: "Mở Cài đặt", onPress: () => Linking.openSettings() }
            ]
          );
        } else if (deniedPermissions.length > 0) {
          console.warn("Một số quyền BLE bị từ chối:", deniedPermissions);
        } else {
          console.log("Tất cả quyền BLE đã được cấp!");
        }
      } catch (err) {
        console.error("Lỗi xin quyền:", err);
      }
    }
  };

  // Quét thiết bị BLE
  const scanDevices = () => {
    setScanning(true);
    setDevices([]);
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Lỗi quét BLE:", error);
        return;
      }
      if (device && device.name) {
        setDevices((prevDevices) => {
          if (!prevDevices.find((d) => d.id === device.id)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
        if (devices.length === 0) {
          setScanning(false);
        }
      }
    });
    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
    }, 30000);
  };

  // Kết nối với thiết bị SpO2
  const connectToDevice = async (device) => {
    try {
      setLoading(device.id);
      const deviceConnection = await manager.connectToDevice(device.id);
      console.log("Đã kết nối với: ", device.id)
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      manager.stopDeviceScan();

      await debugDeviceServices(device);
      startMonitoringSpO2(device)
      setIsSpo2ModalVisible(true);
    } catch (error) {
      console.log("Lỗi kết nối:", error);
    } finally {
      setLoading(null);
    }
  };

  const debugDeviceServices = async (device) => {
    const services = await device.services();
    for (const service of services) {
      console.log("Service UUID:", service.uuid);
      const characteristics = await device.characteristicsForService(service.uuid);
      characteristics.forEach((char) => {
        console.log(" - Characteristic UUID:", char.uuid, " | Notifiable:", char.isNotifiable);
      });
    }
  };

  const convertHexToDecimal = (hex) => {
    let decimalValue = [];
    while (hex.length > 0) {
      let hexValue = hex.substring(0, 2);
      decimalValue.push(parseInt(hexValue, 16));
      hex = hex.substring(2);
    }
    return decimalValue;
  };

  //Đọc dữ liệu SpO2
  const SPO2_RATE_UUID = "f000ffc0-0451-4000-b000-000000000000";
  const SPO2_RATE_CHARACTERISTIC = "f000ffc1-0451-4000-b000-000000000000";

  const startMonitoringSpO2 = async (device) => {
    if (!device) {
      console.log("Không có thiết bị kết nối!");
      return;
    }

    try {
      await device.discoverAllServicesAndCharacteristics();

      // Gửi lệnh kích hoạt SpO2
      const command = Buffer.from([0x01]).toString("base64");
      console.log("kk", command)

      await device.writeCharacteristicWithResponseForService(
        SPO2_RATE_UUID,
        SPO2_RATE_CHARACTERISTIC,
        command
      );
      console.log("Đã gửi lệnh kích hoạt SpO2");

      // Theo dõi dữ liệu SpO2
      setTimeout(async () => {
        console.log("Bắt đầu theo dõi SpO2...");
        await device.monitorCharacteristicForService(
          SPO2_RATE_UUID,
          SPO2_RATE_CHARACTERISTIC,
          (error, char) => {
            if (error) {
              console.log("Lỗi khi theo dõi SpO2:", error);
              return;
            }
            if (char?.value) {
              const hexString = Buffer.from(char.value, "base64").toString("hex");
              console.log("Dữ liệu gốc nhận được (hex):", hexString);
              const data = convertHexToDecimal(hexString);
              console.log("Dữ liệu đã chuyển đổi:", data);
              setSpO2Rate(data[1]); // Lấy giá trị SpO2
            }
          }
        );
      }, 2000); // Chờ 2 giây trước khi theo dõi

    } catch (error) {
      console.log("Lỗi khi theo dõi SpO2:", error);
    }
  };

  //Ngắt kết nối với thiết bị
  const disconnectDevice = async () => {
    if (connectedDevice) {
      try {
        await manager.cancelDeviceConnection(connectedDevice.id);
        console.log("Đã ngắt kết nối với:", connectedDevice.id);
      } catch (error) {
        console.log("Lỗi khi ngắt kết nối:", error);
      } finally {
        setConnectedDevice(null);
        setSpO2Rate(0);
        setIsSpo2ModalVisible(false);
      }
    }
  };


  return (
    <View>
      <Button title={scanning ? "Đang quét..." : "Quét thiết bị SpO2"} onPress={scanDevices} disabled={scanning} />
      {scanning && <ActivityIndicator size="large" color="blue" style={{ marginTop: 50 }} />}
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{item.name} ({item.id})</Text>
            <Button title={loading === item.id ? "Đang kết nối..." : "Kết nối"} onPress={() => connectToDevice(item)} disabled={loading === item.id} />
          </View>
        )}
      />

      {/* Modal hiển thị thông tin SpO2 */}
      <Modal visible={isSpo2ModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalview}>
          <View style={styles.modalview1}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Thiết bị kết nối</Text>
            {connectedDevice && (
              <Text>{connectedDevice.name} ({connectedDevice.id})</Text>
            )}
            <Text>SpO2: {spo2Rate} %</Text>
            {/* <TouchableOpacity style={styles.exit}>
              <Text style={{ color: "white" }}>Lưu file</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.exit} onPress={disconnectDevice}>
              <Text style={{ color: "white" }}>Ngắt kết nối</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalview1: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center"
  },
  exit: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5
  }
});

export default Spo2;
