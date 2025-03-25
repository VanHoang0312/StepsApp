import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, PermissionsAndroid, Platform, Modal, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { BleManager } from "react-native-ble-plx";
import { ActivityIndicator } from "react-native";
import { Buffer } from "buffer";
import RNFS from "react-native-fs";
import { uploadFile, downloadFile } from "../../services/fileService";


const manager = new BleManager();
const filePath = `${RNFS.DocumentDirectoryPath}/data.txt`;

function Spo2() {
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null)
  const [isSpo2ModalVisible, setIsSpo2ModalVisible] = useState(false);
  const [loading, setLoading] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [spo2Rate, setSpO2Rate] = useState(null)
  const [pulseRate, setPulseRate] = useState(null);
  const [perfusionIndex, setPerfusionIndex] = useState(null);
  const [typeRecord, setTypeRecord] = useState(1);

  useEffect(() => {
    requestBluetoothPermission();
    return () => {
      onDestroyBLE();
    };
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
        permissions.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);

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
  const scanDevices = (type = 1) => {
    setScanning(true);
    setDevices([]);
    setTypeRecord(type);
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
      console.log("Đã kết nối với: ", device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      manager.stopDeviceScan();

      // Đăng ký sự kiện ngắt kết nối sau khi kết nối thành công
      const subscription = manager.onDeviceDisconnected(deviceConnection.id, (err, disconnectedDevice) => {
        console.log(disconnectedDevice.id, "onDeviceDisconnected");
        Alert.alert("Thông báo", `Thiết bị ${disconnectedDevice.id} đã ngắt kết nối.`);
        resetBlue();
        subscription.remove(); // Hủy subscription ngay sau khi ngắt
      });

      await debugDeviceServices(deviceConnection);
      startMonitoringSpO2(deviceConnection);
      setIsSpo2ModalVisible(true);
    } catch (error) {
      console.log("Lỗi kết nối:", error);
      Alert.alert("Lỗi", `Không thể kết nối với thiết bị: ${error.message}`);
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
  const startMonitoringSpO2 = async (device) => {
    if (!device) return;
    try {
      await device.discoverAllServicesAndCharacteristics();

      const serviceUUID = "cdeacb80-5235-4c07-8846-93a37ee6b86d";
      const charUUID = "cdeacb81-5235-4c07-8846-93a37ee6b86d";

      device.monitorCharacteristicForService(serviceUUID, charUUID, (error, char) => {
        if (error) {
          console.log(`Lỗi khi theo dõi ${charUUID}:`, error);
          return;
        }
        if (char?.value) {
          const hexString = Buffer.from(char.value, "base64").toString("hex");
          const data = convertHexToDecimal(hexString);

          if (data[0] === 129 && data.length >= 4) {
            console.log(`Dữ liệu từ ${charUUID} (hex):`, hexString);
            console.log(`Dữ liệu từ ${charUUID} (decimal):`, data);
            setPulseRate(data[1]);       // Nhịp tim
            setSpO2Rate(data[2]);        // SpO2
            setPerfusionIndex(data[3] / 10);  // PI
            if (typeRecord !== 1) {
              processAndWriteFile(data); // Ghi dữ liệu nếu không phải chỉ đọc
            }
          }
        }
      });
      console.log(`Đã bắt đầu theo dõi SpO2 trên ${charUUID}`);
    } catch (error) {
      console.log("Lỗi khi theo dõi SpO2:", error);
    }
  };

  // Xử lý và ghi dữ liệu vào file
  const processAndWriteFile = async (data) => {
    const oxiData = {
      heart_rate: data[1],
      spo2: data[2],
      pi: data[3] / 10,
      time: new Date().toISOString(),
    };

    if (
      oxiData.spo2 !== 127 &&
      oxiData.heart_rate !== 255 &&
      oxiData.pi !== 0
    ) {
      await writeFile(oxiData);
    }
  };

  const writeFile = async (data) => {
    try {
      let url = null;
      let fileNm = null;
      if (typeRecord === 2) {
        url = filePath;
        fileNm = "data.txt";
      } else if (typeRecord === 3) {
        const now = new Date(); // Thời gian thực của thiết bị
        const fileNm = `/${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}.txt`;
        url = `${RNFS.DocumentDirectoryPath}${fileNm}`;
      }

      if (url) {
        await RNFS.appendFile(url, JSON.stringify(data) + "\n", "utf8");
        //await RNFS.writeFile(url, JSON.stringify(data), "utf8"); // Ghi đè file thay vì append
        console.log("Đã ghi dữ liệu vào:", url);

        if (typeRecord === 3 && new Date().getSeconds() === 59) {
          const now = new Date();
          const fileNm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}.txt`;
          Alert.alert("Thông báo", `File ${fileNm} đã được ghi xong.`);
          await uploadToServer(url, fileNm);
        }
      }
    } catch (error) {
      console.log("Lỗi khi ghi file:", error);
      Alert.alert("Lỗi", `Không thể ghi file: ${error.message}`);
    }
  };

  // Upload file lên server và tải PDF về
  const uploadToServer = async (fileUri, fileNm) => {
    try {
      const uploadResult = await uploadFile(fileUri, fileNm);
      if (uploadResult.success) {
        console.log("Upload success:", uploadResult);
        await RNFS.unlink(fileUri); // Xóa file sau khi upload

        const oximeter_id = uploadResult.oximeter_id;
        const downloadResult = await downloadFile(oximeter_id);
        if (downloadResult.success) {
          console.log("Download success:", downloadResult);
          Alert.alert("Thành công", `File PDF đã được tải về tại: ${downloadResult.filePath}`);

        }
      } else {
        Alert.alert("Lỗi", "Upload file thất bại");
      }
    } catch (error) {
      console.error("Error in uploadToServer:", error);
      Alert.alert("Lỗi", `Không thể upload file: ${error.message}`);
    }
  };

  // Đọc tất cả file .txt trong thư mục Downloads
  //  const readFile = async () => {
  //   try {
  //     let result = await RNFS.readDir(RNFS.DocumentDirectoryPath);
  //     const txtFiles = result.filter((curr) => curr.isFile() && curr.name.split(".").pop() === "txt");
  //     const contents = await Promise.all(
  //       txtFiles.map(async (file) => {
  //         const content = await RNFS.readFile(file.path, "utf8");
  //         return `File: ${file.name}\nNội dung:\n${content}\n\n`;
  //       })
  //     );
  //     const txtFilesContent = contents.join("");
  //     if (txtFilesContent) {
  //       setFileContent(txtFilesContent); // Lưu nội dung để hiển thị trong ScrollView
  //     } else {
  //       setFileContent("Không tìm thấy file .txt nào trong Downloads.");
  //     }
  //   } catch (error) {
  //     console.log("Lỗi khi đọc thư mục:", error);
  //     setFileContent(`Lỗi: Không thể đọc thư mục - ${error.message}`);
  //   }
  // };

  // Ngắt kết nối và hủy BLE
  const onDestroyBLE = async () => {
    try {
      await manager.stopDeviceScan();
      if (connectedDevice) {
        await manager.cancelDeviceConnection(connectedDevice.id);
      }
      // Upload file khi dừng nếu typeRecord = 2
      if (typeRecord === 2 && (await RNFS.exists(filePath))) {
        await uploadToServer(filePath, "data.txt");
      }
      resetBlue();
    } catch (err) {
      console.log("Lỗi khi hủy BLE:", err);
    }
  };

  const resetBlue = () => {
    setConnectedDevice(null);
    setSpO2Rate(null);
    setPulseRate(null);
    setPerfusionIndex(null);
    setIsSpo2ModalVisible(false);
    setTypeRecord(1);
    setDevices([]);
  };

  // Chọn loại quét
  const showScanOptions = () => {
    Alert.alert(
      "Quét dữ liệu",
      "Vui lòng chọn loại quét dữ liệu",
      [
        { text: "Chỉ đọc dữ liệu", onPress: () => scanDevices(1), style: "cancel" },
        { text: "Đọc và ghi dữ liệu", onPress: () => scanDevices(2) },
        { text: "Theo dõi SPO2", onPress: () => scanDevices(3) },
      ]
    );
  };

  return (
    <View>
      <Button
        title={scanning ? "Đang quét..." : "Quét thiết bị SpO2"}
        onPress={showScanOptions}
        disabled={scanning || connectedDevice !== null}
      />
      {scanning && <ActivityIndicator size="large" color="blue" style={{ marginTop: 50 }} />}
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{item.name} ({item.id})</Text>
            <Button
              title={loading === item.id ? "Đang kết nối..." : "Kết nối"}
              onPress={() => connectToDevice(item)}
              disabled={loading === item.id}
            />
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
            <Text>SpO2: {spo2Rate !== null ? `${spo2Rate} %` : "Đang chờ dữ liệu..."}</Text>
            <Text>Nhịp tim: {pulseRate !== null ? `${pulseRate} bpm` : "Đang chờ dữ liệu..."}</Text>
            <Text>PI: {perfusionIndex !== null ? `${perfusionIndex.toFixed(1)} %` : "Đang chờ dữ liệu..."}</Text>
            {/* Nút đọc tất cả file .txt */}
            {/* <TouchableOpacity style={styles.saveButton} onPress={readFile}>
              <Text style={{ color: "white" }}>Đọc tất cả file</Text>
            </TouchableOpacity>
            
            <ScrollView style={styles.scrollView}>
              <Text style={styles.fileContent}>{fileContent || "Nhấn nút để đọc file..."}</Text>
            </ScrollView> */}
            <TouchableOpacity style={styles.exit} onPress={onDestroyBLE}>
              <Text style={{ color: "white" }}>
                {typeRecord !== 1 ? "Dừng và lưu dữ liệu" : "Dừng đọc dữ liệu"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
    alignItems: "center",
    maxHeight: "80%"
  },
  scrollView: {
    marginTop: 10,
    maxHeight: 200, // Giới hạn chiều cao ScrollView để cuộn được
    width: "100%"
  },
  fileContent: {
    fontSize: 14,
    color: "black",
    textAlign: "left"
  },
  saveButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "green",
    borderRadius: 5
  },
  exit: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5
  }
});

export default Spo2;
