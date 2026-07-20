"""Local Flask API for the phishing-URL research model."""

import hmac
import os
from pathlib import Path
import pickle

from flask import Flask, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import numpy as np

from db.save_data import save_data
from feature import FeatureExtraction
from url_security import URLSecurityError, validate_public_url


BASE_DIR = Path(__file__).resolve().parent
with (BASE_DIR / "pickle" / "model.pkl").open("rb") as model_file:
    model = pickle.load(model_file)  # Only load the repository's reviewed local artifact.

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["60 per minute"],
    storage_uri=os.getenv("RATELIMIT_STORAGE_URI", "memory://"),
)


def request_value(name):
    payload = request.get_json(silent=True)
    if isinstance(payload, dict) and name in payload:
        return payload[name]
    return request.form.get(name)


@app.errorhandler(URLSecurityError)
def unsafe_url(error):
    return jsonify({"error": str(error)}), 400


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify({"error": "Request body is too large"}), 413


@app.route("/", methods=["GET", "POST"])
@limiter.limit("10 per minute", methods=["POST"])
def index():
    network_enabled = os.getenv("ENABLE_NETWORK_FEATURES", "false").lower() in {
        "1",
        "true",
        "yes",
    }
    if request.method == "GET":
        return jsonify({
            "service": "phishing-url-research-model",
            "network_features_enabled": network_enabled,
        })

    url = validate_public_url(request_value("url"))
    values = np.array(FeatureExtraction(url).getFeaturesList()).reshape(1, 30)
    probability = model.predict_proba(values)[0, 1]
    return jsonify({
        "url": url,
        "prob_not_phishy": round(float(probability), 4),
        "network_features_enabled": network_enabled,
    })


@app.route("/add_data", methods=["POST"])
@limiter.limit("5 per minute")
def add_data():
    expected_key = os.getenv("FEEDBACK_API_KEY", "")
    provided_key = request.headers.get("x-feedback-api-key", "")
    if not expected_key:
        return jsonify({"error": "Feedback collection is not configured"}), 503
    if not hmac.compare_digest(provided_key, expected_key):
        return jsonify({"error": "Unauthorized"}), 401

    url = validate_public_url(request_value("url"))
    try:
        label = int(request_value("label"))
    except (TypeError, ValueError):
        return jsonify({"error": "Label must be -1 or 1"}), 400
    if label not in {-1, 1}:
        return jsonify({"error": "Label must be -1 or 1"}), 400
    return jsonify(save_data(url, label))


if __name__ == "__main__":
    app.run(
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "false").lower() in {"1", "true", "yes"},
    )
