#!/bin/sh
sed -i "s|\$VITE_API_URL|${CORE_URL}|g" /usr/share/nginx/html/index.html
exec "$@"