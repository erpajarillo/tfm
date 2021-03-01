FROM node:14

COPY dist package.json ./

RUN npm install
RUN npm install pm2 -g

CMD ["pm2-runtime", "app.js"]