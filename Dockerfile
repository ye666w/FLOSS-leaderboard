FROM node:20-alpine AS dev

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src ./src
COPY tsconfig.json ./
COPY origin.key ./origin.key
COPY origin.pem ./origin.pem
EXPOSE 443 3000

CMD ["npx", "tsx", "watch", "src/server.ts"]

FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src ./src
COPY tsconfig.json ./
RUN npx tsc

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/dist ./dist
COPY origin.key ./origin.key
COPY origin.pem ./origin.pem

RUN npm ci --only=production
EXPOSE 443 3000

CMD ["node", "dist/server.js"]
