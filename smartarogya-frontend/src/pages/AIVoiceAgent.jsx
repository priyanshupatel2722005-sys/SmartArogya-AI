import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";

const questions = {
  english: [
    { key: "age", question: "What is your age?", placeholder: "e.g. 45", type: "number" },
    { key: "gender", question: "What is your gender?", type: "select", options: ["Male", "Female", "Other"] },
    { key: "bloodPressure", question: "What is your blood pressure in mmHg?", placeholder: "e.g. 120", type: "number" },
    { key: "glucoseLevel", question: "What is your glucose level in mg/dL?", placeholder: "e.g. 100", type: "number" },
    { key: "cholesterol", question: "What is your cholesterol level in mg/dL?", placeholder: "e.g. 200", type: "number" },
    { key: "bmi", question: "What is your BMI?", placeholder: "e.g. 24.5", type: "number" },
    { key: "heartRate", question: "What is your heart rate in bpm?", placeholder: "e.g. 72", type: "number" },
    { key: "creatinine", question: "What is your creatinine level in mg/dL?", placeholder: "e.g. 1.0", type: "number" },
    { key: "smokingStatus", question: "What is your smoking status?", type: "select", options: ["Never Smoked", "Former Smoker", "Current Smoker"] },
  ],
  hindi: [
    { key: "age", question: "आपकी उम्र क्या है?", placeholder: "जैसे 45", type: "number" },
    { key: "gender", question: "आपका लिंग क्या है?", type: "select", options: ["पुरुष", "महिला", "अन्य"] },
    { key: "bloodPressure", question: "आपका रक्तचाप कितना है?", placeholder: "जैसे 120", type: "number" },
    { key: "glucoseLevel", question: "आपका ग्लूकोज स्तर कितना है?", placeholder: "जैसे 100", type: "number" },
    { key: "cholesterol", question: "आपका कोलेस्ट्रॉल स्तर कितना है?", placeholder: "जैसे 200", type: "number" },
    { key: "bmi", question: "आपका बीएमआई कितना है?", placeholder: "जैसे 24.5", type: "number" },
    { key: "heartRate", question: "आपकी हृदय गति कितनी है?", placeholder: "जैसे 72", type: "number" },
    { key: "creatinine", question: "आपका क्रिएटिनिन स्तर कितना है?", placeholder: "जैसे 1.0", type: "number" },
    { key: "smokingStatus", question: "आपकी धूम्रपान स्थिति क्या है?", type: "select", options: ["कभी नहीं", "पूर्व धूम्रपानकर्ता", "वर्तमान धूम्रपानकर्ता"] },
  ],
  gujarati: [
    { key: "age", question: "તમારી ઉંમર શું છે?", placeholder: "જેમ કે 45", type: "number" },
    { key: "gender", question: "તમારું લિંગ શું છે?", type: "select", options: ["પુરુષ", "સ્ત્રી", "અન્ય"] },
    { key: "bloodPressure", question: "તમારું બ્લડ પ્રેશર કેટલું છે?", placeholder: "જેમ કે 120", type: "number" },
    { key: "glucoseLevel", question: "તમારું ગ્લુકોઝ સ્તર કેટલું છે?", placeholder: "જેમ કે 100", type: "number" },
    { key: "cholesterol", question: "તમારું કોલેસ્ટ્રોલ સ્તર કેટલું છે?", placeholder: "જેમ કે 200", type: "number" },
    { key: "bmi", question: "તમારું બીએમઆઈ કેટલું છે?", placeholder: "જેમ કે 24.5", type: "number" },
    { key: "heartRate", question: "તમારી હૃદય ગતિ કેટલી છે?", placeholder: "જેમ કે 72", type: "number" },
    { key: "creatinine", question: "તમારું ક્રિએટિનિન સ્તર કેટલું છે?", placeholder: "જેમ કે 1.0", type: "number" },
    { key: "smokingStatus", question: "તમારી ધૂમ્રપાન સ્થિતિ શું છે?", type: "select", options: ["ક્યારેય નહીં", "પૂર્વ ધૂમ્રપાન કરનાર", "હાલ ધૂમ્રપાન કરનાર"] },
  ],
};

