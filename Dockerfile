FROM node:24@sha256:49f7adaf9f1574bc45c20ea317139b39a59d7e758d0e93745e112fd85cb42623

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.7.0 --activate

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn install

COPY . .

EXPOSE 6006

CMD ["yarn", "start", "--no-open"]
