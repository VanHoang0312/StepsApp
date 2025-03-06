import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, PermissionsAndroid, Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";

const manager = new BleManager();

function Spo2() {
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null)

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
      }
    });

    // Dừng quét sau 30 giây
    setTimeout(() => {
      manager.stopDeviceScan();
    }, 30000);
  };

  // Kết nối với thiết bị SpO2
  // const connectToDevice = async (device) => {
  //   try {
  //     const connectedDevice = await manager.connectToDevice(device.id);
  //     console.log("Đã kết nối với:", connectedDevice.name);

  //     // Khám phá dịch vụ BLE
  //     await connectedDevice.discoverAllServicesAndCharacteristics();
  //     console.log("Dịch vụ & đặc tính đã được khám phá");

  //     // Đọc dữ liệu SpO2 (giả sử UUID của đặc tính SpO2 là "00002a37-0000-1000-8000-00805f9b34fb")
  //     const spo2Characteristic = await connectedDevice.readCharacteristicForService(
  //       "0000180d-0000-1000-8000-00805f9b34fb",  // UUID của dịch vụ
  //       "00002a37-0000-1000-8000-00805f9b34fb"   // UUID của đặc tính SpO2
  //     );

  //     console.log("Dữ liệu SpO2 nhận được:", spo2Characteristic.value);

  //   } catch (error) {
  //     console.log("Lỗi kết nối:", error);
  //   }
  // };

  const connectToDevice = async (device) => {
    try {
      const deviceConnection = await manager.connectToDevice(device.id)
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      manager.stopDeviceScan()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <View>
      <Button title="Quét thiết bị SpO2" onPress={scanDevices} />
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{item.name} ({item.id})</Text>
            <Button title="Kết nối" />
            {/* onPress={() => connectToDevice(item)} */}
          </View>
        )}
      />

      
    </View>
  );
};

export default Spo2;
