var XHRItem = require('./XHRItem')
var quickLoader = require('../quickLoader')

var undef

function TextItem (url, cfg) {
  if (!url) return
    cfg.responseType = 'text'
  _super.constructor.apply(this, arguments)
}

module.exports = TextItem
TextItem.type = 'text'
TextItem.extensions = ['html', 'txt', 'svg']
quickLoader.register(TextItem)

TextItem.retrieve = function () {
  return false
}

var _super = XHRItem.prototype
var _p = TextItem.prototype = new XHRItem()
_p.constructor = TextItem
_p._onLoad = _onLoad

function _onLoad () {
  if (!this.content) {
    this.content = this.xmlhttp.responseText;
  }
  _super._onLoad.apply(this, arguments)
}
