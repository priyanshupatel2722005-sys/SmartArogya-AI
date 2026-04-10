import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";

const HospitalDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  const diseaseData = [
    { name: "Diabetes",       value: 486, color: "#3b82f6" },
    { name: "Heart Disease",  value: 312, color: "#ef4444" },
    { name: "Kidney Disease", value: 198, color: "#f59e0b" },
    { name: "Other",          value: 252, color: "#10b981" },
  ];

  const monthlyData = [
    { month: "Jan", patients: 85  }, { month: "Feb", patients: 92  },
    { month: "Mar", patients: 110 }, { month: "Apr", patients: 98  },
    { month: "May", patients: 125 }, { month: "Jun", patients: 140 },
    { month: "Jul", patients: 132 }, { month: "Aug", patients: 118 },
    { month: "Sep", patients: 145 }, { month: "Oct", patients: 160 },
    { month: "Nov", patients: 138 }, { month: "Dec", patients: 105 },
  ];

  const ageData = [
    { age: "18-30", Diabetes: 45,  Heart: 20,  Kidney: 15 },
    { age: "31-45", Diabetes: 120, Heart: 80,  Kidney: 45 },
    { age: "46-60", Diabetes: 180, Heart: 130, Kidney: 80 },
    { age: "61-75", Diabetes: 110, Heart: 65,  Kidney: 45 },
    { age: "75+",   Diabetes: 31,  Heart: 17,  Kidney: 13 },
  ];

  const genderData = [
    { gender: "Male",   High: 198, Moderate: 280, Low: 245 },
    { gender: "Female", High: 144, Moderate: 206, Low: 175 },
  ];

  const highRiskPatients = [
    { id: "P001", name: "Ramesh Shah",   age: 58, disease: "Diabetes",       city: "Ahmedabad" },
    { id: "P002", name: "Priya Patel",   age: 45, disease: "Heart Disease",  city: "Surat"      },
    { id: "P003", name: "Suresh Kumar",  age: 62, disease: "Kidney Disease", city: "Vadodara"   },
    { id: "P004", name: "Meena Joshi",   age: 55, disease: "Diabetes",       city: "Rajkot"     },
    { id: "P005", name: "Anil Mehta",    age: 67, disease: "Heart Disease",  city: "Gandhinagar"},
    { id: "P006", name: "Sita Verma",    age: 71, disease: "Kidney Disease", city: "Bhavnagar"  },
    { id: "P007", name: "Vijay Desai",   age: 53, disease: "Diabetes",       city: "Jamnagar"   },
  ];

  const resourcePlan = [
    { icon: "🩺", dept: "Endocrinology", sub: "Diabetes specialist unit",  load: "Critical",  loadColor: "bg-red-100 text-red-800",    doctors: 8, capacity: 5, fill: 90, bar: "bg-red-500",    note: "Diabetes cases increasing rapidly" },
    { icon: "❤️", dept: "Cardiology",    sub: "Heart disease unit",        load: "Moderate",  loadColor: "bg-yellow-100 text-yellow-800", doctors: 5, capacity: 4, fill: 60, bar: "bg-yellow-500", note: "Regular monitoring needed" },
    { icon: "💊", dept: "Nephrology",    sub: "Kidney disease unit",       load: "Low",       loadColor: "bg-green-100 text-green-800",  doctors: 3, capacity: 3, fill: 30, bar: "bg-green-500",  note: "Stable patient count" },
  ];

  const diseaseTagColor = (d) => {
    if (d === "Diabetes")       return "bg-blue-50 text-blue-700";
    if (d === "Heart Disease")  return "bg-red-50 text-red-700";
    if (d === "Kidney Disease") return "bg-yellow-50 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  };

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    return (
      <text x={cx + r * Math.cos(-midAngle * RADIAN)}
            y={cy + r * Math.sin(-midAngle * RADIAN)}
            fill="white" textAnchor="middle"
            dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const statCards = [
    { label: "Total patients",          value: "1,248", change: "+12% this month", icon: "👥", accent: "#3b82f6", iconBg: "bg-blue-50",   changeBg: "bg-blue-50 text-blue-700",   fill: 78  },
    { label: "High risk patients",      value: "342",   change: "Needs attention", icon: "🚨", accent: "#ef4444", iconBg: "bg-red-50",    changeBg: "bg-red-50 text-red-700",     fill: 27  },
    { label: "Moderate risk patients",  value: "486",   change: "Monitor closely", icon: "⚠️", accent: "#f59e0b", iconBg: "bg-yellow-50", changeBg: "bg-yellow-50 text-yellow-700", fill: 39 },
    { label: "Low risk patients",       value: "420",   change: "Stable",          icon: "✅", accent: "#10b981", iconBg: "bg-green-50",  changeBg: "bg-green-50 text-green-700", fill: 34  },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Header ── */}
        <div className="bg-blue-900 text-white rounded-2xl px-7 py-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">🏥 Hospital Analytics Dashboard</h1>
            <p className="text-blue-300 text-sm">SmartArogya AI — Real-time patient risk monitoring system</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-lg">
              Last updated: <strong>Today, 9:41 AM</strong>
            </span>
            <span className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-lg">
              Admin: <strong>{user?.userId}</strong>
            </span>
            <button onClick={handleLogout}
              className="bg-white text-blue-900 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-50 transition">
              Logout
            </button>
          </div>
        </div>

        {/* ── Alert Strip ── */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl px-5 py-3 flex items-center gap-3 mb-6">
          <div className="w-2 h-2 bg-amber-400 rounded-full shrink-0"></div>
          <p className="text-amber-800 text-sm">
            <strong>Alert:</strong> 342 high-risk patients require immediate follow-up.
            Endocrinology department load is critical.
          </p>
        </div>

        {/* ── Stat Cards ── */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Overview</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          {statCards.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ background: s.accent }}></div>
              <div className="flex justify-between items-start mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${s.iconBg}`}>
                  {s.icon}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.changeBg}`}>
                  {s.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-800 leading-none mb-1">{s.value}</div>
              <div className="text-xs text-slate-400 mb-3">{s.label}</div>
              <div className="bg-slate-100 rounded-full h-1 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${s.fill}%`, background: s.accent }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts Row 1 ── */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Analytics</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-700">Disease distribution</h3>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">1,248 total</span>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={diseaseData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  dataKey="value" labelLine={false} label={renderLabel}>
                  {diseaseData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} patients`, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-1">
              {diseaseData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }}></div>
                  {d.name} — {d.value}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-700">Monthly patient trend</h3>
              <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">Peak: Oct — 160</span>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "0.5px solid #e2e8f0", fontSize: 12 }} />
                <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2.5}
                  dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                  activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Charts Row 2 ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-700">Age group vs disease</h3>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">5 age groups</span>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={ageData} barCategoryGap="25%" barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="age" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "0.5px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="Diabetes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Heart"    fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Kidney"   fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              {[["#3b82f6","Diabetes"],["#ef4444","Heart"],["#f59e0b","Kidney"]].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }}></div>{l}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-700">Gender-wise risk breakdown</h3>
              <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-medium">Male 58% higher</span>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={genderData} barCategoryGap="35%" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="gender" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "0.5px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="High"     fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Moderate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Low"      fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              {[["#ef4444","High"],["#f59e0b","Moderate"],["#10b981","Low"]].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }}></div>{l}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── High Risk Table ── */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">High risk patients</p>
        <div className="bg-white rounded-2xl border border-slate-100 mb-7 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700">Patients requiring immediate attention</h3>
            <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-medium">7 patients</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">Patient ID</th>
                  <th className="px-5 py-3 text-left font-medium">Name</th>
                  <th className="px-5 py-3 text-left font-medium">Age</th>
                  <th className="px-5 py-3 text-left font-medium">Disease</th>
                  <th className="px-5 py-3 text-left font-medium">City</th>
                  <th className="px-5 py-3 text-left font-medium">Risk level</th>
                </tr>
              </thead>
              <tbody>
                {highRiskPatients.map((p, i) => (
                  <tr key={i} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-blue-600 font-semibold text-xs">{p.id}</td>
                    <td className="px-5 py-3 font-medium text-slate-700">{p.name}</td>
                    <td className="px-5 py-3 text-slate-500">{p.age}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${diseaseTagColor(p.disease)}`}>
                        {p.disease}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{p.city}</td>
                    <td className="px-5 py-3">
                      <span className="bg-red-50 text-red-700 text-xs px-3 py-1 rounded-full font-semibold">
                        High
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Resource Planning ── */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Resource planning</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {resourcePlan.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg">
                  {r.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">{r.dept}</div>
                  <div className="text-xs text-slate-400">{r.sub}</div>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4 ${r.loadColor}`}>
                {r.load} load
              </span>
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Doctors required</span>
                  <strong className="text-slate-700">{r.doctors}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Current capacity</span>
                  <strong className="text-slate-700">{r.capacity}</strong>
                </div>
              </div>
              <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden mt-3">
                <div className={`h-full rounded-full ${r.bar}`} style={{ width: `${r.fill}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">{r.note}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default HospitalDashboard;