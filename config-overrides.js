const CopyWebPackPlugin = require('copy-webpack-plugin');

module.exports = function override(config) {
    if (!config.plugins) {
        config.plugins = [];
    }

    let pdfjsPath = 'node_modules/pdfjs-dist/build/';
    if (process.env.USE_PDFJS_FROM_SOURCES === 'true') {
        pdfjsPath = 'pdfjs/build/generic/build/';
    }

    config.plugins.push(
        new CopyWebPackPlugin({
            patterns: [
                {
                    from: pdfjsPath + 'pdf.worker.js',
                    to: 'pdf.worker.js',
                },
                {
                    from: pdfjsPath + 'pdf.worker.js.map',
                    to: 'pdf.worker.js.map',
                },
                {
                    from: 'src/static/ABOUT.md',
                    to: 'ABOUT.md',
                },
                {
                    from: 'src/static/PRIVACY_POLICY.md',
                    to: 'PRIVACY_POLICY.md',
                },
            ],
        })
    );

    //workaround to avoid pdf.js critical dependency
    config.module.parser = { javascript: { requireEnsure: true } };

    return config;
};
