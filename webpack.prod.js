const webpack = require('webpack');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const path = require("path");

module.exports = {
  entry: './index',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.txt$/i,
        use: 'raw-loader',
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {  loader:'babel-loader' },
          {  loader:'ts-loader' }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
    ]
  },
  resolve: {
    extensions: ['.ts','.tsx','.js','.jsx'],
  },
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: 'DocxGenerator.js',
    library: "llqDocxGenerator", // Desired name for the global variable when using as a drop-in script-tag.
    libraryTarget: "umd",
    globalObject: "this"
  }, 
  optimization: {
    minimize: true,
    //https://webpack.js.org/plugins/mini-css-extract-plugin/#minimizing-for-production
    minimizer: [
       new MinifyPlugin({"mangle": true},{}), //zet "false" bij te weinig memory/timeout van build:extra-memory
    ],
  },
  plugins: [
    new FileManagerPlugin({ //https://www.npmjs.com/package/filemanager-webpack-plugin = veel opties, ook zip etc.
      onEnd: {
        copy: [
          { source: path.resolve(__dirname, "lib")+'/DocxGenerator.js', destination: path.resolve(__dirname, "lib")+'/DocxGenerator.txt' },
        ],
      }
    }),
  ],
};