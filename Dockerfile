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

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Run server
COPY --from=client /client/build /client/build/.
WORKDIR /server

COPY server/package*.json ./
RUN npm set progress=false && npm ci --no-cache
COPY server/. .

EXPOSE 80
CMD [ "npm", "run", "start" ]
