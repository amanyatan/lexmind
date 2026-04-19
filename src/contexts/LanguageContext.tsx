import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.security': 'Security',
    'nav.faq': 'FAQ',
    'nav.getStarted': 'Get Started',
    'hero.title': 'Justice Served, Simplified.',
    'hero.subtitle': 'Analyze FIRs, map connections, and draft legal documents in seconds. LexMind is the intelligent partner every modern lawyer needs.',
    'hero.badge': 'Re-inventing Criminal Defense',
    'hero.getStarted': 'Get Started',
    'hero.dataEncryption': 'Data Encryption',
    'hero.privateSecure': 'Private & Secure',
    'features.title': 'Built for the Modern Courtroom',
    'features.subtitle': 'Every tool crafted for speed, clarity and confidentiality.',
    'dashboard.uploadFIR': 'Upload FIR',
    'dashboard.pastCases': 'Past Cases',
    'dashboard.evidenceTool': 'Evidence Tool',
    'dashboard.evidenceVault': 'Evidence Vault',
    'dashboard.analysis': 'Analysis',
    'dashboard.map': 'Map',
    'dashboard.draft': 'Draft',
    'dashboard.aiChat': 'AI Chat',
    'dashboard.profile': 'Profile',
    'dashboard.welcome': 'Welcome',
    'dashboard.logout': 'Logout',
    'dashboard.theme': 'Theme',
    'dashboard.uploadSubtitle': 'Upload a FIR PDF to start the analysis and mind-mapping process.',
    'dashboard.chat': 'Lexmind Chat',
    'common.language': 'Language',
    'common.english': 'English',
    'common.hindi': 'Hindi'
  },
  hi: {
    'nav.home': 'मुख्य पृष्ठ',
    'nav.about': 'हमारे बारे में',
    'nav.security': 'सुरक्षा',
    'nav.faq': 'सवाल-जवाब',
    'nav.getStarted': 'शुरू करें',
    'hero.title': 'न्याय मिला, सरलता से।',
    'hero.subtitle': 'FIR का विश्लेषण करें, कनेक्शन मैप करें और सेकंडों में कानूनी दस्तावेज ड्राफ्ट करें। लेक्समाइंड वह बुद्धिमान साथी है जिसकी हर आधुनिक वकील को जरूरत है।',
    'hero.badge': 'आपराधिक रक्षा का पुनर्गठन',
    'hero.getStarted': 'शुरू करें',
    'hero.dataEncryption': 'डाटा एन्क्रिप्शन',
    'hero.privateSecure': 'निजी और सुरक्षित',
    'features.title': 'आधुनिक न्यायालय के लिए निर्मित',
    'features.subtitle': 'गति, स्पष्टता और गोपनीयता के लिए तैयार किया गया हर उपकरण।',
    'dashboard.uploadFIR': 'FIR अपलोड करें',
    'dashboard.pastCases': 'पुराने मामले',
    'dashboard.evidenceTool': 'सबूत उपकरण',
    'dashboard.evidenceVault': 'सबूत वॉल्ट',
    'dashboard.analysis': 'विश्लेषण',
    'dashboard.map': 'मैप',
    'dashboard.draft': 'ड्राफ्ट',
    'dashboard.aiChat': 'AI चैट',
    'dashboard.profile': 'प्रोफाइल',
    'dashboard.welcome': 'स्वागत है',
    'dashboard.logout': 'लॉगआउट',
    'dashboard.theme': 'थीम',
    'dashboard.uploadSubtitle': 'विश्लेषण और माइंड-मैपिंग प्रक्रिया शुरू करने के लिए FIR PDF अपलोड करें।',
    'dashboard.chat': 'लेक्समाइंड चैट',
    'common.language': 'भाषा',
    'common.english': 'अंग्रेजी',
    'common.hindi': 'हिंदी'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
