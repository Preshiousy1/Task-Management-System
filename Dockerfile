# Base image
FROM node:19.2.0 as builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN rm -Rf node_modules
RUN rm -Rf dist
RUN rm -f package-lock.json
RUN rm -f tsconfig.build.tsbuildinfo
RUN npm cache clean --force

# # Install the dependencies required to build the application.
RUN npm install -g typescript @nestjs/cli
RUN npm install --legacy-peer-deps
# Install app dependencies
# RUN npm install

# Bundle app source
COPY ./ ./

# Creates a "dist" folder with the production build
RUN npm run build


# Uninstall the dependencies not required to run the built application.
# RUN npm prune --production

# Initiate a new container to run the application in.
FROM node:19.2.0

ENV NODE_ENV=production
WORKDIR /app

# Copy everything required to run the built application into the new container.
COPY --from=builder /app/ ./

# Expose the web server's port.
EXPOSE 3000

# CMD ["node", "dist/main"]
# Start the server using the production build
CMD [ "bash", "serve.sh" ]
