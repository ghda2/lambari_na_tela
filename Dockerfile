# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Create uploads directory at project root
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]