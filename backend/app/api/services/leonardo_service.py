import json
import os
import requests
import time
from app.core.config import settings

class LeonardoService:
    def __init__(self, api_key=None):
        self.api_key = api_key or settings.LEONARDO_API_KEY
        self.headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"Bearer {self.api_key}"
        }
        self.base_url = "https://cloud.leonardo.ai/api/rest/v1"
    
    def get_upload_url(self, extension="jpg"):
        """Lấy presigned URL để upload ảnh"""
        url = f"{self.base_url}/init-image"
        payload = {"extension": extension}
        
        response = requests.post(url, json=payload, headers=self.headers)
        if response.status_code != 200:
            raise Exception(f"Failed to get upload URL: {response.text}")
            
        return response.json()
    
    def upload_image(self, image_path):
        """Upload ảnh lên Leonardo.ai"""
        # Lấy presigned URL
        upload_data = self.get_upload_url(extension=image_path.split(".")[-1])
        
        fields = json.loads(upload_data['uploadInitImage']['fields'])
        url = upload_data['uploadInitImage']['url']
        image_id = upload_data['uploadInitImage']['id']
        
        # Upload ảnh
        with open(image_path, 'rb') as image_file:
            files = {'file': image_file}
            response = requests.post(url, data=fields, files=files)
        
        if response.status_code != 204:
            raise Exception(f"Failed to upload image: {response.status_code}")
            
        return image_id
    
    def generate_with_image_prompt(self, image_path, prompt, num_images=4, 
                                  width=512, height=512, 
                                  model_id="6bef9f1b-29cb-40c7-b9df-32b51c1f67d3"):
        """Sinh hình ảnh dựa trên ảnh đầu vào và prompt"""
        # Upload ảnh
        image_id = self.upload_image(image_path)
        
        # Tạo yêu cầu generation
        url = f"{self.base_url}/generations"
        payload = {
            "height": height,
            "width": width,
            "modelId": model_id,
            "prompt": prompt,
            "num_images": num_images,
            "imagePrompts": [image_id]
        }
        
        response = requests.post(url, json=payload, headers=self.headers)
        if response.status_code != 200:
            raise Exception(f"Failed to generate images: {response.text}")
            
        generation_data = response.json()
        return {
            "status": "processing",
            "generation_id": generation_data['sdGenerationJob']['generationId'],
            "estimated_completion": "20-30 seconds"
        }
    
    def check_generation_status(self, generation_id):
        """Kiểm tra trạng thái và lấy kết quả generation"""
        url = f"{self.base_url}/generations/{generation_id}"
        
        response = requests.get(url, headers=self.headers)
        if response.status_code != 200:
            raise Exception(f"Failed to check generation status: {response.text}")
            
        return response.json()
    
    def save_generated_images(self, generation_id, save_dir):
        """Lưu các ảnh đã tạo vào thư mục"""
        status_data = self.check_generation_status(generation_id)
        
        # Kiểm tra nếu generation đã hoàn thành
        if status_data.get('generations_by_pk', {}).get('status') != 'COMPLETE':
            raise Exception("Generation is not complete yet")
            
        # Lấy URLs của các ảnh đã tạo
        generated_images = status_data.get('generations_by_pk', {}).get('generated_images', [])
        if not generated_images:
            raise Exception("No images were generated")
            
        # Tạo thư mục nếu chưa tồn tại
        os.makedirs(save_dir, exist_ok=True)
        
        # Lưu các ảnh
        saved_paths = []
        for idx, img_data in enumerate(generated_images):
            img_url = img_data.get('url')
            if img_url:
                img_response = requests.get(img_url)
                if img_response.status_code == 200:
                    img_path = os.path.join(save_dir, f"generated_{idx+1}.jpg")
                    with open(img_path, 'wb') as f:
                        f.write(img_response.content)
                    saved_paths.append(img_path)
                    
        return saved_paths
