# Use the official Node.js image as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json (if exists) into the container
COPY package*.json ./

# Install the project dependencies inside the container
RUN npm install

# Copy the rest of the application files into the container
COPY src/ ./src/

# Expose the port the app will run on (change this if necessary)
EXPOSE 5600

# Define the command to run the app
CMD ["node", "src/server.js"]

