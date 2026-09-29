"""
=============================================================================
VS CODE PKL MODEL INSPECTOR & SHOWCASE SCRIPT
=============================================================================
Usage:
    python backend/inspect_pkl.py
=============================================================================
"""

import pickle
import os

def inspect_pkl_file(file_path):
    print("=" * 60)
    print(f"  📦 INSPECTING TRAINED MODEL FILE: {file_path}")
    print("=" * 60)
    
    if not os.path.exists(file_path):
        print(f"[!] File not found: {file_path}")
        return

    with open(file_path, 'rb') as f:
        model = pickle.load(f)

    print(f"  • Object Type:        {type(model).__name__}")
    print(f"  • Module Source:      {type(model).__module__}")
    
    if hasattr(model, 'n_estimators'):
        print(f"  • Decision Trees:     {model.n_estimators}")
    if hasattr(model, 'n_features_in_'):
        print(f"  • Input Features:     {model.n_features_in_} Extracted Flow Features")
    if hasattr(model, 'classes_'):
        print(f"  • Trained Classes:    {list(model.classes_)}")
    if hasattr(model, 'estimators_'):
        print(f"  • Sub-models (Voting): {[e[0] for e in model.estimators] if hasattr(model, 'estimators') else len(model.estimators_)}")

    print("\n  • Model Hyperparameters & Parameters:")
    for key, val in list(model.get_params().items())[:6]:
        print(f"    - {key}: {val}")

    print("=" * 60 + "\n")

if __name__ == "__main__":
    inspect_pkl_file("backend/models/trained_ids_ensemble.pkl")
    inspect_pkl_file("backend/models/random_forest_model.pkl")
    inspect_pkl_file("backend/models/xgboost_model.pkl")
