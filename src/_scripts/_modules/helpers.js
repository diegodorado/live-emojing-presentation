const fs = require('fs')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// List all the html files to use as entries
exports.getEntries = function(path) {
  return fs.readdirSync(path)
    .filter(file => file.match(/.*\.html$/))
    .map(file => {
      return {
        name: file.substring(0, file.length - 5),
        path: file
      }
    }).reduce((memo, file) => {
      memo[file.name] = file.path
      return memo
    }, {})
}

exports.getEntriesAndHTMLPlugins = function (htmlFiles) {
  let htmlPluginList = []
  let entries = {'app': './src/_scripts/index.js'}

  Object.entries(htmlFiles).forEach(([name, path]) => {
    htmlPluginList.push(
      new HtmlWebpackPlugin({
        title: name,
        template: `./src/${path}`,
        filename: `./${path}`,
        chunks: ['app'],
      })
    )
  })
  return [entries, htmlPluginList]
}
