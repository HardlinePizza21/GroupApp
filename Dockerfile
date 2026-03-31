FROM node:20

WORKDIR /

COPY package*.json ./
RUN npm install

COPY . .


# 🔥 GENERAR CLIENTE PRISMA
RUN npx prisma generate

CMD ["node", "/server.js"]