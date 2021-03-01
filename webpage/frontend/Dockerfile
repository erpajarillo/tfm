FROM node:14

COPY dist ./

RUN npm install serve -g

CMD ["serve", "-s", "."]