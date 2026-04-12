import pandas as pd
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score, confusion_matrix
from sklearn.utils import resample
import warnings
warnings.filterwarnings("ignore")

os.makedirs("models", exist_ok=True)

print("=" * 60)
print("SMARTAROGYA AI — ML MODEL TRAINING")
print("=" * 60)


def balance_classes(X, y):
    df = pd.concat([X, y], axis=1)
    target = y.name
    majority = df[df[target] == 0]
    minority = df[df[target] == 1]

    if len(minority) == 0 or len(majority) == 0:
        return X, y

    minority_upsampled = resample(
        minority,
        replace=True,
        n_samples=len(majority),
        random_state=42
    )

    df_balanced = pd.concat([majority, minority_upsampled])
    return df_balanced.drop(columns=[target]), df_balanced[target]


def print_metrics(name, y_test, y_pred, y_prob=None):
    acc = accuracy_score(y_test, y_pred)
    print(f"\n{name} Results")
    print(f"Accuracy : {acc*100:.2f}%")

    if y_prob is not None:
        try:
            auc = roc_auc_score(y_test, y_prob)
            print(f"ROC-AUC  : {auc:.4f}")
        except:
            pass

    print(classification_report(y_test, y_pred, target_names=["No Disease", "Disease"]))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    return acc


print("\n🩸 Training Diabetes Model...")


def find_dataset(*paths):
    for path in paths:
        if os.path.exists(path):
            return path
    raise FileNotFoundError(f"Dataset not found in: {', '.join(paths)}")

try:
    diabetes_path = find_dataset(
        "datasets/diabetes_prediction_dataset.csv",
        "datasets/diabetes.csv"
    )
    df_diab = pd.read_csv(diabetes_path)
    print(f"Loaded {len(df_diab):,} rows from {diabetes_path}")

    df_diab["gender_enc"] = df_diab["gender"].str.lower().map({
        "male": 1,
        "female": 0,
        "other": 0
    }).fillna(0)

    smoke_map = {
        "never": 0,
        "No Info": 0,
        "not current": 1,
        "former": 1,
        "ever": 1,
        "current": 2
    }

    df_diab["smoking_enc"] = df_diab["smoking_history"].map(smoke_map).fillna(0)

    DIAB_FEATURES = [
        "age",
        "gender_enc",
        "bmi",
        "blood_glucose_level",
        "HbA1c_level",
        "hypertension",
        "heart_disease",
        "smoking_enc"
    ]

    df_diab["hypertension"] = df_diab.get("hypertension", 0)
    df_diab["heart_disease"] = df_diab.get("heart_disease", 0)

    df_diab = df_diab.dropna(subset=DIAB_FEATURES + ["diabetes"])

    X_d = df_diab[DIAB_FEATURES]
    y_d = df_diab["diabetes"]

    X_d_bal, y_d_bal = balance_classes(X_d, y_d)

    X_train, X_test, y_train, y_test = train_test_split(
        X_d_bal, y_d_bal,
        test_size=0.2,
        random_state=42,
        stratify=y_d_bal
    )

    diabetes_model = RandomForestClassifier(
        n_estimators=50,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        max_features="sqrt",
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )

    diabetes_model.fit(X_train, y_train)

    y_pred_d = diabetes_model.predict(X_test)
    y_prob_d = diabetes_model.predict_proba(X_test)[:, 1]

    acc_d = print_metrics("Diabetes", y_test, y_pred_d, y_prob_d)

    with open("models/diabetes_model.pkl", "wb") as f:
        pickle.dump(diabetes_model, f)

    with open("models/diabetes_features.pkl", "wb") as f:
        pickle.dump(DIAB_FEATURES, f)

    print("✅ Diabetes model saved!")

except FileNotFoundError:
    print("❌ diabetes_prediction_dataset.csv not found")


print("\n❤️ Training Heart Disease Model...")

