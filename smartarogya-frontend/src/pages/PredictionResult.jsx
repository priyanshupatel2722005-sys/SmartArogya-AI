import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import { jsPDF } from "jspdf";
import { API_BASE } from "../api";

const RiskBar = ({ label, percent, level }) => {
  const colorMap = { Low: "bg-green-500", Moderate: "bg-yellow-400", High: "bg-red-500" };
  const textMap  = { Low: "text-green-600", Moderate: "text-yellow-600", High: "text-red-600" };
  const bgMap    = { Low: "bg-green-50",    Moderate: "bg-yellow-50",   High: "bg-red-50" };
  const bdMap    = { Low: "border-green-200", Moderate: "border-yellow-200", High: "border-red-200" };
  return (
    <div className={`${bgMap[level]} border ${bdMap[level]} rounded-xl p-4 mb-3`}>
      <div className="flex justify-between mb-2">
        <span className="font-semibold text-gray-700 text-sm">{label}</span>
        <span className={`font-bold text-sm ${textMap[level]}`}>{level} ({percent}%)</span>
      </div>
      <div className="w-full bg-white rounded-full h-3">
        <div
          className={`${colorMap[level]} h-3 rounded-full transition-all duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

/* ─── PDF HELPERS ─────────────────────────────────────────── */
const h2r = h => [
  parseInt(h.slice(1,3),16),
  parseInt(h.slice(3,5),16),
  parseInt(h.slice(5,7),16),
];
const sf  = (doc,h) => { const [r,g,b]=h2r(h); doc.setFillColor(r,g,b); };
const st  = (doc,h) => { const [r,g,b]=h2r(h); doc.setTextColor(r,g,b); };
const sd  = (doc,h) => { const [r,g,b]=h2r(h); doc.setDrawColor(r,g,b); };

const rc  = r => r==="High" ? "#dc2626" : r==="Moderate" ? "#d97706" : "#16a34a";
const rbg = r => r==="High" ? "#fef2f2" : r==="Moderate" ? "#fffbeb" : "#f0fdf4";
const rbd = r => r==="High" ? "#fecaca" : r==="Moderate" ? "#fde68a" : "#bbf7d0";

const wrapText = (doc, text, maxWidth) =>
  doc.splitTextToSize(String(text || "N/A"), maxWidth);

const checkPage = (doc, y, needed, H, margin=40) => {
  if (y + needed > H - margin) { doc.addPage(); return 48; }
  return y;
};

const PredictionResult = () => {
  const { t }        = useLanguage();
  const navigate     = useNavigate();
  const location     = useLocation();
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState("");
  const [downloading, setDl]    = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const pdfUrlRef = useRef(null);

  const routeData  = location.state?.healthData;
  let storedData   = null;
  try { storedData = JSON.parse(localStorage.getItem("patientData")); } catch {}
  const data = routeData || storedData;

  useEffect(() => {
    setLoading(true); setError(""); setResult(null);
    const run = async () => {
      if (!data || !Object.keys(data).length) {
        setError("No patient data. Please enter health information.");
        return setLoading(false);
      }
      localStorage.setItem("patientData", JSON.stringify(data));
      try {
        const res  = await fetch(`${API_BASE}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (json.success) {
          setResult(json);
          const u = JSON.parse(localStorage.getItem("user") || "{}");
          fetch(`${API_BASE}/save-prediction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId:          u.userId || "guest",
              diabetesRisk:    json.diabetes.risk,
              diabetesPercent: json.diabetes.probability,
              heartRisk:       json.heart.risk,
              heartPercent:    json.heart.probability,
              kidneyRisk:      json.kidney.risk,
              kidneyPercent:   json.kidney.probability,
              healthScore:     json.healthScore,
            }),
          }).catch(() => {});
        } else setError(json.message || "Prediction failed.");
      } catch {
        setError("Cannot connect to server. Please try again.");
      }
      setLoading(false);
    };
    run();
  }, [data, routeData, location.key]);

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
      }
    };
  }, []);

  const setPreviewUrl = url => {
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
    }
    pdfUrlRef.current = url;
    setPdfPreviewUrl(url);
  };

  const buildPdfDocument = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W   = doc.internal.pageSize.getWidth();
    const H   = doc.internal.pageSize.getHeight();
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });
    const timeStr = now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
    const sc  = result.healthScore >= 70 ? "#16a34a"
              : result.healthScore >= 40 ? "#d97706" : "#dc2626";
    const scoreLabel = result.healthScore >= 70 ? "GOOD HEALTH"
                     : result.healthScore >= 40 ? "FAIR HEALTH" : "POOR HEALTH";
    const M = 36;
    const IW = W - M * 2;

    sf(doc, "#0f172a"); doc.rect(0, 0, W, 132, "F");
    sf(doc, "#1e40af"); doc.circle(W + 10, -20, 90, "F");
    sf(doc, "#2563eb"); doc.circle(W - 70,  28, 46, "F");
    sf(doc, "#3b82f6");
    doc.roundedRect(M, 22, 36, 36, 6, 6, "F");
    st(doc, "#ffffff");
    doc.setFont("helvetica","bold"); doc.setFontSize(20);
    doc.text("S", M + 18, 47, { align: "center" });

    doc.setFontSize(13); doc.setFont("helvetica","bold");
    doc.text("SmartArogya AI", M + 46, 35);
    st(doc, "#94a3b8"); doc.setFontSize(7); doc.setFont("helvetica","normal");
    doc.text("HEALTH ANALYTICS PLATFORM", M + 46, 47);

    sf(doc, "#1e293b");
    doc.roundedRect(W - M - 120, 18, 120, 52, 7, 7, "F");
    st(doc, "#64748b"); doc.setFontSize(6.5);
    doc.text("GENERATED ON", W - M - 60, 31, { align:"center" });
    st(doc, "#ffffff"); doc.setFontSize(9); doc.setFont("helvetica","bold");
    doc.text(dateStr, W - M - 60, 43, { align:"center" });
    doc.setFontSize(8); doc.setFont("helvetica","normal");
    doc.text(timeStr, W - M - 60, 55, { align:"center" });

    sf(doc, "#dc2626");
    doc.roundedRect(W - M - 120, 76, 120, 16, 4, 4, "F");
    st(doc, "#ffffff"); doc.setFontSize(6); doc.setFont("helvetica","bold");
    doc.text("CONFIDENTIAL MEDICAL RECORD", W - M - 60, 87, { align:"center" });

    st(doc, "#ffffff"); doc.setFontSize(20); doc.setFont("helvetica","bold");
    doc.text("Health Risk Prediction Report", M, 84);
    st(doc, "#94a3b8"); doc.setFontSize(9); doc.setFont("helvetica","normal");
    doc.text("AI-Powered Multi-Disease Risk Assessment", M, 100);

    // INCREASED SECTION HEIGHT FOR BETTER UI PADDING
    sf(doc, "#f8fafc"); doc.rect(0, 132, W, 115, "F"); 
    sd(doc, "#e2e8f0"); doc.setLineWidth(0.5);
    doc.line(0, 132, W, 132);
    doc.line(0, 247, W, 247); // Moved line down to accommodate text

    const [sr,sg,sb] = h2r(sc);
    doc.setDrawColor(sr,sg,sb); doc.setLineWidth(4.5);
    // Adjusted center slightly to improve vertical balance
    doc.circle(M + 42, 180, 34, "S"); 
    doc.setLineWidth(0.5);
    st(doc, sc); doc.setFontSize(24); doc.setFont("helvetica","bold");
    
    // SCORE INSIDE THE CIRCLE
    doc.text(String(result.healthScore), M + 42, 184, { align:"center" });
    st(doc, "#9ca3af"); doc.setFontSize(7); doc.setFont("helvetica","normal");
    doc.text("/100", M + 42, 194, { align:"center" });
    
    // LABEL SAFELY POSITIONED BELOW THE CIRCLE
    st(doc, sc); doc.setFontSize(8); doc.setFont("helvetica","bold");
    doc.text(scoreLabel, M + 42, 230, { align:"center" });

    sd(doc, "#e2e8f0"); doc.setLineWidth(1);
    doc.line(M + 92, 145, M + 92, 235); // Lengthened vertical separator line

    sf(doc, rbg(result.overallRisk));
    doc.roundedRect(M + 104, 148, 148, 18, 9, 9, "F");
    sd(doc, rbd(result.overallRisk)); doc.setLineWidth(0.5);
    doc.roundedRect(M + 104, 148, 148, 18, 9, 9, "S");
    st(doc, rc(result.overallRisk));
    doc.setFontSize(9); doc.setFont("helvetica","bold");
    doc.text("Overall Risk:  " + result.overallRisk, M + 178, 160, { align:"center" });

    st(doc, "#6b7280"); doc.setFontSize(8); doc.setFont("helvetica","normal");
    const descLines = wrapText(doc,
      "Health score from ML predictions across Diabetes, Heart & Kidney models.", 186);
    doc.text(descLines, M + 104, 178);

    const diseases = [
      { label:"Diabetes", prob:result.diabetes.probability, risk:result.diabetes.risk },
      { label:"Heart",    prob:result.heart.probability,    risk:result.heart.risk },
      { label:"Kidney",   prob:result.kidney.probability,   risk:result.kidney.risk },
    ];
    diseases.forEach((d, i) => {
      const py = 146 + i * 26;
      const pw = 112;
      const px = W - M - pw;
      sf(doc, rbg(d.risk));
      doc.roundedRect(px, py, pw, 20, 5, 5, "F");
      sd(doc, rbd(d.risk)); doc.setLineWidth(0.4);
      doc.roundedRect(px, py, pw, 20, 5, 5, "S");
      st(doc, "#374151"); doc.setFontSize(8); doc.setFont("helvetica","normal");
      doc.text(d.label, px + 9, py + 13);
      st(doc, rc(d.risk)); doc.setFont("helvetica","bold"); doc.setFontSize(9);
      doc.text(String(d.prob) + "%", px + pw - 9, py + 13, { align:"right" });
    });

    // START NEXT SECTION FURTHER DOWN
    let y = 265; 
    sf(doc, "#3b82f6"); doc.rect(M, y, 4, 18, "F");
    st(doc, "#0f172a"); doc.setFontSize(13); doc.setFont("helvetica","bold");
    doc.text("Disease Risk Prediction", M + 10, y + 13);
    y += 26;

    diseases.forEach(d => {
      y = checkPage(doc, y, 68, H);
      const cardH = 62;
      sf(doc, rbg(d.risk));
      doc.roundedRect(M, y, IW, cardH, 8, 8, "F");
      sd(doc, rbd(d.risk)); doc.setLineWidth(0.8);
      doc.roundedRect(M, y, IW, cardH, 8, 8, "S");
      sf(doc, "#ffffff");
      doc.roundedRect(M + 12, y + 12, 26, 26, 5, 5, "F");
      sd(doc, rbd(d.risk)); doc.setLineWidth(0.5);
      doc.roundedRect(M + 12, y + 12, 26, 26, 5, 5, "S");
      st(doc, rc(d.risk)); doc.setFontSize(13); doc.setFont("helvetica","bold");
      doc.text(d.label[0], M + 25, y + 30, { align:"center" });
      st(doc, "#1f2937"); doc.setFontSize(10); doc.setFont("helvetica","bold");
      doc.text(d.label + " Risk", M + 48, y + 22);
      const sub = d.risk === "High"     ? "Immediate attention needed"
                : d.risk === "Moderate" ? "Preventive measures advised"
                :                         "Continue healthy habits";
      st(doc, "#9ca3af"); doc.setFontSize(7.5); doc.setFont("helvetica","normal");
      doc.text(sub, M + 48, y + 33);
      st(doc, rc(d.risk)); doc.setFontSize(20); doc.setFont("helvetica","bold");
      doc.text(String(d.prob) + "%", W - M - 52, y + 26, { align:"right" });
      sf(doc, "#ffffff");
      doc.roundedRect(W - M - 50, y + 30, 42, 13, 6, 6, "F");
      sd(doc, rbd(d.risk)); doc.setLineWidth(0.4);
      doc.roundedRect(W - M - 50, y + 30, 42, 13, 6, 6, "S");
      st(doc, rc(d.risk)); doc.setFontSize(8); doc.setFont("helvetica","bold");
      doc.text(d.risk, W - M - 29, y + 39, { align:"center" });
      const barX = M + 48;
      const barW = W - M - 110 - barX;
      sf(doc, "#ffffff");
      doc.roundedRect(barX, y + 45, barW, 6, 3, 3, "F");
      const fillW = Math.max((d.prob / 100) * barW, 6);
      sf(doc, rc(d.risk));
      doc.roundedRect(barX, y + 45, fillW, 6, 3, 3, "F");
      st(doc, "#9ca3af"); doc.setFontSize(6.5); doc.setFont("helvetica","normal");
      doc.text("0%",   barX, y + 59);
      doc.text("100%", barX + barW, y + 59, { align:"right" });
      y += 72;
    });

    y += 6;
    y = checkPage(doc, y, 160, H);
    sf(doc, "#3b82f6"); doc.rect(M, y, 4, 18, "F");
    st(doc, "#0f172a"); doc.setFontSize(13); doc.setFont("helvetica","bold");
    doc.text("Health Data Summary", M + 10, y + 13);
    y += 26;

    const items = [
      { l:"AGE",            v: String(data.age            || "N/A") },
      { l:"GENDER",         v: String(data.gender         || "N/A") },
      { l:"BLOOD PRESSURE", v:(data.bloodPressure         || "N/A") + " mmHg" },
      { l:"GLUCOSE",        v:(data.glucoseLevel          || "N/A") + " mg/dL" },
      { l:"CHOLESTEROL",    v:(data.cholesterol           || "N/A") + " mg/dL" },
      { l:"BMI",            v: String(data.bmi            || "N/A") },
      { l:"HEART RATE",     v:(data.heartRate             || "N/A") + " bpm" },
      { l:"CREATININE",     v:(data.creatinine            || "N/A") + " mg/dL" },
      { l:"SMOKING",        v: String(data.smokingStatus  || "N/A") },
      { l:"FAMILY HISTORY", v: String(data.familyHistory  || "N/A") },
      { l:"ACTIVITY",       v: String(data.physicalActivity || "N/A") },
      { l:"DIET",           v: String(data.dietPattern    || "N/A") },
    ];

    const cols  = 4;
    const cw    = IW / cols;
    const cellH = 40;
    const rows  = Math.ceil(items.length / cols);

    y = checkPage(doc, y, rows * (cellH + 6), H);

    items.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx  = M + col * cw;
      const cy  = y + row * (cellH + 6);

      sf(doc, "#f8fafc");
      doc.roundedRect(cx, cy, cw - 5, cellH, 6, 6, "F");
      sd(doc, "#e2e8f0"); doc.setLineWidth(0.5);
      doc.roundedRect(cx, cy, cw - 5, cellH, 6, 6, "S");

      st(doc, "#9ca3af"); doc.setFontSize(6.5); doc.setFont("helvetica","normal");
      doc.text(item.l, cx + (cw-5)/2, cy + 12, { align:"center" });

      const maxValW = cw - 14;
      const val     = wrapText(doc, item.v, maxValW)[0] || "";
      st(doc, "#1f2937"); doc.setFontSize(9); doc.setFont("helvetica","bold");
      doc.text(val, cx + (cw-5)/2, cy + 27, { align:"center" });
    });

    y += rows * (cellH + 6) + 10;

    if (result.recommendations && result.recommendations.length > 0) {
      y = checkPage(doc, y, 50, H);
      sf(doc, "#3b82f6"); doc.rect(M, y, 4, 18, "F");
      st(doc, "#0f172a"); doc.setFontSize(13); doc.setFont("helvetica","bold");
      doc.text("Personalised Recommendations", M + 10, y + 13);
      y += 26;

      const colW   = (IW - 8) / 2;
      const minH   = 46;
      const lineH  = 11;
      const maxW   = colW - 36;

      result.recommendations.forEach((rec, i) => {
        const col   = i % 2;
        const rx    = M + col * (colW + 8);
        const lines = wrapText(doc, rec, maxW).slice(0, 4);
        const cardH = Math.max(minH, 20 + lines.length * lineH);

        if (col === 0 && i > 0) y += cardH + 8;
        y = checkPage(doc, y, cardH + 8, H);

        sf(doc, "#eff6ff");
        doc.roundedRect(rx, y, colW, cardH, 6, 6, "F");
        sd(doc, "#bfdbfe"); doc.setLineWidth(0.5);
        doc.roundedRect(rx, y, colW, cardH, 6, 6, "S");

        sf(doc, "#3b82f6");
        doc.circle(rx + 16, y + 14, 8, "F");
        st(doc, "#ffffff"); doc.setFontSize(7.5); doc.setFont("helvetica","bold");
        doc.text(String(i + 1), rx + 16, y + 17, { align:"center" });

        st(doc, "#1e40af"); doc.setFontSize(8); doc.setFont("helvetica","normal");
        doc.text(lines, rx + 30, y + 12);
      });

      const lastLines = wrapText(doc,
        result.recommendations[result.recommendations.length - 1], maxW).slice(0,4);
      const lastH = Math.max(minH, 20 + lastLines.length * lineH);
      y += lastH + 14;
    }

    y = checkPage(doc, y, 72, H);
    sf(doc, "#0f172a");
    doc.roundedRect(M, y, IW, 62, 10, 10, "F");

    st(doc, "#ffffff"); doc.setFontSize(10); doc.setFont("helvetica","bold");
    doc.text("Powered by Random Forest ML Models", M + 16, y + 18);
    st(doc, "#94a3b8"); doc.setFontSize(8); doc.setFont("helvetica","normal");
    doc.text(
      "Accuracy:  Diabetes 91.57%  |  Heart 71.98%  |  Kidney 70.37%",
      M + 16, y + 32
    );
    st(doc, "#64748b"); doc.setFontSize(7);
    doc.text(
      "For informational purposes only. Consult a licensed physician for medical advice.",
      M + 16, y + 46
    );

    st(doc, "#3b82f6"); doc.setFontSize(11); doc.setFont("helvetica","bold");
    doc.text("SmartArogya AI", W - M - 16, y + 22, { align:"right" });
    st(doc, "#64748b"); doc.setFontSize(8); doc.setFont("helvetica","normal");
    doc.text("Health Analytics", W - M - 16, y + 36, { align:"right" });

    const pc = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pc; i++) {
      doc.setPage(i);
      st(doc, "#9ca3af"); doc.setFontSize(7); doc.setFont("helvetica","normal");
      doc.text(`Page ${i} of ${pc}`, W / 2, H - 16, { align:"center" });
    }

    return doc;
  };

  const downloadReport = () => {
    if (!result || !data) return;
    setDl(true);
    const doc = buildPdfDocument();
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    doc.save(`SmartArogya_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    setDl(false);
  };

  const previewReport = () => {
    if (!result || !data) return;
    setDl(true);
    const doc = buildPdfDocument();
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setDl(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate("/manual-input")}
            className="text-gray-500 text-sm hover:text-gray-700 mb-3 flex items-center gap-1"
          >
            &larr; Re-enter Data
          </button>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                &#128269; {t.result || "Prediction Result"}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                AI-powered disease risk predictions based on your health data
              </p>
            </div>
            {result && !loading && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={previewReport}
                  disabled={downloading}
                  className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-150 text-gray-800 px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm"
                >
                  {downloading ? "Preparing..." : "Preview PDF"}
                </button>
                <button
                  onClick={downloadReport}
                  disabled={downloading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm"
                >
                  {downloading ? "Generating..." : "Download PDF"}
                </button>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="text-5xl mb-4 animate-pulse">&#129504;</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Analyzing your health data...
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              ML models are processing your inputs
            </p>
            <div className="flex justify-center gap-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce delay-100" />
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-semibold mb-3">&#10060; {error}</p>
            <button
              onClick={() => navigate("/manual-input")}
              className="bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-5">

            <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-7 text-center">
              <p className="text-blue-200 text-sm mb-1">Overall Health Score</p>
              <div className={`text-7xl font-bold mb-2 ${
                result.healthScore >= 70 ? "text-green-400"
                : result.healthScore >= 40 ? "text-yellow-400"
                : "text-red-400"
              }`}>
                {result.healthScore}%
              </div>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
                <span className="text-sm">Overall Risk:</span>
                <span className="font-bold">{result.overallRisk}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4">Disease Risk Prediction</h2>
              <RiskBar label="Diabetes Risk"
                percent={result.diabetes.probability} level={result.diabetes.risk} />
              <RiskBar label="Heart Disease Risk"
                percent={result.heart.probability}    level={result.heart.risk} />
              <RiskBar label="Kidney Disease Risk"
                percent={result.kidney.probability}   level={result.kidney.risk} />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4">
                {t.recommendation || "Health Recommendations"}
              </h2>
              <div className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <div key={i}
                    className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-gray-700 text-sm leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4">Your Health Summary</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {[
                  { label:"Age",            value: data.age },
                  { label:"Gender",         value: data.gender },
                  { label:"Blood Pressure", value: `${data.bloodPressure} mmHg` },
                  { label:"Glucose",        value: `${data.glucoseLevel} mg/dL` },
                  { label:"Cholesterol",    value: `${data.cholesterol} mg/dL` },
                  { label:"BMI",            value: data.bmi },
                  { label:"Heart Rate",     value: `${data.heartRate} bpm` },
                  { label:"Creatinine",     value: `${data.creatinine} mg/dL` },
                ].map((item, i) => (
                  <div key={i}
                    className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className="font-semibold text-gray-800 text-sm capitalize">
                      {item.value || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
              <p className="text-blue-600 text-xs font-medium">
                Powered by Random Forest ML Models &nbsp;|&nbsp;
                Accuracy: Diabetes 91.57% · Heart 71.98% · Kidney 70.37%
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/manual-input")}
                className="border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition text-sm"
              >
                Re-enter Data
              </button>
              <button
                onClick={downloadReport}
                disabled={downloading}
                className="bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:bg-green-400 transition text-sm"
              >
                {downloading ? "Generating..." : "Download PDF Report"}
              </button>
              <button
                onClick={() => navigate("/patient-dashboard")}
                className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-sm"
              >
                Back to Dashboard
              </button>
            </div>

            {pdfPreviewUrl && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">PDF Preview</h2>
                <div className="rounded-2xl border border-gray-200 overflow-hidden">
                  <iframe
                    src={pdfPreviewUrl}
                    title="PDF Preview"
                    className="w-full min-h-162.5"
                    style={{ border: "none", height: "800px" }}
                  />
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionResult;