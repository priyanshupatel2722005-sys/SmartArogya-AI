import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";

const requiredFields = [
  "age", "gender", "bloodPressure", "glucoseLevel",
  "cholesterol", "bmi", "heartRate", "creatinine", "smokingStatus"
];

const inputClass = (field, errors) =>
  `w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 bg-gray-50 text-sm text-gray-800 ${
    errors[field]
      ? "border-red-400 focus:ring-red-400 bg-red-50"
      : "border-gray-200 focus:ring-blue-400"
  }`;

// ✅ Field defined OUTSIDE component — stable identity across renders
const Field = ({ name, label, unit, placeholder, type = "number", form, errors, handleChange, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {unit && <span className="text-gray-400 text-xs ml-1">({unit})</span>}
      {requiredFields.includes(name) && <span className="text-red-500 ml-1">*</span>}
      {errors[name] && <span className="text-red-500 text-xs ml-2">Required</span>}
    </label>
    {children || (
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={inputClass(name, errors)}
      />
    )}
  </div>
);

const defaultForm = {
  age: "", gender: "", bloodPressure: "", glucoseLevel: "",
  cholesterol: "", bmi: "", heartRate: "", creatinine: "",
  smokingStatus: "", familyHistory: "", physicalActivity: "",
  alcoholConsumption: "", dietPattern: "", previousConditions: "",
};

const ManualInput = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // ✅ FIX 1 — restore form from sessionStorage if user navigated back
  // sessionStorage is browser-only and never touches Google Sheets
  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem("manualInputData");
      return saved ? JSON.parse(saved) : defaultForm;
    } catch {
      return defaultForm;
    }
  });

  const [errors, setErrors] = useState({});

  // ✅ FIX 2 — save to sessionStorage on every field change
  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    setErrors({ ...errors, [e.target.name]: false });
    sessionStorage.setItem("manualInputData", JSON.stringify(updated));
  };

  const handleSubmit = () => {
    const newErrors = {};
    let hasError = false;
    requiredFields.forEach((f) => {
      if (!form[f]) { newErrors[f] = true; hasError = true; }
    });
    setErrors(newErrors);
    if (hasError) return;

    // Save the data so the prediction page can consume it reliably.
    localStorage.setItem("patientData", JSON.stringify(form));
    sessionStorage.removeItem("manualInputData");

    navigate("/prediction-result", {
      state: { healthData: { ...form } }
    });
  };

  // ✅ Clear form manually (reset button)
  const handleReset = () => {
    setForm(defaultForm);
    setErrors({});
    sessionStorage.removeItem("manualInputData");
  };

  const selectClass = (field) =>
    `w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 bg-gray-50 text-sm text-gray-800 ${
      errors[field]
        ? "border-red-400 focus:ring-red-400 bg-red-50"
        : "border-gray-200 focus:ring-blue-400"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/patient-dashboard")}
            className="text-gray-500 text-sm hover:text-gray-700 mb-3 flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">📋 {t.manualInput}</h1>
              <p className="text-gray-500 text-sm mt-1">{t.manualInputDesc}</p>
            </div>
            {/* Reset button — only shown if form has any data */}
            {Object.values(form).some(v => v !== "") && (
              <button
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
              >
                🗑 Clear Form
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">

          {/* Section 1 — Main Inputs */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">1</div>
            <h2 className="font-bold text-gray-800">Main Health Inputs</h2>
            <span className="text-red-500 text-xs">* Required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <Field
              name="age" label="Age" placeholder="e.g. 45"
              form={form} errors={errors} handleChange={handleChange}
            />
            <Field name="gender" label="Gender" form={form} errors={errors} handleChange={handleChange}>
              <select name="gender" value={form.gender} onChange={handleChange} className={selectClass("gender")}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field
              name="bloodPressure" label="Blood Pressure" unit="mmHg" placeholder="e.g. 120"
              form={form} errors={errors} handleChange={handleChange}
            />
            <Field
              name="glucoseLevel" label="Glucose Level" unit="mg/dL" placeholder="e.g. 100"
              form={form} errors={errors} handleChange={handleChange}
            />
            <Field
              name="cholesterol" label="Cholesterol" unit="mg/dL" placeholder="e.g. 200"
              form={form} errors={errors} handleChange={handleChange}
            />
            <Field
              name="bmi" label="BMI" unit="kg/m²" placeholder="e.g. 24.5"
              form={form} errors={errors} handleChange={handleChange}
            />
            <Field
              name="heartRate" label="Heart Rate" unit="bpm" placeholder="e.g. 72"
              form={form} errors={errors} handleChange={handleChange}
            />
            <Field
              name="creatinine" label="Creatinine" unit="mg/dL" placeholder="e.g. 1.0"
              form={form} errors={errors} handleChange={handleChange}
            />
            <Field name="smokingStatus" label="Smoking Status" form={form} errors={errors} handleChange={handleChange}>
              <select name="smokingStatus" value={form.smokingStatus} onChange={handleChange} className={selectClass("smokingStatus")}>
                <option value="">Select Status</option>
                <option value="never">Never Smoked</option>
                <option value="former">Former Smoker</option>
                <option value="current">Current Smoker</option>
              </select>
            </Field>
          </div>

          {/* Section 2 — Additional Inputs */}
          <div className="flex items-center gap-3 mb-5 pt-4 border-t border-gray-100">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 text-sm font-bold">2</div>
            <h2 className="font-bold text-gray-800">Additional Inputs</h2>
            <span className="text-gray-400 text-xs bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Family History</label>
              <select
                name="familyHistory" value={form.familyHistory} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-sm"
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Physical Activity</label>
              <select
                name="physicalActivity" value={form.physicalActivity} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-sm"
              >
                <option value="">Select</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Alcohol Consumption</label>
              <select
                name="alcoholConsumption" value={form.alcoholConsumption} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-sm"
              >
                <option value="">Select</option>
                <option value="none">None</option>
                <option value="occasional">Occasional</option>
                <option value="regular">Regular</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Diet Pattern</label>
              <select
                name="dietPattern" value={form.dietPattern} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-sm"
              >
                <option value="">Select</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="nonvegetarian">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Previous Medical Conditions</label>
              <input
                type="text" name="previousConditions" value={form.previousConditions}
                onChange={handleChange} placeholder="e.g. Hypertension, Asthma"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-sm"
              />
            </div>
          </div>

          {/* Validation error banner */}
          {Object.values(errors).some(Boolean) && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <span>⚠️</span> Please fill all required main health inputs before submitting.
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            🔍 {t.predict}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualInput;