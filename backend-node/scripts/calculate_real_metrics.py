#!/usr/bin/env python3
"""
Smart Career Advisor - Real Model Metrics Calculator
Loads the actual trained models and calculates real performance metrics
"""

import os
import sys
import json

# Add parent directory to path to access models
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import joblib
    import pandas as pd
    import numpy as np
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
except ImportError as e:
    print(f"Error: Missing required package - {e}")
    print("Please install: pip install joblib pandas numpy scikit-learn")
    sys.exit(1)

print("=" * 70)
print("   SMART CAREER ADVISOR - REAL MODEL METRICS CALCULATOR")
print("=" * 70)

# Paths - check both backend and backend-node locations
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

# Try to find the models directory
possible_model_dirs = [
    os.path.join(PROJECT_ROOT, 'models'),
    os.path.join(PROJECT_ROOT, '..', 'backend', 'models'),
    os.path.join(PROJECT_ROOT, '..', 'backend-node', 'models'),
]

MODEL_DIR = None
for dir_path in possible_model_dirs:
    if os.path.exists(dir_path) and os.path.isfile(os.path.join(dir_path, 'vectorizer.joblib')):
        MODEL_DIR = dir_path
        break

if MODEL_DIR is None:
    print("\n[ERROR] Could not find trained models!")
    print("Please ensure the following files exist in the 'models' directory:")
    print("  - model_svm.joblib")
    print("  - model_rf.joblib")  
    print("  - vectorizer.joblib")
    print("  - label_encoder.joblib")
    sys.exit(1)

print(f"\n[+] Found models directory: {MODEL_DIR}")

# Try to find the dataset
possible_data_dirs = [
    os.path.join(PROJECT_ROOT, 'data'),
    os.path.join(PROJECT_ROOT, '..', 'backend', 'data'),
]

DATA_DIR = None
DATASET_PATH = None
for dir_path in possible_data_dirs:
    # Try different dataset names
    for dataset_name in ['jobs_dataset_10roles.csv', 'jobs_dataset.csv', 'resume_dataset.csv']:
        test_path = os.path.join(dir_path, dataset_name)
        if os.path.exists(test_path):
            DATA_DIR = dir_path
            DATASET_PATH = test_path
            break
    if DATASET_PATH:
        break

if DATASET_PATH is None:
    print("\n[ERROR] Could not find dataset!")
    print("Please ensure a CSV dataset exists in the 'data' directory")
    sys.exit(1)

print(f"[+] Found dataset: {DATASET_PATH}")

# Load models
print("\n" + "=" * 70)
print("STEP 1: LOADING TRAINED MODELS")
print("=" * 70)

try:
    svm_model = joblib.load(os.path.join(MODEL_DIR, 'model_svm.joblib'))
    print("[+] Loaded SVM model")
except:
    print("[!] SVM model not found, skipping...")
    svm_model = None

try:
    rf_model = joblib.load(os.path.join(MODEL_DIR, 'model_rf.joblib'))
    print("[+] Loaded Random Forest model")
except:
    print("[!] Random Forest model not found, skipping...")
    rf_model = None

vectorizer = joblib.load(os.path.join(MODEL_DIR, 'vectorizer.joblib'))
print("[+] Loaded TF-IDF Vectorizer")

label_encoder = joblib.load(os.path.join(MODEL_DIR, 'label_encoder.joblib'))
print("[+] Loaded Label Encoder")

# Load and prepare dataset
print("\n" + "=" * 70)
print("STEP 2: LOADING AND PREPARING DATASET")
print("=" * 70)

df = pd.read_csv(DATASET_PATH)
print(f"[+] Loaded dataset: {len(df)} records")
print(f"[+] Unique roles: {df['role'].nunique()}")

# Prepare features
if 'combined_text' not in df.columns:
    if 'job_description' in df.columns and 'skills' in df.columns:
        df['combined_text'] = df['job_description'] + ' ' + df['skills']
    elif 'skills' in df.columns:
        df['combined_text'] = df['skills']
    else:
        df['combined_text'] = df.iloc[:, 0].astype(str)  # Use first column

