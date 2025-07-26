# Backend - AI Text Generation and Classification

Python modules for AI-powered text generation and spam classification using Hugging Face transformers and language models.

## 🎯 Purpose

The backend contains AI modules that power the core functionality:
- **Text Generation**: AI-powered scam conversation simulation
- **Spam Classification**: Machine learning-based spam detection
- **Model Integration**: Hugging Face transformers and API integration

## 🚀 Quick Start for Users

### Prerequisites
- Python 3.11+
- Hugging Face account with API tokens
- Internet connection for model downloads

### 1. Environment Setup
The backend modules are automatically integrated with the FastAPI server. Ensure your server is configured with:
```env
# In server/.env
HF_TOKEN_PRED=your-huggingface-token
HF_TOKEN_GEN=your-huggingface-token
```

### 2. Model Access
Get Hugging Face tokens:
1. Visit [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new token with read access
3. Add tokens to your server environment

### 3. Usage Through API
The backend modules are accessed through the FastAPI server endpoints:
- Text generation: `POST /api/generate-reply`
- Spam classification: `POST /api/classify`

## 📁 Module Structure

```
backend/
└── generative/
    ├── llama_3_2_3b_instruct.py # LLaMA model integration
    ├── mistral.py             # Mistral model for classification (active)
    └── __pycache__/           # Python bytecode cache
```

## 🛠️ For Developers

### Active Modules

#### Spam Classification (`mistral.py`)
Production module for spam detection:
```python
def classify_spam(text: str) -> dict:
    """
    Classify text for spam detection
    
    Args:
        text: Input text to classify
    
    Returns:
        {
            "classification": "spam" | "not_spam",
            "confidence": float,
            "probabilities": {
                "spam": float,
                "not_spam": float
            }
        }
    """
```

### Model Integration

#### Hugging Face Integration
The modules use Hugging Face transformers and API:
```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import requests

# Model loading with authentication
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    use_auth_token=hf_token
)

# API requests with authentication
headers = {"Authorization": f"Bearer {hf_token}"}
response = requests.post(api_url, headers=headers, json=payload)
```

#### Model Selection

**Text Generation Models:**
- **LLaMA 3.2 3B Instruct**: Primary generation model
- **Alternative models**: Configurable for different use cases
- **Local/API**: Supports both local inference and API calls

**Classification Models:**
- **Mistral**: Primary spam classification model
- **Custom fine-tuned models**: Extensible for specific domains
- **Multi-class support**: Expandable beyond binary classification

### Development Setup

#### Install Dependencies
```bash
pip install transformers torch huggingface_hub requests python-dotenv
```

#### Environment Configuration
Set up Hugging Face authentication:
```python
import os
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN_PRED = os.getenv("HF_TOKEN_PRED")
HF_TOKEN_GEN = os.getenv("HF_TOKEN_GEN")
```

#### Local Development
```python
# Test generation module
from backend.generative.genai4 import generate_reply

response = generate_reply(
    conversation="Hello, I received your email about the lottery.",
    persona="scammer",
    style="urgent"
)
print(response)

# Test classification module
from backend.generative.mistral import classify_spam

result = classify_spam("Congratulations! You've won $1 million!")
print(result)
```

### Module Details

#### Generation Module Architecture (`genai4.py`)

```python
class TextGenerator:
    def __init__(self, model_name: str, hf_token: str):
        self.model_name = model_name
        self.hf_token = hf_token
        self.model = None
        self.tokenizer = None
    
    def load_model(self):
        """Load model and tokenizer"""
        
    def generate_response(self, prompt: str, **kwargs) -> str:
        """Generate text response"""
        
    def format_prompt(self, conversation: str, persona: str, style: str) -> str:
        """Format conversation prompt"""
```

#### Classification Module Architecture (`mistral.py`)

```python
class SpamClassifier:
    def __init__(self, model_name: str, hf_token: str):
        self.model_name = model_name
        self.hf_token = hf_token
        self.classifier = None
    
    def load_classifier(self):
        """Load classification model"""
        
    def classify_text(self, text: str) -> dict:
        """Classify text and return probabilities"""
        
    def preprocess_text(self, text: str) -> str:
        """Preprocess input text"""
```

### Configuration Options

#### Model Configuration
```python
# Generation settings
GENERATION_CONFIG = {
    "max_length": 150,
    "temperature": 0.7,
    "top_p": 0.9,
    "do_sample": True,
    "pad_token_id": tokenizer.eos_token_id
}

# Classification settings
CLASSIFICATION_CONFIG = {
    "return_all_scores": True,
    "truncation": True,
    "max_length": 512
}
```

#### Persona Prompts
```python
PERSONA_PROMPTS = {
    "scammer": {
        "neutral": "You are a scammer trying to convince someone...",
        "urgent": "You are a scammer creating urgency...",
        "friendly": "You are a scammer being friendly..."
    },
    "victim": {
        "neutral": "You are responding to a suspicious message...",
        "urgent": "You are confused by an urgent message...",
        "friendly": "You are being polite but cautious..."
    }
}
```

### Error Handling

#### Model Loading Errors
```python
try:
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        use_auth_token=hf_token
    )
except Exception as e:
    logger.error(f"Model loading failed: {e}")
    # Fallback to API or alternative model
```

#### API Rate Limiting
```python
import time
from typing import Optional

def api_request_with_retry(url: str, payload: dict, max_retries: int = 3) -> Optional[dict]:
    for attempt in range(max_retries):
        try:
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code == 429:  # Rate limited
                wait_time = 2 ** attempt
                time.sleep(wait_time)
                continue
            return response.json()
        except Exception as e:
            logger.warning(f"API request failed (attempt {attempt + 1}): {e}")
    return None
```

### Performance Optimization

#### Model Caching
```python
import functools
from typing import Dict, Any

@functools.lru_cache(maxsize=128)
def cached_generation(prompt_hash: str, model_name: str) -> str:
    """Cache recent generations to avoid redundant API calls"""
    pass

# Use content hashing for cache keys
import hashlib

def get_prompt_hash(conversation: str, persona: str, style: str) -> str:
    content = f"{conversation}_{persona}_{style}"
    return hashlib.md5(content.encode()).hexdigest()
```

#### Batch Processing
```python
def batch_classify(texts: List[str], batch_size: int = 8) -> List[dict]:
    """Process multiple texts in batches for efficiency"""
    results = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        batch_results = classifier(batch)
        results.extend(batch_results)
    return results
```

### Testing

#### Unit Tests
```python
import unittest
from unittest.mock import patch, MagicMock

class TestTextGeneration(unittest.TestCase):
    def setUp(self):
        self.generator = TextGenerator("test-model", "test-token")
    
    @patch('requests.post')
    def test_api_generation(self, mock_post):
        mock_post.return_value.json.return_value = {"generated_text": "Test response"}
        
        result = self.generator.generate_api_response("test prompt")
        self.assertEqual(result, "Test response")
    
    def test_prompt_formatting(self):
        prompt = self.generator.format_prompt("Hello", "scammer", "urgent")
        self.assertIn("scammer", prompt)
        self.assertIn("urgent", prompt)

class TestSpamClassification(unittest.TestCase):
    def test_classification_format(self):
        classifier = SpamClassifier("test-model", "test-token")
        # Mock classification result
        result = {"classification": "spam", "confidence": 0.95}
        self.assertIn("classification", result)
        self.assertIn("confidence", result)
```

#### Integration Tests
```python
def test_end_to_end_generation():
    """Test complete generation pipeline"""
    conversation = "I need help with my account"
    response = generate_reply(conversation, "scammer", "urgent")
    
    assert isinstance(response, str)
    assert len(response) > 0
    assert len(response) < 500  # Reasonable length

def test_end_to_end_classification():
    """Test complete classification pipeline"""
    spam_text = "URGENT: Click here to claim your prize!"
    result = classify_spam(spam_text)
    
    assert "classification" in result
    assert "confidence" in result
    assert result["classification"] in ["spam", "not_spam"]
    assert 0 <= result["confidence"] <= 1
```

### Model Management

#### Model Updates
```python
def update_model(model_name: str, hf_token: str) -> bool:
    """Download and update model"""
    try:
        # Download new model
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            use_auth_token=hf_token,
            cache_dir="./models"
        )
        # Update global model reference
        return True
    except Exception as e:
        logger.error(f"Model update failed: {e}")
        return False
```

#### Model Versioning
```python
MODEL_VERSIONS = {
    "generation": {
        "current": "llama-3.2-3b-instruct",
        "fallback": "gpt2-medium",
        "experimental": "llama-3.2-7b-instruct"
    },
    "classification": {
        "current": "mistral-7b-instruct",
        "fallback": "distilbert-base-uncased",
        "experimental": "llama-3.2-3b-instruct"
    }
}
```

### Security Considerations

#### Token Security
```python
import os
from cryptography.fernet import Fernet

def encrypt_token(token: str, key: bytes) -> str:
    """Encrypt sensitive tokens"""
    f = Fernet(key)
    encrypted_token = f.encrypt(token.encode())
    return encrypted_token.decode()

def decrypt_token(encrypted_token: str, key: bytes) -> str:
    """Decrypt tokens for use"""
    f = Fernet(key)
    decrypted_token = f.decrypt(encrypted_token.encode())
    return decrypted_token.decode()
```

#### Input Sanitization
```python
import re
from typing import Optional

def sanitize_input(text: str) -> Optional[str]:
    """Sanitize input text for model processing"""
    if not text or len(text.strip()) == 0:
        return None
    
    # Remove potential harmful content
    text = re.sub(r'[^\w\s\.,!?-]', '', text)
    
    # Limit length
    max_length = 10000
    if len(text) > max_length:
        text = text[:max_length]
    
    return text.strip()
```

### Deployment Considerations

#### Resource Requirements
- **Memory**: 4GB+ RAM for local model inference
- **Storage**: 2-10GB for model files (depending on model size)
- **GPU**: Optional but recommended for faster inference
- **Network**: Stable internet for API calls and model downloads

#### Production Configuration
```python
PRODUCTION_CONFIG = {
    "cache_size": 256,  # Larger cache for production
    "batch_size": 16,   # Optimized batch size
    "timeout": 30,      # API timeout in seconds
    "max_retries": 5,   # More retries for stability
    "fallback_enabled": True,  # Enable fallback models
}
```

### Troubleshooting

#### Common Issues

1. **Model Loading Failures**
   - Check Hugging Face token validity
   - Verify model name and availability
   - Check disk space for model downloads

2. **API Rate Limiting**
   - Implement exponential backoff
   - Use caching to reduce API calls
   - Consider upgrading Hugging Face plan

3. **Memory Issues**
   - Use smaller models for local inference
   - Implement model quantization
   - Use API endpoints instead of local models

4. **Performance Issues**
   - Enable caching mechanisms
   - Use batch processing where possible
   - Optimize prompt lengths

### Contributing

When contributing to backend modules:
1. Follow Python best practices and PEP 8
2. Add comprehensive error handling
3. Include unit tests for new functions
4. Document model requirements and dependencies
5. Test with both local and API model configurations
6. Consider performance implications
7. Update integration points with server code
