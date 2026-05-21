import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import ServicesList from './pages/ServicesList';
import Service from './pages/Service';
import WhatsAppButton from './components/WhatsAppButton';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/eligibility" element={<Eligibility />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/cibil-check" element={<CibilCheck />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/services" element={<ServicesList />} />
          <Route path="/services/:slug" element={<Service />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
