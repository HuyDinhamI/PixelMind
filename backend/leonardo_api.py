import json
import requests
import time
import os
import uuid

class LeonardoAPI:
    def __init__(self):
        self.api_key = "5605afe7-1f6d-40fd-979e-22b7f2df72ce"
        self.authorization = f"Bearer {self.api_key}"
        self.headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": self.authorization
        }
        # Sử dụng PhotoReal v2 - tốt hơn cho chỉnh sửa ảnh thực tế
        self.model_id = "1e60896f-3c26-4296-8ecc-53e2afecc132"  # PhotoReal v2
    
    def enhance_prompt(self, user_prompt):
        """Cải thiện prompt để giữ nguyên ảnh gốc và chỉ thay đổi theo yêu cầu"""
        # Prefix để giữ nguyên composition và chất lượng
        prefix = "High quality photo, preserve original composition and lighting, subtle enhancement, "
        
        # Suffix để đảm bảo ảnh thực tế và ít thay đổi
        suffix = ", keep original colors and style, minimal changes, realistic, photorealistic"
        
        # Kết hợp prompt
        enhanced = f"{prefix}{user_prompt}{suffix}"
        
        return enhanced
    
    def upload_image(self, image_path):
        """Upload image to Leonardo and get image ID"""
        try:
            # Get presigned URL
            url = "https://cloud.leonardo.ai/api/rest/v1/init-image"
            payload = {"extension": "jpg"}
            
            response = requests.post(url, json=payload, headers=self.headers)
            
            if response.status_code != 200:
                return None, f"Failed to get presigned URL: {response.status_code}"
            
            response_data = response.json()
            fields = json.loads(response_data['uploadInitImage']['fields'])
            upload_url = response_data['uploadInitImage']['url']
            image_id = response_data['uploadInitImage']['id']
            
            # Upload image
            with open(image_path, 'rb') as f:
                files = {'file': f}
                upload_response = requests.post(upload_url, data=fields, files=files)
            
            if upload_response.status_code != 204:
                return None, f"Failed to upload image: {upload_response.status_code}"
            
            return image_id, None
            
        except Exception as e:
            return None, str(e)
    
    def generate_image(self, image_path, prompt, strength=0.3):
        """Generate image with Leonardo AI với thông số tối ưu và đơn giản"""
        try:
            # Upload image first
            image_id, error = self.upload_image(image_path)
            if error:
                return {'success': False, 'error': error}
            
            # Cải thiện prompt
            enhanced_prompt = self.enhance_prompt(prompt)
            
            # Generate image với thông số tối ưu cố định
            url = "https://cloud.leonardo.ai/api/rest/v1/generations"
            payload = {
                "height": 512,
                "modelId": self.model_id,
                "prompt": enhanced_prompt,
                "width": 512,
                "imagePrompts": [image_id],
                "num_images": 2,  # Tạo 2 ảnh để có lựa chọn
                "guidance_scale": 7,  # Optimized value
                "strength": strength,  # Mức độ thay đổi (default 0.3)
                "promptMagic": True,  # Cải thiện prompt tự động
                "photoReal": True,  # Cho ảnh thực tế
                "num_inference_steps": 15,  # Optimized steps
                "presetStyle": "CINEMATIC"  # Style phù hợp với ảnh thực
            }
            
            response = requests.post(url, json=payload, headers=self.headers)
            
            if response.status_code != 200:
                return {'success': False, 'error': f"Generation failed: {response.status_code}"}
            
            generation_id = response.json()['sdGenerationJob']['generationId']
            
            # Wait for generation to complete
            time.sleep(25)  # Optimized wait time
            
            # Get results
            result_url = f"https://cloud.leonardo.ai/api/rest/v1/generations/{generation_id}"
            result_response = requests.get(result_url, headers=self.headers)
            
            if result_response.status_code != 200:
                return {'success': False, 'error': f"Failed to get results: {result_response.status_code}"}
            
            data = result_response.json()
            images = data["generations_by_pk"]["generated_images"]
            
            if not images:
                return {'success': False, 'error': 'No images generated'}
            
            # Download và save tất cả ảnh được tạo
            result_images = []
            for i, img in enumerate(images):
                img_url = img["url"]
                img_data = requests.get(img_url).content
                
                # Save to results folder
                filename = f"{uuid.uuid4()}_generated_{i+1}.jpg"
                result_path = os.path.join('results', filename)
                
                with open(result_path, 'wb') as f:
                    f.write(img_data)
                
                result_images.append({
                    'url': f'/api/result/{filename}',
                    'filename': filename
                })
            
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
            return {'success': False, 'error': str(e)}
