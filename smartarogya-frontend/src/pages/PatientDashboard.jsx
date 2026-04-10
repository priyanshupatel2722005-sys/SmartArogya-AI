import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const PatientDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const healthTips = [
    { icon: "🥗", tip: t.tip1 },
    { icon: "🚶", tip: t.tip2 },
    { icon: "💧", tip: t.tip3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Welcome Banner */}
        <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-7 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-blue-200 text-sm mb-1">Welcome back 👋</p>
            <h1 className="text-2xl font-bold">{user?.userId}</h1>
            <p className="text-blue-100 text-sm mt-1">{t.selectInputMethod}</p>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition flex items-center gap-2"
          >
            <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-xs font-bold">
              {user?.userId?.charAt(0)?.toUpperCase()}
            </div>
            View Profile
          </button>
        </div>

        {/* Input Method Cards */}
        <h2 className="text-lg font-bold text-gray-800 mb-4">{t.chooseInput}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

          {/* Manual Input */}
          <div
            onClick={() => navigate("/manual-input")}
            className="group bg-white rounded-2xl border border-gray-100 p-7 cursor-pointer hover:border-blue-300 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-blue-100 transition">
                📋
              </div>
              <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                Recommended
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t.manualInput}</h3>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">{t.manualInputDesc}</p>
            <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:gap-2 transition-all">
              {t.startManual} <span className="ml-1 group-hover:ml-2 transition-all">→</span>
            </div>
          </div>

          {/* AI Voice Agent */}
          <div
            onClick={() => navigate("/ai-voice-agent")}
            className="group bg-white rounded-2xl border border-gray-100 p-7 cursor-pointer hover:border-green-300 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-green-100 transition">
                🎙️
              </div>
              <span className="bg-green-50 text-green-600 text-xs font-semibold px-3 py-1 rounded-full">
                Multilingual
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t.aiVoiceAgent}</h3>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">{t.aiVoiceDesc}</p>
            <div className="flex items-center text-green-600 text-sm font-semibold group-hover:gap-2 transition-all">
              {t.startVoice} <span className="ml-1 group-hover:ml-2 transition-all">→</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: "🩺", label: "Diseases Tracked", value: "3" },
            { icon: "🤖", label: "ML Model Accuracy", value: "93%" },
            { icon: "🌐", label: "Languages", value: "3" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-xl font-bold text-gray-800">{s.value}</div>
              <div className="text-gray-500 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Health Tips */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💡 {t.healthTips}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {healthTips.map((item, i) => (
              <div key={i} className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-gray-600 text-sm leading-relaxed">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;