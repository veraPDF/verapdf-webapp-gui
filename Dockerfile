FROM nginx
LABEL name="verapdf-webapp-gui"
COPY ./landing /usr/share/nginx/html

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our config file
COPY nginx-local-site.conf /etc/nginx/conf.d/default.conf

# Copy project files
COPY ./landing /usr/share/nginx/html
COPY ./build /usr/share/nginx/html/demo
