#!/bin/sh
set -eu

API_BASE_URL_VALUE="${API_BASE_URL:-/api}"
ESCAPED_API_BASE_URL_VALUE=$(printf '%s' "$API_BASE_URL_VALUE" | sed 's/[\\"]/\\&/g')

cat > /usr/share/nginx/html/runtime-config.js <<EOF
(function applyRuntimeConfig() {
  window.__COMMITTEE_CONFIG__ = window.__COMMITTEE_CONFIG__ || {};
  window.__COMMITTEE_CONFIG__.apiBaseUrl = "${ESCAPED_API_BASE_URL_VALUE}";
})();
EOF

exec "$@"
