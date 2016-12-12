var AbstractItem = require('./AbstractItem')
var computedStyle = require('computed-style')
var quickLoader = require('../quickLoader')

function ImageItem (url, cfg) {
  if (!url) return
  _super.constructor.apply(this, arguments)
  this.content = new Image()
  if (this.crossOrigin) {
    this.content.crossOrigin = this.crossOrigin
  }
}

module.exports = ImageItem
var _super = AbstractItem.prototype
var _p = ImageItem.prototype = new AbstractItem()
_p.constructor = ImageItem
_p.load = load
_p._onLoad = _onLoad

ImageItem.retrieve = function (target) {
  if (target.nodeType && target.style) {
    var list = []

    if ((target.nodeName.toLowerCase() === 'img') && (target.src.indexOf(';') < 0)) {
      list.push(target.src)
    }

    computedStyle(target, 'background-image').replace(/s?url\(\s*?['"]?([^;]*?)['"]?\s*?\)/g, function (a, b) {
      list.push(b)
    })

    var i = list.length
    while (i--) {
      if (!_isNotData(list[i])) {
        list.splice(i, 1)
      }
    }
    return list.length ? list : false
  } else if (typeof target === 'string') {
    return [target]
  } else {
    return false
  }
}

ImageItem.type = 'image'
ImageItem.extensions = ['jpg', 'gif', 'png']
quickLoader.register(ImageItem)

function load () {
  _super.load.apply(this, arguments)
  var img = this.content
  img.onload = this.boundOnLoad
  img.src = this.url
}

function _onLoad () {
  delete this.content.onload
  this.width = this.content.width
  this.height = this.content.height
  _super._onLoad.call(this)
}

function _isNotData (url) {
  return url.indexOf('data:') !== 0
}
