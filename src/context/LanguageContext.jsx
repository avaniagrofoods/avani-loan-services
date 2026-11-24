import { createContext, useState, useContext } from 'react';
import { OFFICIAL_BUSINESS } from '../config/officialBusiness';

export const LanguageContext = createContext();

const translations = {
  en: {
    disclaimer: 'Independent Loan Consultancy & Advisory (Not a bank or direct lender). Final sanction and rates rest solely with partner lenders.',
    home: 'Home',
    about: 'About',
    loans: 'Loan Services',
    eligibility: 'Eligibility Estimator',
    documents: 'Documents',
    calculators: 'Calculators',
    blog: 'Blog',
    contact: 'Contact',
    cibil_check: 'Credit Score Guide',
    download_app: 'Download Application',
    apply_now: 'Request Consultation',
    hero_badge: `📍 ${OFFICIAL_BUSINESS.shortAddress}`,
    hero_title: 'Transparent Loan Advisory & Coordination in Latur & Maharashtra',
    hero_subtitle: 'Independent loan consultancy across Personal, Business, Doctor, Home, Mortgage, Education (India & Global), and School & College Funding.',
    check_eligibility: 'Estimate Eligibility',
    quick_links: 'Quick Links',
    all_loans: 'All Loan Services',
    contact_us: 'Contact Us',
    footer_desc: 'AVANI LOAN SERVICES is an independent loan consultancy and advisory firm in Latur, Maharashtra assisting individuals, professionals, businesses, and educational institutions.',
    rights_reserved: 'All rights reserved.'
  },
  mr: {
    disclaimer: 'स्वतंत्र कर्ज सल्लागार व समन्वय सेवा (बँक किंवा थेट कर्जदाता नाही). अंतिम कर्ज मंजुरी व व्याजदर संबंधित बँक/संस्थेच्या धोरणांवर अवलंबून असतात.',
    home: 'होम',
    about: 'आमच्याबद्दल',
    loans: 'कर्ज सेवा',
    eligibility: 'पात्रता अंदाजक',
    documents: 'कागदपत्रे',
    calculators: 'कॅल्क्युलेटर',
    blog: 'ब्लॉग',
    contact: 'संपर्क',
    cibil_check: 'क्रेडिट स्कोर मार्गदर्शक',
    download_app: 'अर्ज डाउनलोड करा',
    apply_now: 'सल्ला विनंती करा',
    hero_badge: `📍 ${OFFICIAL_BUSINESS.shortAddress}`,
    hero_title: 'लातूर आणि महाराष्ट्रात पारदर्शक कर्ज सल्ला व समन्वय सेवा',
    hero_subtitle: 'पर्सनल, बिझनेस, डॉक्टर, होम, मॉर्टगेज, शिक्षण (भारत व परदेश) आणि शाळा-महाविद्यालय निधीसाठी स्वतंत्र कर्ज सल्लागार.',
    check_eligibility: 'पात्रता तपासा',
    quick_links: 'द्रुत दुवे',
    all_loans: 'सर्व कर्ज सेवा',
    contact_us: 'आमच्याशी संपर्क साधा',
    footer_desc: 'अवनी लोन सर्व्हिसेस ही लातूर, महाराष्ट्रातील स्वतंत्र कर्ज सल्लागार संस्था असून व्यक्ती, व्यावसायिक आणि शैक्षणिक संस्थांना कागदपत्र व अर्ज समन्वयासाठी मार्गदर्शन करते.',
    rights_reserved: 'सर्व हक्क राखीव.'
  },
  hi: {
    disclaimer: 'स्वतंत्र ऋण परामर्श एवं समन्वय सेवा (बैंक या प्रत्यक्ष ऋणदाता नहीं)। अंतिम स्वीकृति व ब्याज दरें संबंधित बैंक/एनबीएफसी की नीतियों पर निर्भर करती हैं।',
    home: 'होम',
    about: 'हमारे बारे में',
    loans: 'ऋण सेवाएं',
    eligibility: 'पात्रता अनुमानक',
    documents: 'दस्तावेज़',
    calculators: 'कैलकुलेटर',
    blog: 'ब्लॉग',
    contact: 'संपर्क',
    cibil_check: 'क्रेडिट स्कोर गाइड',
    download_app: 'आवेदन डाउनलोड करें',
    apply_now: 'परामर्श अनुरोध करें',
    hero_badge: `📍 ${OFFICIAL_BUSINESS.shortAddress}`,
    hero_title: 'लातूर और महाराष्ट्र में पारदर्शी ऋण परामर्श एवं समन्वय',
    hero_subtitle: 'पर्सनल, बिजनेस, डॉक्टर, होम, मॉर्टगेज, एजुकेशन (भारत व विदेश) और स्कूल-कॉलेज फंडिंग के लिए स्वतंत्र ऋण परामर्श।',
    check_eligibility: 'पात्रता जांचें',
    quick_links: 'त्वरित लिंक',
    all_loans: 'सभी ऋण सेवाएं',
    contact_us: 'हमसे संपर्क करें',
    footer_desc: 'अवनी लोन सर्विसेज लातूर, महाराष्ट्र में एक स्वतंत्र ऋण परामर्श फर्म है जो व्यक्तियों, पेशेवरों, व्यवसायों और शैक्षणिक संस्थानों को ऋण दस्तावेज़ व समन्वय मार्गदर्शन प्रदान करती है।',
    rights_reserved: 'सर्वाधिकार सुरक्षित।'
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const t = (key) => translations[language]?.[key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
