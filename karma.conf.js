'use strict'

/*
 * mirage
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const webpackConfig = require('./webpack.config.js')
delete webpackConfig.entry
delete webpackConfig.output

const testType = process.argv.indexOf('--local') > -1 ? 'local' : 'remote'
const browsers = testType === 'local' ? ['Chrome'] : ['PhantomJS']

module.exports = function (config) {
  config.set({
    browsers: browsers,
    frameworks: ['mocha'],
    files: ['test-loader.js'],
    preprocessors: {
      'test-loader.js': ['webpack']
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
    singleRun: true
  })
}
