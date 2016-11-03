FROM gurumojo:latest

COPY package.json /opt/gurumojo

RUN npm install

COPY server.js /opt/gurumojo
COPY middleware /opt/gurumojo/middleware
COPY route /opt/gurumojo/route

CMD ["npm", "start"]
