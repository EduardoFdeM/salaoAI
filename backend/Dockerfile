# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy all files first (instead of just package.json)
COPY . .

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# Expose port
EXPOSE 3333

# Start the app
CMD ["npm", "run", "start:prod"]