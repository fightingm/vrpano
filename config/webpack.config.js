const path =require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');


module.exports = {
  entry: {
    index: './demo/index.js',
    backend: './demo/backend.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.glsl$/,
        use: 'webpack-glsl-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env', 'stage-0']
          }
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {root: path.resolve(__dirname, '../')}),
    new HtmlWebpackPlugin({
      template: './pages/index/index.html',
      filename: 'index.html',
      hash: true,
      chunks: ['index'],
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: './pages/backend/index.html',
      filename: 'backend.html',
      hash: true,
      chunks: ['backend'],
      inject: 'body'
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    proxy: {
      '/entry': {
        target: 'http://vr.corp.qunar.com',
        changeOrigin: true
      }
    },
    host: "localhost",
    hot: true
  },
  // mode: 'development'
  mode: 'development'
}
