import os
import requests
from typing import Optional

class SecureLlamaClient:
    """Secure wrapper for Llama API calls with proper error handling"""
    
    def __init__(self):
        self.api_url = "https://router.huggingface.co/novita/v3/openai/chat/completions"
        self.token = os.getenv("HF_TOKEN_GEN")
        
        if not self.token:
            raise ValueError("HF_TOKEN_GEN environment variable is required")

        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def clean_reply(self, reply: str) -> str:
        """Clean the reply from any unwanted prefixes"""
        if reply.startswith("User:"):
            return reply[len("User:"):].strip()
        elif reply.startswith("Scammer:"):
            return reply[len("Scammer:"):].strip()
        return reply.strip()
    
    def convo_to_prompt(self, convo_text: str) -> str:
        """Convert conversation to a proper prompt"""
        prompt = (
            "You are chatting with a scammer. Your goal is to waste their time by responding in a convincing but vague way.\n\n"
            "You will accept bad language, typos, and nonsensical replies.\n\n"
            "You will not break character or reveal that you are an AI.\n\n"
            "You are free to use any language, including slang, emojis, and internet abbreviations.\n\n"
            "You are allowed to use humor, sarcasm, and playful responses.\n\n"
            "You are allowed to use inaccurate information, fake names, and fictional scenarios in order to make the scammer waste time.\n\n"
            "The goal is to make the scammer think they are making progress, while in reality you are just wasting their time.\n\n"
            "You are allowed only to reply to the scammer's messages, not to the user.\n\n"
            "The answer should be in the perspective of the user, not the scammer.\n\n"
            "No prefix or suffix is needed, just the reply.\n\n"
            "If the last message was from the scammer, you will reply as the user.\n\n"
            "If the last message was from the user, you will continue as the user strictly!!!.\n\n"
            "Do NOT include the prefixes \"User:\" or \"Scammer:\" in your reply.\n\n"
            "Your reply should be natural conversational text only.\n\n"
            "Conversation so far:\n"
            f"{convo_text}"
        )
        return prompt
    
    def generate_reply(self, convo_text: str) -> str:
        """Generate a reply with proper error handling and validation"""
        
        if not convo_text or not convo_text.strip():
            raise ValueError("Conversation text cannot be empty")
        
        prompt = self.convo_to_prompt(convo_text)
        
        payload = {
            "model": "meta-llama/llama-3.2-3b-instruct",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 300
        }
        
        try:
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload,
                timeout=30  # Add timeout
            )
            response.raise_for_status()
            data = response.json()
            
            if "choices" in data and len(data["choices"]) > 0:
                reply = data["choices"][0]["message"]["content"]
                return self.clean_reply(reply)
            else:
                raise ValueError(f"Unexpected response format: {data}")
                
        except requests.exceptions.Timeout:
            raise ValueError("Request timed out")
        except requests.exceptions.ConnectionError:
            raise ValueError("Connection error to API")
        except requests.exceptions.HTTPError as e:
            raise ValueError(f"HTTP error: {e}")
        except Exception as e:
            raise ValueError(f"API request failed: {e}")

# Create singleton instance
_client = None

def generate_reply(convo_text: str) -> str:
    """Public function to generate reply using singleton client"""
    global _client
    if _client is None:
        _client = SecureLlamaClient()
    
    return _client.generate_reply(convo_text)
