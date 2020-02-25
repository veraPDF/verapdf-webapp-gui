FROM nginx
LABEL name="verapdf-webapp-gui"
COPY ./landing /usr/share/nginx/html