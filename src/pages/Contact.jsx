import LeadForm from '../components/LeadForm';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import './Contact.css';

export default function Contact() {
  return (
    <div>
      <section className="page-header">
        <div className="container">
          <span className="badge">Get in Touch</span>
          <h1>Contact Us — Get Free Loan Consultation</h1>
          <p>Fill the form and our advisor will call you back within 5 minutes during business hours</p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-container">

          {/* Lead Form */}
          <div className="contact-form-col">
            <LeadForm />
          </div>

          {/* Info */}
          <div className="contact-info-col">
            <div className="contact-info-card glass-card">
              <h3>📍 Our Office</h3>
              <div className="info-row"><MapPin size={20} /><span>Latur, Maharashtra, India<br /><small>Service Area: All Maharashtra</small></span></div>
              <div className="info-row"><Phone size={20} /><a href="tel:+917249108474">+91-7249108474</a></div>
              <div className="info-row"><Mail size={20} /><a href="mailto:sales@avaniagrofoods.com">sales@avaniagrofoods.com</a></div>
            </div>

            <div className="contact-info-card glass-card">
              <h3>⏰ Business Hours</h3>
              <div className="hours-row"><span>Monday – Saturday</span><span>9:00 AM – 7:00 PM</span></div>
              <div className="hours-row"><span>Sunday</span><span>10:00 AM – 2:00 PM</span></div>
              <div className="hours-row"><span>WhatsApp Support</span><span>24/7</span></div>
            </div>

            <a href="https://wa.me/917249108474?text=Hello! I need help with a loan application. Please connect me." target="_blank" rel="noopener noreferrer" className="wa-contact-btn">
              <MessageCircle size={24} />
              <div>
                <strong>Chat on WhatsApp</strong>
                <span>Fastest response - usually within minutes</span>
              </div>
            </a>

            <div className="contact-info-card glass-card map-embed">
              <h3>📍 Location Map</h3>
              <iframe
                title="Latur Maharashtra Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60720.49!2d76.5604!3d18.4088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcf81!2sLatur!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="200"
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
