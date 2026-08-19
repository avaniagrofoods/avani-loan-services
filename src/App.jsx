import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNavbar from './components/BottomNavbar';
import Home from './pages/Home';
import About from './pages/About';
import Loans from './pages/Loans';
import Eligibility from './pages/Eligibility';
import Documents from './pages/Documents';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Blog from './pages/Blog';
import CibilCheck from './pages/CibilCheck';
import AIAssistant from './pages/AIAssistant';
import AdminDashboard from './pages/AdminDashboard';
import AdminEligibility from './pages/AdminEligibility';
import DocumentPortal from './pages/DocumentPortal';
import PasswordGate from './components/PasswordGate';
import ServicesList from './pages/ServicesList';
import Service from './pages/Service';
import Catalog from './pages/Catalog';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import FloatingAIAssistant from './components/FloatingAIAssistant';
import ErrorBoundary from './components/ErrorBoundary';

// ── Financial Calculator Suite (Isolated & Password-Protected) ──
import { CalculatorAuthProvider } from './calculators/auth/CalculatorAuthContext';
import CalculatorProtectedRoute from './calculators/auth/CalculatorProtectedRoute';
import CalculatorLogin from './calculators/pages/CalculatorLogin';
import CalculatorDashboard from './calculators/pages/CalculatorDashboard';

// Loan Calculators
import EmiCalculatorPage from './calculators/pages/loan/EmiCalculatorPage';
import FoirEligibilityPage from './calculators/pages/loan/FoirEligibilityPage';
import MultiplierEligibilityPage from './calculators/pages/loan/MultiplierEligibilityPage';
import OutstandingLoanPage from './calculators/pages/loan/OutstandingLoanPage';
import ForeclosurePage from './calculators/pages/loan/ForeclosurePage';
import OverdraftPage from './calculators/pages/loan/OverdraftPage';
import LoanComparisonPage from './calculators/pages/loan/LoanComparisonPage';
import PrepaymentPage from './calculators/pages/loan/PrepaymentPage';
import RateChangePage from './calculators/pages/loan/RateChangePage';
import GstOnInterestPage from './calculators/pages/loan/GstOnInterestPage';

// Investment Calculators
import FdCalculatorPage from './calculators/pages/investment/FdCalculatorPage';
import RdCalculatorPage from './calculators/pages/investment/RdCalculatorPage';
import SipCalculatorPage from './calculators/pages/investment/SipCalculatorPage';
import InterestCalculatorPage from './calculators/pages/investment/InterestCalculatorPage';
import PpfCalculatorPage from './calculators/pages/investment/PpfCalculatorPage';

// Other Financial Tools
import GstCalculatorPage from './calculators/pages/other/GstCalculatorPage';
import ProfitLossPage from './calculators/pages/other/ProfitLossPage';
import DiscountPage from './calculators/pages/other/DiscountPage';
import CashCounterPage from './calculators/pages/other/CashCounterPage';
import AmountToWordsPage from './calculators/pages/other/AmountToWordsPage';

import './App.css';

export default function App() {
  return (
    <CalculatorAuthProvider>
      <div className="app">
        <Navbar />
        <main>
          <ErrorBoundary>
            <Routes>
              {/* Existing Unchanged Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/eligibility" element={<PasswordGate pageTitle="AI Loan Eligibility Engine"><Eligibility /></PasswordGate>} />
              <Route path="/documents" element={<PasswordGate pageTitle="Document Vault & Calculator"><Documents /></PasswordGate>} />
              <Route path="/loan-documents/:token" element={<DocumentPortal />} />
              <Route path="/cibil-check" element={<CibilCheck />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/services" element={<ServicesList />} />
              <Route path="/services/:slug" element={<Service />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/admin" element={<PasswordGate pageTitle="Executive Operations Dashboard"><AdminDashboard /></PasswordGate>} />
              <Route path="/admin-eligibility" element={<PasswordGate pageTitle="Eligibility Admin Panel"><AdminEligibility /></PasswordGate>} />
              <Route path="/catalog" element={<Catalog />} />

              {/* ── Financial Calculator Suite Routes ── */}
              <Route path="/calculators/login" element={<CalculatorLogin />} />
              <Route
                path="/calculators"
                element={
                  <CalculatorProtectedRoute>
                    <CalculatorDashboard />
                  </CalculatorProtectedRoute>
                }
              />

              {/* Loan Calculators */}
              <Route path="/calculators/loan/emi" element={<CalculatorProtectedRoute><EmiCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/foir-eligibility" element={<CalculatorProtectedRoute><FoirEligibilityPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/multiplier-eligibility" element={<CalculatorProtectedRoute><MultiplierEligibilityPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/outstanding" element={<CalculatorProtectedRoute><OutstandingLoanPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/foreclosure" element={<CalculatorProtectedRoute><ForeclosurePage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/overdraft" element={<CalculatorProtectedRoute><OverdraftPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/comparison" element={<CalculatorProtectedRoute><LoanComparisonPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/prepayment" element={<CalculatorProtectedRoute><PrepaymentPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/rate-change" element={<CalculatorProtectedRoute><RateChangePage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/loan/gst-interest" element={<CalculatorProtectedRoute><GstOnInterestPage /></CalculatorProtectedRoute>} />

              {/* Investment Calculators */}
              <Route path="/calculators/investment/fd" element={<CalculatorProtectedRoute><FdCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/investment/rd" element={<CalculatorProtectedRoute><RdCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/investment/sip" element={<CalculatorProtectedRoute><SipCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/investment/interest" element={<CalculatorProtectedRoute><InterestCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/investment/ppf" element={<CalculatorProtectedRoute><PpfCalculatorPage /></CalculatorProtectedRoute>} />

              {/* Other Financial Tools */}
              <Route path="/calculators/other/gst" element={<CalculatorProtectedRoute><GstCalculatorPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/other/profit-margin" element={<CalculatorProtectedRoute><ProfitLossPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/other/discount" element={<CalculatorProtectedRoute><DiscountPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/other/cash-counter" element={<CalculatorProtectedRoute><CashCounterPage /></CalculatorProtectedRoute>} />
              <Route path="/calculators/other/amount-to-words" element={<CalculatorProtectedRoute><AmountToWordsPage /></CalculatorProtectedRoute>} />

              {/* Calculator Suite Fallback */}
              <Route path="/calculators/*" element={<Navigate to="/calculators" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
        <BottomNavbar />
        <FloatingWhatsApp />
        <FloatingAIAssistant />
      </div>
    </CalculatorAuthProvider>
  );
}
