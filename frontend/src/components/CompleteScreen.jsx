import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress
} from '@mui/material';
import { CheckCircle, RestartAlt } from '@mui/icons-material';
import { useAppState } from '../context/AppStateContext';
import { generationApi } from '../services/api';

const CompleteScreen = () => {
  const [countdown, setCountdown] = useState(15);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const { sessionId, selectedImageIndex, generatedImages, resetApp } = useAppState();
  const confettiRef = useRef(null);
  
  // Tạo hiệu ứng confetti
  useEffect(() => {
    // Tạo các phần tử confetti
    const colors = ['#f44336', '#2196f3', '#4caf50', '#ffeb3b', '#9c27b0'];
    const container = confettiRef.current;
    
    if (container) {
      // Xóa confetti cũ nếu có
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      // Tạo 50 confetti mới
      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.classList.add('confetti');
        if (i % 5 === 0) confetti.classList.add('blue');
        else if (i % 5 === 1) confetti.classList.add('green');
        else if (i % 5 === 2) confetti.classList.add('yellow');
        else if (i % 5 === 3) confetti.classList.add('purple');
        
        // Random position
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDuration = (3 + Math.random() * 4) + 's';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        
        container.appendChild(confetti);
      }
    }
  }, []);
  
  // Đếm ngược tự động reset
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(timer);
          handleReset();
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Xử lý reset
  const handleReset = async () => {
    setIsCleaningUp(true);
    
    // Dọn dẹp session trên server nếu cần
    if (sessionId) {
      try {
        await generationApi.cleanupSession(sessionId);
      } catch (error) {
        console.error('Error cleaning up session:', error);
        // Không cần hiển thị lỗi này cho người dùng
      }
    }
    
    // Reset state của ứng dụng
    resetApp();
    setIsCleaningUp(false);
  };
  
  return (
    <Box className="fullscreen-container" sx={{ backgroundColor: '#1a1a2e', overflow: 'hidden', position: 'relative' }}>
      {/* Container for confetti */}
      <div ref={confettiRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}></div>
      <Box className="loading-container" sx={{ textAlign: 'center', p: 3 }}>
        <Paper elevation={6} sx={{ 
          p: 4, 
          borderRadius: 3, 
          maxWidth: 600, 
          mx: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}>
          <CheckCircle fontSize="large" color="success" sx={{ fontSize: 80, mb: 2 }} className="pulse" />
          
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }} className="fade-in-down">
            Cảm ơn bạn!
          </Typography>
          
          {selectedImageIndex !== null && generatedImages[selectedImageIndex] && (
            <Box sx={{ my: 3 }}>
              <Typography variant="h6" gutterBottom>
                Ảnh của bạn đã được in thành công
              </Typography>
              <Box sx={{ 
                position: 'relative', 
                borderRadius: 4, 
                overflow: 'hidden',
                transition: 'transform 0.5s ease', 
                '&:hover': { transform: 'scale(1.03)' } 
              }}>
                <img
                  src={generatedImages[selectedImageIndex].url}
                  alt="Ảnh đã in"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: 300, 
                    borderRadius: 8, 
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                    animation: 'fadeInUp 0.8s ease'
                  }}
                />
              </Box>
            </Box>
          )}
          
          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Hãy đón nhận ảnh của bạn!
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<RestartAlt />}
            onClick={handleReset}
            disabled={isCleaningUp}
            className="interactive-button"
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.5, 
              px: 4, 
              fontSize: '1.2rem',
              borderRadius: 8,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
            }}
          >
            {isCleaningUp ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} /> 
                Đang khởi tạo lại...
              </>
            ) : 'Bắt đầu mới'}
          </Button>
          
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Tự động bắt đầu lại sau <b>{countdown}</b> giây
          </Typography>
          
          <Box sx={{ mt: 4, p: 2, borderTop: '1px solid #eee' }}>
            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
              Hãy thử trải nghiệm thêm lần nữa với một ảnh và phong cách mới!
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default CompleteScreen;
