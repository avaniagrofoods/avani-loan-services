import { useEffect } from 'react';

// Use Vite env vars so the formId can be injected at build time
const portalId = import.meta.env.VITE_HUBSPOT_PORTAL_ID || '244236573';
const formId = import.meta.env.VITE_HUBSPOT_FORM_ID || 'YOURHUBSPOTFORM_ID';

export default function HubspotLeadForm() {
  useEffect(() => {
    const scriptId = 'hs-form-script';

    function createForm() {
      if (!formId || formId === 'YOURHUBSPOTFORM_ID') {
        console.warn('HubSpot formId is not set. Set VITE_HUBSPOT_FORM_ID in your .env to load the embedded form.');
        return;
      }
      if (window.hbspt && window.hbspt.forms) {
        try {
          window.hbspt.forms.create({
            region: 'na1',
            portalId,
            formId,
            target: '#hubspot-lead-form',
          });
        } catch (e) {
          console.error('Error creating HubSpot form:', e);
        }
      }
    }

    // Load HubSpot forms script once
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.src = 'https://js.hsforms.net/forms/embed/v2.js';
      script.type = 'text/javascript';
      script.async = true;
      script.id = scriptId;
      script.onload = () => {
        createForm();
      };
      document.body.appendChild(script);
    } else {
      createForm();
    }
  }, []);

  return (
    <div className="hubspot-lead-form-wrapper">
      <div id="hubspot-lead-form"></div>
      <p className="form-note">✅ 100% Free. No spam. Advisor calls in 5 minutes.</p>
    </div>
  );
}
