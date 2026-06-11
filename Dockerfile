FROM node:26.3.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

RUN npm prune --omit=dev

EXPOSE 3000

CMD ["node", "dist/server.js"]