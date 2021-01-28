FROM node:14.14.0-alpine

# Set working directory
WORKDIR /var/www/producer
COPY ./package.json ./
RUN npm install
COPY . .
CMD ["npm","run","start"]