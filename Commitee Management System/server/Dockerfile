FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/src ./src
COPY --from=base /app/scripts ./scripts
COPY --from=base /app/tsconfig.json ./tsconfig.json
COPY --from=base /app/.env.example ./.env.example
EXPOSE 5000
CMD ["node", "dist/index.js"]
