var MinSignal = require('min-signal')
var quickLoader = require('../quickLoader')

function AbstractItem (url, cfg) {
  if (!url) return
  this.url = url
  this.loadedWeight = 0
  this.weight = 1
  this.postPercent = 0
  for (var id in cfg) {
    this[id] = cfg[id]
  }

  if (!this.type) {
    this.type = this.constructor.type
  }

  if (this.hasLoading) {
    this.loadingSignal = new MinSignal()
    this.loadingSignal.add(_onLoading, this)
    if (this.onLoading) {
      this.loadingSignal.add(this.onLoading)
    }
  }

  if (this.onPost) {
    this.onPostLoadingSignal = new MinSignal()
    this.onPostLoadingSignal.add(this._onPostLoading, this)
    this.postWeightRatio = this.postWeightRatio || 0.1
  } else {
    this.postWeightRatio = 0
  }

  var self = this
  this.boundOnLoad = function () {
    self._onLoad()
  }
  this.onLoaded = new MinSignal()

  quickLoader.addedItems[url] = this
}

module.exports = AbstractItem
var _p = AbstractItem.prototype
_p.load = load
_p._onLoad = _onLoad
_p._onLoading = _onLoading
_p._onPostLoading = _onPostLoading
_p._onLoadComplete = _onLoadComplete
_p.getCombinedPercent = getCombinedPercent
_p.dispatch = dispatch

AbstractItem.extensions = []

AbstractItem.retrieve = function () {
  return false
}

function load () {
  this.isStartLoaded = true
}

function _onLoad () {
  if (this.onPost) {
    this.onPost.call(this, this.content, this.onPostLoadingSignal)
  } else {
    this._onLoadComplete()
  }
}

function _onPostLoading (percent) {
  this.postPercent = percent
  if (this.hasLoading) {
    this.loadingSignal.dispatch(1)
  }
  if (percent === 1) {
    this._onLoadComplete()
  }
}

function _onLoadComplete () {
  this.isLoaded = true
  this.loadedWeight = this.weight
  quickLoader.loadedItems[this.url] = this
  this.onLoaded.dispatch(this.content)
}

function getCombinedPercent (percent) {
  return percent * (1 - this.postWeightRatio) + (this.postWeightRatio * this.postPercent)
}

function _onLoading (percent) {
  this.loadedWeight = this.weight * this.getCombinedPercent(percent)
}

function dispatch () {
  if (this.hasLoading) {
    this.loadingSignal.remove()
  }
  this.onLoaded.dispatch(this.content)
}
