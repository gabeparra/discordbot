# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION}

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY index.js deploy-commands.js ./
COPY src ./src
COPY commands ./commands

USER node

CMD ["node", "index.js"]
