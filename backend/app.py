import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import re
import logging
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

SECRET_KEY = "smartarogya_secret_key_2025"

HOSPITAL_ADMIN = {
    "userId": "Priyanshu27",
    "password": "Priy#nshu0227",
    "fullName": "Hospital Admin",
    "role": "hospital"
}

logging.basicConfig(level=logging.INFO)

SHEET_SCOPE = [
    "https://spreadsheets.google.com/feeds",
    "https://www.googleapis.com/auth/drive"
]

SHEET_URL = "https://docs.google.com/spreadsheets/d/1-XOVdIABAcRIQRU9Ro66fpcJaK0fnkkukoxyH-XLJl0"

def get_client():
    creds = ServiceAccountCredentials.from_json_keyfile_name(
        "credentials.json", SHEET_SCOPE
    )
    return gspread.authorize(creds)

def get_sheet():
    try:
        client = get_client()
        return client.open_by_url(SHEET_URL).worksheet("Users")
    except Exception as e:
        logging.error(f"Error accessing Users sheet: {e}")
        raise

def get_history_sheet():
    try:
        client = get_client()
        return client.open_by_url(SHEET_URL).worksheet("PredictionHistory")
    except Exception as e:
        logging.error(f"Error accessing PredictionHistory sheet: {e}")
        raise

def get_all_users():
    try:
        return get_sheet().get_all_records()
    except Exception as e:
        logging.error(f"Error fetching users: {e}")
        return []

def find_user(user_id):
    for user in get_all_users():
        uid = (user.get("UserID") or user.get("User ID") or
               user.get("userid") or user.get("USERID") or "")
        if str(uid).strip() == str(user_id).strip():
            return user
    return None

def load_models():
    with open("models/diabetes_model.pkl", "rb") as f:
        diabetes_model = pickle.load(f)
    with open("models/heart_model.pkl", "rb") as f:
        heart_model = pickle.load(f)
    with open("models/kidney_model.pkl", "rb") as f:
        kidney_model = pickle.load(f)
    return diabetes_model, heart_model, kidney_model

@app.route("/check-userid", methods=["GET"])
def check_userid():
    user_id = request.args.get("userId", "").strip()
    if not re.match(r'^[a-zA-Z0-9]{5,15}$', user_id):
        return jsonify({"available": False, "message": "Invalid format"})
    if user_id == HOSPITAL_ADMIN["userId"]:
        return jsonify({"available": False, "message": "Make other user id"})
    if find_user(user_id):
        return jsonify({"available": False, "message": "Make other user id"})
    return jsonify({"available": True, "message": "User ID available"})

