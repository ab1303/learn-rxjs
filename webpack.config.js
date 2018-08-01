const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    // main: './src/main.ts',
    advancedAsynchronousJS: './src/Advanced Asynchronous Javascript/Minimal Observable Implementation/index.ts',

  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js'
  },
  module: {
    rules: [
      {
        test:"/\.js$/",
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract(
          {
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader']
          })
      },
      {
        test: /\.(ts|tsx)?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      }
    ]
  },
  plugins:[
    // new ExtractTextPlugin({filename: './src/.scss/main.scss'}),
    new ExtractTextPlugin(
      {filename: './style/main.[chunkhash].css', disable: false, allChunks: true}
    ),
    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
      template: './src/Advanced Asynchronous Javascript/index.html',
      filename: 'index.html'
    })
  ],
  resolve: {
    extensions: [".ts", ".js"]
  }
};
