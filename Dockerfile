FROM node:22.9-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

COPY . .

FROM node:22.9-alpine as start

WORKDIR /app

COPY --from=build /app /app

EXPOSE ${PORT}

CMD npx prisma migrate dev && npm run start:dev