import {createProxyMiddleware} from 'http-proxy-middleware'

module.exports = function (app) {
    app.use(
        '/',
        createProxyMiddleware({
            target: 'http://python_chatting:5000',
            changeOrigin: true,
        })
    );
    app.use(
        '/meeting',
        createProxyMiddleware({
            target: 'http://python_chatting:5000',
            changeOrigin: true,
        })
    );
};