const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: './src/index.js',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                include: path.resolve(__dirname, 'src/styles'),
                use: 'raw-loader'
            },
            {
                test: /\.css$/i,
                exclude: path.resolve(__dirname, 'src/styles'),
                use: ['style-loader', 'css-loader']
            },
        ]
    },
    devServer: {
        static: './public',
        port: 3000,
        hot: true,
    },
    devtool: 'inline-source-map',
};
