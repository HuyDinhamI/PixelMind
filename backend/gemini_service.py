import os
from openai import OpenAI
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

class GeminiService:
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("GEMINI_API_KEY"),
            base_url=os.getenv("GEMINI_BASE_URL")
        )
        self.model = "gemini-1.5-flash"
        
    async def translate_to_english(self, vietnamese_prompt: str) -> str:
        """
        Dịch prompt từ tiếng Việt sang tiếng Anh
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": "Bạn hãy dịch câu sau sang tiếng anh"
                    },
                    {
                        "role": "user",
                        "content": vietnamese_prompt
                    }
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            logging.error(f"Error in translate_to_english: {str(e)}")
            raise Exception(f"Lỗi khi dịch prompt: {str(e)}")
