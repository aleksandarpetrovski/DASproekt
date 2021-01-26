FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
WORKDIR ./backend
COPY ./backend/package*.json ./
RUN npm install
WORKDIR ../
COPY . .
EXPOSE 5000
CMD [ "npm", "start" ]
