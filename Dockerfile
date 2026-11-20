FROM node:24@sha256:9d266751ca3d7fdbe651c878ffd5ad0a42fed49a18c283509267c97f025b7496

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.7.0 --activate

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn install

COPY . .

EXPOSE 6006

CMD ["yarn", "start", "--no-open"]
