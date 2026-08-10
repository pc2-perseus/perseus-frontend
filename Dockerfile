FROM docker.io/library/nginx:1.31.3-trixie

COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

RUN chmod 444 /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
