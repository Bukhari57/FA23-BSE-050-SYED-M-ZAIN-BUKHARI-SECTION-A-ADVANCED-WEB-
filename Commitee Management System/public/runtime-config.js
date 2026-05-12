(function applyRuntimeConfig() {
  window.__COMMITTEE_CONFIG__ = window.__COMMITTEE_CONFIG__ || {};

  if (!window.__COMMITTEE_CONFIG__.apiBaseUrl) {
    window.__COMMITTEE_CONFIG__.apiBaseUrl = '/api';
  }
})();
