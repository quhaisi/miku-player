const webpack = require('webpack');
const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: '../renderer',
  },
  plugins: [
    new webpack.ProvidePlugin({
      'window.electronAPI': [path.resolve(path.join(__dirname, '../mock/electronAPI')), 'default']
    })
  ]
});