@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        user_id = data.get("userId", "").strip()
        password = data.get("password", "").strip()
        role = data.get("role", "patient")
        if role == "hospital":
            return jsonify({"success": False, "message": "Hospital registration is closed."})
        if not re.match(r'^[a-zA-Z0-9]{5,15}$', user_id):
            return jsonify({"success": False, "message": "Invalid User ID format"})
        if find_user(user_id):
            return jsonify({"success": False, "message": "User ID already exists"})
        get_sheet().append_row([
            data.get("fullName", ""), user_id, password,
            data.get("mobile", ""), data.get("email", ""),
            data.get("address", ""), data.get("city", ""),
            data.get("district", ""), data.get("state", ""),
            data.get("mapLink", ""), "patient",
            datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ])
        return jsonify({"success": True, "message": "Registration successful"})
    except Exception as e:
        logging.error(f"Registration error: {e}")
        return jsonify({"success": False, "message": "Internal server error"})

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        user_id = data.get("userId", "").strip()
        password = data.get("password", "").strip()
        role = data.get("role", "patient")

        if role == "hospital":
            if user_id == HOSPITAL_ADMIN["userId"] and password == HOSPITAL_ADMIN["password"]:
                token = jwt.encode({
                    "userId": user_id, "role": "hospital",
                    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
                }, SECRET_KEY, algorithm="HS256")
                return jsonify({
                    "success": True, "token": token,
                    "user": {"fullName": HOSPITAL_ADMIN["fullName"],
                             "userId": user_id, "role": "hospital"}
                })
            return jsonify({"success": False, "message": "Invalid User ID or Password"})

        user = find_user(user_id)
        if not user:
            return jsonify({"success": False, "message": "Invalid User ID or Password"})

        stored_password = str(
            user.get("Password") or user.get("password") or user.get("PASSWORD") or ""
        ).strip()

        if password != stored_password:
            return jsonify({"success": False, "message": "Invalid User ID or Password"})

        stored_role = str(user.get("Role") or user.get("role") or "patient").strip()
        if stored_role != role:
            return jsonify({"success": False, "message": "Invalid role. Please select correct login type."})

        token = jwt.encode({
            "userId": user_id, "role": stored_role,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({
            "success": True, "token": token,
            "user": {
                "fullName": user.get("FullName") or user.get("Full Name") or "",
                "userId": user_id, "role": stored_role,
                "mobile": user.get("Mobile") or user.get("mobile") or "",
                "email": user.get("Email") or user.get("email") or "",
                "address": user.get("Address") or user.get("address") or "",
                "city": user.get("City") or user.get("city") or "",
                "district": user.get("District") or user.get("district") or "",
                "state": user.get("State") or user.get("state") or "",
            }
        })
    except Exception as e:
        logging.error(f"Login error: {e}")
        return jsonify({"success": False, "message": "Internal server error"})

@app.route("/update-profile", methods=["POST"])
def update_profile():
    try:
        data = request.json
        user_id = data.get("userId", "").strip()
        sheet = get_sheet()
        records = sheet.get_all_records()
        for i, row in enumerate(records):
            uid = (row.get("UserID") or row.get("User ID") or row.get("userid") or "")
            if str(uid).strip() == user_id:
                row_num = i + 2
                sheet.update_cell(row_num, 1, data.get("fullName", ""))
                sheet.update_cell(row_num, 4, data.get("mobile", ""))
                sheet.update_cell(row_num, 5, data.get("email", ""))
                sheet.update_cell(row_num, 6, data.get("address", ""))
                sheet.update_cell(row_num, 7, data.get("city", ""))
                sheet.update_cell(row_num, 8, data.get("district", ""))
                sheet.update_cell(row_num, 9, data.get("state", ""))
                return jsonify({"success": True, "message": "Profile updated"})
        return jsonify({"success": False, "message": "User not found"})
    except Exception as e:
        logging.error(f"Update profile error: {e}")
        return jsonify({"success": False, "message": "Internal server error"})

@app.route("/save-prediction", methods=["POST"])
def save_prediction():
    try:
        data = request.json
        user_id = data.get("userId", "").strip()
        sheet = get_history_sheet()
        now = datetime.datetime.now()
        sheet.append_row([
            user_id,
            now.strftime("%Y-%m-%d"),
            now.strftime("%H:%M:%S"),
            data.get("diabetesRisk", ""),
            data.get("diabetesPercent", ""),
            data.get("heartRisk", ""),
            data.get("heartPercent", ""),
            data.get("kidneyRisk", ""),
            data.get("kidneyPercent", ""),
            data.get("healthScore", ""),
        ])
        return jsonify({"success": True, "message": "Prediction saved"})
    except Exception as e:
        logging.error(f"Save prediction error: {e}")
        return jsonify({"success": False, "message": str(e)})

@app.route("/test-history", methods=["GET"])
def test_history():
    try:
        sheet = get_history_sheet()
        sheet.append_row(["TestUser", "2026-04-06", "10:00:00",
                          "High", 80, "Moderate", 55, "Low", 25, 75])
        return jsonify({"success": True, "message": "Test row added!"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    try:
        diabetes_model, heart_model, kidney_model = load_models()

        age = float(data.get("age", 50))
        gender = 1 if str(data.get("gender", "")).lower() == "male" else 0
        bmi = float(data.get("bmi", 25))
        glucose = float(data.get("glucoseLevel", 100))
        smoking = 1 if str(data.get("smokingStatus", "")).lower() == "current" else 0
        cholesterol = float(data.get("cholesterol", 200))
        creatinine = float(data.get("creatinine", 1.0))
        bloodPressure = float(data.get("bloodPressure", 120))
        familyHistory = 1 if str(data.get("familyHistory", "")).lower() == "yes" else 0
        physicalActivity = 1 if str(data.get("physicalActivity", "")).lower() in ["high", "moderate"] else 0
        alcohol = 1 if str(data.get("alcoholConsumption", "")).lower() in ["regular", "occasional"] else 0

        def get_hba1c(glucose_value):
            if glucose_value > 200:
                return 10.5
            if glucose_value > 140:
                return 8.5
            if glucose_value > 100:
                return 6.5
            return 5.5

        def map_smoking(status):
            status = str(status).strip().lower()
            if status == "current":
                return 2
            if status in ["former", "ever", "not current"]:
                return 1
            return 0

        diabetes_input = np.array([[
            age,
            gender,
            bmi,
            glucose,
            get_hba1c(glucose),
            1 if bloodPressure > 140 else 0,
            0,
            map_smoking(smoking)
        ]])
        diabetes_prob = diabetes_model.predict_proba(diabetes_input)[0][1]
        if glucose > 200: diabetes_prob = max(diabetes_prob, 0.80)
        elif glucose > 140: diabetes_prob = max(diabetes_prob, 0.60)
        elif glucose < 100: diabetes_prob = min(diabetes_prob, 0.25)

        heart_input = np.array([[bmi, smoking, alcohol, 3.0, 3.0,
            1 if bloodPressure > 140 else 0, gender, physicalActivity, 7.0,
            1 if glucose > 126 else 0, 0]])
        heart_prob = heart_model.predict_proba(heart_input)[0][1]
        if cholesterol > 280: heart_prob = max(heart_prob, 0.75)
        elif cholesterol > 240: heart_prob = max(heart_prob, 0.55)
        elif cholesterol < 180: heart_prob = min(heart_prob, 0.20)

        kidney_input = np.array([[age, gender, bmi, smoking, alcohol,
            physicalActivity, bloodPressure, bloodPressure - 40, glucose,
            6.0 if glucose > 126 else 5.0, creatinine, 15.0,
            90.0 if creatinine < 1.2 else 60.0, cholesterol,
            familyHistory, 1 if glucose > 126 else 0]])
        kidney_prob = kidney_model.predict_proba(kidney_input)[0][1]
        if creatinine > 2.0: kidney_prob = max(kidney_prob, 0.80)
        elif creatinine > 1.5: kidney_prob = max(kidney_prob, 0.60)
        elif creatinine < 1.0: kidney_prob = min(kidney_prob, 0.25)

        def get_risk_level(prob):
            if prob >= 0.60: return "High"
            elif prob >= 0.35: return "Moderate"
            else: return "Low"

        avg_prob = (diabetes_prob + heart_prob + kidney_prob) / 3
        health_score = round((1 - avg_prob) * 100)

        recommendations = []
        if get_risk_level(diabetes_prob) in ["High", "Moderate"]:
            recommendations.append("Consult an Endocrinologist for diabetes management.")
            recommendations.append("Reduce sugar and refined carbohydrate intake.")
        if get_risk_level(heart_prob) in ["High", "Moderate"]:
            recommendations.append("Consult a Cardiologist for heart disease risk.")
            recommendations.append("Follow a low-cholesterol heart-healthy diet.")
        if get_risk_level(kidney_prob) in ["High", "Moderate"]:
            recommendations.append("Consult a Nephrologist for kidney health.")
            recommendations.append("Stay well hydrated and reduce sodium intake.")
        if not recommendations:
            recommendations.append("Your health looks great! Keep maintaining a healthy lifestyle.")
            recommendations.append("Continue regular exercise and balanced diet.")

        return jsonify({
            "success": True,
            "diabetes": {"probability": round(diabetes_prob * 100, 1), "risk": get_risk_level(diabetes_prob)},
            "heart": {"probability": round(heart_prob * 100, 1), "risk": get_risk_level(heart_prob)},
            "kidney": {"probability": round(kidney_prob * 100, 1), "risk": get_risk_level(kidney_prob)},
            "healthScore": health_score,
            "overallRisk": get_risk_level(avg_prob),
            "recommendations": recommendations
        })
    except Exception as e:
        logging.error(f"Prediction error: {e}")
        return jsonify({"success": False, "message": str(e)})

@app.route("/", methods=["GET"])
def home():
    return jsonify({"success": True, "message": "SmartArogya backend is running"})

@app.route("/favicon.ico")
def favicon():
    return "", 204

if __name__ == "__main__":
    app.run(debug=True, port=5000)