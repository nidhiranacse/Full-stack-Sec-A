FROM node:20-alpine

WORKDIR /app

# Install dependencies first for Docker caching
COPY package*.json ./
RUN npm install --production

# Copy application source code
COPY . .

# Expose server port
EXPOSE 5000

# Environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Start command
CMD ["node", "src/server.js"]
