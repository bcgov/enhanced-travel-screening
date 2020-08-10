# Client
FROM node:12-alpine AS client

# Build client
RUN apk add --no-cache git python g++ make
WORKDIR /client
COPY client/package*.json ./
RUN npm set progress=false && npm ci --no-cache
COPY client/. .
RUN INLINE_RUNTIME_CHUNK=false npm run build

# Server
FROM node:12-alpine AS server

# Static env vars
ARG VERSION
ENV NODE_ENV production
ENV VERSION $VERSION

# Run server
RUN apk add --no-cache git curl
COPY --from=client /client/build /client/build/.
WORKDIR /server
COPY server/package*.json ./
RUN npm set progress=false && npm ci --no-cache
COPY server/. .

# Run app
EXPOSE 80
CMD [ "npm", "run", "start" ]
