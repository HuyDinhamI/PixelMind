from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import requests
import time
import base64
import os
from io import BytesIO
from PIL import Image
from openai import OpenAI
import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Logging to terminal with colors
class Colors:
    INFO = '\033[94m'      # Blue
    WARN = '\033[93m'      # Yellow
    ERROR = '\033[91m'     # Red
    API = '\033[96m'       # Cyan
    PHASE = '\033[95m'     # Magenta
    ENDC = '\033[0m'       # End color
    BOLD = '\033[1m'       # Bold

def log_to_terminal(level, phase, message, data=None):
    """Log message to terminal with colors"""
    timestamp = datetime.datetime.now().strftime('%H:%M:%S')
    color_map = {
        'INFO': Colors.INFO,
        'WARN': Colors.WARN,
        'ERROR': Colors.ERROR,
        'API': Colors.API,
        'PHASE': Colors.PHASE
    }
    
    color = color_map.get(level, Colors.INFO)
    log_line = f"{color}[{timestamp}] [{level}] [{phase}]{Colors.ENDC} {message}"
    
    if data:
        log_line += f"\n{Colors.BOLD}    Data:{Colors.ENDC} {json.dumps(data, indent=2, ensure_ascii=False)}"
    
    print(log_line)

class GeminiService:
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv('GEMINI_API_KEY'),
            base_url=os.getenv('GEMINI_BASE_URL')
        )
        self.model = "gemini-1.5-flash"
        
    def translate_to_english(self, vietnamese_prompt: str) -> str:
        """Dịch prompt từ tiếng Việt sang tiếng Anh"""
        log_to_terminal('API', 'GEMINI', 'Translation request started', {
            'originalPrompt': vietnamese_prompt,
            'promptLength': len(vietnamese_prompt)
        })
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": "Bạn là một chuyên gia trong việc viết prompt cho AI sinh ảnh. Nhiệm vụ của bạn là dịch prompt từ tiếng Việt sang tiếng Anh một cách chính xác và tự nhiên nhất. Hãy đảm bảo rằng nội dung được dịch giữ nguyên ý nghĩa và ngữ cảnh ban đầu của người dùng."
                    },
                    {
                        "role": "user",
                        "content": vietnamese_prompt
                    }
                ]
            )
            
            translated_text = response.choices[0].message.content
            log_to_terminal('API', 'GEMINI', 'Translation completed successfully', {
                'originalPrompt': vietnamese_prompt,
                'translatedPrompt': translated_text
            })
            
            return translated_text
            
        except Exception as e:
            log_to_terminal('ERROR', 'GEMINI', 'Translation failed', {'error': str(e)})
            raise Exception(f"Lỗi khi dịch prompt: {str(e)}")

