FROM node:20

WORKDIR /

COPY package*.json ./
RUN npm install

COPY . .


# 🔥 GENERAR CLIENTE PRISMA
RUN npx prisma generate

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]