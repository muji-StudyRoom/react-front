FROM node:18-alpine3.15 AS build
WORKDIR /app
COPY . /app
ENV REACT_APP_HTTP_API_URL "https://192.168.5.204:30000"
RUN npm install && npm run build


FROM nginx:1.21.1-alpine

COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