class LeonardoAIService:
    def __init__(self):
        self.api_key = os.getenv('LEONARDO_AI_API_KEY')
        self.base_url = os.getenv('LEONARDO_BASE_URL')
        self.headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"Bearer {self.api_key}"
        }
        self.gemini_service = GeminiService()

    def save_base64_image(self, base64_data, filename="temp_image.jpg"):
        """Lưu ảnh base64 thành file tạm thời"""
        try:
            # Remove data URL prefix if present
            if ',' in base64_data:
                base64_data = base64_data.split(',')[1]
            
            # Decode base64
            image_data = base64.b64decode(base64_data)
            
            # Save to temporary file
            temp_path = f"/tmp/{filename}"
            with open(temp_path, 'wb') as f:
                f.write(image_data)
            
            log_to_terminal('INFO', 'IMAGE_PROCESSING', 'Base64 image saved successfully', {
                'tempPath': temp_path,
                'imageSize': f"{len(image_data) // 1024}KB"
            })
            
            return temp_path
        except Exception as e:
            log_to_terminal('ERROR', 'IMAGE_PROCESSING', 'Failed to save base64 image', {'error': str(e)})
            raise Exception(f"Lỗi khi lưu ảnh: {str(e)}")

    def upload_image(self, image_file_path):
        """Upload ảnh lên Leonardo AI"""
        try:
            log_to_terminal('API', 'LEONARDO', 'Starting image upload', {'imagePath': image_file_path})
            
            # Step 1: Initialize upload
            url_upload_init = f"{self.base_url}/init-image"
            response = requests.post(url_upload_init, json={"extension": "jpg"}, headers=self.headers)
            
            if response.status_code != 200:
                raise Exception(f"Failed to initialize upload: {response.text}")
            
            upload_data = response.json()['uploadInitImage']
            fields = json.loads(upload_data['fields'])
            upload_url = upload_data['url']
            uploaded_image_id = upload_data['id']

            log_to_terminal('API', 'LEONARDO', 'Upload initialized', {
                'uploadImageId': uploaded_image_id,
                'uploadUrl': upload_url[:50] + '...'
            })

            # Step 2: Upload image file
            with open(image_file_path, 'rb') as f:
                files = {'file': f}
                upload_response = requests.post(upload_url, data=fields, files=files)
            
            if upload_response.status_code != 204:
                raise Exception(f"Failed to upload image: {upload_response.text}")
            
            log_to_terminal('API', 'LEONARDO', 'Image uploaded successfully', {
                'uploadedImageId': uploaded_image_id,
                'responseStatus': upload_response.status_code
            })
            
            return uploaded_image_id
            
        except Exception as e:
            log_to_terminal('ERROR', 'LEONARDO', 'Image upload failed', {'error': str(e)})
            raise Exception(f"Lỗi khi upload ảnh: {str(e)}")

    def generate_style_image(self, prompt_style):
        """Tạo ảnh style từ prompt"""
        try:
            log_to_terminal('API', 'LEONARDO', 'Starting style image generation', {'stylePrompt': prompt_style})
            
            # Translate prompt to English
            english_prompt = self.gemini_service.translate_to_english(prompt_style)
            
            url_gen_style = f"{self.base_url}/generations"
            payload_style = {
                "height": 768,
                "width": 1024,
                "modelId": "aa77f04e-3eec-4034-9c07-d0f619684628",  # Leonardo Kino XL (SDXL)
                "prompt": english_prompt,
                "num_images": 1,
                "alchemy": True
            }

            style_response = requests.post(url_gen_style, json=payload_style, headers=self.headers)
            
            if style_response.status_code != 200:
                raise Exception(f"Failed to generate style image: {style_response.text}")
            
            style_gen_id = style_response.json()['sdGenerationJob']['generationId']
            log_to_terminal('API', 'LEONARDO', 'Style generation started', {
                'generationId': style_gen_id,
                'englishPrompt': english_prompt
            })

            # Wait for style image generation
            log_to_terminal('INFO', 'LEONARDO', 'Waiting for style image generation (30s)...')
            time.sleep(30)

            # Get style image ID
            style_fetch_url = f"{self.base_url}/generations/{style_gen_id}"
            style_fetch_resp = requests.get(style_fetch_url, headers=self.headers)
            
            if style_fetch_resp.status_code != 200:
                raise Exception(f"Failed to fetch style image: {style_fetch_resp.text}")
            
            generated_image_id = style_fetch_resp.json()['generations_by_pk']['generated_images'][0]['id']
            log_to_terminal('API', 'LEONARDO', 'Style image generated successfully', {
                'generatedImageId': generated_image_id
            })
            
            return generated_image_id
            
        except Exception as e:
            log_to_terminal('ERROR', 'LEONARDO', 'Style image generation failed', {'error': str(e)})
            raise Exception(f"Lỗi khi tạo ảnh style: {str(e)}")

    def generate_final_image(self, prompt_main, uploaded_image_id, generated_image_id):
        """Tạo ảnh cuối cùng với 2 ControlNets"""
        try:
            log_to_terminal('API', 'LEONARDO', 'Starting final image generation with ControlNet', {
                'mainPrompt': prompt_main,
                'uploadedImageId': uploaded_image_id,
                'styleImageId': generated_image_id
            })
            
            # Translate main prompt to English
            english_prompt = self.gemini_service.translate_to_english(prompt_main)
            
            url_gen_final = f"{self.base_url}/generations"
            payload_final = {
                "height": 768,
                "width": 1024,
                "modelId": "aa77f04e-3eec-4034-9c07-d0f619684628",  # Leonardo Kino XL
                "prompt": english_prompt,
                "num_images": 1,
                "alchemy": True,
                "photoReal": True,
                "photoRealVersion": "v2",
                "presetStyle": "CINEMATIC",
                "controlnets": [
                    {
                        "initImageId": uploaded_image_id,
                        "initImageType": "UPLOADED",
                        "preprocessorId": 133,  # Character Reference
                        "strengthType": "Mid"
                    },
                    {
                        "initImageId": generated_image_id,
                        "initImageType": "GENERATED",
                        "preprocessorId": 67,  # Style Reference
                        "strengthType": "High"
                    }
                ]
            }

            final_response = requests.post(url_gen_final, json=payload_final, headers=self.headers)
            
            if final_response.status_code != 200:
                raise Exception(f"Failed to generate final image: {final_response.text}")
            
            final_gen_id = final_response.json()['sdGenerationJob']['generationId']
            log_to_terminal('API', 'LEONARDO', 'Final generation started', {
                'generationId': final_gen_id,
                'englishPrompt': english_prompt
            })

            # Wait for final image generation
            log_to_terminal('INFO', 'LEONARDO', 'Waiting for final image generation (60s)...')
            time.sleep(60)

            # Get final result
            final_url = f"{self.base_url}/generations/{final_gen_id}"
            result = requests.get(final_url, headers=self.headers)
            
            if result.status_code != 200:
                raise Exception(f"Failed to fetch final image: {result.text}")
            
            result_data = result.json()
            
            if 'generations_by_pk' not in result_data or not result_data['generations_by_pk']['generated_images']:
                raise Exception("No generated images found in response")
            
            image_url = result_data['generations_by_pk']['generated_images'][0]['url']
            log_to_terminal('API', 'LEONARDO', 'Final image generated successfully', {
                'imageUrl': image_url
            })
            
            return image_url
            
        except Exception as e:
            log_to_terminal('ERROR', 'LEONARDO', 'Final image generation failed', {'error': str(e)})
            raise Exception(f"Lỗi khi tạo ảnh cuối cùng: {str(e)}")

