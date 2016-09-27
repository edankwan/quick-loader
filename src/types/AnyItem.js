var AbstractItem = require('./AbstractItem')
var quickLoader = require('../quickLoader')

function AnyItem (url, cfg) {
  if (!url) return
  _super.constructor.call(this, url, cfg)

  if (!this.loadFunc && console) {
    console[console.error || console.log]('require loadFunc in the config object.')
  }
}

module.exports = AnyItem
AnyItem.type = 'any'
AnyItem.extensions = []
quickLoader.register(AnyItem)

AnyItem.retrieve = function () {
  return false
}

var _super = AbstractItem.prototype
var _p = AnyItem.prototype = new AbstractItem()
_p.constructor = AnyItem

_p.load = load

function load () {
  var self = this

  this.loadFunc(this.url, function (content) {
    self.content = content
    _super._onLoad.call(self)
  }, this.loadingSignal)
}
