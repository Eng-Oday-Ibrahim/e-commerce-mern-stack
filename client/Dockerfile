#--
FROM node:20-alpine AS builder
WORKDIR /client

# Install dependencies and build
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /client
ENV NODE_ENV=production

# Copy built assets and package.json, install production deps
COPY --from=builder /client/package.json ./package.json
COPY --from=builder /client/.next .next
COPY --from=builder /client/public ./public
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["npm", "start"]
