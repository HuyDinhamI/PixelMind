import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Fade,
  useTheme
} from '@mui/material';
import { CameraAlt, TouchApp } from '@mui/icons-material';
import { useAppState } from '../context/AppStateContext';

const WelcomeScreen = () => {
  const theme = useTheme();
  const { startApp } = useAppState();
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Danh sách ảnh mẫu để hiển thị (giả lập)
  const sampleImages = [
    'https://cdn.leonardo.ai/users/ff3b8a3c-345b-46c8-9b6b-44903c359fd2/generations/c6174404-a90a-489e-a212-5447e7cd0447/variations/Default_anime_style_young_woman_with_brown_hair_and_green_ey_3.jpg',
    'https://cdn.leonardo.ai/users/b2eaec87-3f31-4053-8b93-a86e99ad8d78/generations/826de2e0-94a9-4d53-97e1-f7f246fad1cd/DreamShaper_v7_beautifull_painting_in_a_renaissance_style_full_0.jpg',
    'https://cdn.leonardo.ai/users/9b62e517-9d83-4ea8-a67c-2f89b9dd6ef5/generations/1de7ce3a-8979-44ea-a31f-8eb0080e24c5/RPG_v5_a_cyberpunk_character_portrait_for_tabletop_roleplaying_0.jpg',
    'https://cdn.leonardo.ai/users/d725ecda-8b8f-4f1d-bf45-94d0a5149ddb/generations/9a7e7508-8827-4f8a-82cc-b0de303866c8/variations/Default_8k_professional_shot_portrait_romanticrealistic_light_0.jpg'
  ];
  
  // Thay đổi slide mỗi 5 giây
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % sampleImages.length);
    }, 5000);
    
    return () => clearInterval(slideInterval);
  }, [sampleImages.length]);
  
  return (
    <Box 
      className="fullscreen-container" 
      sx={{ 
        backgroundColor: '#121212',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background slideshow */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        "&::before": {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 1
        }
      }}>
        {sampleImages.map((img, idx) => (
          <Fade 
            key={idx} 
            in={activeSlide === idx} 
            timeout={1000}
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              display: activeSlide === idx ? 'block' : 'none'
            }}
          >
            <img 
              src={img}
              alt={`Sample ${idx}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.5
              }}
            />
          </Fade>
        ))}
      </Box>
      
      {/* Content */}
      <Box sx={{ zIndex: 2, textAlign: 'center', px: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h1" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'white',
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
              textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
              mb: 2
            }}
          >
            AI Photo Booth
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'white', 
              mb: 4,
              maxWidth: 700,
              mx: 'auto',
              textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
            }}
          >
            Chụp ảnh và biến hóa thành tác phẩm nghệ thuật AI tuyệt đẹp
          </Typography>
        </Box>
        
        <Paper 
          elevation={10} 
          sx={{ 
            p: 4, 
            borderRadius: 4, 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            maxWidth: 500,
            mx: 'auto'
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Hãy bắt đầu trải nghiệm
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4 }}>
            Chỉ với 3 bước đơn giản:
            <br />
            1. Chụp một tấm ảnh
            <br />
            2. Mô tả phong cách bạn muốn biến đổi
            <br />
            3. Chọn hình ảnh bạn thích nhất và in ra
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<CameraAlt />}
            endIcon={<TouchApp />}
            onClick={startApp}
            sx={{ 
              py: 2, 
              px: 4, 
              fontSize: '1.2rem',
              borderRadius: 8,
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)'
            }}
          >
            Bắt đầu
          </Button>
          
          <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
            Nhấn vào nút trên để bắt đầu trải nghiệm
          </Typography>
        </Paper>
      </Box>
      
      <Box sx={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', zIndex: 2 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Được phát triển với Leonardo.ai
        </Typography>
      </Box>
    </Box>
  );
};

export default WelcomeScreen;
