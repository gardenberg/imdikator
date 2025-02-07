import less from 'less'
import path from 'path'
import fs from 'fs'
import config from '../config'
import readdir from 'fs-readdir-recursive'
import CombinedStream from 'combined-stream'

const imdiStylesRoot = path.dirname(require.resolve('imdi-styles'))

const development = config.env === 'development'

const stylesRelPath = './Styles/global'

const imdiStylesImports = readdir(path.join(imdiStylesRoot, stylesRelPath))
  .map(file => `@import "${path.join('imdi-styles', stylesRelPath, file)}";`)

export default {
  '/build/stylesheets/main.css'() {

    return Promise.resolve(
      imdiStylesImports
        .concat(`@import "./stylesheets/bundles/main.less";`)
        .join('\n')
      )
      .then(buffer => {
        return less.render(buffer, {
          outFile: '/stylesheets/main.css',
          paths: [path.join(__dirname, '../node_modules')],
          sourceMap: development ? {sourceMapFileInline: true} : false,
          compress: !development
        })
      })
      .then(output => output.css)
  },
  '/build/stylesheets/docsite.css'() {
    return Promise.resolve(
      imdiStylesImports
        .concat(`@import "./stylesheets/bundles/docsite.less";`)
        .join('\n')
      )
      .then(buffer => {
        return less.render(buffer, {
          outFile: '/stylesheets/docsite.css',
          paths: [path.join(__dirname, '../node_modules')],
          sourceMap: development ? {sourceMapFileInline: true} : false,
          compress: !development
        })
      })
      .then(output => output.css)
  },
  '/build/stylesheets/codemirror.css'() {
    const combinedStream = CombinedStream.create()
    combinedStream.append(fs.createReadStream(require.resolve('codemirror/lib/codemirror.css')))
    combinedStream.append(fs.createReadStream(require.resolve('codemirror/theme/solarized.css')))
    return combinedStream
  }
}
