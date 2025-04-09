FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code for notification service
RUN npm run notification:build

# Use the port from environment variable with fallback
ENV NOTIFICATION_SERVICE_PORT=4001
EXPOSE ${NOTIFICATION_SERVICE_PORT}

# Command to run the notification service
CMD ["npm", "run", "notification:start:prod"]
