import joblib
from pathlib import Path

# Resolve paths relative to this file so the server works regardless of
# which directory it is launched from.
_BASE_DIR   = Path(__file__).resolve().parent.parent
MODEL_PATH  = _BASE_DIR / "models" / "xgboost_phishing_model.joblib"
SCALER_PATH = _BASE_DIR / "models" / "phishing_scaler.joblib"

model  = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
