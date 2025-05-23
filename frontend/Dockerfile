FROM node:18-alpine AS builder

WORKDIR /app

# Install OpenSSL and ts-node globally
RUN apk add --no-cache openssl wget && npm install -g ts-node typescript

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Generate Prisma client and build
RUN npx prisma generate && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install OpenSSL and ts-node
RUN apk add --no-cache openssl wget && npm install -g ts-node typescript

# Copy built assets from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"] 