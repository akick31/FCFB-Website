# Use a Node.js image to build and serve the React app
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Install a lightweight server for serving the build
RUN npm install -g serve

# Expose the port your app will run on
EXPOSE 462

# Command to serve the React app
CMD ["serve", "-s", "build", "-l", "462"]