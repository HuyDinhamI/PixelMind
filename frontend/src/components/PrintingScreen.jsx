import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button
} from '@mui/material';
import { Print, CheckCircle } from '@mui/icons-material';
import { useAppState } from '../context/AppStateContext';
import { printApi } from '../services/api';

const PrintingScreen = () => {
  const [isPrinting, setIsPrinting] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Đang chuẩn bị in ảnh...');
  const { printJobId, selectedImageIndex, generatedImages, completePrint, setError } = useAppState();
  
  const checkPrintStatus = useCallback(async () => {
    if (!printJobId) return;
    
    try {
      const result = await printApi.checkPrintStatus(printJobId);
      
      if (result.status === 'completed') {
        setIsPrinting(false);
        setStatusMessage('In ảnh thành công!');
        // Tự động chuyển sang màn hình hoàn thành sau 3 giây
        setTimeout(() => {
          completePrint();
        }, 3000);
        return true;
      } else if (result.status === 'failed') {
        setIsPrinting(false);
        setStatusMessage(`In ảnh thất bại: ${result.error || 'Lỗi không xác định'}`);
        setError(`In ảnh thất bại: ${result.error || 'Lỗi không xác định'}`);
        return true;
      } else {
        // Cập nhật trạng thái
        setStatusMessage(`Đang in... ${result.status || ''}`);
        return false;
      }
    } catch (error) {
      console.error('Error checking print status:', error);
      setError(error.message || 'Đã xảy ra lỗi khi kiểm tra trạng thái in.');
      return false;
    }
  }, [printJobId, completePrint, setError]);
  
  useEffect(() => {
    let interval;
    
    // Kiểm tra trạng thái mỗi 2 giây
    interval = setInterval(async () => {
      const isComplete = await checkPrintStatus();
      if (isComplete) {
        clearInterval(interval);
      }
    }, 2000);
    
    // Gọi lần đầu ngay lập tức
    checkPrintStatus();
    
    return () => {
      clearInterval(interval);
    };
  }, [checkPrintStatus]);
  
  return (
    <Box className="loading-container" sx={{ textAlign: 'center', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 500, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          {isPrinting ? 'Đang in ảnh' : 'Hoàn thành'}
        </Typography>
        
        {selectedImageIndex !== null && generatedImages[selectedImageIndex] && (
          <Box sx={{ my: 2 }}>
            <img
              src={generatedImages[selectedImageIndex].url}
              alt="Ảnh đang in"
              style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
            />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          {isPrinting ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={40} sx={{ mr: 2 }} />
              <Print fontSize="large" color="primary" />
            </Box>
          ) : (
            <CheckCircle fontSize="large" color="success" sx={{ fontSize: 60 }} />
          )}
        </Box>
        
        <Typography variant="h6" sx={{ mb: 2 }}>
          {statusMessage}
        </Typography>
        
        {!isPrinting && (
          <Button
            variant="contained"
            color="primary"
            onClick={completePrint}
            sx={{ mt: 2 }}
          >
            Tiếp tục
          </Button>
        )}
        
        <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
          {isPrinting ? 
            'Vui lòng đợi trong khi ảnh của bạn đang được in. Quá trình này sẽ mất một chút thời gian.' :
            'Ảnh của bạn đã được in xong. Vui lòng nhận ảnh của bạn!'
          }
        </Typography>
      </Paper>
    </Box>
  );
};

export default PrintingScreen;
