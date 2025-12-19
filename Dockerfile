FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production

COPY src/server ./src/server
COPY src/db ./src/db

EXPOSE 3000

CMD ["sh", "-c", "sleep 5 && node src/server/server.js"]