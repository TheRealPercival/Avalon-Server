# syntax=docker/dockerfile:1
FROM node:alpine
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "start"]
