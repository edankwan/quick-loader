var AbstractItem = require('./AbstractItem')
var quickLoader = require('../quickLoader')

var undef

function VideoItem (url, cfg) {
  if (!url) {
    return
  }
  this.loadThrough = !cfg || cfg.loadThrough === undef ? true : cfg.loadThrough
  _super.constructor.apply(this, arguments)
  try {
    this.content = new Video()
  } catch (e) {
    this.content = document.createElement('video')
  }
  if (this.crossOrigin) {
    this.content.crossOrigin = this.crossOrigin
  }
}

module.exports = VideoItem
VideoItem.type = 'video'
VideoItem.extensions = ['mp4', 'webm', 'ogv']
quickLoader.register(VideoItem)

VideoItem.retrieve = function (target) {
  // TODO add dom videos support
  return false
}

var _super = AbstractItem.prototype
var _p = VideoItem.prototype = new AbstractItem()
_p.constructor = VideoItem
_p.load = load
_p._onLoad = _onLoad

function load () {
  _super.load.apply(this, arguments)
  var video = this.content
  video.preload = 'auto'
  video.src = this.url
  if (this.loadThrough) {
    video.addEventListener('canplaythrough', this.boundOnLoad, false)
  } else {
    video.addEventListener('canplay', this.boundOnLoad, false)
  }
  video.load()
}

function _onLoad () {
  this.content.removeEventListener('canplaythrough', this.boundOnLoad)
  this.content.removeEventListener('canplay', this.boundOnLoad)
  if (this.isLoaded) {
    return
  }
  _super._onLoad.call(this)
}
