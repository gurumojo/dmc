FROM node:slim

MAINTAINER theguy@gurumojo.net

ENV TERM=linux GURUMOJO=development

WORKDIR /opt/gurumojo

COPY package.json /opt/gurumojo

RUN npm install

COPY server.js /opt/gurumojo

EXPOSE 8000

CMD ["npm", "start"]
