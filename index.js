'use strict'

var toHast = require('mdast-util-to-hast')
var toHtml = require('hast-util-to-html')
var sanitize = require('hast-util-sanitize')

module.exports = plugin

function plugin(options) {
  var settings = options || {}
  var clean = settings.sanitize
  var schema = clean && typeof clean === 'object' ? clean : null
  var handlers = settings.handlers || {}

  this.Compiler = compiler

  function compiler(node, file) {
    var root = node && node.type && node.type === 'root'
    var hast = toHast(node, {allowDangerousHtml: !clean, handlers: handlers})
    var result

    if (file.extname) {
      file.extname = '.html'
    }

    if (clean) {
      hast = sanitize(hast, schema)
    }

    result = toHtml(
      hast,
      Object.assign({}, settings, {allowDangerousHtml: !clean})
    )

    // Add an eof eol.
    if (root && result && /[^\r\n]/.test(result.charAt(result.length - 1))) {
      result += '\n'
    }

    return result
  }
}