X = df['combined_text']
y = label_encoder.transform(df['role'])

# Split data (same as training)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"[+] Training set: {len(X_train)} samples")
print(f"[+] Testing set: {len(X_test)} samples")

# Vectorize
X_test_vec = vectorizer.transform(X_test)
print(f"[+] Vectorized test set: {X_test_vec.shape}")

# Calculate metrics
print("\n" + "=" * 70)
print("STEP 3: CALCULATING REAL MODEL METRICS")
print("=" * 70)

results = {}

if svm_model:
    print("\n[+] Evaluating SVM Model...")
    svm_pred = svm_model.predict(X_test_vec)
    results['SVM'] = {
        'accuracy': accuracy_score(y_test, svm_pred),
        'precision': precision_score(y_test, svm_pred, average='weighted', zero_division=0),
        'recall': recall_score(y_test, svm_pred, average='weighted', zero_division=0),
        'f1_score': f1_score(y_test, svm_pred, average='weighted', zero_division=0)
    }
    print(f"    Accuracy:  {results['SVM']['accuracy']*100:.2f}%")
    print(f"    Precision: {results['SVM']['precision']*100:.2f}%")
    print(f"    Recall:    {results['SVM']['recall']*100:.2f}%")
    print(f"    F1-Score:  {results['SVM']['f1_score']*100:.2f}%")

if rf_model:
    print("\n[+] Evaluating Random Forest Model...")
    rf_pred = rf_model.predict(X_test_vec)
    results['Random Forest'] = {
        'accuracy': accuracy_score(y_test, rf_pred),
        'precision': precision_score(y_test, rf_pred, average='weighted', zero_division=0),
        'recall': recall_score(y_test, rf_pred, average='weighted', zero_division=0),
        'f1_score': f1_score(y_test, rf_pred, average='weighted', zero_division=0)
    }
    print(f"    Accuracy:  {results['Random Forest']['accuracy']*100:.2f}%")
    print(f"    Precision: {results['Random Forest']['precision']*100:.2f}%")
    print(f"    Recall:    {results['Random Forest']['recall']*100:.2f}%")
    print(f"    F1-Score:  {results['Random Forest']['f1_score']*100:.2f}%")

# Comparison table
print("\n" + "=" * 70)
print("                    MODEL COMPARISON TABLE")
print("=" * 70)

if svm_model and rf_model:
    print(f"\n{'Metric':<15} {'SVM':<15} {'Random Forest':<15} {'Winner':<10}")
    print("-" * 60)
    
    for metric in ['accuracy', 'precision', 'recall', 'f1_score']:
        svm_val = results['SVM'][metric] * 100
        rf_val = results['Random Forest'][metric] * 100
        winner = "■ RF" if rf_val > svm_val else "■ SVM" if svm_val > rf_val else "TIE"
        metric_name = metric.replace('_', '-').title()
        print(f"{metric_name:<15} {svm_val:.2f}%{'':<8} {rf_val:.2f}%{'':<8} {winner}")

# Save metrics
print("\n" + "=" * 70)
print("STEP 4: SAVING METRICS")
print("=" * 70)

metrics_output = {
    'svm_metrics': results.get('SVM', {}),
    'rf_metrics': results.get('Random Forest', {}),
    'dataset_info': {
        'total_samples': len(df),
        'test_samples': len(X_test),
        'roles': len(label_encoder.classes_)
    }
}

metrics_file = os.path.join(MODEL_DIR, 'real_metrics.json')
with open(metrics_file, 'w') as f:
    json.dump(metrics_output, f, indent=2)
print(f"[+] Saved metrics to: {metrics_file}")

print("\n" + "=" * 70)
print("                    METRICS CALCULATION COMPLETE!")
print("=" * 70 + "\n")
