# Deploying Translator Service to Vercel

## Prerequisites
- Install Vercel CLI: `npm install -g vercel`
- Create a Vercel account at https://vercel.com

## Deployment Steps

### 1. Navigate to the translator-service directory
```bash
cd translator-service
```

### 2. Deploy to Vercel
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? (default: translator-service)
- Directory? **./translator-service** (or just press Enter if already inside)
- Override settings? **N**

### 3. Deploy to Production
```bash
vercel --prod
```

## Your Endpoints

After deployment, you'll get a URL like: `https://translator-service-xxxx.vercel.app`

### Available Endpoints:

1. **Health Check**
   - GET `https://your-app.vercel.app/api/health`

2. **Translate**
   - POST `https://your-app.vercel.app/api/translate`
   - Body: `{"text": "Your text in Indian language"}`

## Using in Python

### Example 1: Basic Usage
```python
import requests

VERCEL_URL = "https://your-app.vercel.app"  # Replace with your actual Vercel URL

def translate_text(text):
    """Translate Indian language text to English using Vercel endpoint"""
    try:
        response = requests.post(
            f"{VERCEL_URL}/api/translate",
            json={"text": text},
            timeout=30
        )
        response.raise_for_status()
        
        result = response.json()
        if result.get("success"):
            return result.get("english_text")
        else:
            raise Exception(f"Translation failed: {result.get('error')}")
            
    except requests.exceptions.RequestException as e:
        raise Exception(f"Request failed: {str(e)}")

# Usage
hindi_text = "मुझे आज काम पर जाना है।"
english_text = translate_text(hindi_text)
print(f"Original: {hindi_text}")
print(f"Translated: {english_text}")
```

### Example 2: Update Your Backend Config
Update `backend/config.py`:

```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # ... other config ...
    
    # Use Vercel URL for production
    TRANSLATOR_URL = os.getenv(
        "TRANSLATOR_URL",
        "https://your-app.vercel.app/api"  # Replace with your Vercel URL
    )
```

### Example 3: Complete Python Client
```python
import requests
from typing import Dict, Optional

class VercelTranslatorClient:
    """Client for Vercel-hosted translation service"""
    
    def __init__(self, base_url: str):
        """
        Initialize the translator client
        
        Args:
            base_url: Vercel app URL (e.g., https://your-app.vercel.app)
        """
        self.base_url = base_url.rstrip('/')
        self.translate_endpoint = f"{self.base_url}/api/translate"
        self.health_endpoint = f"{self.base_url}/api/health"
    
    def health_check(self) -> bool:
        """Check if the service is healthy"""
        try:
            response = requests.get(self.health_endpoint, timeout=10)
            return response.status_code == 200
        except:
            return False
    
    def translate(self, text: str) -> Dict[str, any]:
        """
        Translate text to English
        
        Args:
            text: Text in Indian language
            
        Returns:
            Dictionary with translation result
            
        Raises:
            Exception: If translation fails
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        try:
            response = requests.post(
                self.translate_endpoint,
                json={"text": text},
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            
            if not result.get("success"):
                raise Exception(result.get("error", "Unknown error"))
            
            return {
                "success": True,
                "original_text": result.get("original_text"),
                "english_text": result.get("english_text")
            }
            
        except requests.exceptions.Timeout:
            raise Exception("Translation request timed out")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request failed: {str(e)}")
        except Exception as e:
            raise Exception(f"Translation failed: {str(e)}")

# Usage Example
if __name__ == "__main__":
    # Replace with your actual Vercel URL
    VERCEL_URL = "https://translator-service-xxxx.vercel.app"
    
    client = VercelTranslatorClient(VERCEL_URL)
    
    # Health check
    if client.health_check():
        print("✓ Service is healthy")
    else:
        print("✗ Service is unhealthy")
        exit(1)
    
    # Translate
    test_texts = [
        "मुझे आज काम पर जाना है।",  # Hindi
        "আমি আজ কাজে যেতে হবে।",       # Bengali
        "நான் இன்று வேலைக்குச் செல்ல வேண்டும்।"  # Tamil
    ]
    
    for text in test_texts:
        try:
            result = client.translate(text)
            print(f"\nOriginal: {result['original_text']}")
            print(f"English: {result['english_text']}")
        except Exception as e:
            print(f"Error: {str(e)}")
```

## Environment Variables

No environment variables needed for the basic setup. The service works out of the box.

## Monitoring

- View logs: `vercel logs`
- Check deployments: `vercel ls`
- View project dashboard: https://vercel.com/dashboard

## Important Notes

1. **Serverless Functions**: Vercel uses serverless functions with:
   - 10 second timeout (Hobby plan)
   - 50 second timeout (Pro plan)
   - Cold starts may occur

2. **Rate Limits**: 
   - Free tier: 100 GB bandwidth/month
   - Consider rate limiting for production use

3. **CORS**: Already configured to allow all origins (`*`)
   - Restrict in production by modifying `Access-Control-Allow-Origin`

## Troubleshooting

### Issue: Function timeout
**Solution**: Optimize translation or upgrade Vercel plan

### Issue: Cold starts
**Solution**: Keep service warm with periodic health checks

### Issue: Rate limiting from Google Translate
**Solution**: Implement caching or use official Google Cloud Translation API

## Next Steps

1. Deploy to Vercel
2. Get your production URL
3. Update Python code with the URL
4. Test the integration
5. Monitor usage and performance
