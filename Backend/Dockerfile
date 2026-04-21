FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Valor solo para build (prisma.config lee DATABASE_URL); en runtime usa Compose.
ENV DATABASE_URL=postgresql://groupapp:groupapp@db:5432/groupapp

RUN npx prisma generate

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node server.js"]
