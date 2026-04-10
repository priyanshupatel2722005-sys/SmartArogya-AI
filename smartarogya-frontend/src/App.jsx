import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import ManualInput from "./pages/ManualInput";
import AIVoiceAgent from "./pages/AIVoiceAgent";
import PredictionResult from "./pages/PredictionResult";
import HospitalDashboard from "./pages/HospitalDashboard";
import Profile from "./pages/Profile";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/patient-dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
            <Route path="/manual-input" element={<ProtectedRoute role="patient"><ManualInput /></ProtectedRoute>} />
            <Route path="/ai-voice-agent" element={<ProtectedRoute role="patient"><AIVoiceAgent /></ProtectedRoute>} />
            <Route path="/prediction-result" element={<ProtectedRoute role="patient"><PredictionResult /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute role="patient"><Profile /></ProtectedRoute>} />
            <Route path="/hospital-dashboard" element={<ProtectedRoute role="hospital"><HospitalDashboard /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;