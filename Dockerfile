# Client
FROM node:12 AS client

# Build client
WORKDIR /client
COPY client/package*.json ./
RUN npm set progress=false && npm ci --no-cache
COPY client/. .
RUN npm run build

# Server
FROM node:12 AS server

# Run server
COPY --from=client /client/build /client/build/.
WORKDIR /server
COPY server/package*.json ./
RUN npm ci
COPY server/. .

EXPOSE 80
CMD [ "npm", "run", "start" ]
