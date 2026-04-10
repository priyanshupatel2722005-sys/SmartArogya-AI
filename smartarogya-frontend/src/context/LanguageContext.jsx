import { createContext, useContext, useState } from "react";

const translations = {
  english: {
    appName: "SmartArogya AI",
    tagline: "AI-Driven Multi-Disease Risk Prediction",
    login: "Login", register: "Register",
    patient: "Patient", hospital: "Hospital Management",
    username: "User ID", password: "Password",
    fullName: "Full Name", mobile: "Mobile Number",
    email: "Email ID", address: "Address",
    city: "City", district: "District", state: "State",
    hospitalName: "Hospital Name", adminName: "Admin Name",
    submit: "Submit", captcha: "Captcha Verification",
    selectLanguage: "Select Language",
    manualInput: "Manual Input", aiVoiceAgent: "AI Voice Agent",
    predict: "Predict Disease", result: "Prediction Result",
    recommendation: "Health Recommendation",
    dashboard: "Dashboard", logout: "Logout",
    welcome: "Welcome",
    selectInputMethod: "Select how you want to enter your health data below.",
    chooseInput: "Choose Input Method",
    manualInputDesc: "Enter your health details manually using a simple form with tooltips and validation.",
    aiVoiceDesc: "Use our multilingual AI voice agent to answer health questions in English, Hindi or Gujarati.",
    startManual: "Start Manual Input", startVoice: "Start Voice Agent",
    healthTips: "Daily Health Tips",
    tip1: "Eat a balanced diet rich in fruits and vegetables.",
    tip2: "Walk at least 30 minutes every day.",
    tip3: "Drink 8 glasses of water daily.",
  },
  hindi: {
    appName: "स्मार्टआरोग्य AI",
    tagline: "AI-आधारित बहु-रोग जोखिम भविष्यवाणी",
    login: "लॉगिन", register: "रजिस्टर",
    patient: "मरीज", hospital: "अस्पताल प्रबंधन",
    username: "यूज़र आईडी", password: "पासवर्ड",
    fullName: "पूरा नाम", mobile: "मोबाइल नंबर",
    email: "ईमेल आईडी", address: "पता",
    city: "शहर", district: "जिला", state: "राज्य",
    hospitalName: "अस्पताल का नाम", adminName: "एडमिन का नाम",
    submit: "जमा करें", captcha: "कैप्चा सत्यापन",
    selectLanguage: "भाषा चुनें",
    manualInput: "मैन्युअल इनपुट", aiVoiceAgent: "AI वॉयस एजेंट",
    predict: "रोग की भविष्यवाणी करें", result: "भविष्यवाणी परिणाम",
    recommendation: "स्वास्थ्य अनुशंसा",
    dashboard: "डैशबोर्ड", logout: "लॉगआउट",
    welcome: "स्वागत है",
    selectInputMethod: "नीचे बताएं कि आप अपना स्वास्थ्य डेटा कैसे दर्ज करना चाहते हैं।",
    chooseInput: "इनपुट विधि चुनें",
    manualInputDesc: "सरल फॉर्म के माध्यम से अपना स्वास्थ्य विवरण मैन्युअल रूप से दर्ज करें।",
    aiVoiceDesc: "हिंदी, अंग्रेजी या गुजराती में स्वास्थ्य प्रश्नों के उत्तर देने के लिए AI वॉयस एजेंट का उपयोग करें।",
    startManual: "मैन्युअल इनपुट शुरू करें", startVoice: "वॉयस एजेंट शुरू करें",
    healthTips: "दैनिक स्वास्थ्य सुझाव",
    tip1: "फलों और सब्जियों से भरपूर संतुलित आहार लें।",
    tip2: "हर दिन कम से कम 30 मिनट चलें।",
    tip3: "रोज 8 गिलास पानी पिएं।",
  },
  gujarati: {
    appName: "સ્માર્ટઆરોગ્ય AI",
    tagline: "AI-આધારિત બહુ-રોગ જોખમ આગાહી",
    login: "લૉગિન", register: "નોંધણી",
    patient: "દર્દી", hospital: "હોસ્પિટલ મેનેજમેન્ટ",
    username: "યુઝર આઈડી", password: "પાસવર્ડ",
    fullName: "પૂરું નામ", mobile: "મોબાઈલ નંબર",
    email: "ઈમેઈલ આઈડી", address: "સરનામું",
    city: "શહેર", district: "જિલ્લો", state: "રાજ્ય",
    hospitalName: "હોસ્પિટલનું નામ", adminName: "એડમિનનું નામ",
    submit: "સબમિટ કરો", captcha: "કેપ્ચા ચકાસણી",
    selectLanguage: "ભાષા પસંદ કરો",
    manualInput: "મેન્યુઅલ ઇનપુટ", aiVoiceAgent: "AI વૉઇસ એજન્ટ",
    predict: "રોગની આગાહી કરો", result: "આગાહી પરિણામ",
    recommendation: "સ્વાસ્થ્ય ભલામણ",
    dashboard: "ડેશબોર્ડ", logout: "લૉગઆઉટ",
    welcome: "સ્વાગત છે",
    selectInputMethod: "નીચે પસંદ કરો કે તમે તમારો આરોગ્ય ડેટા કેવી રીતે દાખલ કરવા માંગો છો.",
    chooseInput: "ઇનપુટ પદ્ધતિ પસંદ કરો",
    manualInputDesc: "સરળ ફોર્મ દ્વારા તમારી આરોગ્ય વિગતો મેન્યુઅલી દાખલ કરો.",
    aiVoiceDesc: "ગુજરાતી, હિન્દી અથવા અંગ્રેજીમાં આરોગ્ય પ્રશ્નોના જવાબ આપવા માટે AI વૉઇસ એજન્ટનો ઉપયોગ કરો.",
    startManual: "મેન્યુઅલ ઇનપુટ શરૂ કરો", startVoice: "વૉઇસ એજન્ટ શરૂ કરો",
    healthTips: "દૈનિક આરોગ્ય સૂચનો",
    tip1: "ફળો અને શાકભાજીથી ભરપૂર સંતુલિત આહાર લો.",
    tip2: "દરરોજ ઓછામાં ઓછા 30 મિનિટ ચાલો.",
    tip3: "દરરોજ 8 ગ્લાસ પાણી પીઓ.",
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("english");
  const t = translations[language];
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);