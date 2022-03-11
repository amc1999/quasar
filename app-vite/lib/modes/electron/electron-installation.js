const fs = require('fs')
const fse = require('fs-extra')

const appPaths = require('../../app-paths')
const { log, warn } = require('../../helpers/logger')
const nodePackager = require('../../helpers/node-packager')
const { bundlerIsInstalled } = require('./bundler')

const electronDeps = {
  'electron': 'latest'
}

function isInstalled () {
  return fs.existsSync(appPaths.electronDir)
}

function add (silent) {
  if (isInstalled()) {
    if (silent !== true) {
      warn('Electron support detected already. Aborting.')
    }
    return
  }

  nodePackager.installPackage(
    Object.entries(electronDeps).map(([name, version]) => `${name}@${version}`),
    { isDev: true, displayName: 'Electron dependencies' }
  )

  log('Creating Electron source folder...')
  fse.copySync(
    appPaths.resolve.cli('templates/electron'),
    appPaths.electronDir
  )

  log('Electron support was added')
}

function remove () {
  if (!isInstalled()) {
    warn('No Electron support detected. Aborting.')
    return
  }

  log(`Removing Electron source folder`)
  fse.removeSync(appPaths.electronDir)

  const deps = Object.keys(electronDeps)

  ;['packager', 'builder'].forEach(bundlerName => {
    if (bundlerIsInstalled(bundlerName)) {
      deps.push(`electron-${bundlerName}`)
    }
  })

  nodePackager.uninstallPackage(deps, { displayName: 'Electron dependencies' })

  log('Electron support was removed')
}

module.exports = {
  isInstalled,
  add,
  remove
}
