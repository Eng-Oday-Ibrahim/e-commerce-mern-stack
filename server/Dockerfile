# ---------- BUILD STAGE ----------
# How to build the image:
# 1. Navigate to the server directory in your terminal.
# 2. Run the following command to build the Docker image:
#    docker build -t sass-store-server .

FROM node:20-alpine AS builder
WORKDIR /server

# Install dev deps and build
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /server
ENV NODE_ENV=production

# Install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files
COPY --from=builder /server/dist ./dist

EXPOSE 4000
CMD ["node", "dist/src/server.js"]
