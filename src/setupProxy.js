const {createProxyMiddleware} = require('http-proxy-middleware')

module.exports = function(app) {
    app.use(
        createProxyMiddleware('/room', {
            target: "http://back-svc:8080", // 비즈니스 서버 URL 설정
            changeOrigin: true
        }),
        createProxyMiddleware('/room/valid/create', {
            target: "http://back-svc:8080", // 비즈니스 서버 URL 설정
            changeOrigin: true
        })
    );
};