import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button, Typography, Box, CircularProgress } from '@mui/material';
import { CameraAlt, Replay } from '@mui/icons-material';
import { useAppState } from '../context/AppStateContext';
import { generationApi, dataURItoBlob } from '../services/api';

const CameraCapture = () => {
  const webcamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const { captureImage, setError, capturedImage } = useAppState();

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  const handleCapture = useCallback(async () => {
    setIsCapturing(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error('Không thể chụp ảnh. Vui lòng thử lại.');
      }

      // Lưu ảnh vào state mà không gọi API
      captureImage(imageSrc, null);
      
    } catch (error) {
      console.error('Error capturing image:', error);
      setError(error.message || 'Đã xảy ra lỗi khi chụp ảnh.');
    } finally {
      setIsCapturing(false);
    }
  }, [webcamRef, captureImage, setError]);

  return (
    <Box className="camera-container" sx={{ textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Chụp ảnh
      </Typography>
      
      {capturedImage ? (
        <img 
          src={capturedImage} 
          alt="Ảnh đã chụp" 
          style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px' }}
        />
      ) : (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px' }}
        />
      )}

      <Box sx={{ mt: 3 }}>
        {!capturedImage ? (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<CameraAlt />}
            onClick={handleCapture}
            disabled={isCapturing}
            sx={{ p: 2, px: 4, fontSize: '1.2rem' }}
          >
            {isCapturing ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} /> 
                Đang xử lý...
              </>
            ) : 'Chụp ảnh'}
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Replay />}
            onClick={() => captureImage(null, null)}
            sx={{ p: 1.5, px: 3 }}
          >
            Chụp lại
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CameraCapture;
