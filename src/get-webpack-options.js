// @ts-check
const debug = require('debug')('find-webpack')
const path = require('path')
const findYarnWorkspaceRoot = require('find-yarn-workspace-root')
const mockEnv = require('mocked-env')

const tryLoadingWebpackConfig = (webpackConfigPath) => {
  debug('trying to load webpack config from %s', webpackConfigPath)
  // Do this as the first thing so that any code reading it knows the right env.
  const envName = 'development'
  // @ts-ignore
  const restoreEnv = mockEnv({
    BABEL_ENV: envName,
    NODE_ENV: envName
  })
  try {
    const webpackFactory = require(webpackConfigPath)
    const webpackOptions = webpackFactory(envName)
    debug('webpack options: %o', webpackOptions)
    return webpackOptions
  } catch (err) {
    debug('could not load react-scripts webpack')
    debug('error %s', err.message)
    restoreEnv()
  }
}

const tryReactScripts = () => {
  const webpackConfigPath = path.resolve(
    findYarnWorkspaceRoot() || process.cwd(),
    'node_modules',
    'react-scripts',
    'config',
    'webpack.config.js',
  )

  debug('path to react-scripts own webpack.config.js: %s', webpackConfigPath)
  return tryLoadingWebpackConfig(webpackConfigPath)
}

const tryEjectedReactScripts = () => {
  const webpackConfigPath = path.resolve(process.cwd(), 'config', 'webpack.config.js')
  return tryLoadingWebpackConfig(webpackConfigPath)
}

const getWebpackOptions = () => {
  let webpackOptions = tryReactScripts()
  if (webpackOptions) {
    return webpackOptions
  }
  webpackOptions = tryEjectedReactScripts()
  if (webpackOptions) {
    return webpackOptions
  }
  debug('could not find webpack options')
}

module.exports = getWebpackOptions
