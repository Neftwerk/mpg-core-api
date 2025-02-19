FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN apk --no-cache add curl

RUN npm ci

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
