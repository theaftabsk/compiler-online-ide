# Dockerfile for CodeLab Fullstack
FROM node:20-alpine AS base

# Step 1: Build Backend
WORKDIR /app/backned
COPY backned/package*.json ./
RUN npm install
COPY backned ./
RUN npm run build

# Step 2: Build Frontend
WORKDIR /app/fronted
COPY fronted/package*.json ./
RUN npm install
COPY fronted ./
RUN npm run build

# Step 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache gcc g++ musl-dev python3 make

COPY --from=base /app/backned /app/backned
COPY --from=base /app/fronted /app/fronted

EXPOSE 3000 5000

CMD ["sh", "-c", "cd /app/backned && npm run start:prod & cd /app/fronted && npm start"]
