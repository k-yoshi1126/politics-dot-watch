FROM node:18-alpine

WORKDIR /app

# Install ts-node globally
RUN npm install -g ts-node typescript

# Copy package.json files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the frontend directory
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"] 