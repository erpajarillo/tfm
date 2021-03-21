# Stage 1: Compile TypeScript
FROM node:14 as vue-compiler

WORKDIR /app
COPY . .
RUN npm install && npm run build

# Stage 2: Create container
FROM node:14

COPY --from=vue-compiler /app/dist /
RUN npm install serve -g

CMD ["serve", "-s", "."]