const AIVoiceAgent = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [done, setDone] = useState(false);

  const currentQuestions = questions[language];
  const current = currentQuestions[step];

  const speak = (text) => {
    if ("speechSynthesis" in window && language === "english") {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US"; utter.rate = 0.9; utter.pitch = 1;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utter);
    }
  };

  useEffect(() => {
    setInput("");
    if (!done) speak(questions["english"][step].question);
  }, [step, language]);

  const handleNext = () => {
    if (!input.trim()) return;
    const updated = { ...answers, [current.key]: input.trim() };
    setAnswers(updated);
    setInput("");
    if (step + 1 < currentQuestions.length) {
      setStep(step + 1);
    } else {
      setDone(true);
      localStorage.setItem("patientData", JSON.stringify(updated));
      if (language === "english") speak("Thank you! Your data has been saved.");
    }
  };

  const handleRestart = () => { setStep(0); setAnswers({}); setInput(""); setDone(false); };

  const progressPercent = Math.round(((step + 1) / currentQuestions.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="mb-6">
          <button onClick={() => navigate("/patient-dashboard")}
            className="text-gray-500 text-sm hover:text-gray-700 mb-3 flex items-center gap-1">
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">🎙️ {t.aiVoiceAgent}</h1>
          <p className="text-gray-500 text-sm mt-1">{t.aiVoiceDesc}</p>
        </div>

        {!done ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Question {step + 1} of {currentQuestions.length}</span>
                <span>{progressPercent}% complete</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* AI Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-3 transition ${
                speaking ? "bg-green-100 animate-pulse" : "bg-blue-50"
              }`}>🤖</div>
              {language === "english" && speaking ? (
                <span className="text-green-600 text-xs font-medium animate-pulse">🔊 Speaking...</span>
              ) : language !== "english" ? (
                <span className="text-blue-500 text-xs bg-blue-50 px-3 py-1 rounded-full">
                  📖 {language === "hindi" ? "पढ़ें और उत्तर दें" : "વાંચો અને જવાબ આપો"}
                </span>
              ) : null}
            </div>

            {/* Question */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-5 text-center">
              <p className="text-lg font-semibold text-gray-800">{current.question}</p>
            </div>

            {/* Speak Button */}
            {language === "english" && (
              <button onClick={() => speak(questions["english"][step].question)}
                className="w-full mb-4 border border-green-300 text-green-600 py-2 rounded-xl text-sm font-medium hover:bg-green-50 transition">
                🔊 Repeat Question
              </button>
            )}

            {/* Input */}
            {current.type === "select" ? (
              <select value={input} onChange={(e) => setInput(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 text-sm text-center">
                <option value="">-- Select --</option>
                {current.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input type="number" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
                placeholder={current.placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 text-sm text-center" />
            )}

            <button onClick={handleNext}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition">
              {step + 1 === currentQuestions.length ? "✅ Submit" : "Next →"}
            </button>

            {/* Previous Answers */}
            {Object.keys(answers).length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  {language === "hindi" ? "अब तक के उत्तर" : language === "gujarati" ? "અત્યાર સુધીના જવાબો" : "Your Answers So Far"}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(answers).map(([key, val]) => (
                    <div key={key} className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-400 capitalize">{key}</p>
                      <p className="text-sm font-semibold text-gray-700">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {language === "hindi" ? "सब हो गया!" : language === "gujarati" ? "બધું થઈ ગયું!" : "All Done!"}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {language === "hindi" ? "आपका स्वास्थ्य डेटा सफलतापूर्वक एकत्र किया गया है।" :
               language === "gujarati" ? "તમારો આરોગ્ય ડેટા સફળતાપૂર્વક એકત્ર કરવામાં આવ્યો છે." :
               "Your health data has been collected successfully."}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6 text-left">
              {Object.entries(answers).map(([key, val]) => (
                <div key={key} className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 capitalize">{key}</p>
                  <p className="font-semibold text-gray-800 text-sm capitalize">{val}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleRestart}
                className="border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition text-sm">
                🔄 {language === "hindi" ? "फिर से" : language === "gujarati" ? "ફરી" : "Restart"}
              </button>
              <button onClick={() => navigate("/prediction-result")}
                className="bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition text-sm">
                🔍 {language === "hindi" ? "परिणाम देखें" : language === "gujarati" ? "પરિણામ જુઓ" : "See Prediction"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIVoiceAgent;