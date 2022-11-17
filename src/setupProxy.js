const {createProxyMiddleware} =require('http-proxy-middleware')

const SOCKET_IP = process.env.REACT_APP_SOCKET_API_URL;
const HTTP_IP = process.env.REACT_APP_HTTP_API_URL
  //  SOCKET_SERVER


module.exports = function(app){
    app.use(
        createProxyMiddleware(
            ['/socket', '/socket.io'],
            {
                target: HTTP_IP,
                changeOrigin: true,
                ws: true,
                router: {
                    '/socket.io': SOCKET_IP
                }
            }
        )
    );
}
