#!/usr/bin/env python3
"""
Smart Career Advisor - Explainable AI Service (Module 5)
========================================================
Explains career predictions using:
  1. Feature Contribution Analysis (RF importance × TF-IDF weight)
  2. SHAP (SHapley Additive exPlanations) — waterfall + summary
  3. LIME (Local Interpretable Model-Agnostic Explanations) — bar chart

Usage:
    python scripts/explain_service.py "Python, Machine Learning, TensorFlow"

Output: JSON to stdout with feature contributions, SHAP values, LIME weights
"""

import os
import sys
import json
import base64
import io

try:
    import numpy as np
    import joblib
except ImportError as e:
    print(json.dumps({"error": f"Missing package: {e}"}))
    sys.exit(1)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
MODEL_DIR = os.path.join(PROJECT_ROOT, 'models')


def load_models():
    models = {}
    for f in ['vectorizer.joblib', 'label_encoder.joblib', 'model_rf.joblib']:
        path = os.path.join(MODEL_DIR, f)
        if os.path.exists(path):
            models[f.replace('.joblib', '')] = joblib.load(path)
    return models


def fig_to_base64(fig):
    """Convert matplotlib figure to base64 PNG string."""
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=120, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    return b64


def explain_prediction(text, models):
    import matplotlib
    matplotlib.use('Agg')  # Non-interactive backend
    import matplotlib.pyplot as plt

    vectorizer = models['vectorizer']
    label_encoder = models['label_encoder']
    rf = models.get('model_rf')

    X = vectorizer.transform([text])
    feature_names = vectorizer.get_feature_names_out()

    result = {
        "input_text": text,
        "techniques": [],
        "charts": {}
    }

    if not rf:
        result["error"] = "Random Forest model not found"
        return result

    prediction = rf.predict(X)[0]
    predicted_role = label_encoder.inverse_transform([prediction])[0]
    result["predicted_role"] = predicted_role

    # ──────────────────────────────────────────────────────────────
    # TECHNIQUE 1: Feature Contribution Analysis (always works)
    # ──────────────────────────────────────────────────────────────
    try:
        importances = rf.feature_importances_
        input_features = X.toarray()[0]
        nonzero_indices = np.where(input_features > 0)[0]

        contributions = []
        for idx in nonzero_indices:
            contributions.append({
                "feature": str(feature_names[idx]),
                "importance": float(round(importances[idx], 6)),
                "tfidf_weight": float(round(input_features[idx], 4)),
                "contribution": float(round(importances[idx] * input_features[idx], 6)),
                "direction": "positive"
            })

        contributions.sort(key=lambda x: x['contribution'], reverse=True)
        top_positive = contributions[:10]

        result["techniques"].append({
            "name": "Feature Contribution Analysis",
            "description": "Shows which skills/keywords contributed most to the prediction "
                           "(Random Forest feature importance × TF-IDF weight).",
            "top_contributing_features": top_positive,
            "total_features_used": len(nonzero_indices),
            "explanation": f"The predicted role '{predicted_role}' was primarily determined by: " +
                           ", ".join([f"'{c['feature']}'" for c in top_positive[:5]])
        })

        # ── Generate Feature Contribution Bar Chart ──
        try:
            top8 = contributions[:8]
            fig, ax = plt.subplots(figsize=(8, 4))
            features = [c['feature'] for c in reversed(top8)]
            values = [c['contribution'] * 1000 for c in reversed(top8)]
            colors = ['#7c3aed' if v > 0 else '#ef4444' for v in values]
            ax.barh(features, values, color=colors, height=0.6, edgecolor='none')
            ax.set_xlabel('Contribution Score (×1000)', fontsize=10, color='#475569')
            ax.set_title(f'Top Features → {predicted_role}', fontsize=12,
                         fontweight='bold', color='#1e293b', pad=12)
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.spines['left'].set_color('#e2e8f0')
            ax.spines['bottom'].set_color('#e2e8f0')
            ax.tick_params(colors='#64748b', labelsize=9)
            plt.tight_layout()
            result["charts"]["feature_contribution"] = fig_to_base64(fig)
            plt.close(fig)
        except Exception:
            pass

    except Exception as e:
        result["techniques"].append({
            "name": "Feature Contribution Analysis",
            "error": str(e)
        })

    # ──────────────────────────────────────────────────────────────
    # TECHNIQUE 2: SHAP (SHapley Additive exPlanations)
    # ──────────────────────────────────────────────────────────────
    try:
        import shap

        # Create SHAP explainer for Random Forest
        explainer = shap.TreeExplainer(rf)
        shap_values = explainer.shap_values(X)

        # For multiclass: shap_values is list of arrays (one per class)
        if isinstance(shap_values, list):
            pred_class = int(prediction)
            sv = shap_values[pred_class][0]
        elif shap_values.ndim == 3:
            pred_class = int(prediction)
            sv = shap_values[0, :, pred_class]
        else:
            sv = shap_values[0]

        # Top SHAP features (sorted by absolute value)
        top_indices = np.argsort(np.abs(sv))[-10:][::-1]
        shap_features = []
        for idx in top_indices:
            if sv[idx] != 0:
                shap_features.append({
                    "feature": str(feature_names[idx]),
                    "shap_value": float(round(sv[idx], 6)),
                    "direction": "positive" if sv[idx] > 0 else "negative",
                    "impact": "increases" if sv[idx] > 0 else "decreases",
                    "interpretation": f"'{feature_names[idx]}' {'supports' if sv[idx] > 0 else 'opposes'} this prediction"
                })

        result["techniques"].append({
            "name": "SHAP (SHapley Additive exPlanations)",
            "description": "SHAP uses game theory (Shapley values) to quantify each feature's "
                           "contribution. Positive values push towards the predicted class, negative values push away.",
            "shap_features": shap_features[:10],
            "explanation": "SHAP analysis shows the top contributing skills are: " +
                           ", ".join([f"'{f['feature']}' ({f['direction']})" for f in shap_features[:5]])
        })

        # ── Generate SHAP Waterfall Plot (instance-level) ──
        try:
            fig, ax = plt.subplots(figsize=(8, 5))
            top6 = shap_features[:6]
            features_list = [f['feature'] for f in reversed(top6)]
            values_list = [f['shap_value'] for f in reversed(top6)]
            colors = ['#10b981' if v > 0 else '#ef4444' for v in values_list]

            bars = ax.barh(features_list, values_list, color=colors, height=0.6, edgecolor='none')
            ax.axvline(x=0, color='#94a3b8', linewidth=0.8, linestyle='--')
            ax.set_xlabel('SHAP Value (impact on prediction)', fontsize=10, color='#475569')
            ax.set_title(f'SHAP Waterfall — Why "{predicted_role}"?', fontsize=12,
                         fontweight='bold', color='#1e293b', pad=12)
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.spines['left'].set_color('#e2e8f0')
            ax.spines['bottom'].set_color('#e2e8f0')
            ax.tick_params(colors='#64748b', labelsize=9)

            # Add value labels on bars
            for bar, val in zip(bars, values_list):
                x_pos = bar.get_width()
                ax.text(x_pos + (0.001 if val >= 0 else -0.001),
                        bar.get_y() + bar.get_height() / 2,
                        f'{val:.4f}', ha='left' if val >= 0 else 'right',
                        va='center', fontsize=8, color='#475569')

            plt.tight_layout()
            result["charts"]["shap_waterfall"] = fig_to_base64(fig)
            plt.close(fig)
        except Exception:
            pass

        # ── Generate SHAP Summary Bar Plot ──
        try:
            fig, ax = plt.subplots(figsize=(8, 4))
            abs_mean = np.mean([np.abs(sv_class) for sv_class in shap_values], axis=0)
            if abs_mean.ndim > 1:
                abs_mean = abs_mean[0]
            top_global = np.argsort(abs_mean)[-8:][::-1]
            gf = [str(feature_names[i]) for i in reversed(top_global)]
            gv = [float(abs_mean[i]) for i in reversed(top_global)]
            ax.barh(gf, gv, color='#6366f1', height=0.6, edgecolor='none')
            ax.set_xlabel('Mean |SHAP Value| (global importance)', fontsize=10, color='#475569')
            ax.set_title('SHAP Global Feature Importance', fontsize=12,
                         fontweight='bold', color='#1e293b', pad=12)
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.spines['left'].set_color('#e2e8f0')
            ax.spines['bottom'].set_color('#e2e8f0')
            ax.tick_params(colors='#64748b', labelsize=9)
            plt.tight_layout()
            result["charts"]["shap_summary"] = fig_to_base64(fig)
            plt.close(fig)
        except Exception:
            pass

    except ImportError:
        result["techniques"].append({
            "name": "SHAP",
            "error": "shap package not installed. Run: pip install shap"
        })
    except Exception as e:
        result["techniques"].append({
            "name": "SHAP",
            "error": str(e)
        })

    # ──────────────────────────────────────────────────────────────
    # TECHNIQUE 3: LIME (Local Interpretable Model-Agnostic)
    # ──────────────────────────────────────────────────────────────
    try:
        from lime.lime_text import LimeTextExplainer

        class_names = label_encoder.classes_.tolist()

        def predict_proba_fn(texts):
            X_transformed = vectorizer.transform(texts)
            return rf.predict_proba(X_transformed)

        lime_explainer = LimeTextExplainer(class_names=class_names)
        lime_exp = lime_explainer.explain_instance(
            text,
            predict_proba_fn,
            num_features=10,
            num_samples=200
        )

        lime_features = []
        for feature, weight in lime_exp.as_list():
            lime_features.append({
                "feature": feature,
                "lime_weight": float(round(weight, 6)),
                "direction": "positive" if weight > 0 else "negative",
                "impact": "supports" if weight > 0 else "opposes",
                "interpretation": f"'{feature}' {'supports' if weight > 0 else 'opposes'} this prediction"
            })

        result["techniques"].append({
            "name": "LIME (Local Interpretable Model-Agnostic Explanations)",
            "description": "LIME builds a simple interpretable model around the specific prediction "
                           "to explain why THIS particular output was generated. "
                           "Positive weights support the prediction, negative weights oppose it.",
            "lime_features": lime_features,
            "predicted_class_label": predicted_role,
            "explanation": "LIME reveals the words most influencing this prediction: " +
                           ", ".join([f"'{f['feature']}' ({f['direction']})" for f in lime_features[:5]])
        })

        # ── Generate LIME Bar Chart (positive/negative influence) ──
        try:
            fig, ax = plt.subplots(figsize=(8, 4))
            top8_lime = lime_features[:8]
            lf_names = [f['feature'] for f in reversed(top8_lime)]
            lf_weights = [f['lime_weight'] for f in reversed(top8_lime)]
            colors = ['#10b981' if w > 0 else '#ef4444' for w in lf_weights]

            bars = ax.barh(lf_names, lf_weights, color=colors, height=0.6, edgecolor='none')
            ax.axvline(x=0, color='#94a3b8', linewidth=0.8, linestyle='--')
            ax.set_xlabel('LIME Weight (+ supports, - opposes)', fontsize=10, color='#475569')
            ax.set_title(f'LIME — Why "{predicted_role}"?', fontsize=12,
                         fontweight='bold', color='#1e293b', pad=12)
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.spines['left'].set_color('#e2e8f0')
            ax.spines['bottom'].set_color('#e2e8f0')
            ax.tick_params(colors='#64748b', labelsize=9)

            for bar, val in zip(bars, lf_weights):
                x_pos = bar.get_width()
                ax.text(x_pos + (0.002 if val >= 0 else -0.002),
                        bar.get_y() + bar.get_height() / 2,
                        f'{val:.4f}', ha='left' if val >= 0 else 'right',
                        va='center', fontsize=8, color='#475569')

            plt.tight_layout()
            result["charts"]["lime_bar"] = fig_to_base64(fig)
            plt.close(fig)
        except Exception:
            pass

    except ImportError:
        result["techniques"].append({
            "name": "LIME",
            "error": "lime package not installed. Run: pip install lime"
        })
    except Exception as e:
        result["techniques"].append({
            "name": "LIME",
            "error": str(e)
        })

    result["success"] = True
    return result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input text provided"}))
        sys.exit(1)

    models = load_models()
    if not models.get('model_rf'):
        print(json.dumps({"error": "RF model not found. Run train_and_evaluate.py first"}))
        sys.exit(1)

    result = explain_prediction(sys.argv[1], models)
    print(json.dumps(result))
