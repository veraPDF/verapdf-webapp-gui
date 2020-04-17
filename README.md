# GUI for veraPDF web application

## Cloning sources

GUI repository uses submodule with server code.

To initiate and update submodule use:

`git submodule update --init`

If you pass `--recurse-submodules` to the `git clone` command, it will automatically initialize and update each submodule in the repository.

If you run `git submodule update --remote`, Git will go into your submodules and fetch and update for you.

## Dev environment

**Prerequisites**

Node (latest) + npm (latest)

**Preparation**

Install dependencies:

`npm install`

Build backend services and run them in docker as described in server's [README](./server/README.md), 
section **Running in docker**.

**Running dev server**

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

**Build sources**

Build backend services:
```
cd ./server
mvn clean install
```

Build production ready static content:

```
npm install
npm run build
```

**Run service stack**

Run stack on a local machine:
```
cd server/.docker/
docker-compose -f docker-compose.yml -f ../../.docker/docker-compose.staging.yml up -d --build
```
In this case default values for environment variables will be used which are defined in `server/.docker/.env` file.

## Wiki

If you want to setup a server serving the application you can use utility scripts. For the reference on available scripts please consult with [Scripts reference](https://github.com/veraPDF/verapdf-webapp-gui/wiki/Scripts-reference).

We have certain code convensions for GUI development which are described at [Code conventions](https://github.com/veraPDF/verapdf-webapp-gui/wiki/Code-conventions) wiki page.
