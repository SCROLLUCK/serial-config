#!/bin/sh

HOST_IP=${HOST_IP:-localhost}

envsubst '${HOST_IP}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
envsubst '${HOST_IP}' < /etc/nginx/conf.d/site.conf.template > /etc/nginx/conf.d/site.conf


cat > /var/www/html/env.js <<EOF
window.__ENV__ = {
  VITE_API_URL: "${VITE_API_URL:-'VITE_API_URL'}",
};
EOF

exec nginx -g "daemon off;"