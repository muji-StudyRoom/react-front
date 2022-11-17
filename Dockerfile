FROM node:18-alpine3.15 AS build
WORKDIR /app
COPY . /app
ENV REACT_APP_HTTP_API_URL "https://python_chatting:5000"
RUN npm install && npm run build


FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
