import axios from 'axios';

// Lấy API URL từ biến môi trường hoặc dùng mặc định
const API_URL = process.env.REACT_APP_API_URL || '/api';
console.log("API URL được cấu hình:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API cho phần tạo hình ảnh
export const generationApi = {
  // Kết hợp upload ảnh và gửi prompt trong 1 request
  generateWithImage: async (imageBlob, prompt, numImages = 4, width = 512, height = 512) => {
    try {
      console.log("Gọi API generateWithImage với:", {
        endpoint: `${API_URL}/generation/generate`,
        promptLength: prompt.length,
        imageBlobSize: imageBlob.size,
        numImages, width, height
      });
      
      const formData = new FormData();
      formData.append('file', imageBlob, 'captured_image.jpg');
      formData.append('prompt', prompt);
      formData.append('num_images', numImages);
      formData.append('width', width);
      formData.append('height', height);
      
      const response = await axios.post(`${API_URL}/generation/generate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log("Kết quả từ API generateWithImage:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error generating images with uploaded image:', error);
      console.log("Đường dẫn API đang gọi:", `${API_URL}/generation/generate`);
      console.log("Thông tin lỗi chi tiết:", {
        message: error.message,
        statusCode: error.response?.status,
        responseData: error.response?.data,
        requestURL: error.config?.url
      });
      throw error;
    }
  },
  
  // Kiểm tra trạng thái của quá trình sinh hình ảnh
  checkStatus: async (sessionId) => {
    try {
      console.log("Kiểm tra trạng thái với sessionId:", sessionId);
      const response = await api.get(`/generation/status/${sessionId}`);
      console.log("Kết quả kiểm tra trạng thái:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking generation status:', error);
      throw error;
    }
  },
  
  // Xóa session khi hoàn thành hoặc reset
  cleanupSession: async (sessionId) => {
    try {
      const response = await api.delete(`/generation/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error cleaning up session:', error);
      // Không throw error ở đây vì đây là một hành động dọn dẹp
      return { status: 'error', message: error.message };
    }
  }
};

// API cho phần in ảnh
export const printApi = {
  // Gửi yêu cầu in ảnh
  printImage: async (sessionId, imageIndex, copies = 1) => {
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('image_index', imageIndex);
      formData.append('copies', copies);
      
      const response = await axios.post(`${API_URL}/print/print`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error printing image:', error);
      throw error;
    }
  },
  
  // Kiểm tra trạng thái in
  checkPrintStatus: async (jobId) => {
    try {
      const response = await api.get(`/print/status/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking print status:', error);
      throw error;
    }
  }
};

// Helper function để chuyển đổi dataURI thành Blob
export const dataURItoBlob = (dataURI) => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeString });
};
