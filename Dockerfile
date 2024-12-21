FROM node:22.12.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 56567
CMD [ "node", "post_service.js" ]