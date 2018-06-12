const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    Pano: './src/entries/vrPano.js',
    Aligner: './src/entries/vrAligner.js',
    Traveller: './src/entries/vrTraveller.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'Vr[name].js',
    library: "Vr[name]",
    libraryTarget: "umd"
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
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  ],
  mode: 'production'
}
