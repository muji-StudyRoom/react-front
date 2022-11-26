FROM node:18-alpine3.15 AS build
WORKDIR /app
COPY . /app
ENV REACT_APP_BACK_BASE_URL "k8s-default-backsvc-2f8deb7e9a-95a536966cba0027.elb.ap-northeast-2.amazonaws.com:8080"
ENV REACT_APP_SIG_BASE_URL "k8s-default-sigsvc-b3e52a2381-f33b10ad52a29fe5.elb.ap-northeast-2.amazonaws.com:5000"
RUN npm install && npm run build


FROM nginx:1.21.1-alpine

RUN rm -rf /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/
COPY —from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]