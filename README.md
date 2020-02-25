# verapdf-webapp-gui
Front end GUI for veraPDF web application

## How to build docker image
<i>Install Docker on your machine</i>
### Build image based on Dockerfile with name 'verapdf-webapp-gui'
<code>docker image build -t verapdf-webapp-gui .</code>

### Run image through container named 'verapdf-webapp-gui--container' on port :80
<code>docker run -d -p 80:80 --name verapdf-webapp-gui--container --rm -d verapdf-webapp-gui</code>