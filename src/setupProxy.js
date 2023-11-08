const { createProxyMiddleware } = require('http-proxy-middleware');

const PROXY_TARGET = process.env.REACT_APP_PROXY_TARGET || 'http://localhost';

module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: PROXY_TARGET,
            //target: 'http://192.168.5.42:8001',
            changeOrigin: true,
        })
    );
};
