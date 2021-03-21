# Stage 1: Compile TypeScript
FROM node:14 as ts-compiler

WORKDIR /app
COPY . .
RUN npm install && npm run build

# Stage 2: Create container
FROM node:14

COPY --from=ts-compiler /app/dist /app/package* /
RUN npm install --production pm2 -g
RUN npm install --production

CMD ["pm2-runtime", "app.js"]