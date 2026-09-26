FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Ensure data directory exists for LowDB JSON file
RUN mkdir -p data

EXPOSE 5000
CMD ["node", "server.js"]
