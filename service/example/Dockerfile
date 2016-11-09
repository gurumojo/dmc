FROM gurumojo:development

COPY package.json /opt/gurumojo/
COPY server.js /opt/gurumojo/

COPY node_modules /opt/gurumojo/node_modules
COPY middleware /opt/gurumojo/middleware
COPY route /opt/gurumojo/route

CMD ["npm", "start"]
