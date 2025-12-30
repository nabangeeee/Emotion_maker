const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules\/(?!(react-native|@react-native|react-native-.*|@react-navigation|react-native-progress|react-native-svg)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['last 2 versions']
                },
                modules: false
              }],
              '@babel/preset-react',
            ],
            plugins: [
              [
                'module-resolver',
                {
                  root: ['./src'],
                  extensions: ['.web.js', '.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
                  alias: {
                    '@': './src',
                  },
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx', '.json'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native/Libraries/Image/AssetRegistry': 'react-native-web/dist/modules/AssetRegistry',
      'react-native/Libraries/Image/resolveAssetSource': 'react-native-web/dist/modules/resolveAssetSource',
    },
    fallback: {
      'fs': false,
      'path': false,
      'crypto': false,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8080,
    host: 'localhost',
    hot: true,
    historyApiFallback: true,
  },
};

