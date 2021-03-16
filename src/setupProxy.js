const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://192.168.5.42:8001',
            changeOrigin: true,
        })
    );
};
