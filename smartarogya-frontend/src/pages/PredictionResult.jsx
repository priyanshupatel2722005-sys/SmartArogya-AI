import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import { jsPDF } from "jspdf";

const RiskBar = ({ label, percent, level }) => {
  const colorMap = { Low: "bg-green-500", Moderate: "bg-yellow-400", High: "bg-red-500" };
  const textMap = { Low: "text-green-600", Moderate: "text-yellow-600", High: "text-red-600" };
  const bgMap = { Low: "bg-green-50", Moderate: "bg-yellow-50", High: "bg-red-50" };
  const borderMap = { Low: "border-green-200", Moderate: "border-yellow-200", High: "border-red-200" };

  return (
    <div className={`${bgMap[level]} border ${borderMap[level]} rounded-xl p-4 mb-3`}>
      <div className="flex justify-between mb-2">
        <span className="font-semibold text-gray-700 text-sm">{label}</span>
        <span className={`font-bold text-sm ${textMap[level]}`}>{level} ({percent}%)</span>
      </div>
      <div className="w-full bg-white rounded-full h-3">
        <div className={`${colorMap[level]} h-3 rounded-full transition-all duration-700`}
          style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

const PredictionResult = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const routeData = location.state?.healthData;
  const raw = localStorage.getItem("patientData");
  let storedData = null;
  try {
    storedData = raw ? JSON.parse(raw) : null;
  } catch {
    storedData = null;
  }
  const data = routeData || storedData;

  useEffect(() => {
    setLoading(true);
    setError("");
    setResult(null);

    const fetchPrediction = async () => {
      if (!data || Object.keys(data).length === 0) {
        setError("No patient data available. Please enter your health information.");
        setLoading(false);
        return;
      }

      if (data) {
        localStorage.setItem("patientData", JSON.stringify(data));
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (result.success) {
          setResult(result);
          const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
          try {
            await fetch("http://127.0.0.1:5000/save-prediction", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: savedUser.userId || "guest",
                diabetesRisk: result.diabetes.risk,
                diabetesPercent: result.diabetes.probability,
                heartRisk: result.heart.risk,
                heartPercent: result.heart.probability,
                kidneyRisk: result.kidney.risk,
                kidneyPercent: result.kidney.probability,
                healthScore: result.healthScore,
              }),
            });
          } catch { console.error("Could not save history"); }
        } else { setError(result.message || "Prediction failed."); }
      } catch { setError("Cannot connect to server. Please try again."); }
      setLoading(false);
    };
    fetchPrediction();
  }, [data, routeData, location.key]);

  const downloadReport = () => {
    if (!result || !data) return;

    const createdAt = new Date().toLocaleString();
    const reportLines = [
      "SmartArogya AI - Prediction Result Report",
      `Generated On : ${createdAt}`,
      "",
      "Patient Health Summary:",
      `Age           : ${data.age || "N/A"}`,
      `Gender        : ${data.gender || "N/A"}`,
      `Blood Pressure: ${data.bloodPressure || "N/A"} mmHg`,
      `Glucose Level : ${data.glucoseLevel || "N/A"} mg/dL`,
      `Cholesterol   : ${data.cholesterol || "N/A"} mg/dL`,
      `BMI           : ${data.bmi || "N/A"}`,
      `Heart Rate    : ${data.heartRate || "N/A"} bpm`,
      `Creatinine    : ${data.creatinine || "N/A"} mg/dL`,
      "",
      "AI Prediction Summary:",
      `Overall Health Score : ${result.healthScore}%`,
      `Overall Risk Level   : ${result.overallRisk}`,
      "",
      "Disease Risk Details:",
      `Diabetes Risk : ${result.diabetes.risk} (${result.diabetes.probability}%)`,
      `Heart Risk    : ${result.heart.risk} (${result.heart.probability}%)`,
      `Kidney Risk   : ${result.kidney.risk} (${result.kidney.probability}%)`,
      "",
      "Recommendations:",
      ...result.recommendations.map((rec, index) => `${index + 1}. ${rec}`),
      "",
      "Thank you for using SmartArogya AI.",
      "For personalized guidance, please consult your healthcare professional.",
    ];

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("SmartArogya AI - Prediction Result Report", 40, 50);
    doc.setFontSize(10);

    let y = 75;
    reportLines.slice(1).forEach((line) => {
      if (line === "") {
        y += 12;
      } else {
        const splitLines = doc.splitTextToSize(line, 500);
        doc.text(splitLines, 40, y);
        y += splitLines.length * 12;
      }

      if (y > 760) {
        doc.addPage();
        y = 40;
      }
    });

    const filename = `SmartArogya_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button onClick={() => navigate("/manual-input")}
            className="text-gray-500 text-sm hover:text-gray-700 mb-3 flex items-center gap-1">← Re-enter Data</button>
          <h1 className="text-2xl font-bold text-gray-800">🔍 {t.result}</h1>
          <p className="text-gray-500 text-sm mt-1">AI-powered disease risk predictions based on your health data</p>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="text-5xl mb-4 animate-pulse">🤖</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Analyzing your health data...</h2>
            <p className="text-gray-500 text-sm mb-6">ML models are processing your inputs</p>
            <div className="flex justify-center gap-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce delay-100" />
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-semibold mb-3">❌ {error}</p>
            <button onClick={() => navigate("/manual-input")}
              className="bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition text-sm">Try Again</button>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-5">
            <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-7 text-center">
              <p className="text-blue-200 text-sm mb-1">Overall Health Score</p>
              <div className={`text-7xl font-bold mb-2 ${result.healthScore >= 70 ? "text-green-400" : result.healthScore >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                {result.healthScore}%
              </div>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
                <span className="text-sm">Overall Risk:</span>
                <span className="font-bold">{result.overallRisk}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4">📊 Disease Risk Prediction</h2>
              <RiskBar label="🩸 Diabetes Risk" percent={result.diabetes.probability} level={result.diabetes.risk} />
              <RiskBar label="❤️ Heart Disease Risk" percent={result.heart.probability} level={result.heart.risk} />
              <RiskBar label="🫘 Kidney Disease Risk" percent={result.kidney.probability} level={result.kidney.risk} />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4">💡 {t.recommendation}</h2>
              <div className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <span className="text-lg">{i % 3 === 0 ? "🩺" : i % 3 === 1 ? "🥗" : "💊"}</span>
                    <p className="text-gray-700 text-sm leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4">📋 Your Health Summary</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {[
                  { label: "Age", value: data.age },
                  { label: "Gender", value: data.gender },
                  { label: "Blood Pressure", value: `${data.bloodPressure} mmHg` },
                  { label: "Glucose", value: `${data.glucoseLevel} mg/dL` },
                  { label: "Cholesterol", value: `${data.cholesterol} mg/dL` },
                  { label: "BMI", value: data.bmi },
                  { label: "Heart Rate", value: `${data.heartRate} bpm` },
                  { label: "Creatinine", value: `${data.creatinine} mg/dL` },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className="font-semibold text-gray-800 text-sm capitalize">{item.value || "N/A"}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
              <p className="text-blue-600 text-xs font-medium">
                🤖 Powered by SmartArogya AI
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button onClick={() => navigate("/manual-input")}
                className="border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition text-sm">
                🔄 Re-enter Data
              </button>
              <button onClick={downloadReport}
                className="bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition text-sm">
                📥 Download Report
              </button>
              <button onClick={() => navigate("/patient-dashboard")}
                className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-sm">
                🏠 Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionResult;