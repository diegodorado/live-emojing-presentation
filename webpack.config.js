const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs')
const exec = require('child_process').exec;
const gchelpers =  require('./src/_scripts/_modules/helpers.js')

async function getConfig() {
  const htmlList = await gchelpers.getEntries('./src/')
  const [entries, htmlPluginList] = gchelpers.getEntriesAndHTMLPlugins(htmlList)

  return {
    entry: entries,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'lib/js/[name].js'
    },

    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            output: null,
          },
          sourceMap: false
        }),
        new OptimizeCSSAssetsPlugin({})
      ]
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
            },
            'sass-loader',
          ],
        },
        { test: /(eot|woff|woff2|ttf|svg)(\?\S*)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              publicPath: '../webfonts/',
              outputPath: 'lib/webfonts/',
              emitFile: true
            }
          }
        ]
      },
      ]
    },

    resolve: {
      alias: {
        nodePath: path.join(__dirname, 'node_modules'),
        stylesPath: path.join(__dirname, 'src/_styles'),
      }
    },

    devServer: {
      contentBase: path.join(__dirname, "dist/"),
      port: 9000
    },

    plugins: [
      ...htmlPluginList,

      new webpack.ProvidePlugin({
        Reveal: 'reveal.js',
      }),

      /* Copy some needed files in hierarchy */
      new CopyWebpackPlugin([
        { context: 'src/content',
          from: '**/*',
          to: 'content/'
        }
      ]),

      new webpack.DefinePlugin({
        HIGHLIGHT_LANGUAGES: JSON.stringify(Object.assign({}, ['haskell', 'javascript', 'json']))
      }),

      new webpack.ContextReplacementPlugin(
        /highlight\.js\/lib\/languages$/,
        new RegExp(`^./(${['haskell', 'javascript', 'json'].join('|')})$`),
      ),

      new MiniCssExtractPlugin({
        filename: 'lib/css/[name].css',
      }),

    ].filter((plugin) => plugin !== false) // filter out skipped conditions
  };

}


module.exports = getConfig();
