#!/usr/bin/env python3
"""
Smart Career Advisor - Train & Evaluate ML Models
==================================================
Trains SVM (with CalibratedClassifierCV for predict_proba support)
and Random Forest, then saves production models.

Strategy: Fit vectorizer on FULL data → train/test split for evaluation → 
final production models trained on full data with same vectorizer.

Usage:
    cd backend-node
    python scripts/train_and_evaluate.py
"""

import os
import sys
import io
import json
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

try:
    import numpy as np
    import pandas as pd
    import joblib
    from sklearn.model_selection import train_test_split
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.preprocessing import LabelEncoder
    from sklearn.svm import LinearSVC
    from sklearn.calibration import CalibratedClassifierCV
    from sklearn.ensemble import RandomForestClassifier, VotingClassifier
    from sklearn.metrics import accuracy_score, f1_score
except ImportError as e:
    print(f"Error: Missing package - {e}")
    sys.exit(1)

LINE = "=" * 60

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')
MODEL_DIR = os.path.join(PROJECT_ROOT, 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

# Find dataset
dataset_path = None
for name in ['jobs_dataset_comprehensive.csv', 'jobs_dataset_10roles.csv']:
    p = os.path.join(DATA_DIR, name)
    if os.path.exists(p):
        dataset_path = p
        break

if not dataset_path:
    print("[ERROR] No dataset found in data/ folder")
    sys.exit(1)

print(LINE)
print("  SMART CAREER ADVISOR - MODEL TRAINING")
print(LINE)
print(f"  Started: {time.strftime('%Y-%m-%d %H:%M:%S')}")

# ═══════════════════════════════════════════
# STEP 1: LOAD DATA
# ═══════════════════════════════════════════
print(f"\n  Loading dataset: {os.path.basename(dataset_path)}")
df = pd.read_csv(dataset_path)
print(f"  Records: {len(df):,} | Roles: {df['role'].nunique()}")

# Combine job_description + skills for richer features
if 'job_description' in df.columns and 'skills' in df.columns:
    df['combined_text'] = df['job_description'].fillna('') + ' ' + df['skills'].fillna('')
elif 'skills' in df.columns:
    df['combined_text'] = df['skills'].fillna('')
else:
    df['combined_text'] = df.iloc[:, 0].astype(str)

X_text = df['combined_text']
y_labels = df['role']

# ═══════════════════════════════════════════
# STEP 2: SPLIT FOR EVALUATION (Raw Text)
# ═══════════════════════════════════════════
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y_labels)

X_train_text, X_test_text, y_train, y_test = train_test_split(
    X_text, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)
print(f"  Train: {X_train_text.shape[0]:,} | Test: {X_test_text.shape[0]:,}")

# ═══════════════════════════════════════════
# STEP 3: VECTORIZE FOR EVALUATION (Fit on Train only)
# ═══════════════════════════════════════════
eval_vectorizer = TfidfVectorizer(
    max_features=1000,
    ngram_range=(1, 1),
    sublinear_tf=True,
    stop_words='english',
)

X_train = eval_vectorizer.fit_transform(X_train_text)
X_test = eval_vectorizer.transform(X_test_text)
print(f"  TF-IDF features: {X_train.shape[1]:,}")

# ═══════════════════════════════════════════
# STEP 4: TRAIN SVM WITH CALIBRATION
# ═══════════════════════════════════════════
print(f"\n  Training SVM (LinearSVC + CalibratedClassifierCV)...")
svm_start = time.time()

# To artificially decrease SVM accuracy per user request, we cripple its regularization (C=0.01)
base_svm = LinearSVC(max_iter=10000, random_state=42, C=0.01, dual=True)
svm_model = CalibratedClassifierCV(base_svm, cv=3, method='sigmoid')
svm_model.fit(X_train, y_train)

svm_time = time.time() - svm_start
svm_pred = svm_model.predict(X_test)
svm_acc = accuracy_score(y_test, svm_pred)
svm_f1 = f1_score(y_test, svm_pred, average='weighted', zero_division=0)

# Verify predict_proba works
svm_proba_test = svm_model.predict_proba(X_test[:1])
has_proba = svm_proba_test.shape[1] == len(label_encoder.classes_)

print(f"  SVM Accuracy:  {svm_acc*100:.2f}%")
print(f"  SVM F1-Score:  {svm_f1*100:.2f}%")
print(f"  predict_proba: {'YES' if has_proba else 'NO'} ({svm_proba_test.shape[1]} classes)")
print(f"  Time: {svm_time:.1f}s")

# ═══════════════════════════════════════════
# STEP 5: TRAIN RANDOM FOREST
# ═══════════════════════════════════════════
print(f"\n  Training Random Forest...")
rf_start = time.time()

rf_model = RandomForestClassifier(
    n_estimators=20,
    max_depth=15,
    max_features='log2',
    class_weight='balanced',
    random_state=42,
    n_jobs=1,
)
rf_model.fit(X_train, y_train)

rf_time = time.time() - rf_start
rf_pred = rf_model.predict(X_test)
rf_acc = accuracy_score(y_test, rf_pred)
rf_f1 = f1_score(y_test, rf_pred, average='weighted', zero_division=0)

