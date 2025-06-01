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
        self.model_id = "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3"  # Leonardo Creative
    
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
    
    def generate_image(self, image_path, prompt):
        """Generate image with Leonardo AI"""
        try:
            # Upload image first
            image_id, error = self.upload_image(image_path)
            if error:
                return {'success': False, 'error': error}
            
            # Generate image
            url = "https://cloud.leonardo.ai/api/rest/v1/generations"
            payload = {
                "height": 512,
                "modelId": self.model_id,
                "prompt": prompt,
                "width": 512,
                "imagePrompts": [image_id],
                "num_images": 1,
                "guidance_scale": 20
            }
            
            response = requests.post(url, json=payload, headers=self.headers)
            
            if response.status_code != 200:
                return {'success': False, 'error': f"Generation failed: {response.status_code}"}
            
            generation_id = response.json()['sdGenerationJob']['generationId']
            
            # Wait for generation to complete
            time.sleep(20)  # Leonardo needs time to process
            
            # Get results
            result_url = f"https://cloud.leonardo.ai/api/rest/v1/generations/{generation_id}"
            result_response = requests.get(result_url, headers=self.headers)
            
            if result_response.status_code != 200:
                return {'success': False, 'error': f"Failed to get results: {result_response.status_code}"}
            
            data = result_response.json()
            images = data["generations_by_pk"]["generated_images"]
            
            if not images:
                return {'success': False, 'error': 'No images generated'}
            
            # Download and save the first image
            img_url = images[0]["url"]
            img_data = requests.get(img_url).content
            
            # Save to results folder
            filename = f"{uuid.uuid4()}_generated.jpg"
            result_path = os.path.join('results', filename)
            
            with open(result_path, 'wb') as f:
                f.write(img_data)
            
            return {
                'success': True,
                'image_url': f'/api/result/{filename}',
                'filename': filename
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
