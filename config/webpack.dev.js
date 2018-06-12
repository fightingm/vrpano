const path =require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');


module.exports = {
  entry: {
    index: './example/index',
    backend: './example/backend'
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
    new HtmlWebpackPlugin({
      template: './example/index/index.html',
      filename: 'index.html',
      chunks: ['index'],
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: './example/backend/index.html',
      filename: 'backend.html',
      chunks: ['backend'],
      inject: 'body'
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    hot: true
  },
  mode: 'development'
}
