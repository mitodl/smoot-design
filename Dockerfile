FROM node:20

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.7.0 --activate

COPY package.json yarn.lock .yarnrc.yml ./

COPY . .

RUN yarn install

EXPOSE 6006

CMD ["yarn", "storybook", "dev", "-p", "6006", "--no-open", "--docs"]
