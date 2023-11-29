FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN yarn install

COPY . .

RUN npx prisma generate

CMD [ "yarn", "start" ]