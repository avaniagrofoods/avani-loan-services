import { useEffect } from 'react';

const portalId = '244236573';
const formId = 'edde042c-3451-420a-a472-6a5c42cbdf98';

export default function HubspotLeadForm() {
  useEffect(() => {
    const renderForm = () => {
      if (window.hbspt && window.hbspt.forms) {
        window.hbspt.forms.create({
          region: 'na2',
          portalId: portalId,
          formId: formId,
          target: '#hubspot-lead-form'
        });
      } else {
        setTimeout(renderForm, 500);
      }
    };
    renderForm();
  }, []);

  return (
    <div className="hubspot-lead-form-wrapper" style={{ minHeight: '500px', background: '#f9fafb', padding: '24px', borderRadius: '12px' }}>
      <div id="hubspot-lead-form"></div>
      <p className="form-note">✅ 100% Free Consultation. No spam. Advisor calls in 5 minutes.</p>
    </div>
  );
}
