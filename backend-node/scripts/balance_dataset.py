#!/usr/bin/env python3
"""
Smart Career Advisor - Dataset Balancing using SMOTE
Checks class distribution and applies SMOTE if imbalanced.

Usage:
    cd backend-node
    pip install imbalanced-learn
    python scripts/balance_dataset.py
"""

import os
import sys
import pandas as pd
import numpy as np

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.preprocessing import LabelEncoder
    from imblearn.over_sampling import SMOTE
except ImportError as e:
    print(f"\n[ERROR] Missing required package: {e}")
    print("Please install required packages:")
    print("  pip install scikit-learn pandas numpy imbalanced-learn")
    sys.exit(1)

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')

# Find dataset
dataset_path = os.path.join(DATA_DIR, 'jobs_dataset_comprehensive.csv')
if not os.path.exists(dataset_path):
    dataset_path = os.path.join(DATA_DIR, 'jobs_dataset_10roles.csv')
if not os.path.exists(dataset_path):
    print("[ERROR] No dataset found. Run generate_dataset.py first.")
    sys.exit(1)

print("=" * 60)
print("SMART CAREER ADVISOR - DATASET BALANCING (SMOTE)")
print("=" * 60)

# Load dataset
df = pd.read_csv(dataset_path)
print(f"\nLoaded dataset: {len(df)} samples")

# Check class distribution
role_counts = df['role'].value_counts()
print(f"\n--- BEFORE Balancing ---")
print(f"Total samples: {len(df)}")
print(f"Total roles: {len(role_counts)}")
print(f"Min samples per role: {role_counts.min()} ({role_counts.idxmin()})")
print(f"Max samples per role: {role_counts.max()} ({role_counts.idxmax()})")
print(f"Mean samples per role: {role_counts.mean():.1f}")
print(f"Std dev: {role_counts.std():.2f}")

# Check if balanced
is_balanced = role_counts.std() < 1.0  # Allow slight variation
if is_balanced:
    print(f"\n✅ Dataset is already BALANCED. No SMOTE needed.")
    print(f"Each role has {role_counts.iloc[0]} samples.")
else:
    print(f"\n⚠️ Dataset is IMBALANCED. Applying SMOTE...")
    
    # Vectorize skills text using TF-IDF
    vectorizer = TfidfVectorizer(max_features=500)
    X = vectorizer.fit_transform(df['skills'].fillna(''))
    
    # Encode labels
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df['role'])
    
    # Apply SMOTE
    # Set k_neighbors to min(5, min_class_size - 1) to handle small classes
    min_class_size = role_counts.min()
    k = min(5, min_class_size - 1)
    if k < 1:
        k = 1
    
    smote = SMOTE(random_state=42, k_neighbors=k)
    X_resampled, y_resampled = smote.fit_resample(X, y)
    
    # Convert back to DataFrame
    # For SMOTE-generated samples, we reconstruct the skills column
    roles_resampled = label_encoder.inverse_transform(y_resampled)
    
    # Get feature names to reconstruct skills
    feature_names = vectorizer.get_feature_names_out()
    
    new_data = []
    for i in range(len(y_resampled)):
        role = roles_resampled[i]
        if i < len(df):
            # Original sample
            new_data.append(df.iloc[i].to_dict())
        else:
            # SMOTE-generated sample: reconstruct skills from TF-IDF vector
            row_vec = X_resampled[i].toarray()[0]
            top_indices = np.argsort(row_vec)[-8:]  # Top 8 skills
            skills = [feature_names[j] for j in top_indices if row_vec[j] > 0]
            new_data.append({
                "id": i + 1,
                "title": f"{role} (Mid-level)",
                "company": "SyntheticCorp",
                "location": "Remote",
                "job_description": f"Synthetic sample for {role}",
                "skills": ", ".join(skills),
                "role": role
            })
    
    df_balanced = pd.DataFrame(new_data)
    
    # Save balanced dataset
    balanced_path = os.path.join(DATA_DIR, 'jobs_dataset_10k_balanced.csv')
    df_balanced.to_csv(balanced_path, index=False)
    
    # Report
    balanced_counts = df_balanced['role'].value_counts()
    print(f"\n--- AFTER Balancing (SMOTE) ---")
    print(f"Total samples: {len(df_balanced)}")
    print(f"Total roles: {len(balanced_counts)}")
    print(f"Min samples per role: {balanced_counts.min()}")
    print(f"Max samples per role: {balanced_counts.max()}")
    print(f"Mean samples per role: {balanced_counts.mean():.1f}")
    print(f"Saved to: {balanced_path}")

# Also save the primary dataset paths for consistency
for alt_path in [os.path.join(DATA_DIR, 'jobs_dataset_10roles.csv')]:
    df.to_csv(alt_path, index=False)
    print(f"Updated: {alt_path}")

print(f"\n{'=' * 60}")
print("Dataset balancing complete!")
print(f"{'=' * 60}")
