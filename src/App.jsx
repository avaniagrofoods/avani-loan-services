import { Routes, Route } from 'react-router-dom';
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
import './App.css';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <ErrorBoundary>
          <Routes>
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
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
      <BottomNavbar />
      <FloatingWhatsApp />
      <FloatingAIAssistant />
    </div>
  );
}
