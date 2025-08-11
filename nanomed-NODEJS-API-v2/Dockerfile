FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY yarn.lock ./

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 8080

# Comando para ejecutar la aplicación
CMD ["yarn", "start"]
