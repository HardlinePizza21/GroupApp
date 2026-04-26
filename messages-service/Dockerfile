# Imagen base ligera
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto interno (no el del host)
EXPOSE 3004

# Comando de arranque
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
