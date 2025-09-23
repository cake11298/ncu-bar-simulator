const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'index.js',  // 正確，輸出單一 bundle
    path: path.resolve(__dirname, 'dist'), // 建立 dist 資料夾作為最終靜態檔
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'NCU Molecular Bartending Bar Simulator',
    }),
  ],
  devServer: {
    static: './public',
    hot: true,
  },
};