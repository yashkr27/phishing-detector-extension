from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel 

from app.predict import predict_url

# ----------------------------
# FastAPI app
# ----------------------------
app = FastAPI(title="Phishing Detection API")

# ----------------------------
# CORS
# allow_origins=["*"] is intentional for a local-only extension backend.
# If you ever expose this server publicly, replace "*" with the exact
# chrome-extension://... origin of your built extension.
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------
# Root endpoint
# ----------------------------
@app.get("/")
def read_root():
    return {"status": "online", "message": "Phishing Detection API is running"}


# Manual OPTIONS handler removed - CORSMiddleware handles preflight correctly


# ----------------------------
# Request schema
# ----------------------------
class URLRequest(BaseModel):
    url: str



# ----------------------------
# Prediction endpoint
# ----------------------------
@app.post("/predict")
def predict(req: URLRequest):
        return predict_url(req.url)


# ----------------------------
# Debug endpoint (temp)
# Usage: GET /debug/scaler?url=https://example.com
# ----------------------------
@app.get("/debug/scaler")
def debug_scaler(url: str = "https://www.example.com"):
    from app.model_loader import scaler, model
    from app.feature_extractor import extract_features
    result = {}
    if hasattr(scaler, 'feature_names_in_'):
        result["scaler_feature_names"] = list(scaler.feature_names_in_)
    result["n_features"] = int(scaler.n_features_in_)
    result["mean"] = [round(float(x), 4) for x in scaler.mean_]
    result["scale"] = [round(float(x), 4) for x in scaler.scale_]

    features = extract_features(url)
    result["test_url"] = url
    result["raw_features"] = [float(x) for x in features[0]]
    result["scaled_features"] = [round(float(x), 4) for x in scaler.transform(features)[0]]

    return result
