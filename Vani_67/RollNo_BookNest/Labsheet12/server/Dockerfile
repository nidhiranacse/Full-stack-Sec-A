FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
COPY queries.sql ./
RUN mkdir -p /app/data && chown -R node:node /app
USER node
ENV PORT=4000
ENV DB_PATH=/app/data/booknest.sqlite
EXPOSE 4000
CMD ["node","src/index.js"]
