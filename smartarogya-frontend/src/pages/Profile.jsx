import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { API_BASE } from "../api";

const Profile = () => {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    mobile: user?.mobile || "",
    email: user?.email || "",
    address: user?.address || "",
    city: user?.city || "",
    district: user?.district || "",
    state: user?.state || "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    setError(""); setSuccess("");
    if (!form.fullName || !form.mobile || !form.email ||
        !form.address || !form.city || !form.district || !form.state) {
      setError("Please fill all required fields."); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId: user?.userId }),
      });
      const data = await res.json();
      if (data.success) { updateUser(form); setSuccess("Profile updated successfully! ✅"); }
      else setError(data.message || "Update failed.");
    } catch { setError("Cannot connect to server."); }
    setLoading(false);
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800 text-sm";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="mb-6">
          <button onClick={() => navigate("/patient-dashboard")}
            className="text-gray-500 text-sm hover:text-gray-700 mb-3 flex items-center gap-1">
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">👤 My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">View and update your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-5">

          {/* Avatar Section */}
          <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-100">
            <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {user?.fullName?.charAt(0)?.toUpperCase() || user?.userId?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user?.fullName || user?.userId}</h2>
              <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                Patient Account
              </span>
            </div>
          </div>

          {/* Non-editable Fields */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">User ID</p>
              <p className="font-bold text-gray-800">{user?.userId}</p>
              <p className="text-xs text-gray-400 mt-1">Cannot be changed</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Password</p>
              <p className="font-bold text-gray-800 tracking-widest">••••••••</p>
              <p className="text-xs text-gray-400 mt-1">Cannot be changed</p>
            </div>
          </div>

          {/* Editable Fields */}
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
            Editable Information
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.fullName}</label>
              <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
                placeholder={t.fullName} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.mobile}</label>
                <input type="tel" name="mobile" value={form.mobile} onChange={handleChange}
                  placeholder={t.mobile} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.email}</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder={t.email} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.address}</label>
              <input type="text" name="address" value={form.address} onChange={handleChange}
                placeholder={t.address} className={inputClass} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.city}</label>
                <input type="text" name="city" value={form.city} onChange={handleChange}
                  placeholder={t.city} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.district}</label>
                <input type="text" name="district" value={form.district} onChange={handleChange}
                  placeholder={t.district} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.state}</label>
                <input type="text" name="state" value={form.state} onChange={handleChange}
                  placeholder={t.state} className={inputClass} />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <span>✅</span> {success}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={() => navigate("/patient-dashboard")}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition text-sm">
              ← Back
            </button>
            <button onClick={handleUpdate} disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm">
              {loading ? "Updating..." : "💾 Update Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;