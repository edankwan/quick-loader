var AbstractItem = require('./AbstractItem')
var quickLoader = require('../quickLoader')

var undef

function AudioItem (url, cfg) {
  if (!url) return
  this.loadThrough = !cfg || cfg.loadThrough === undef ? true : cfg.loadThrough
  _super.constructor.apply(this, arguments)
  try {
    this.content = new Audio()
  } catch (e) {
    this.content = document.createElement('audio')
  }
  if (this.crossOrigin) {
    this.content.crossOrigin = this.crossOrigin
  }
}

module.exports = AudioItem
AudioItem.type = 'audio'
AudioItem.extensions = ['mp3', 'ogg']
quickLoader.register(AudioItem)

AudioItem.retrieve = function (target) {
  // TODO add dom audios support
  return false
}

var _super = AbstractItem.prototype
var _p = AudioItem.prototype = new AbstractItem()
_p.constructor = AudioItem
_p.load = load
_p._onLoad = _onLoad

function load () {
  _super.load.apply(this, arguments)
  var self = this
  var audio = self.content
  audio.src = this.url
  if (this.loadThrough) {
    audio.addEventListener('canplaythrough', this.boundOnLoad, false)
  } else {
    audio.addEventListener('canplay', this.boundOnLoad, false)
  }
  audio.load()
}

function _onLoad () {
  this.content.removeEventListener('canplaythrough', this.boundOnLoad, false)
  this.content.removeEventListener('canplay', this.boundOnLoad, false)
  if (this.isLoaded) {
    return
  }
  _super._onLoad.call(this)
}
