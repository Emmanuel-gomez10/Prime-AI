from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests

from prime_agent import process_message


app = FastAPI(title="PRIME Voice Server")


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# SERVICES
# ============================================================

WHISPER_URL = "http://localhost:9000/v1/audio/transcriptions"

DEFAULT_MODEL = "Systran/faster-distil-whisper-large-v3"


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "ok",
        "service": "prime-voice-server",
        "whisper": WHISPER_URL,
    }


# ============================================================
# WHISPER
# ============================================================

@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    model: str = Form(DEFAULT_MODEL),
):

    try:

        audio_data = await file.read()

        files = {
            "file": (
                file.filename or "prime_voice.webm",
                audio_data,
                file.content_type or "audio/webm",
            )
        }

        data = {
            "model": model,
        }

        response = requests.post(
            WHISPER_URL,
            files=files,
            data=data,
            timeout=120,
        )

        if not response.ok:

            return JSONResponse(
                status_code=response.status_code,
                content={
                    "error": "Whisper request failed",
                    "whisper_status": response.status_code,
                    "details": response.text,
                },
            )

        return response.json()

    except requests.RequestException as error:

        return JSONResponse(
            status_code=502,
            content={
                "error": "Could not reach Whisper",
                "details": str(error),
            },
        )

    except Exception as error:

        return JSONResponse(
            status_code=500,
            content={
                "error": "Voice server error",
                "details": str(error),
            },
        )


# ============================================================
# PRIME CHAT
# ============================================================

@app.post("/chat")
async def chat(payload: dict):

    try:

        message = str(
            payload.get("message", "")
        ).strip()

        if not message:

            return JSONResponse(
                status_code=400,
                content={
                    "error": "Message is empty"
                },
            )

        print()
        print("🎤 PRIME received:")
        print(message)

        answer = process_message(
            message
        )

        print()
        print("🧠 PRIME answered:")
        print(answer)

        return {
            "message": message,
            "response": answer,
        }

    except Exception as error:

        print()
        print("❌ PRIME CHAT ERROR:")
        print(error)

        return JSONResponse(
            status_code=500,
            content={
                "error": "PRIME processing failed",
                "details": str(error),
            },
        )