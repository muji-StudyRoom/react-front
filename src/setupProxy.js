const {createProxyMiddleware} = require('http-proxy-middleware');
const BACK = process.env.REACT_APP_BACK_BASE_URL;
const SOCKET = process.env.REACT_APP_SIG_BASE_URL;
module.exports = function(app) {
    app.use(
        createProxyMiddleware('/room', {
            target: BACK, // 비즈니스 서버 URL 설정
            changeOrigin: true
        }),
        createProxyMiddleware('/room/valid/create', {
            target: BACK, // 비즈니스 서버 URL 설정
            changeOrigin: true
        }),
        createProxyMiddleware('/room/valid/create', {
            target: SOCKET, // 비즈니스 서버 URL 설정
            changeOrigin: true
        })
    );
};