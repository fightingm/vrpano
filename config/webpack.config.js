const path =require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const Webpack = require('webpack');


module.exports = {
  entry: {
    aligner: './src/entries/vrAligner.js',
    traveller: './src/entries/vrTraveller.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].[hash].js'
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
      chunks: ['traveller'],
      inject: 'head'
    }),
    new HtmlWebpackPlugin({
      template: './pages/backend/index.html',
      filename: 'backend.html',
      hash: true,
      chunks: ['aligner'],
      inject: 'head'
    })
  ],
  devServer: {
    proxy: {
      '/entry': {
        target: 'http://vr.corp.qunar.com',
        changeOrigin: true
      }
    },
    host: "100.80.168.132"
  },
  // mode: 'development'
  mode: 'development'
}
