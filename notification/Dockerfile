FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run notification:build

ENV NOTIFICATION_SERVICE_PORT=4001
EXPOSE ${NOTIFICATION_SERVICE_PORT}

# Use direct node command instead of npm script
CMD ["node", "notification/dist/notification/src/main.js"]
