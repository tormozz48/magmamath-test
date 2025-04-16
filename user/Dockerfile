FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run user:build

ENV USER_SERVICE_PORT=4000
EXPOSE ${USER_SERVICE_PORT}

# Use direct node command instead of npm script
CMD ["node", "user/dist/user/src/main.js"]
