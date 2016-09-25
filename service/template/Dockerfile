FROM gurumojo:latest

COPY package.json /opt/gurumojo

RUN npm install

COPY server.js /opt/gurumojo

CMD ["npm", "start"]
