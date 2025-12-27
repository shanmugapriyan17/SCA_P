#!/usr/bin/env python3
"""
Smart Career Advisor - Display Model Metrics
Shows the saved model performance metrics from training

Usage:
    cd backend-node
    python scripts/show_model_metrics.py
"""

import os
import sys
import json

def print_header(text):
    print("\n" + "=" * 70)
    print(f"       {text}")
    print("=" * 70)

# Find metrics file
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
METRICS_PATH = os.path.join(SCRIPT_DIR, '..', 'models', 'metrics.json')

if not os.path.exists(METRICS_PATH):
    print("\n[ERROR] No metrics found!")
    print("Please run: python scripts/train_and_evaluate.py")
    sys.exit(1)

# Load metrics
with open(METRICS_PATH, 'r') as f:
    metrics = json.load(f)

print_header("SMART CAREER ADVISOR - MODEL PERFORMANCE REPORT")
print(f"\nLast trained: {metrics['timestamp']}")

# Dataset info
print("\n" + "=" * 70)
print("                    DATASET INFORMATION")
print("=" * 70)
print(f"""
  Total Samples:    {metrics['dataset']['total_samples']}
  Training Set:     {metrics['dataset']['train_samples']}
  Testing Set:      {metrics['dataset']['test_samples']}
  Number of Roles:  {metrics['dataset']['num_roles']}
""")

# Model comparison table
print("=" * 70)
print("                    MODEL COMPARISON TABLE")
print("=" * 70)

svm = metrics['svm_metrics']
rf = metrics['rf_metrics']

print(f"\n{'Metric':<15} {'SVM':<15} {'Random Forest':<15} {'Winner':<10}")
print("-" * 60)

# Accuracy
winner = "■ RF" if rf['accuracy'] > svm['accuracy'] else "■ SVM"
print(f"{'Accuracy':<15} {svm['accuracy']*100:.2f}%{'':<8} {rf['accuracy']*100:.2f}%{'':<8} {winner}")

# Precision
winner = "■ RF" if rf['precision'] > svm['precision'] else "■ SVM"
print(f"{'Precision':<15} {svm['precision']*100:.2f}%{'':<8} {rf['precision']*100:.2f}%{'':<8} {winner}")

# Recall
winner = "■ RF" if rf['recall'] > svm['recall'] else "■ SVM"
print(f"{'Recall':<15} {svm['recall']*100:.2f}%{'':<8} {rf['recall']*100:.2f}%{'':<8} {winner}")

# F1-Score
winner = "■ RF" if rf['f1_score'] > svm['f1_score'] else "■ SVM"
print(f"{'F1-Score':<15} {svm['f1_score']*100:.2f}%{'':<8} {rf['f1_score']*100:.2f}%{'':<8} {winner}")

# Detailed metrics
print("\n" + "=" * 70)
print("                    DETAILED METRICS")
print("=" * 70)

print(f"""
[SVM Model - Support Vector Machine]
----------------------------------------
  Accuracy:  {svm['accuracy']*100:.2f}%
  Precision: {svm['precision']*100:.2f}%
  Recall:    {svm['recall']*100:.2f}%
  F1-Score:  {svm['f1_score']*100:.2f}%
  Train Time: {svm['training_time_seconds']:.3f}s

[Random Forest Model]
----------------------------------------
  Accuracy:  {rf['accuracy']*100:.2f}%
  Precision: {rf['precision']*100:.2f}%
  Recall:    {rf['recall']*100:.2f}%
  F1-Score:  {rf['f1_score']*100:.2f}%
  Train Time: {rf['training_time_seconds']:.3f}s
""")

# Cross-validation scores
if 'cv_scores' in svm:
    print("=" * 70)
    print("                    CROSS-VALIDATION SCORES")
    print("=" * 70)
    
    print(f"\nSVM 5-Fold CV: {[f'{s*100:.1f}%' for s in svm['cv_scores']]}")
    print(f"  Mean: {sum(svm['cv_scores'])/len(svm['cv_scores'])*100:.2f}%")
    
    print(f"\nRF 5-Fold CV:  {[f'{s*100:.1f}%' for s in rf['cv_scores']]}")
    print(f"  Mean: {sum(rf['cv_scores'])/len(rf['cv_scores'])*100:.2f}%")

# Summary
print("\n" + "=" * 70)
print("                    SUMMARY")
print("=" * 70)

best = metrics['best_model']
print(f"""
  • Best Model: {best['name']} ({best['accuracy']*100:.2f}% accuracy)
  • Total Roles Supported: {metrics['dataset']['num_roles']}
""")

# Show all roles
print("=" * 70)
print("                    SUPPORTED JOB ROLES")
print("=" * 70)
roles = metrics['dataset']['roles']
# Print in 2 columns
half = (len(roles) + 1) // 2
for i in range(half):
    left = f"  {i+1:2}. {roles[i]}"
    right = f"  {i+half+1:2}. {roles[i+half]}" if i+half < len(roles) else ""
    print(f"{left:<38} {right}")

print("\n" + "=" * 70)
