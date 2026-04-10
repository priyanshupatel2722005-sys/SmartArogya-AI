import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { API_BASE } from "../api";

const EyeIcon = ({ show }) => (
  show ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
    </svg>
  )
);

const generateCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

const InputField = ({ label, type = "text", value, onChange, placeholder, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 text-sm"
      />
      {children}
    </div>
  </div>
);

const Login = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("patient");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaText] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!userId || !password) {
      setError("Please enter User ID and Password.");
      return;
    }
    if (captchaInput !== captchaText) {
      setError("Captcha verification failed. Please try again.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password, role }),
      });
      const data = await response.json();
      if (data.success) {
        login(data.user, data.token);
        navigate(data.user.role === "patient" ? "/patient-dashboard" : "/hospital-dashboard");
      } else {
        setError(data.message || "Invalid User ID or Password");
      }
    } catch {
      setError("Cannot connect to server. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex min-h-[calc(100vh-64px)]">

        {/* Left Panel */}
        <div className="hidden lg:flex flex-col justify-center px-16 bg-linear-to-br from-blue-700 to-blue-900 text-white w-2/5">
          <div className="mb-8">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-6">🏥</div>
            <h2 className="text-3xl font-bold mb-3">Welcome Back!</h2>
            <p className="text-blue-200 leading-relaxed">
              Login to access your personalized health dashboard and AI-powered disease risk predictions.
            </p>
          </div>
          <div className="space-y-4">
            {["AI-powered disease prediction", "Multilingual voice agent", "Real-time health analytics"].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center text-xs">✓</div>
                <span className="text-blue-100 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{t.login}</h1>
              <p className="text-gray-500 text-sm">Enter your credentials to continue</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">

              {/* Role Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                {[
                  { val: "patient", label: `👤 ${t.patient}` },
                  { val: "hospital", label: `🏥 ${t.hospital}` },
                ].map((r) => (
                  <button
                    key={r.val}
                    onClick={() => setRole(r.val)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                      role === r.val
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <InputField
                  label={t.username}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={t.username}
                />

                <InputField
                  label={t.password}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.password}
                >
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <EyeIcon show={showPassword} />
                  </button>
                </InputField>

                {/* Captcha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.captcha}</label>
                  <div className="bg-linear-to-r from-gray-100 to-gray-200 rounded-xl px-4 py-3 text-center font-mono text-xl tracking-[0.3em] text-gray-800 mb-2 select-none border border-gray-200 font-bold">
                    {captchaText}
                  </div>
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Type the characters above"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm"
              >
                {loading ? "Verifying..." : `${t.login} →`}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Don't have an account?{" "}
                <span onClick={() => navigate("/register")} className="text-blue-600 cursor-pointer hover:underline font-medium">
                  {t.register}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;