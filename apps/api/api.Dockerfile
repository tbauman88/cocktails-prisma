FROM node:lts-alpine

WORKDIR /app

ENV PORT=3333
EXPOSE ${PORT}

COPY package*.json ./
COPY .env ./

RUN npm install --production

COPY prisma ./prisma/
COPY . ./
COPY ./dist/apps/api ./dist

RUN npx prisma generate

CMD ["npm", "run", "start:migrate:prod"]

