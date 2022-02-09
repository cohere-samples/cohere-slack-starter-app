FROM node:17
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install --production
COPY *.js ./
COPY ./bin/ ./bin
COPY ./plugins/ ./plugins
CMD [ "yarn", "serve" ]
