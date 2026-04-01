FROM node:20-alpine

WORKDIR /app

COPY package*.json yarn.lock .yarnrc.yml* ./
RUN corepack enable && yarn install --immutable

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]