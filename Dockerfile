FROM node:18-alpine3.15 AS build
WORKDIR /app
COPY . /app
ENV REACT_APP_BACK_URL "https://192.168.5.204:30000"
RUN npm install && npm run build


FROM nginx:1.21.1-alpine

RUN rm -rf /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
