const proxy = require('http-proxy-middleware')

module.exports = function(app) {
    app.use(
        proxy('/room', {
            target: "http://back-svc:8080", // 비즈니스 서버 URL 설정
            changeOrigin: true
        })
    );
};