# Battery Passport REST APIs to connect with backend 
Wrapper for other service

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod

# Open in web browser
http://localhost:3000/
```

## Run docker 

```bash
# know your path
$ pwd

# build docker image
$ docker buildx build --target=debug --compress --secret id=npmrc,src=/Users/manjiiri/.npmrc -t zirkel-kafka-adapter:0.0.1-debug .

# docker run
$ docker run --rm -it --name kafka-client -p 3000:3000 zirkel-dip-wrapper:0.0.1-debug

# Open new command prompt and run
$ docker ps

# Test your application which is running inside docker
$ curl http://localhost:3000
