FROM docker.io/library/nginx:1.25-bookworm
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
RUN chmod 444 /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
