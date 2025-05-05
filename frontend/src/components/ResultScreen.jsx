import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardActionArea,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { Print, ArrowBack, Refresh, CheckCircle } from '@mui/icons-material';
import { useAppState } from '../context/AppStateContext';
import { printApi } from '../services/api';

const ResultScreen = () => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const { 
    generatedImages, 
    selectedImageIndex, 
    selectImage, 
    sessionId, 
    prompt,
    printImage,
    setError,
    resetApp
  } = useAppState();
  
  const handlePrint = async () => {
    if (selectedImageIndex === null) {
      setError('Vui lòng chọn một ảnh để in.');
      return;
    }
    
    // Đóng dialog xác nhận nếu đang mở
    setConfirmOpen(false);
    
    setIsPrinting(true);
    try {
      // Gọi API để in ảnh
      const result = await printApi.printImage(sessionId, selectedImageIndex + 1);
      
      if (!result.job_id) {
        throw new Error('Không nhận được job ID từ server.');
      }
      
      // Cập nhật state với job ID
      printImage(result.job_id);
      
    } catch (error) {
      console.error('Error printing image:', error);
      setError(error.message || 'Đã xảy ra lỗi khi gửi yêu cầu in ảnh.');
    } finally {
      setIsPrinting(false);
    }
  };
  
  const openFullScreen = (index) => {
    setFullScreenImage(generatedImages[index]);
  };
  
  const closeFullScreen = () => {
    setFullScreenImage(null);
  };
  
  const handleImageClick = (index) => {
    selectImage(index);
  };
  
  const handlePrintConfirm = () => {
    setConfirmOpen(true);
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
        Kết quả
      </Typography>
      
      <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 3 }}>
        Dựa trên mô tả: "<i>{prompt}</i>"
      </Typography>
      
      <Grid container spacing={3} className="results-grid">
        {generatedImages.map((image, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card 
              elevation={selectedImageIndex === index ? 8 : 3}
              sx={{
                position: 'relative',
                border: selectedImageIndex === index ? '3px solid #4caf50' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <CardActionArea 
                onClick={() => handleImageClick(index)}
                onDoubleClick={() => openFullScreen(index)}
              >
                <CardMedia
                  component="img"
                  image={image.url}
                  alt={`Generated image ${index + 1}`}
                  height={300}
                  sx={{ objectFit: 'cover' }}
                />
                {selectedImageIndex === index && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      backgroundColor: 'rgba(76, 175, 80, 0.9)',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CheckCircle sx={{ color: 'white' }} />
                  </Box>
                )}
              </CardActionArea>
              <CardContent sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Hình ảnh {index + 1} {selectedImageIndex === index && '(Đã chọn)'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={resetApp}
        >
          Tạo mới
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary"
          startIcon={<Refresh />}
          onClick={() => window.location.reload()}
          sx={{ mx: 2 }}
        >
          Tạo lại
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Print />}
          onClick={handlePrintConfirm}
          disabled={selectedImageIndex === null || isPrinting}
          sx={{ minWidth: 120 }}
        >
          {isPrinting ? (
            <>
              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} /> 
              Đang xử lý...
            </>
          ) : 'In ảnh'}
        </Button>
      </Box>
      
      <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
        Chọn một hình ảnh bằng cách nhấp vào ảnh, hoặc nhấp đúp để xem ảnh lớn hơn
      </Typography>
      
      {/* Dialog xác nhận in */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="print-confirm-dialog"
      >
        <DialogTitle id="print-confirm-dialog">Xác nhận in ảnh</DialogTitle>
        <DialogContent>
          {selectedImageIndex !== null && (
            <>
              <Typography variant="body1" paragraph>
                Bạn có chắc chắn muốn in ảnh này?
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <img
                  src={generatedImages[selectedImageIndex].url}
                  alt="Selected image"
                  style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="primary">
            Hủy
          </Button>
          <Button onClick={handlePrint} color="primary" variant="contained" autoFocus>
            In
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog xem ảnh toàn màn hình */}
      <Dialog
        open={fullScreenImage !== null}
        onClose={closeFullScreen}
        maxWidth="lg"
      >
        <DialogContent sx={{ p: 0 }}>
          {fullScreenImage && (
            <img
              src={fullScreenImage.url}
              alt="Full size image"
              style={{ width: '100%', display: 'block' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFullScreen} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResultScreen;
