FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN apk --no-cache add curl

RUN npm ci

RUN npm run build

RUN npm run prestart:prod

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