print(f"  RF Accuracy:   {rf_acc*100:.2f}%")
print(f"  RF F1-Score:   {rf_f1*100:.2f}%")
print(f"  Time: {rf_time:.1f}s")

# ═══════════════════════════════════════════
# STEP 5.5: TRAIN VOTING ENSEMBLE
# ═══════════════════════════════════════════
print(f"\n  Training Soft Voting Ensemble...")
ens_start = time.time()

# Recreate components for ensemble evaluation avoiding fitting leakage
ens_svm = CalibratedClassifierCV(LinearSVC(max_iter=10000, random_state=42, C=0.01, dual=True), cv=3, method='sigmoid')
ens_rf = RandomForestClassifier(n_estimators=20, max_depth=15, max_features='log2', class_weight='balanced', random_state=42, n_jobs=1)

ensemble_model = VotingClassifier(
    estimators=[('svm', ens_svm), ('rf', ens_rf)],
    voting='soft',
    weights=[1, 1.5]
)
ensemble_model.fit(X_train, y_train)

ens_time = time.time() - ens_start
ens_pred = ensemble_model.predict(X_test)
ens_acc = accuracy_score(y_test, ens_pred)
ens_f1 = f1_score(y_test, ens_pred, average='weighted', zero_division=0)

print(f"  Ensemble Accuracy: {ens_acc*100:.2f}%")
print(f"  Ensemble F1-Score: {ens_f1*100:.2f}%")
print(f"  Time: {ens_time:.1f}s")

# ═══════════════════════════════════════════
# STEP 6: PRODUCTION MODELS — TRAIN ON FULL
# ═══════════════════════════════════════════
print(f"\n  Retraining on FULL dataset for production...")

# Final Vectorizer on ALL text
final_vectorizer = TfidfVectorizer(
    max_features=1000,
    ngram_range=(1, 1),
    sublinear_tf=True,
    stop_words='english',
)
X_all = final_vectorizer.fit_transform(X_text)

# SVM with calibration on full data (same vectorizer features)
base_svm_full = LinearSVC(max_iter=10000, random_state=42, C=0.01, dual=True)
svm_prod = CalibratedClassifierCV(base_svm_full, cv=3, method='sigmoid')
svm_prod.fit(X_all, y_encoded)

# RF on full data
rf_prod = RandomForestClassifier(
    n_estimators=20, max_depth=15, max_features='log2',
    class_weight='balanced', random_state=42, n_jobs=1
)
rf_prod.fit(X_all, y_encoded)

# Soft Voting Ensemble on full data
print("  Training production ensemble on full data...")
ensemble_prod = VotingClassifier(
    estimators=[('svm', svm_prod), ('rf', rf_prod)],
    voting='soft',
    weights=[1, 1.5]
)
# Since estimators are already fitted on the full data, we can just fit the ensemble itself on the full data.
# sklearn VotingClassifier will refit internal estimators, which is fine and intended.
ensemble_prod.fit(X_all, y_encoded)

# ═══════════════════════════════════════════
# STEP 7: SAVE MODELS
# ═══════════════════════════════════════════
print(f"\n  Saving models to {MODEL_DIR}")

joblib.dump(svm_prod, os.path.join(MODEL_DIR, 'model_svm.joblib'))
joblib.dump(rf_prod, os.path.join(MODEL_DIR, 'model_rf.joblib'))
joblib.dump(ensemble_prod, os.path.join(MODEL_DIR, 'model_ensemble.joblib'))
joblib.dump(final_vectorizer, os.path.join(MODEL_DIR, 'vectorizer.joblib'))
joblib.dump(label_encoder, os.path.join(MODEL_DIR, 'label_encoder.joblib'))

print("  [OK] model_svm.joblib       (CalibratedClassifierCV + LinearSVC)")
print("  [OK] model_rf.joblib        (RandomForestClassifier)")
print("  [OK] model_ensemble.joblib  (Soft Voting Classifier)")
print("  [OK] vectorizer.joblib")
print("  [OK] label_encoder.joblib")

# Save metrics
metrics = {
    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
    'dataset': os.path.basename(dataset_path),
    'total_samples': int(len(df)),
    'roles': int(df['role'].nunique()),
    'features': int(X_all.shape[1]),
    'svm': {
        'accuracy': round(svm_acc * 100, 2),
        'f1_weighted': round(svm_f1 * 100, 2),
        'has_predict_proba': True,
        'training_time': round(svm_time, 2),
    },
    'rf': {
        'accuracy': round(rf_acc * 100, 2),
        'f1_weighted': round(rf_f1 * 100, 2),
        'training_time': round(rf_time, 2),
    },
    'ensemble': {
        'accuracy': round(ens_acc * 100, 2),
        'f1_weighted': round(ens_f1 * 100, 2),
        'training_time': round(ens_time, 2),
    }
}
with open(os.path.join(MODEL_DIR, 'metrics.json'), 'w', encoding='utf-8') as f:
    json.dump(metrics, f, indent=2, ensure_ascii=False)
print("  [OK] metrics.json")

print(f"\n{LINE}")
print(f"  DONE — SVM now supports predict_proba() for top-3 predictions")
print(f"  Finished: {time.strftime('%Y-%m-%d %H:%M:%S')}")
print(LINE)
