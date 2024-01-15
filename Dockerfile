FROM nginx
LABEL name="verapdf-webapp-gui"
ARG profile

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our config file
COPY ./.docker/nginx/conf.d/${profile}.conf /etc/nginx/conf.d/default.conf

# Copy project files
COPY ./landing /usr/share/nginx/html
COPY ./build /usr/share/nginx/html/validate
