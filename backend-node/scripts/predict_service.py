#!/usr/bin/env python3
"""
Smart Career Advisor - Prediction Service
Loads trained ML models and predicts career roles from skill text.

Usage:
    python scripts/predict_service.py "Python, Machine Learning, TensorFlow, Deep Learning"

Output: JSON to stdout
"""

import os
import sys
import json

try:
    import numpy as np
    import joblib
except ImportError as e:
    print(json.dumps({"error": f"Missing package: {e}"}))
    sys.exit(1)

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
MODEL_DIR = os.path.join(PROJECT_ROOT, 'models')

def load_models():
    """Load all trained models."""
    models = {}
    required_files = ['vectorizer.joblib', 'label_encoder.joblib']
    model_files = ['model_svm.joblib', 'model_rf.joblib', 'model_ensemble.joblib']
    
    for f in required_files:
        path = os.path.join(MODEL_DIR, f)
        if not os.path.exists(path):
            return None, f"Required file not found: {f}"
        models[f.replace('.joblib', '')] = joblib.load(path)
    
    for f in model_files:
        path = os.path.join(MODEL_DIR, f)
        if os.path.exists(path):
            models[f.replace('.joblib', '')] = joblib.load(path)
    
    return models, None

def predict(text, models):
    """Run prediction using all available models."""
    vectorizer = models['vectorizer']
    label_encoder = models['label_encoder']
    
    # Transform input text using trained TF-IDF vectorizer
    X = vectorizer.transform([text])
    
    results = {}
    
    # SVM Prediction
    if 'model_svm' in models:
        svm = models['model_svm']
        svm_pred = svm.predict(X)[0]
        svm_role = label_encoder.inverse_transform([svm_pred])[0]
        
        # Get probability estimates
        try:
            svm_proba = svm.predict_proba(X)[0]
            svm_top_indices = np.argsort(svm_proba)[-5:][::-1]
            svm_top_roles = [
                {
                    "role": label_encoder.inverse_transform([idx])[0],
                    "confidence": float(round(svm_proba[idx], 4)),
                    "rank": rank + 1
                }
                for rank, idx in enumerate(svm_top_indices)
            ]
            svm_confidence = float(round(svm_proba[svm_pred], 4))
        except Exception:
            svm_top_roles = [{"role": svm_role, "confidence": 0.9, "rank": 1}]
            svm_confidence = 0.9
        
        results['svm'] = {
            "predicted_role": svm_role,
            "confidence": svm_confidence,
            "top_roles": svm_top_roles
        }
    
    # Random Forest Prediction
    if 'model_rf' in models:
        rf = models['model_rf']
        rf_pred = rf.predict(X)[0]
        rf_role = label_encoder.inverse_transform([rf_pred])[0]
        
        rf_proba = rf.predict_proba(X)[0]
        rf_top_indices = np.argsort(rf_proba)[-5:][::-1]
        rf_top_roles = [
            {
                "role": label_encoder.inverse_transform([idx])[0],
                "confidence": float(round(rf_proba[idx], 4)),
                "rank": rank + 1
            }
            for rank, idx in enumerate(rf_top_indices)
        ]
        rf_confidence = float(round(rf_proba[rf_pred], 4))
        
        results['rf'] = {
            "predicted_role": rf_role,
            "confidence": rf_confidence,
            "top_roles": rf_top_roles
        }
    
    # Ensemble Prediction
    if 'model_ensemble' in models:
        ens = models['model_ensemble']
        ens_pred = ens.predict(X)[0]
        ens_role = label_encoder.inverse_transform([ens_pred])[0]
        
        # Ensemble may not have predict_proba with hard voting
        try:
            ens_proba = ens.predict_proba(X)[0]
            ens_confidence = float(round(ens_proba[ens_pred], 4))
        except Exception:
            # For hard voting, take average of individual model confidences
            confidences = []
            if 'svm' in results:
                confidences.append(results['svm']['confidence'])
            if 'rf' in results:
                confidences.append(results['rf']['confidence'])
            ens_confidence = float(round(np.mean(confidences) if confidences else 0.9, 4))
        
        results['ensemble'] = {
            "predicted_role": ens_role,
            "confidence": ens_confidence,
            "voting_method": "hard"
        }
    
    # Final result
    # Use ensemble as primary prediction
    primary = results.get('ensemble', results.get('svm', results.get('rf', {})))
    
    predicted_role = primary.get("predicted_role", "Unknown")
    confidence = primary.get("confidence", 0)
    
    # Confidence calibration: if model is very unsure, return a safe general role
    LOW_CONFIDENCE_THRESHOLD = 0.15
    if confidence < LOW_CONFIDENCE_THRESHOLD:
        predicted_role = "Software Engineer"
        confidence = max(confidence, 0.10)  # Floor at 10%
    
    return {
        "success": True,
        "predicted_role": predicted_role,
        "confidence": confidence,
        "svm_prediction": results.get('svm', {}),
        "rf_prediction": results.get('rf', {}),
        "ensemble_prediction": results.get('ensemble', {}),
        "models_used": list(results.keys()),
        "total_supported_roles": len(label_encoder.classes_)
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input text provided. Usage: python predict_service.py 'skills text'"}))
        sys.exit(1)
    
    input_text = sys.argv[1]
    
    models, error = load_models()
    if error:
        print(json.dumps({"error": error}))
        sys.exit(1)
    
    result = predict(input_text, models)
    print(json.dumps(result))
