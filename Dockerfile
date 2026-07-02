FROM node:20-alpine

WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose port for dev server
EXPOSE 5173

# Default to dev server (can be overridden)
CMD ["npm", "run", "dev", "--", "--host"]
