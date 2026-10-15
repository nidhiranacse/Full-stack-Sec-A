FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN npm ci --omit=dev --workspace=server --include-workspace-root=false
COPY server ./server
RUN mkdir -p /app/data && chown -R node:node /app
ENV PORT=3000
ENV DB_PATH=/app/data/booknest.sqlite
EXPOSE 3000
USER node
CMD ["npm", "start", "--workspace", "server"]
