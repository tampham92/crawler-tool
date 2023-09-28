FROM ghcr.io/puppeteer/puppeteer:21.3.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true \
    PUPPETEER_EXCUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /user/src/app

COPY package*.json ./

RUN npm ci

COPY  . .

EXPOSE 3000

CMD ["node", "app.js"]