// src/config/officialBusiness.js
// Single authoritative business identity configuration confirmed under DEC-003B-06 (2026-11-22)

export const OFFICIAL_BUSINESS = Object.freeze({
  name: 'AVANI LOAN SERVICES',
  displayName: 'Avani Loan Services',
  category: 'Financial Services / Loan Consultancy',
  model: 'Loan advisory and coordination',
  owner: 'Sachin Shinde',
  ownerTitle: 'Founder & Owner',
  streetAddress: 'OLD BARSHI ROAD, 5NO CHAUK, KULSWAMINI NAGAR, NEXT TO SAI SCHOOL',
  city: 'Latur',
  state: 'Maharashtra',
  country: 'India',
  pinCode: '413512',
  fullAddress: 'OLD BARSHI ROAD, 5NO CHAUK, KULSWAMINI NAGAR, NEXT TO SAI SCHOOL, LATUR – 413512, MAHARASHTRA, INDIA',
  shortAddress: 'Old Barshi Road, 5NO Chauk, Kulswamini Nagar, Next to Sai School, Latur – 413512, Maharashtra, India',
  websiteUrl: 'https://www.avanifinserv.com',
  email: 'enquiry@avanifinserv.com',
  emailHref: 'mailto:enquiry@avanifinserv.com',
  phoneDisplay: '+91 91756 35165',
  phoneE164: '+919175635165',
  telHref: 'tel:+919175635165',
  whatsappNumber: '919175635165',
  whatsappUrl: 'https://wa.me/919175635165',
  serviceArea: 'Latur & Maharashtra, India',
  hours: {
    weekdays: 'Monday – Saturday: 9:30 AM – 7:00 PM',
    sunday: 'Sunday: By Appointment'
  },
  advisoryDisclosure:
    'AVANI LOAN SERVICES operates strictly as an independent loan consultancy and advisory firm (not a bank, NBFC, or direct lender). Final loan eligibility, interest rates, fees, tenures, and sanction decisions rest exclusively with partner banks and financial institutions.',
  noAdvanceFeeNotice:
    'We do not collect advance cash deposits or upfront sanction fees into personal accounts or personal UPI IDs. Applicable lender processing charges are paid directly to the lending institution per its official fee schedule.',
  consentText:
    'I explicitly consent to AVANI LOAN SERVICES contacting me by phone, WhatsApp, or email regarding my loan advisory enquiry in accordance with the Privacy Policy.'
});

export const OFFICIAL_SERVICES_NAV = Object.freeze([
  { slug: 'personal-loan', name: 'Personal Loan' },
  { slug: 'business-loan', name: 'Business Loan' },
  { slug: 'doctor-loan', name: 'Doctor Loan' },
  { slug: 'home-loan', name: 'Home Loan' },
  { slug: 'mortgage-loan', name: 'Mortgage Loan' },
  { slug: 'education-loan-india', name: 'Education Loan — India' },
  { slug: 'education-loan-global-studies', name: 'Education Loan — Global Studies' },
  { slug: 'school-and-college-funding', name: 'School and College Funding' }
]);

export const LEGACY_SERVICE_SLUG_MAP = Object.freeze({
  'salary-loan': 'personal-loan',
  'doctor-professional-loan': 'doctor-loan',
  'chartered-accountant-loan': 'business-loan',
  'mortgage-lap': 'mortgage-loan',
  'education-loan': 'education-loan-india'
});
