# GUI for veraPDF web application

## Dev environment

**Prerequisites**

Node (latest) + npm (latest)

**Preparation**

Install dependencies:

`npm install`

**Running in dev environment**

Runs the app in the development mode:

`npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

To execute unit tests run:

`npm test`

This will launch the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## Running in Docker

**Prerequisites**

Install Docker on your machine

**Build source and docker image**

Build production ready static content:

`npm run build`

Build docker image:

`docker image build -t verapdf-webapp-gui .`

**Run docker container**

Run image through container named `verapdf-webapp-gui--container` on port `:80` :

```
docker run -d -p 80:80 --name verapdf-webapp-gui--container --rm -d verapdf-webapp-gui
```
