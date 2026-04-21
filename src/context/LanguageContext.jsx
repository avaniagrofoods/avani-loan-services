import { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    disclaimer: "No commission from customer — Only bank charges applicable",
    home: "Home",
    about: "About",
    loans: "Loan Products",
    eligibility: "Eligibility Checker",
    documents: "Documents",
    blog: "Blog",
    contact: "Contact",
    cibil_check: "CIBIL Check",
    apply_now: "Apply Now",
    hero_badge: "📍 Trusted in Latur, Maharashtra",
    hero_title: "Get Your Loan Approved in 48 Hours in Latur",
    hero_subtitle: "Salary, Business, Education, Home & Mortgage Loans across all Maharashtra. No hidden charges. Free consultation.",
    check_eligibility: "Check Eligibility",
    quick_links: "Quick Links",
    all_loans: "All Loan Products",
    contact_us: "Contact Us",
    footer_desc: "Your trusted partner for unsecured and secured loans in Latur and across Maharashtra. Get approved in 48 hours.",
    rights_reserved: "All rights reserved."
  },
  mr: {
    disclaimer: "ग्राहकाकडून कोणतेही कमिशन घेतले जात नाही — फक्त बँक चार्जेस लागू",
    home: "होम",
    about: "आमच्याबद्दल",
    loans: "कर्ज उत्पादने",
    eligibility: "पात्रता तपासक",
    documents: "कागदपत्रे",
    blog: "ब्लॉग",
    contact: "संपर्क",
    cibil_check: "CIBIL तपासा",
    apply_now: "आता अर्ज करा",
    hero_badge: "📍 लातूर, महाराष्ट्र मध्ये विश्वसनीय",
    hero_title: "लातूरमध्ये ४८ तासांत कर्ज मंजूर करा",
    hero_subtitle: "पगार, व्यवसाय, शिक्षण, घर आणि मॉर्टगेज कर्ज संपूर्ण महाराष्ट्रात. कोणतेही छुपे चार्जेस नाही. मोफत सल्ला.",
    check_eligibility: "पात्रता तपासा",
    quick_links: "द्रुत दुवे",
    all_loans: "सर्व कर्ज उत्पादने",
    contact_us: "आमच्याशी संपर्क साधा",
    footer_desc: "लातूर आणि संपूर्ण महाराष्ट्रात असुरक्षित आणि सुरक्षित कर्जासाठी तुमचा विश्वसनीय भागीदार. ४८ तासांत कर्ज मंजूर करा.",
    rights_reserved: "सर्व हक्क राखीव."
  },
  hi: {
    disclaimer: "ग्राहक से कोई कमीशन नहीं लिया जाता — केवल बैंक शुल्क लागू",
    home: "होम",
    about: "हमारे बारे में",
    loans: "ऋण उत्पाद",
    eligibility: "पात्रता जांच",
    documents: "दस्तावेज़",
    blog: "ब्लॉग",
    contact: "संपर्क",
    cibil_check: "CIBIL जांच",
    apply_now: "अभी आवेदन करें",
    hero_badge: "📍 लातूर, महाराष्ट्र में विश्वसनीय",
    hero_title: "लातूर में 48 घंटों में अपना ऋण स्वीकृत कराएं",
    hero_subtitle: "पूरे महाराष्ट्र में वेतन, व्यवसाय, शिक्षा, घर और मॉर्टगेज ऋण। कोई छिपा हुआ शुल्क नहीं। मुफ्त परामर्श।",
    check_eligibility: "पात्रता जांचें",
    quick_links: "त्वरित लिंक",
    all_loans: "सभी ऋण उत्पाद",
    contact_us: "हमसे संपर्क करें",
    footer_desc: "लातूर और पूरे महाराष्ट्र में असुरक्षित और सुरक्षित ऋण के लिए आपका विश्वसनीय भागीदार। 48 घंटों में ऋण स्वीकृत कराएं।",
    rights_reserved: "सर्वाधिकार सुरक्षित।"
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
