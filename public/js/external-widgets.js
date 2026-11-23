// public/js/external-widgets.js
// Privacy-safe optional widget loader: zero hardcoded API keys, assistant IDs, or third-party portals.
// Third-party widgets remain inactive unless explicitly configured at runtime via approved server config.
(function initExternalWidgets() {
  const cfg = (typeof window !== 'undefined' && window.__AVANI_WIDGET_CONFIG__) || null;
  if (!cfg) return;

  if (cfg.gaMeasurementId) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', cfg.gaMeasurementId);
  }
})();
