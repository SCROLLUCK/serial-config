FROM node:22.12.0 AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

FROM nginx:1.27.2

# Copia arquivos do build Vite
COPY --from=build /app/dist /var/www/html

# Copia templates e entrypoint
COPY nginx/site.conf.template /etc/nginx/conf.d/site.conf.template
COPY nginx/nginx.conf.template /etc/nginx/nginx.conf.template
COPY nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]