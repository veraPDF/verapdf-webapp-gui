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
                    from: 'ABOUT.md',
                    to: 'ABOUT.md',
                },
            ],
        })
    );

    //workaround to avoid pdf.js critical dependency warnings
    config.module.rules[0].parser.requireEnsure = true;

    return config;
};
