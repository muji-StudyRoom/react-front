const {createProxyMiddleware} = require('http-proxy-middleware')

module.exports = function(app) {
    app.use(
        createProxyMiddleware('/room', {
            target: "http://back-svc", // 비즈니스 서버 URL 설정
            changeOrigin: true
        })
    );
};