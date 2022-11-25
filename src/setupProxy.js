const proxy = require('http-proxy-middleware')

module.exports = function(app) {
    app.use(
        proxy('/room', {
            target: "https://www.naver.com", // 비즈니스 서버 URL 설정
            changeOrigin: true
        })
    );
};