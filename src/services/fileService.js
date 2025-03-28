import RNFS from "react-native-fs";
import axios from "axios";

const API_DOMAIN = "http://192.168.1.172:3002/api/";

export const uploadFile = async (fileUri, fileName) => {
  try {
    console.log("Đang tải tệp lên:", fileUri, fileName);

    const fileExists = await RNFS.exists(fileUri);
    console.log("Tệp có tồn tại không:", fileExists);
    if (!fileExists) throw new Error("Tệp không tồn tại");

    const extension = (fileName || "data.txt").split(".").pop().toLowerCase();
    const mimeType =
      extension === "txt" ? "text/plain" :
        extension === "json" ? "application/json" :
          extension === "pdf" ? "application/pdf" : "application/octet-stream";

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: fileName || "data.txt",
      type: mimeType,
    });

    console.log("URI của tệp:", fileUri);
    console.log("Tên tệp:", fileName || "data.txt");
    console.log("Loại MIME:", mimeType);
    console.log("Gửi yêu cầu tới:", `${API_DOMAIN}upload`);

    const response = await axios.post(`${API_DOMAIN}upload`, formData, {
      headers: {
        Accept: "application/json",
        "content-type": "multipart/form-data",
      },
    });

    console.log("Trạng thái phản hồi:", response.status);
    console.log("Dữ liệu phản hồi:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải tệp lên:", error.message, error.stack);
    throw error;
  }
};

export const downloadFile = async (oximeter_id) => {
  try {
    console.log("Đang tải tệp xuống với oximeter_id:", oximeter_id);

    const downloadUrl = `${API_DOMAIN}pulse-oximeter/phantich/${oximeter_id}`;
    const downloadPath = `${RNFS.DocumentDirectoryPath}/${oximeter_id}.pdf`;

    console.log("Tải xuống từ:", downloadUrl);

    const response = await axios({
      url: downloadUrl,
      method: "GET",
      responseType: "arraybuffer", // Để tải file nhị phân (PDF)
    });

    console.log("Trạng thái tải xuống:", response.status);
    if (response.status !== 200) {
      throw new Error(`Tải xuống thất bại với trạng thái: ${response.status}`);
    }

    // Ghi dữ liệu file vào thiết bị
    await RNFS.writeFile(downloadPath, Buffer.from(response.data), "base64");

    const fileExists = await RNFS.exists(downloadPath);
    if (!fileExists) {
      throw new Error("Tệp không được lưu vào thiết bị");
    }

    return {
      success: true,
      message: "Tệp đã được tải xuống thành công",
      filePath: downloadPath,
    };
  } catch (error) {
    console.error("Lỗi khi tải tệp xuống:", error.message, error.stack);
    throw error;
  }
};