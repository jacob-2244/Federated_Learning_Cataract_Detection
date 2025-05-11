from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import base64
import requests
import os
from dotenv import load_dotenv
from inference import load_trained_model, predict_image_bytes

load_dotenv()

app = FastAPI()

# ✅ Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend development origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = load_trained_model()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

async def is_retina_image(image_bytes: bytes) -> bool:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Missing Gemini API key")

    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    payload = {
        "contents": [{
            "parts": [
                {"text": "Is this a retina or eye fundus image? Answer only YES or NO"},
                {
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": base64_image
                    }
                }
            ]
        }],
        "generationConfig": {
            "temperature": 0.0,
            "topK": 1
        }
    }

    headers = {"Content-Type": "application/json"}
    params = {"key": GEMINI_API_KEY}

    try:
        response = requests.post(
            GEMINI_ENDPOINT,
            json=payload,
            headers=headers,
            params=params,
            timeout=15
        )
        response.raise_for_status()

        result = response.json()
        if "candidates" not in result or not result["candidates"]:
            return False

        answer = result["candidates"][0]["content"]["parts"][0]["text"].upper().strip()
        return answer.startswith("YES")

    except requests.exceptions.HTTPError as e:
        error_msg = f"Gemini API error: {e.response.text}"
        raise HTTPException(status_code=e.response.status_code, detail=error_msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"API request failed: {str(e)}")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        if not await is_retina_image(contents):
            return {"error": "Invalid input: Please upload a retina scan image"}

        return predict_image_bytes(model, contents)

    except HTTPException as e:
        return {"error": e.detail}
    except Exception as e:
        return {"error": f"Internal server error: {str(e)}"}
