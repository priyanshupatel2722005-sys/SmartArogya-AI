import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="bg-blue-600 text-white rounded-xl w-9 h-9 flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-blue-700 transition">
            S
          </div>
          <span className="text-blue-600 font-bold text-lg hidden sm:block">
            {t.appName}
          </span>
        </div>

        {/* Nav Links — only when logged in */}
        {user && user.role === "patient" && (
          <div className="hidden md:flex items-center gap-1">
            {[
              { path: "/patient-dashboard", label: "Dashboard" },
              { path: "/manual-input", label: "Health Check" },
              { path: "/profile", label: "Profile" },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-2">

          {/* Language Toggle */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-600"
          >
            <option value="english">EN</option>
            <option value="hindi">हि</option>
            <option value="gujarati">ગુ</option>
          </select>

          {/* Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user.userId?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-gray-700 text-sm font-medium">
                  {user.userId}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition"
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/login")}
                className="border border-blue-600 text-blue-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
              >
                {t.login}
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                {t.register}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;