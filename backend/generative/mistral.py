import os
import requests
from typing import Optional

class SecureAPIClient:
    """Secure wrapper for external API calls with proper error handling"""
    
    def __init__(self):
        self.api_url = "https://router.huggingface.co/featherless-ai/v1/chat/completions"
        self.token = os.getenv("HF_TOKEN_PRED")
        
        if not self.token:
            raise ValueError("HF_TOKEN_PRED environment variable is required")

        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }
    
    def generate_reply(self, convo_text: str, max_new_tokens: int = 512, 
                      temperature: float = 0.7, top_p: float = 0.9) -> str:
        """Generate a classification reply with proper error handling"""
        
        if not convo_text or not convo_text.strip():
            raise ValueError("Conversation text cannot be empty")
        
        system_prompt = (
            "You are a classification assistant for scam detection. Your job is to analyze the given input, which may be a message, "
            "an email, or a conversation, and determine if it is potentially part of a scam.\n\n"
            
            "You must output:\n"
            "- A single line with comma-separated values: the first value is the main label, followed by one or more categorization tags.\n"
            "- On a second line, provide a clear and concise explanation (1-2 sentences) for your classification decision.\n\n"

            "Accepted labels are: 'Scam', 'Most Certainly Scam', 'Safe', 'Most Certainly Safe', or 'Unknown'. Avoid Unknown as much as possible\n"
            "Tags should describe the type of content or scam (e.g., 'Phishing attempt', 'Banking', 'Investment fraud', 'Romance scam', 'Technical support', 'Unknown').\n\n"

            "Output format:\n"
            "<Label>, <Tag0>, <Tag1>, ..., <TagN>\n"
            "<Justification>\n\n"

            "No extra quotes in the before or after the words for label, tags or justification. If you are unsure about the classification, use 'Unknown' as the label and provide your best guess for tags. Be as suspicious as possible and be urgent on emotional context or situations under pressure.\n"
            "Never break the output format. Do not include any other text beyond what is required."
        )

        payload = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": convo_text}
            ],
            "model": "mistralai/Mistral-7B-Instruct-v0.2",
            "max_tokens": max_new_tokens,
            "temperature": temperature,
            "top_p": top_p
        }

        try:
            response = requests.post(
                self.api_url, 
                headers=self.headers, 
                json=payload, 
                timeout=30  # Add timeout
            )
            response.raise_for_status()
            output = response.json()

            if "choices" in output and len(output["choices"]) > 0:
                reply = output["choices"][0]["message"]["content"]
                return reply.strip()
            else:
                raise ValueError(f"Unexpected response format: {output}")
                
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
        _client = SecureAPIClient()
    
    return _client.generate_reply(convo_text)
