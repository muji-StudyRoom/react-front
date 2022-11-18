FROM python:3.8.15-slim

LABEL maintainer="rhj0830@gmail.com"
# 파일 옮기기
COPY . /app/server

WORKDIR /app/server

RUN pip3 install -r requirements.txt

EXPOSE 5000
ENTRYPOINT ["python", "app.py"]
