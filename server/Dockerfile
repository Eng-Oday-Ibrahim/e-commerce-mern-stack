FROM node:20-alpine AS builder

WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm ci

# copy source
COPY tsconfig.json ./
COPY src ./src

# build
RUN npm run build


FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# copy build
COPY --from=builder /app/dist ./dist

# if you have uploads or config files
# COPY --from=builder /app/public ./public

EXPOSE 4000

CMD ["node", "dist/server.js"]