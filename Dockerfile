FROM node:18-bullseye

RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/

COPY package.json .
RUN npm install

COPY auth.js .
COPY posts.js .
COPY processor.js .
COPY shareddit.js .
COPY telegram.js .

# the following two steps are required to make sure puppeteer runs correctly
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

ENV TELEGRAM_TOKEN=
ENV AUTO_SCHEDULE="0 18 * * *"

CMD npm start