# Initialize services
leonardo_service = LeonardoAIService()

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    """API endpoint để tạo ảnh từ frontend"""
    try:
        log_to_terminal('PHASE', 'API_REQUEST', 'Received image generation request')
        
        # Get data from request
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        image_base64 = data.get('image')
        prompt1 = data.get('prompt1')  # Main transformation prompt
        prompt2 = data.get('prompt2')  # Style prompt
        
        if not all([image_base64, prompt1, prompt2]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400
        
        log_to_terminal('INFO', 'AI_GENERATION', 'Processing image generation request', {
            'prompt1': prompt1,
            'prompt2': prompt2,
            'imageSize': f"{len(image_base64) // 1024}KB"
        })
        
        # Step 1: Save base64 image to temporary file
        temp_image_path = leonardo_service.save_base64_image(image_base64)
        
        # Step 2: Upload image to Leonardo AI
        uploaded_image_id = leonardo_service.upload_image(temp_image_path)
        
        # Step 3: Generate style image
        style_image_id = leonardo_service.generate_style_image(prompt2)
        
        # Step 4: Generate final image
        final_image_url = leonardo_service.generate_final_image(prompt1, uploaded_image_id, style_image_id)
        
        # Clean up temporary file
        if os.path.exists(temp_image_path):
            os.remove(temp_image_path)
            log_to_terminal('INFO', 'CLEANUP', 'Temporary image file removed')
        
        log_to_terminal('PHASE', 'AI_GENERATION', 'Image generation completed successfully', {
            'finalImageUrl': final_image_url
        })
        
        return jsonify({
            "success": True,
            "imageUrl": final_image_url,
            "message": "Image generated successfully!"
        })
        
    except Exception as e:
        log_to_terminal('ERROR', 'AI_GENERATION', 'Image generation failed', {'error': str(e)})
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/translate', methods=['POST'])
def translate_prompt():
    """API endpoint để dịch prompt từ tiếng Việt sang tiếng Anh"""
    try:
        data = request.get_json()
        vietnamese_text = data.get('text')
        
        if not vietnamese_text:
            return jsonify({"success": False, "error": "No text provided"}), 400
        
        gemini_service = GeminiService()
        english_text = gemini_service.translate_to_english(vietnamese_text)
        
        return jsonify({
            "success": True,
            "translation": english_text
        })
        
    except Exception as e:
        log_to_terminal('ERROR', 'TRANSLATION', 'Translation failed', {'error': str(e)})
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "PixelMind API Server is running!",
        "timestamp": datetime.datetime.now().isoformat()
    })

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({
        "message": "PixelMind API Server",
        "version": "1.0.0",
        "endpoints": [
            "POST /api/generate-image - Generate transformed image",
            "POST /api/translate - Translate Vietnamese to English",
            "GET /api/health - Health check"
        ]
    })

if __name__ == '__main__':
    # Get server configuration from environment variables
    host = os.getenv('API_SERVER_HOST', '0.0.0.0')
    port = int(os.getenv('API_SERVER_PORT', 5000))
    
    print(f"{Colors.BOLD}{Colors.PHASE}🚀 Starting PixelMind API Server...{Colors.ENDC}")
    print(f"{Colors.INFO}📡 Frontend should call: http://localhost:{port}/api/generate-image{Colors.ENDC}")
    print(f"{Colors.WARN}🔧 Health check: http://localhost:{port}/api/health{Colors.ENDC}")
    print(f"{Colors.INFO}🔑 Using API keys from .env file{Colors.ENDC}")
    print(f"{Colors.PHASE}📋 Logs will appear below:{Colors.ENDC}")
    print("=" * 80)
    
    # Create temp directory if not exists
    os.makedirs('/tmp', exist_ok=True)
    
    app.run(host=host, port=port, debug=False)
