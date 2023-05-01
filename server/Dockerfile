FROM node:16.15.1-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . . 
CMD [ "npm", "run", "start" ]