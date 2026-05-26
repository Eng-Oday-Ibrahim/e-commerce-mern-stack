FROM node:20-alpine AS builder

WORKDIR /client

# env لازم يكون صحيح للسيرفر داخل docker network
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51TT2FCKC3m0tIJfCwcGFCLcKtox0tyWMCoOFrqHP>
ENV NEXT_PUBLIC_MAIN_DOMAIN=sudanista.net
ENV NEXT_PUBLIC_API_URL=http://sudanista-server:4000

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /client
ENV NODE_ENV=production

COPY --from=builder /client/package.json ./
COPY --from=builder /client/package-lock.json ./
COPY --from=builder /client/.next ./.next
COPY --from=builder /client/public ./public
COPY --from=builder /client/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]