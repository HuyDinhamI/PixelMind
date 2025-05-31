import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  LinearProgress,
  Paper
} from '@mui/material';
import { useAppState } from '../context/AppStateContext';
import { generationApi } from '../services/api';

const GeneratingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Đang khởi tạo...');
  const { sessionId, receiveResults, setError } = useAppState();
  
  const checkGenerationStatus = useCallback(async () => {
    console.log("Kiểm tra trạng thái với session_id:", sessionId);
    
    if (!sessionId) {
      console.error("Session ID không tồn tại, không thể kiểm tra trạng thái");
      setStatusMessage("Đang chờ session ID...");
      return false;
    }
    
    try {
      const result = await generationApi.checkStatus(sessionId);
      console.log("Kết quả kiểm tra trạng thái:", result);
      
      if (result.status === 'complete' && result.images) {
        console.log("Sinh ảnh hoàn thành, chuyển đến màn hình kết quả");
        // Đã hoàn thành, chuyển đến màn hình kết quả
        receiveResults(result.images);
        return true; // Đánh dấu là đã hoàn thành
      } else if (result.status === 'failed') {
        throw new Error('Quá trình tạo ảnh thất bại. Vui lòng thử lại.');
      } else {
        // Cập nhật trạng thái
        setStatusMessage(`Đang xử lý... ${result.status || ''}`);
        return false; // Chưa hoàn thành
      }
    } catch (error) {
      console.error('Error checking generation status:', error);
      setError(error.message || 'Đã xảy ra lỗi khi kiểm tra trạng thái.');
      return false;
    }
  }, [sessionId, receiveResults, setError]);
  
  useEffect(() => {
    let interval;
    let animationInterval;
    
    // Hiệu ứng tiến trình giả lập
    animationInterval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + (100 - prevProgress) * 0.05;
        return Math.min(newProgress, 98); // Tối đa 98% cho đến khi hoàn thành thật sự
      });
    }, 500);
    
    // Kiểm tra trạng thái mỗi 3 giây
    interval = setInterval(async () => {
      const isComplete = await checkGenerationStatus();
      if (isComplete) {
        clearInterval(interval);
        clearInterval(animationInterval);
        setProgress(100);
      }
    }, 3000);
    
    // Gọi lần đầu ngay lập tức
    checkGenerationStatus();
    
    return () => {
      clearInterval(interval);
      clearInterval(animationInterval);
    };
  }, [checkGenerationStatus]);
  
  // Danh sách các thông điệp để hiển thị trong khi chờ đợi
  const waitingMessages = [
    "Leonardo.ai đang biến hóa ảnh của bạn...",
    "AI đang phát huy trí tưởng tượng...",
    "Đang tạo phép màu nghệ thuật...",
    "Chỉ còn vài khoảnh khắc nữa thôi...",
    "Đang trộn màu sắc và phong cách...",
    "Quá trình này có thể mất khoảng 20-30 giây..."
  ];
  
  // Hiển thị các thông điệp xoay vòng
  useEffect(() => {
    if (progress < 100) {
      const messageInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * waitingMessages.length);
        setStatusMessage(waitingMessages[randomIndex]);
      }, 5000);
      
      return () => clearInterval(messageInterval);
    }
  }, [progress]);
  
  return (
    <Box className="loading-container" sx={{ textAlign: 'center', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 500, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Đang tạo ảnh
        </Typography>
        
        <Box sx={{ position: 'relative', my: 4, transition: 'all 0.3s ease' }}>
          <CircularProgress
            variant="determinate"
            value={progress}
            size={120}
            thickness={4}
            sx={{ 
              color: 'primary.main',
              transition: 'all 0.3s ease'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h5"
              component="div"
              color="text.secondary"
            >{`${Math.round(progress)}%`}</Typography>
          </Box>
        </Box>
        
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, mb: 2 }} />
        
        <div className="wave-loading" style={{ margin: '20px 0' }}>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
        
        <Typography variant="body1" sx={{ mt: 2, fontStyle: 'italic', animation: 'fadeInUp 0.5s ease' }}>
          {statusMessage}
        </Typography>
        
        <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }} className="shimmer">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Vui lòng đợi trong khi AI đang biến đổi ảnh của bạn. Quá trình này mất khoảng 20-30 giây.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default GeneratingScreen;