try:
    heart_path = find_dataset(
        "datasets/heart_2020_cleaned.csv",
        "datasets/heart.csv"
    )
    df_heart = pd.read_csv(heart_path)
    print(f"Loaded {len(df_heart):,} rows from {heart_path}")

    yes_no_cols = [
        "HeartDisease",
        "Smoking",
        "AlcoholDrinking",
        "DiffWalking",
        "PhysicalActivity",
        "Diabetic",
        "Stroke"
    ]

    for col in yes_no_cols:
        if col in df_heart.columns:
            df_heart[col] = df_heart[col].map({"Yes": 1, "No": 0}).fillna(0)

    df_heart["Sex"] = df_heart["Sex"].map({
        "Male": 1,
        "Female": 0
    }).fillna(0)

    HEART_FEATURES = [
        "BMI",
        "Smoking",
        "AlcoholDrinking",
        "PhysicalHealth",
        "MentalHealth",
        "DiffWalking",
        "Sex",
        "PhysicalActivity",
        "SleepTime",
        "Diabetic",
        "Stroke"
    ]

    df_heart = df_heart.dropna(subset=HEART_FEATURES + ["HeartDisease"])

    X_h = df_heart[HEART_FEATURES]
    y_h = df_heart["HeartDisease"]

    X_h_bal, y_h_bal = balance_classes(X_h, y_h)

    X_train, X_test, y_train, y_test = train_test_split(
        X_h_bal, y_h_bal,
        test_size=0.2,
        random_state=42,
        stratify=y_h_bal
    )

    heart_model = RandomForestClassifier(
        n_estimators=50,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        max_features="sqrt",
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )

    heart_model.fit(X_train, y_train)

    y_pred_h = heart_model.predict(X_test)
    y_prob_h = heart_model.predict_proba(X_test)[:, 1]

    acc_h = print_metrics("Heart Disease", y_test, y_pred_h, y_prob_h)

    with open("models/heart_model.pkl", "wb") as f:
        pickle.dump(heart_model, f)

    with open("models/heart_features.pkl", "wb") as f:
        pickle.dump(HEART_FEATURES, f)

    print("✅ Heart model saved!")

except FileNotFoundError:
    print("❌ heart_2020_cleaned.csv not found")


print("\n🫘 Training Kidney Disease Model...")

try:
    kidney_path = find_dataset(
        "datasets/kidney_disease.csv",
        "datasets/kidney.csv"
    )
    df_kid = pd.read_csv(kidney_path)
    print(f"Loaded {len(df_kid):,} rows from {kidney_path}")

    if df_kid["Gender"].dtype == object:
        df_kid["Gender"] = df_kid["Gender"].str.lower().map({
            "male": 1,
            "female": 0
        }).fillna(0)

    for col in [
        "Smoking",
        "AlcoholConsumption",
        "PhysicalActivity",
        "FamilyHistoryKidneyDisease",
        "FamilyHistoryDiabetes"
    ]:
        if df_kid[col].dtype == object:
            df_kid[col] = df_kid[col].str.lower().map({
                "yes": 1,
                "no": 0,
                "1": 1,
                "0": 0
            }).fillna(0)

    if df_kid["Diagnosis"].dtype == object:
        df_kid["Diagnosis"] = df_kid["Diagnosis"].str.lower().map({
            "ckd": 1,
            "notckd": 0,
            "yes": 1,
            "no": 0,
            "1": 1,
            "0": 0
        }).fillna(0)

    KIDNEY_FEATURES = [
        "Age",
        "Gender",
        "BMI",
        "Smoking",
        "AlcoholConsumption",
        "PhysicalActivity",
        "SystolicBP",
        "DiastolicBP",
        "FastingBloodSugar",
        "HbA1c",
        "SerumCreatinine",
        "BUNLevels",
        "GFR",
        "CholesterolTotal",
        "FamilyHistoryKidneyDisease",
        "FamilyHistoryDiabetes"
    ]

    df_kid = df_kid.dropna(subset=KIDNEY_FEATURES + ["Diagnosis"])

    X_k = df_kid[KIDNEY_FEATURES].astype(float)
    y_k = df_kid["Diagnosis"].astype(int)

    X_k_bal, y_k_bal = balance_classes(X_k, y_k)

    X_train, X_test, y_train, y_test = train_test_split(
        X_k_bal, y_k_bal,
        test_size=0.2,
        random_state=42,
        stratify=y_k_bal
    )

    kidney_model = RandomForestClassifier(
        n_estimators=50,
        max_depth=None,
        min_samples_split=3,
        min_samples_leaf=1,
        max_features="sqrt",
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )

    kidney_model.fit(X_train, y_train)

    y_pred_k = kidney_model.predict(X_test)
    y_prob_k = kidney_model.predict_proba(X_test)[:, 1]

    acc_k = print_metrics("Kidney Disease", y_test, y_pred_k, y_prob_k)

    with open("models/kidney_model.pkl", "wb") as f:
        pickle.dump(kidney_model, f)

    with open("models/kidney_features.pkl", "wb") as f:
        pickle.dump(KIDNEY_FEATURES, f)

    print("✅ Kidney model saved!")

except FileNotFoundError:
    print("❌ kidney_disease.csv not found")


print("\n" + "=" * 60)
print("ALL MODELS TRAINED AND SAVED SUCCESSFULLY!")
print("=" * 60)
print("Models saved in backend/models/")