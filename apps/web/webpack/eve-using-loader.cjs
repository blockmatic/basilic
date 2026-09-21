const evePath = `${require('node:path').sep}node_modules${require('node:path').sep}eve${require('node:path').sep}`

/** @type {import('webpack').LoaderDefinitionFunction} */
module.exports = function eveUsingLoader(source) {
  if (!this.resourcePath.includes(evePath)) return source
  return source.replaceAll(/\busing\s+/g, 'const ')
}
