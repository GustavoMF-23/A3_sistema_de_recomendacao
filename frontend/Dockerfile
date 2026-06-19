# --- STAGE 1: Build a aplicação ---
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código-fonte
COPY . .

# Compilar a aplicação para produção
RUN npm run build

# --- STAGE 2: Servir com Nginx ---
FROM nginx:alpine

# Copiar os arquivos estáticos compilados para a pasta pública do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar arquivo de configuração customizado para lidar com rotas de SPA se necessário
# Embora no nosso caso seja SPA simples baseada em estados internos, 
# se usarmos roteamento no futuro isso previne erros 404.
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expor a porta 80 do container
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
