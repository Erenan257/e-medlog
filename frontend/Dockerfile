# ==========================================
# FASE 1: O Construtor (Node.js)
# ==========================================
# Usamos o Node apenas temporariamente para transformar o seu código Vite num site estático.
FROM node:18-alpine as build

WORKDIR /app

# Copia os ficheiros de dependências e instala
COPY package*.json ./
RUN npm install

# Copia o resto do código do frontend
COPY . .

# Roda o comando mágico que comprime e otimiza o seu React
# Nota: Como o Nginx vai fazer o proxy da /api, podemos deixar o VITE_API_URL vazio.
ENV VITE_API_URL=""
RUN npm run build

# ==========================================
# FASE 2: O Servidor de Produção (Nginx)
# ==========================================
FROM nginx:alpine

# Apaga as configurações padrão do Nginx que vêm de fábrica
RUN rm /etc/nginx/conf.d/default.conf

# Coloca a NOSSA configuração (que acabámos de criar) no lugar
COPY nginx.conf /etc/nginx/conf.d/

# Pega apenas a pasta "dist" gerada na Fase 1 e joga para a pasta pública do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]