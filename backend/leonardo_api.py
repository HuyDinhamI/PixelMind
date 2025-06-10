import json
import requests
import time
import os
import uuid
import logging
import asyncio
from dotenv import load_dotenv
from gemini_service import GeminiService

# Load environment variables
load_dotenv()

# Setup detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class LeonardoAPI:
    def __init__(self):
        self.api_key = os.getenv("LEONARDO_API_KEY")
        self.authorization = f"Bearer {self.api_key}"
        self.headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": self.authorization
        }
        # Sử dụng PhotoReal v2 - tốt hơn cho chỉnh sửa ảnh thực tế
        self.model_id = "1e60896f-3c26-4296-8ecc-53e2afecc132"  # PhotoReal v2
        # Initialize Gemini service for translation
        self.gemini_service = GeminiService()
        logger.info(f"LeonardoAPI initialized with model: {self.model_id}")
    
    def enhance_prompt(self, user_prompt):
        """Cải thiện prompt để giữ nguyên ảnh gốc và chỉ thay đổi theo yêu cầu"""
        logger.info(f"Original prompt: '{user_prompt}'")
        
        # Prefix để giữ nguyên composition và chất lượng
        prefix = "High quality photo, preserve original composition and lighting, subtle enhancement, "
        
        # Suffix để đảm bảo ảnh thực tế và ít thay đổi
        suffix = ", keep original colors and style, minimal changes, realistic, photorealistic"
        
        # Kết hợp prompt
        enhanced = f"{prefix}{user_prompt}{suffix}"
        
        logger.info(f"Enhanced prompt: '{enhanced}'")
        logger.info(f"Prompt length: {len(enhanced)} characters")
        
        return enhanced
    
    async def translate_and_enhance_prompt(self, vietnamese_prompt):
        """Dịch prompt từ tiếng Việt sang tiếng Anh và enhance"""
        try:
            # Attempt translation
            logger.info(f"Attempting to translate: '{vietnamese_prompt}'")
            english_prompt = await self.gemini_service.translate_to_english(vietnamese_prompt)
            logger.info(f"Translation successful: {vietnamese_prompt} → {english_prompt}")
            working_prompt = english_prompt
        except Exception as e:
            # Fallback to Vietnamese
            logger.warning(f"Translation failed, using Vietnamese: {str(e)}")
            working_prompt = vietnamese_prompt
        
        # Enhance prompt (works with both languages)
        return self.enhance_prompt(working_prompt)
    
    def upload_image(self, image_path):
        """Upload image to Leonardo and get image ID"""
        try:
            logger.info(f"Starting image upload: {image_path}")
            
            # Check file exists and get size
            if not os.path.exists(image_path):
                error_msg = f"Image file not found: {image_path}"
                logger.error(error_msg)
                return None, error_msg
            
            file_size = os.path.getsize(image_path)
            logger.info(f"Image file size: {file_size} bytes")
            
            # Get presigned URL
            url = "https://cloud.leonardo.ai/api/rest/v1/init-image"
            payload = {"extension": "jpg"}
            
            logger.info(f"Requesting presigned URL from: {url}")
            logger.info(f"Payload: {payload}")
            
            response = requests.post(url, json=payload, headers=self.headers)
            
            logger.info(f"Presigned URL response status: {response.status_code}")
            
            if response.status_code != 200:
                error_msg = f"Failed to get presigned URL: {response.status_code}"
                logger.error(f"{error_msg} - Response: {response.text}")
                return None, error_msg
            
            response_data = response.json()
            logger.info(f"Presigned URL response: {response_data}")
            
            fields = json.loads(response_data['uploadInitImage']['fields'])
            upload_url = response_data['uploadInitImage']['url']
            image_id = response_data['uploadInitImage']['id']
            
            logger.info(f"Upload URL: {upload_url}")
            logger.info(f"Image ID: {image_id}")
            
            # Upload image
            logger.info("Starting image upload to presigned URL...")
            with open(image_path, 'rb') as f:
                files = {'file': f}
                upload_response = requests.post(upload_url, data=fields, files=files)
            
            logger.info(f"Image upload response status: {upload_response.status_code}")
            
            if upload_response.status_code != 204:
                error_msg = f"Failed to upload image: {upload_response.status_code}"
                logger.error(f"{error_msg} - Response: {upload_response.text}")
                return None, error_msg
            
            logger.info(f"Image uploaded successfully with ID: {image_id}")
            return image_id, None
            
        except Exception as e:
            error_msg = f"Exception during image upload: {str(e)}"
            logger.error(error_msg)
            return None, error_msg
    
    async def generate_image(self, image_path, prompt, strength=0.3):
        """Generate image with Leonardo AI với thông số tối ưu và đơn giản"""
        try:
            logger.info("=== STARTING IMAGE GENERATION ===")
            logger.info(f"Image path: {image_path}")
            logger.info(f"Original prompt: '{prompt}'")
            logger.info(f"Strength: {strength}")
            
            # Upload image first
            logger.info("Step 1: Uploading image...")
            image_id, error = self.upload_image(image_path)
            if error:
                logger.error(f"Image upload failed: {error}")
                return {'success': False, 'error': error}
            
            logger.info(f"Image upload successful, ID: {image_id}")
            
            # Translate and enhance prompt
            logger.info("Step 2: Translating and enhancing prompt...")
            enhanced_prompt = await self.translate_and_enhance_prompt(prompt)
            
            # Generate image với thông số tối ưu cố định
            logger.info("Step 3: Preparing generation request...")
            url = "https://cloud.leonardo.ai/api/rest/v1/generations"
            payload = {
                "height": 512,
                "modelId": self.model_id,
                "prompt": enhanced_prompt,
                "width": 512,
                "imagePrompts": [image_id],
                "num_images": 1,  # Tạo 2 ảnh để có lựa chọn
                
            }
            
            logger.info(f"Generation URL: {url}")
            logger.info(f"Generation payload: {json.dumps(payload, indent=2)}")
            
            logger.info("Step 4: Sending generation request...")
            response = requests.post(url, json=payload, headers=self.headers)
            
            logger.info(f"Generation response status: {response.status_code}")
            logger.info(f"Generation response headers: {dict(response.headers)}")
            
            if response.status_code != 200:
                error_msg = f"Generation failed: {response.status_code}"
                logger.error(f"{error_msg}")
                logger.error(f"Response body: {response.text}")
                
                # Try to parse error details
                try:
                    error_data = response.json()
                    logger.error(f"Parsed error data: {json.dumps(error_data, indent=2)}")
                except:
                    logger.error("Could not parse error response as JSON")
                
                return {'success': False, 'error': f"{error_msg} - {response.text}"}
            
            response_data = response.json()
            logger.info(f"Generation response data: {json.dumps(response_data, indent=2)}")
            
            generation_id = response_data['sdGenerationJob']['generationId']
            logger.info(f"Generation ID: {generation_id}")
            
            # Wait for generation to complete
            logger.info("Step 5: Waiting for generation to complete (25s)...")
            time.sleep(25)  # Optimized wait time
            
            # Get results
            logger.info("Step 6: Fetching generation results...")
            result_url = f"https://cloud.leonardo.ai/api/rest/v1/generations/{generation_id}"
            logger.info(f"Result URL: {result_url}")
            
            result_response = requests.get(result_url, headers=self.headers)
            
            logger.info(f"Result response status: {result_response.status_code}")
            
            if result_response.status_code != 200:
                error_msg = f"Failed to get results: {result_response.status_code}"
                logger.error(f"{error_msg} - Response: {result_response.text}")
                return {'success': False, 'error': error_msg}
            
            data = result_response.json()
            logger.info(f"Result response data: {json.dumps(data, indent=2)}")
            
            images = data["generations_by_pk"]["generated_images"]
            
            if not images:
                error_msg = 'No images generated'
                logger.error(error_msg)
                logger.error(f"Full response data: {json.dumps(data, indent=2)}")
                return {'success': False, 'error': error_msg}
            
            logger.info(f"Found {len(images)} generated images")
            
            # Download và save tất cả ảnh được tạo
            logger.info("Step 7: Downloading and saving generated images...")
            result_images = []
            for i, img in enumerate(images):
                img_url = img["url"]
                logger.info(f"Downloading image {i+1}: {img_url}")
                
                img_data = requests.get(img_url).content
                logger.info(f"Downloaded {len(img_data)} bytes for image {i+1}")
                
                # Save to results folder
                filename = f"{uuid.uuid4()}_generated_{i+1}.jpg"
                result_path = os.path.join('results', filename)
                
                logger.info(f"Saving image {i+1} to: {result_path}")
                
                with open(result_path, 'wb') as f:
                    f.write(img_data)
                
                logger.info(f"Saved image {i+1} successfully")
                
                result_images.append({
                    'url': f'/api/result/{filename}',
                    'filename': filename
                })
            
            logger.info("=== IMAGE GENERATION COMPLETED SUCCESSFULLY ===")
            
            return {
                'success': True,
                'images': result_images,
                'primary_image': result_images[0],  # Ảnh chính
                'enhanced_prompt': enhanced_prompt,  # Trả về prompt đã cải thiện
                'settings': {
                    'strength': strength,
                    'guidance_scale': 7,
                    'num_images': 2,
                    'model': 'PhotoReal v2',
                    'optimized': True
                }
            }
            
        except Exception as e:
            error_msg = f"Exception during image generation: {str(e)}"
            logger.error(error_msg)
            logger.exception("Full exception traceback:")
            return {'success': False, 'error': error_msg}
