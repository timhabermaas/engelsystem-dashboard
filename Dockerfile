FROM node:22.7.0-alpine3.20
WORKDIR /usr/server/app

COPY package.json package-lock.json ./
RUN npm install
COPY ./ .
RUN npm run build
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
