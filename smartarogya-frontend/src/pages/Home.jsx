import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: "🧠", title: "AI Disease Prediction", desc: "Predicts Diabetes, Heart & Kidney Disease using trained ML models with real medical datasets." },
  { icon: "🎙️", title: "Voice AI Agent", desc: "Multilingual voice-based health data collection in English, Hindi and Gujarati." },
  { icon: "🌐", title: "Multilingual Support", desc: "Full support for English, Hindi and Gujarati across all pages and interactions." },
  { icon: "📊", title: "Hospital Analytics", desc: "Real-time analytics dashboard with charts for hospital management decisions." },
  { icon: "🔒", title: "Secure Login", desc: "Role-based authentication with Captcha verification for patients and hospitals." },
  { icon: "📱", title: "Mobile Responsive", desc: "Fully responsive design works perfectly on mobile, tablet and desktop." },
];

const steps = [
  { step: "01", title: "Register", desc: "Create your patient account securely" },
  { step: "02", title: "Enter Health Data", desc: "Manual form or AI voice agent" },
  { step: "03", title: "Get Prediction", desc: "ML models analyze your health data" },
  { step: "04", title: "View Results", desc: "Risk levels and recommendations" },
];

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-linear-to-br from-blue-700 via-blue-600 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            AI-Powered Healthcare System
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            {t.appName}
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t.tagline} — Predicts Diabetes, Heart Disease & Kidney Disease using Real ML Models
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition text-lg"
            >
              Get Started Free →
            </button>
            <button
              onClick={() => navigate("/login")}
              className="border-2 border-white/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition text-lg"
            >
              {t.login}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-14 max-w-lg mx-auto">
            {[
              { value: "3", label: "Diseases Detected" },
              { value: "93%", label: "Model Accuracy" },
              { value: "3", label: "Languages" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="text-blue-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">How It Works</h2>
        <p className="text-center text-gray-500 mb-10">Get your health risk assessment in 4 simple steps</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:border-blue-200 transition">
              <div className="text-4xl font-bold text-blue-100 mb-3">{s.step}</div>
              <h3 className="font-bold text-gray-800 mb-1">{s.title}</h3>
              <p className="text-gray-500 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Key Features</h2>
          <p className="text-center text-gray-500 mb-10">Everything you need for smart healthcare</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition cursor-default"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-linear-to-r from-blue-600 to-blue-800 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to Check Your Health?</h2>
          <p className="text-blue-100 mb-6">Register now and get your AI-powered health risk assessment in minutes.</p>
          <button
            onClick={() => navigate("/register")}
            className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition"
          >
            Register for Free →
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 text-center py-6 text-gray-400 text-sm">
        © 2026 SmartArogya AI — AI-Driven Multi-Disease Risk Prediction System
      </footer>
    </div>
  );
};

export default Home;