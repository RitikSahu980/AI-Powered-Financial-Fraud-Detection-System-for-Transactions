import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score
from xgboost import XGBClassifier

# ==========================
# Load dataset
# ==========================
DATA_PATH = "../modified_onlinefraud.csv"

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)

# ==========================
# Feature engineering
# ==========================
df["origBalanceDiff"] = df["oldbalanceOrg"] - df["newbalanceOrig"]
df["destBalanceDiff"] = df["newbalanceDest"] - df["oldbalanceDest"]

FEATURES = [
    "step",
    "type",
    "amount",
    "oldbalanceOrg",
    "newbalanceOrig",
    "oldbalanceDest",
    "newbalanceDest",
    "origBalanceDiff",
    "destBalanceDiff",
]

TARGET = "isFraud"

X = df[FEATURES]
y = df[TARGET]

print(f"Rows: {len(df)}")
print(df[TARGET].value_counts(normalize=True))

# ==========================
# Train/test split
# ==========================
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

# ==========================
# Preprocessor
# ==========================
preprocessor = ColumnTransformer(
    transformers=[
        (
            "cat",
            OneHotEncoder(
                categories=[["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"]],
                handle_unknown="ignore",
            ),
            ["type"],
        ),
    ],
    remainder="passthrough",
)

# ==========================
# XGBoost
# ==========================
xgb = XGBClassifier(
    n_estimators=400,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    min_child_weight=10,
    gamma=0.5,
    reg_alpha=0.5,
    reg_lambda=2.0,
    objective="binary:logistic",
    eval_metric="logloss",
    random_state=42,
)

# Calibrate probabilities
pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("classifier", xgb),
    ]
)

# ==========================
# Train
# ==========================
print("Training model...")
pipeline.fit(X_train, y_train)

# ==========================
# Evaluate
# ==========================
probs = pipeline.predict_proba(X_test)[:, 1]
auc = roc_auc_score(y_test, probs)
print(f"ROC-AUC: {auc:.4f}")

# ==========================
# Save
# ==========================
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_PATH = BASE_DIR / "online_payment_fraud_detection_model.pkl"

joblib.dump(pipeline, OUTPUT_PATH)
print(f"Model saved to: {OUTPUT_PATH}")