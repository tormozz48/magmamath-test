FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code for user service
RUN npm run user:build

# Use the port from environment variable with fallback
ENV USER_SERVICE_PORT=4000
EXPOSE ${USER_SERVICE_PORT}

# Command to run the application
CMD ["npm", "run", "user:start:prod"]
