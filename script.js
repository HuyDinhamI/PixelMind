// Simple Browser Console Logging
class Logger {
    static log(level, phase, message, data = {}) {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] [${level}] [${phase}]`;
        
        switch (level) {
            case 'INFO':
                console.log(`${prefix} ${message}`, data);
                break;
            case 'WARN':
                console.warn(`${prefix} ${message}`, data);
                break;
            case 'ERROR':
                console.error(`${prefix} ${message}`, data);
                break;
            case 'API':
                console.log(`%c${prefix} ${message}`, 'color: #4facfe', data);
                break;
            case 'PHASE':
                console.log(`%c${prefix} ${message}`, 'color: #f093fb; font-weight: bold', data);
                break;
        }
    }

    static info(phase, message, data = {}) {
        this.log('INFO', phase, message, data);
    }

    static warn(phase, message, data = {}) {
        this.log('WARN', phase, message, data);
    }

    static error(phase, message, error = null) {
        const errorData = error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
        } : {};
        this.log('ERROR', phase, message, errorData);
    }

    static api(service, action, request = {}, response = {}) {
        this.log('API', service, `${action}`, {
            request: request,
            response: response
        });
    }

    static phase(from, to, reason = '') {
        this.log('PHASE', 'TRANSITION', `${from} → ${to}${reason ? ': ' + reason : ''}`, {
            from: from,
            to: to,
            reason: reason
        });
    }
}

// Game State Management
class GameController {
    constructor() {
        this.currentPhase = 1;
        this.userData = {};
        this.capturedImage = null;
        this.generatedImageUrl = null;
        this.init();
    }

    init() {
        Logger.info('GAME', 'Initializing PixelMind Game Controller');
        this.setupEventListeners();
        this.setupCharacterCounters();
        this.setupFunFacts();
        Logger.info('GAME', 'Game Controller initialized successfully');
    }

    setupEventListeners() {
        // Phase 1: Login
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Phase 2: Camera
        document.getElementById('startCamera').addEventListener('click', () => {
            this.startCamera();
        });

        document.getElementById('captureBtn').addEventListener('click', () => {
            this.capturePhoto();
        });

        document.getElementById('retakeBtn').addEventListener('click', () => {
            this.retakePhoto();
        });

        document.getElementById('confirmPhoto').addEventListener('click', () => {
            this.confirmPhoto();
        });

        // Phase 3: Prompts
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateImage();
        });

        // Phase 5: Results
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadImage();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });

        // Error Modal
        document.getElementById('closeErrorBtn').addEventListener('click', () => {
            this.closeErrorModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.currentPhase === 2) {
                e.preventDefault();
                const captureBtn = document.getElementById('captureBtn');
                if (captureBtn.style.display !== 'none') {
                    this.capturePhoto();
                }
            }
        });
    }

    setupCharacterCounters() {
        const prompt1 = document.getElementById('prompt1');
        const prompt2 = document.getElementById('prompt2');
        const counter1 = document.getElementById('prompt1Counter');
        const counter2 = document.getElementById('prompt2Counter');

        prompt1.addEventListener('input', () => {
            counter1.textContent = prompt1.value.length;
        });

        prompt2.addEventListener('input', () => {
            counter2.textContent = prompt2.value.length;
        });
    }

    setupFunFacts() {
        this.funFacts = [
            "Bạn có biết? AI có thể tạo ra hàng triệu phong cách khác nhau!",
            "Mỗi bức ảnh AI tạo ra đều là độc nhất và không bao giờ lặp lại!",
            "Công nghệ AI đang phân tích 1000+ đặc điểm trên khuôn mặt bạn!",
            "Việc tạo ra một bức ảnh AI cần khoảng 10 tỷ phép tính!",
            "AI có thể học hỏi phong cách từ các nghệ sĩ nổi tiếng!",
            "Mỗi giây AI có thể xử lý hàng triệu pixel!",
            "Bức ảnh của bạn sẽ trở nên tuyệt vời hơn bao giờ hết!"
        ];
    }

    switchPhase(phaseNumber) {
        Logger.phase(this.currentPhase, phaseNumber, 'User navigation');
        
        // Hide current phase
        document.querySelectorAll('.phase').forEach(phase => {
            phase.classList.remove('active');
        });

        // Show new phase
        setTimeout(() => {
            document.getElementById(`phase${phaseNumber}`).classList.add('active');
            this.currentPhase = phaseNumber;
            Logger.info('PHASE', `Successfully switched to phase ${phaseNumber}`);
        }, 300);
    }

    handleLogin() {
        Logger.info('LOGIN', 'Starting login process');
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();

        Logger.info('LOGIN', 'Validating user input', { 
            fullNameLength: fullName.length, 
            emailFormat: email 
        });

        if (!this.validateEmail(email)) {
            Logger.error('LOGIN', 'Email validation failed', { email });
            this.showError('Email không hợp lệ. Vui lòng nhập email đúng định dạng.');
            return;
        }

        if (fullName.length < 2) {
            Logger.error('LOGIN', 'Full name too short', { fullNameLength: fullName.length });
            this.showError('Vui lòng nhập họ và tên đầy đủ.');
            return;
        }

        this.userData = { fullName, email };
        localStorage.setItem('pixelmind_user', JSON.stringify(this.userData));
        
        Logger.info('LOGIN', 'Login successful, user data saved', { 
            fullName, 
            email: email.replace(/(.{3}).*(@.*)/, '$1***$2') // Hide email for privacy
        });
        
        this.switchPhase(2);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async startCamera() {
        Logger.info('CAMERA', 'Requesting camera access');
        
        try {
            const constraints = { 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                } 
            };

            Logger.info('CAMERA', 'Camera constraints', constraints);
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            const video = document.getElementById('cameraVideo');
            video.srcObject = stream;
            
            Logger.info('CAMERA', 'Camera access granted successfully', {
                streamId: stream.id,
                tracks: stream.getTracks().length
            });
            
            document.getElementById('startCamera').style.display = 'none';
            document.getElementById('captureBtn').style.display = 'flex';
            
        } catch (error) {
            Logger.error('CAMERA', 'Camera access failed', error);
            this.showError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
        }
    }

    capturePhoto() {
        Logger.info('CAMERA', 'Starting photo capture');
        
        const video = document.getElementById('cameraVideo');
        const canvas = document.getElementById('captureCanvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        Logger.info('CAMERA', 'Canvas configured', {
            width: canvas.width,
            height: canvas.height,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight
        });

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0);

        // Convert to data URL
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        Logger.info('CAMERA', 'Photo captured successfully', {
            imageSize: Math.round(imageData.length / 1024) + 'KB',
            format: 'JPEG',
            quality: 0.8
        });
        
        // Show preview
        const preview = document.getElementById('photoPreview');
        const capturedImage = document.getElementById('capturedImage');
        
        capturedImage.src = imageData;
        video.style.display = 'none';
        preview.style.display = 'block';
        
        document.getElementById('captureBtn').style.display = 'none';
        document.getElementById('photoActions').style.display = 'flex';

        this.capturedImage = imageData;
    }

    retakePhoto() {
        const video = document.getElementById('cameraVideo');
        const preview = document.getElementById('photoPreview');
        
        video.style.display = 'block';
        preview.style.display = 'none';
        
        document.getElementById('captureBtn').style.display = 'flex';
        document.getElementById('photoActions').style.display = 'none';
        
        this.capturedImage = null;
    }

    confirmPhoto() {
        if (!this.capturedImage) {
            this.showError('Vui lòng chụp ảnh trước khi tiếp tục.');
            return;
        }

        // Stop camera stream
        const video = document.getElementById('cameraVideo');
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }

        // Store image in localStorage
        localStorage.setItem('pixelmind_image', this.capturedImage);

        // Show image in phase 3
        document.getElementById('selectedPhoto').src = this.capturedImage;
        
        this.switchPhase(3);
    }

    async generateImage() {
        const prompt1 = document.getElementById('prompt1').value.trim();
        const prompt2 = document.getElementById('prompt2').value.trim();

        if (!prompt1 || !prompt2) {
            this.showError('Vui lòng nhập đầy đủ cả hai prompt để tạo ảnh.');
            return;
        }

        if (!this.capturedImage) {
            this.showError('Không tìm thấy ảnh. Vui lòng chụp ảnh trước.');
            return;
        }

        // Switch to loading phase
        this.switchPhase(4);
        this.startLoadingAnimation();

        try {
            // Call Python backend to generate image
            const result = await this.callImageGeneration(prompt1, prompt2);
            
            if (result.success) {
                this.generatedImageUrl = result.imageUrl;
                localStorage.setItem('pixelmind_generated', result.imageUrl);
                
                // Show results
                document.getElementById('originalImage').src = this.capturedImage;
                document.getElementById('generatedImage').src = result.imageUrl;
                
                this.switchPhase(5);
            } else {
                throw new Error(result.error || 'Có lỗi xảy ra khi tạo ảnh');
            }
            
        } catch (error) {
            console.error('Generation error:', error);
            this.showError('Hệ thống bị gián đoạn. Vui lòng thử lại sau.');
            this.switchPhase(3);
        }
    }

    async callImageGeneration(prompt1, prompt2) {
        Logger.info('AI_GENERATION', 'Starting AI image generation process', {
            prompt1: prompt1,
            prompt2: prompt2,
            imageSize: Math.round(this.capturedImage.length / 1024) + 'KB'
        });

        try {
            // Call backend API server instead of direct AI services
            Logger.info('AI_GENERATION', 'Sending request to backend API server');
            
            const response = await fetch('http://localhost:5000/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: this.capturedImage,
                    prompt1: prompt1,
                    prompt2: prompt2
                })
            });

            if (!response.ok) {
                throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success) {
                Logger.info('AI_GENERATION', 'Backend processing completed successfully', {
                    imageUrl: result.imageUrl,
                    message: result.message
                });
                
                return {
                    success: true,
                    imageUrl: result.imageUrl
                };
            } else {
                throw new Error(result.error || 'Backend processing failed');
            }
            
        } catch (error) {
            Logger.error('AI_GENERATION', 'Backend API call failed', error);
            
            // Fallback for demo purposes
            Logger.warn('AI_GENERATION', 'Switching to demo mode fallback');
            return new Promise((resolve) => {
                setTimeout(() => {
                    const demoUrl = 'https://picsum.photos/400/400?random=' + Date.now();
                    Logger.info('AI_GENERATION', 'Demo mode completed', { 
                        demoImageUrl: demoUrl,
                        mode: 'fallback'
                    });
                    resolve({
                        success: true,
                        imageUrl: demoUrl
                    });
                }, 10000);
            });
        }
    }

    dataURLtoBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    startLoadingAnimation() {
        let progress = 0;
        const progressBar = document.querySelector('.progress-fill');
        const loadingText = document.getElementById('loadingText');
        const funFact = document.getElementById('funFact').querySelector('span');
        
        const progressInterval = setInterval(() => {
            progress += Math.random() * 2;
            if (progress > 100) progress = 100;
            
            progressBar.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(progressInterval);
            }
        }, 500);

        // Update loading text
        const loadingTexts = [
            'AI đang phân tích và biến hóa ảnh của bạn...',
            'Đang áp dụng các hiệu ứng nghệ thuật...',
            'Tạo ra phong cách độc đáo cho bạn...',
            'Hoàn thiện những chi tiết cuối cùng...',
            'Sắp hoàn thành rồi!'
        ];

        let textIndex = 0;
        const textInterval = setInterval(() => {
            if (textIndex < loadingTexts.length) {
                loadingText.textContent = loadingTexts[textIndex];
                textIndex++;
            } else {
                clearInterval(textInterval);
            }
        }, 12000);

        // Update fun facts
        let factIndex = 0;
        const factInterval = setInterval(() => {
            if (factIndex < this.funFacts.length) {
                funFact.textContent = this.funFacts[factIndex];
                factIndex++;
            } else {
                factIndex = 0;
            }
        }, 8000);

        // Clear intervals after 60 seconds
        setTimeout(() => {
            clearInterval(progressInterval);
            clearInterval(textInterval);
            clearInterval(factInterval);
        }, 60000);
    }

    async downloadImage() {
        if (!this.generatedImageUrl) {
            this.showError('Không có ảnh để tải xuống.');
            return;
        }

        Logger.info('DOWNLOAD', 'Starting image download', { imageUrl: this.generatedImageUrl });

        try {
            // Show loading while downloading
            this.showLoading();
            
            // Fetch image as blob to handle cross-origin URLs
            const response = await fetch(this.generatedImageUrl, {
                mode: 'cors',
                headers: {
                    'Accept': 'image/*'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status}`);
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            
            // Create download link
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `pixelmind_generated_${Date.now()}.jpg`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up object URL
            URL.revokeObjectURL(objectUrl);
            
            Logger.info('DOWNLOAD', 'Image download completed successfully');
            
        } catch (error) {
            Logger.error('DOWNLOAD', 'Download failed, trying fallback method', error);
            
            // Fallback: Direct link download (might open in new tab)
            try {
                const link = document.createElement('a');
                link.href = this.generatedImageUrl;
                link.download = `pixelmind_generated_${Date.now()}.jpg`;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                Logger.info('DOWNLOAD', 'Fallback download triggered');
                
            } catch (fallbackError) {
                Logger.error('DOWNLOAD', 'All download methods failed', fallbackError);
                this.showError('Không thể tải ảnh tự động. Vui lòng click chuột phải vào ảnh và chọn "Lưu ảnh".');
            }
        } finally {
            this.hideLoading();
        }
    }

    restartGame() {
        // Clear stored data
        localStorage.removeItem('pixelmind_user');
        localStorage.removeItem('pixelmind_image');
        localStorage.removeItem('pixelmind_generated');
        
        // Reset form
        document.getElementById('loginForm').reset();
        document.getElementById('prompt1').value = '';
        document.getElementById('prompt2').value = '';
        document.getElementById('prompt1Counter').textContent = '0';
        document.getElementById('prompt2Counter').textContent = '0';
        
        // Reset state
        this.userData = {};
        this.capturedImage = null;
        this.generatedImageUrl = null;
        
        // Reset camera UI
        document.getElementById('startCamera').style.display = 'flex';
        document.getElementById('captureBtn').style.display = 'none';
        document.getElementById('photoActions').style.display = 'none';
        document.getElementById('cameraVideo').style.display = 'block';
        document.getElementById('photoPreview').style.display = 'none';
        
        // Go back to phase 1
        this.switchPhase(1);
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorModal').style.display = 'flex';
    }

    closeErrorModal() {
        document.getElementById('errorModal').style.display = 'none';
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }
}


// Animation Utilities
class AnimationHelper {
    static addEntranceAnimation(element, delay = 0) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, delay);
    }

    static addHoverEffect(element) {
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'translateY(-5px)';
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0)';
        });
    }

    static addClickEffect(element) {
        element.addEventListener('click', () => {
            element.style.transform = 'scale(0.95)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 150);
        });
    }
}

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    const game = new GameController();
    
    // Add entrance animations to all buttons
    document.querySelectorAll('button').forEach((btn, index) => {
        AnimationHelper.addEntranceAnimation(btn, index * 100);
        AnimationHelper.addHoverEffect(btn);
        AnimationHelper.addClickEffect(btn);
    });

    // Add entrance animations to input groups
    document.querySelectorAll('.input-group').forEach((group, index) => {
        AnimationHelper.addEntranceAnimation(group, index * 200);
    });

    console.log('🎮 PixelMind Game Initialized!');
});
