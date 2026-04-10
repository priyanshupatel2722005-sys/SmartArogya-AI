import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
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

const Register = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "", userId: "", password: "", mobile: "",
    email: "", address: "", city: "", district: "",
    state: "", mapLink: "",
  });
  const [userIdStatus, setUserIdStatus] = useState(null);
  const [userIdMessage, setUserIdMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    const userId = form.userId;
    if (!userId) { setUserIdStatus(null); setUserIdMessage(""); return; }
    if (!/^[a-zA-Z0-9]{5,15}$/.test(userId)) {
      setUserIdStatus("error");
      setUserIdMessage("User ID must be 5-15 alphanumeric characters only");
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/check-userid?userId=${userId}`);
        const data = await res.json();
        setUserIdStatus(data.available ? "success" : "error");
        setUserIdMessage(data.available ? "User ID available ✅" : "User ID already taken ❌");
      } catch { setUserIdStatus(null); setUserIdMessage(""); }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.userId]);

  const handleSubmit = async () => {
    setError("");
    if (!form.fullName || !form.userId || !form.password || !form.mobile ||
        !form.email || !form.address || !form.city || !form.district || !form.state) {
      setError("Please fill all required fields."); return;
    }
    if (userIdStatus !== "success") { setError("Please fix User ID before submitting."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "patient" }),
      });
      const data = await res.json();
      if (data.success) { setSuccess(true); setTimeout(() => navigate("/login"), 2000); }
      else setError(data.message || "Registration failed.");
    } catch { setError("Cannot connect to server. Please try again."); }
    setLoading(false);
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 text-sm";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">{t.register}</h1>
          <p className="text-gray-500 text-sm">Create your SmartArogya AI account</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {[
            { val: "patient", label: `👤 ${t.patient}` },
            { val: "hospital", label: `🏥 ${t.hospital}` },
          ].map((r) => (
            <button key={r.val} onClick={() => setRole(r.val)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                role === r.val ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {r.label}
            </button>
          ))}
        </div>

        {/* Patient Form */}
        {role === "patient" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-6 pb-3 border-b border-gray-100">
              👤 Patient Registration
            </h2>

            <div className="grid grid-cols-1 gap-4">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.fullName} <span className="text-red-500">*</span></label>
                <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
                  placeholder={t.fullName} className={inputClass} />
              </div>

              {/* User ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.username} <span className="text-red-500">*</span></label>
                <input type="text" name="userId" value={form.userId} onChange={handleChange}
                  placeholder="5-15 alphanumeric characters"
                  className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 bg-gray-50 text-sm ${
                    userIdStatus === "error" ? "border-red-400 focus:ring-red-400" :
                    userIdStatus === "success" ? "border-green-400 focus:ring-green-400" :
                    "border-gray-200 focus:ring-blue-400"
                  }`} />
                {userIdMessage && (
                  <p className={`text-xs mt-1 ${userIdStatus === "error" ? "text-red-500" : "text-green-600"}`}>
                    {userIdMessage}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.password} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password"
                    value={form.password} onChange={handleChange} placeholder={t.password}
                    className={`${inputClass} pr-10`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
              </div>

              {/* Mobile & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.mobile} <span className="text-red-500">*</span></label>
                  <input type="tel" name="mobile" value={form.mobile} onChange={handleChange}
                    placeholder={t.mobile} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.email} <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder={t.email} className={inputClass} />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.address} <span className="text-red-500">*</span></label>
                <input type="text" name="address" value={form.address} onChange={handleChange}
                  placeholder={t.address} className={inputClass} />
              </div>

              {/* City, District, State */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.city} <span className="text-red-500">*</span></label>
                  <input type="text" name="city" value={form.city} onChange={handleChange}
                    placeholder={t.city} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.district} <span className="text-red-500">*</span></label>
                  <input type="text" name="district" value={form.district} onChange={handleChange}
                    placeholder={t.district} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.state} <span className="text-red-500">*</span></label>
                  <input type="text" name="state" value={form.state} onChange={handleChange}
                    placeholder={t.state} className={inputClass} />
                </div>
              </div>

              {/* Map Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Google Map Link <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input type="text" name="mapLink" value={form.mapLink} onChange={handleChange}
                  placeholder="https://maps.google.com/..." className={inputClass} />
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
            {success && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span>✅</span> Registration Successful! Redirecting to Login...
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm">
              {loading ? "Registering..." : `${t.submit} →`}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="text-blue-600 cursor-pointer hover:underline font-medium">
                {t.login}
              </span>
            </p>
          </div>
        )}

        {/* Hospital Form — Closed */}
        {role === "hospital" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6 text-center">
              <div className="text-2xl mb-2">🔒</div>
              <p className="text-red-700 font-semibold">Hospital Registration is Currently Closed</p>
              <p className="text-red-500 text-sm mt-1">Please contact the system administrator for hospital access.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 opacity-40 pointer-events-none">
              {[
                { label: t.hospitalName, placeholder: t.hospitalName },
                { label: t.adminName, placeholder: t.adminName },
                { label: t.username, placeholder: t.username },
                { label: t.password, placeholder: t.password, type: "password" },
              ].map((f, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <input type={f.type || "text"} placeholder={f.placeholder} disabled className={inputClass} />
                </div>
              ))}
            </div>
            <button disabled className="w-full mt-6 bg-gray-300 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed text-sm">
              Registration Closed
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="text-blue-600 cursor-pointer hover:underline font-medium">
                {t.login}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;