FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production

COPY src/server ./src/server
COPY src/db ./src/db
COPY origin.key ./origin.key
COPY origin.pem ./origin.pem

EXPOSE 3000

CMD ["sh", "-c", "node src/server/routers.js"]