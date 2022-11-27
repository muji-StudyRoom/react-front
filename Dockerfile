FROM node:18-alpine3.15
WORKDIR /app
COPY . /app
ENV REACT_APP_BACK_BASE_URL "https://back-svc:8080"
ENV REACT_APP_SIG_BASE_URL "https://eyestalk.site:5000"
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]