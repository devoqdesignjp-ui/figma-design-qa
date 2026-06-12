const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const InlineChunksHtmlPlugin = require('react-dev-utils/InlineChunksHtmlPlugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = [
  {
    mode: isDevelopment ? 'development' : 'production',
    devtool: isDevelopment ? 'inline-source-map' : 'source-map',
    entry: {
      code: './src/code.ts',
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
  },
  {
    mode: isDevelopment ? 'development' : 'production',
    devtool: isDevelopment ? 'inline-source-map' : 'source-map',
    entry: {
      ui: './src/ui.tsx',
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    plugins: [
      new HtmlPlugin({
        template: './src/ui.html',
        filename: 'ui.html',
        chunks: ['ui'],
        cache: false,
      }),
      new InlineChunksHtmlPlugin(HtmlPlugin, [/ui/]),
    ],
  },
];
