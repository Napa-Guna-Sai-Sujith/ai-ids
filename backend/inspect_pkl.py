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
import sys

# Ensure UTF-8 output on Windows terminal
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

def inspect_pkl_file(file_path):
    print("=" * 65)
    print(f"  [+] INSPECTING TRAINED MODEL FILE: {file_path}")
    print("=" * 65)
    
    if not os.path.exists(file_path):
        print(f"  [!] File not found: {file_path}")
        return

    with open(file_path, 'rb') as f:
        model = pickle.load(f)

    print(f"  * Object Type:        {type(model).__name__}")
    print(f"  * Module Source:      {type(model).__module__}")
    
    if hasattr(model, 'n_estimators'):
        print(f"  * Decision Trees:     {model.n_estimators} trees in forest")
    if hasattr(model, 'n_features_in_'):
        print(f"  * Input Features:     {model.n_features_in_} NetFlow statistical features")
    if hasattr(model, 'classes_'):
        print(f"  * Trained Classes:    {list(model.classes_)}")
    if hasattr(model, 'estimators_'):
        print(f"  * Ensemble Members:   {len(model.estimators_)} fitted estimators")

    if hasattr(model, 'get_params'):
        print("\n  * Tuned Model Hyperparameters:")
        for key, val in list(model.get_params().items())[:6]:
            print(f"    - {key}: {val}")

    print("=" * 65 + "\n")

if __name__ == "__main__":
    inspect_pkl_file("backend/models/trained_ids_ensemble.pkl")
    inspect_pkl_file("backend/models/random_forest_model.pkl")
    inspect_pkl_file("backend/models/xgboost_model.pkl")
