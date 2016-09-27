var AbstractItem = require('./AbstractItem')
var quickLoader = require('../quickLoader')

function __generateFuncName () {
  return '_jsonp' + new Date().getTime() + ~~(Math.random() * 100000000)
}

function JSONPItem (url) {
  if (!url) return
  _super.constructor.apply(this, arguments)
}

module.exports = JSONPItem
JSONPItem.type = 'jsonp'
JSONPItem.extensions = []
quickLoader.register(JSONPItem)

JSONPItem.retrieve = function (target) {
  if ((typeof target === 'string') && (target.indexOf('=') > -1)) {
    return [target]
  }
  return false
}

var _super = AbstractItem.prototype
var _p = JSONPItem.prototype = new AbstractItem()
_p.constructor = JSONPItem
_p.load = load

function load (callback) {
  _super.load.apply(this, arguments)
  var self = this
  var lastEqualIndex = this.url.lastIndexOf('=') + 1
  var urlPrefix = this.url.substr(0, lastEqualIndex)
  var funcName = this.url.substr(lastEqualIndex)
  if (funcName.length === 0) {
    funcName = __generateFuncName()
    this.jsonpCallback = callback
  } else {
    this.jsonpCallback = this.jsonpCallback || window[funcName]
  }

  window[funcName] = function (data) {
    if (script.parentNode) script.parentNode.removeChild(script)
    self.content = data
    self._onLoad()
  }
  var script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = urlPrefix + funcName
  document.getElementsByTagName('head')[0].appendChild(script)
}
