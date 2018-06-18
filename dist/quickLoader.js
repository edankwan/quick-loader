(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.quickLoader = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./src/quickLoader')

require('./src/types/JSONPItem')
require('./src/types/JSONItem')
require('./src/types/TextItem')
require('./src/types/AudioItem')
require('./src/types/VideoItem')
require('./src/types/AnyItem')
require('./src/types/ImageItem')
require('./src/types/XHRItem')

},{"./src/quickLoader":4,"./src/types/AnyItem":6,"./src/types/AudioItem":7,"./src/types/ImageItem":8,"./src/types/JSONItem":9,"./src/types/JSONPItem":10,"./src/types/TextItem":11,"./src/types/VideoItem":12,"./src/types/XHRItem":13}],2:[function(require,module,exports){
// DEV: We don't use var but favor parameters since these play nicer with minification
function computedStyle(el, prop, getComputedStyle, style) {
  getComputedStyle = window.getComputedStyle;
  style =
      // If we have getComputedStyle
      getComputedStyle ?
        // Query it
        // TODO: From CSS-Query notes, we might need (node, null) for FF
        getComputedStyle(el) :

      // Otherwise, we are in IE and use currentStyle
        el.currentStyle;
  if (style) {
    return style
    [
      // Switch to camelCase for CSSOM
      // DEV: Grabbed from jQuery
      // https://github.com/jquery/jquery/blob/1.9-stable/src/css.js#L191-L194
      // https://github.com/jquery/jquery/blob/1.9-stable/src/core.js#L593-L597
      prop.replace(/-(\w)/gi, function (word, letter) {
        return letter.toUpperCase();
      })
    ];
  }
}

module.exports = computedStyle;

},{}],3:[function(require,module,exports){
var MinSignal = (function(undef){

    function MinSignal() {
        this._listeners = [];
        this.dispatchCount = 0;
    }

    var _p = MinSignal.prototype;

    _p.add = add;
    _p.addOnce = addOnce;
    _p.remove = remove;
    _p.dispatch = dispatch;

    var ERROR_MESSAGE_MISSING_CALLBACK = 'Callback function is missing!';

    var _slice = Array.prototype.slice;

    function _sort(list) {
        list.sort(function(a, b){
            a = a.p;
            b = b.p;
            return b < a ? 1 : a > b ? -1 : 0;
        });
    }

    /**
     * Adding callback to the signal
     * @param {Function} the callback function
     * @param {object} the context of the callback function
     * @param {number} priority in the dispatch call. The higher priority it is, the eariler it will be dispatched.
     * @param {any...} additional argument prefix
     */
    function add (fn, context, priority, args) {

        if(!fn) {
            throw ERROR_MESSAGE_MISSING_CALLBACK;
        }

        priority = priority || 0;
        var listeners = this._listeners;
        var listener, realFn, sliceIndex;
        var i = listeners.length;
        while(i--) {
            listener = listeners[i];
            if(listener.f === fn && listener.c === context) {
                return false;
            }
        }
        if(typeof priority === 'function') {
            realFn = priority;
            priority = args;
            sliceIndex = 4;
        }
        listeners.unshift({f: fn, c: context, p: priority, r: realFn || fn, a: _slice.call(arguments, sliceIndex || 3), j: 0});
        _sort(listeners);
    }

    /**
     * Adding callback to the signal but it will only trigger once
     * @param {Function} the callback function
     * @param {object} the context of the callback function
     * @param {number} priority in the dispatch call. The higher priority it is, the eariler it will be dispatched.
     * @param {any...} additional argument prefix
     */
    function addOnce (fn, context, priority, args) {

        if(!fn) {
            throw ERROR_MESSAGE_MISSING_CALLBACK;
        }

        var self = this;
        var realFn = function() {
            self.remove.call(self, fn, context);
            return fn.apply(context, _slice.call(arguments, 0));
        };
        args = _slice.call(arguments, 0);
        if(args.length === 1) {
            args.push(undef);
        }
        args.splice(2, 0, realFn);
        add.apply(self, args);
    }

    /**
     * Remove callback from the signal
     * @param {Function} the callback function
     * @param {object} the context of the callback function
     * @return {boolean} return true if there is any callback was removed
     */
    function remove (fn, context) {
        if(!fn) {
            this._listeners.length = 0;
            return true;
        }
        var listeners = this._listeners;
        var listener;
        var i = listeners.length;
        while(i--) {
            listener = listeners[i];
            if(listener.f === fn && (!context || (listener.c === context))) {
                listener.j = 0;
                listeners.splice(i, 1);
                return true;
            }
        }
        return false;
    }


    /**
     * Dispatch the callback
     * @param {any...} additional argument suffix
     */
    function dispatch(args) {
        args = _slice.call(arguments, 0);
        this.dispatchCount++;
        var dispatchCount = this.dispatchCount;
        var listeners = this._listeners;
        var listener, context, stoppedListener;
        var i = listeners.length;
        while(i--) {
            listener = listeners[i];
            if(listener && (listener.j < dispatchCount)) {
                listener.j = dispatchCount;
                if(listener.r.apply(listener.c, listener.a.concat(args)) === false) {
                    stoppedListener = listener;
                    break;
                }
            }
        }
        listeners = this._listeners;
        i = listeners.length;
        while(i--) {
            listeners[i].j = 0;
        }
        return stoppedListener;
    }

    if (typeof module !== 'undefined') {
        module.exports = MinSignal;
    }

}());

},{}],4:[function(require,module,exports){
var MinSignal = require('min-signal')

var undef

function QuickLoader () {
  this.isLoading = false
  this.totalWeight = 0
  this.loadedWeight = 0
  this.itemUrls = {}
  this.itemList = []
  this.loadingSignal = new MinSignal()
  this.crossOriginMap = {}
  this.queue = []
  this.activeItems = []
  this.maxActiveItems = 4
}

var _p = QuickLoader.prototype
_p.addChunk = addChunk
_p.setCrossOrigin = setCrossOrigin
_p.add = add
_p.load = load
_p.start = start
_p.loadNext = loadNext
_p._createItem = _createItem
_p._onLoading = _onLoading

var quickLoader = module.exports = create()
quickLoader.version = '0.1.9'
quickLoader.register = register
quickLoader.retrieveAll = retrieveAll
quickLoader.retrieve = retrieve
quickLoader.testExtensions = testExtensions
quickLoader.create = create
quickLoader.load = load
quickLoader.check = check

var addedItems = quickLoader.addedItems = {}
var loadedItems = quickLoader.loadedItems = {}

var ITEM_CLASS_LIST = quickLoader.ITEM_CLASS_LIST = []
var ITEM_CLASSES = quickLoader.ITEM_CLASSES = {}

function setCrossOrigin (domain, value) {
  this.crossOriginMap[domain] = value
}

function addChunk (target, type) {
  var i, j, len, itemsLength, retrievedTypeObj
  var retrievedTypeObjList = retrieveAll(target, type)
  for (i = 0, len = retrievedTypeObjList.length; i < len; i++) {
    retrievedTypeObj = retrievedTypeObjList[i]
    for (j = 0, itemsLength = retrievedTypeObj.items.length; j < itemsLength; j++) {
      this.add(retrievedTypeObj.items[j], {type: retrievedTypeObj.type})
    }
  }
  return retrievedTypeObjList
}

function add (url, cfg) {
  var item = addedItems[url]
  if (!item) {
    item = this._createItem(url, (cfg && cfg.type) ? cfg.type : retrieve(url).type, cfg)
  }

  if (cfg && cfg.onLoad) item.onLoaded.addOnce(cfg.onLoad)

  if (!this.itemUrls[url]) {
    this.itemUrls[url] = item
    this.itemList.push(item)
    this.totalWeight += item.weight
  }

  return item
}

function load (url, cfg) {
  var item = addedItems[url]
  if (!item) {
    item = this._createItem(url, (cfg && cfg.type) ? cfg.type : retrieve(url).type, cfg)
  }

  if (cfg && cfg.onLoad) item.onLoaded.addOnce(cfg.onLoad)

  if (loadedItems[url]) {
    item.dispatch()
  } else {
    if (!item.isStartLoaded) {
      item.load()
    }
  }

  return item
}

function start (onLoading) {
  if (onLoading) this.loadingSignal.add(onLoading)
  this.isLoading = true
  var len = this.itemList.length
  if (len) {
    var itemList = this.itemList.splice(0, this.itemList.length)
    var item
    for (var i = 0; i < len; i++) {
      item = itemList[i]
      var isAlreadyLoaded = !!loadedItems[item.url]
      item.onLoaded.addOnce(_onItemLoad, this, -1024, item, itemList, isAlreadyLoaded)
      if (item.hasLoading) {
        item.loadingSignal.add(_onLoading, this, -1024, item, itemList, undef)
      }

      if (isAlreadyLoaded) {
        item.dispatch(_onItemLoad)
      } else {
        if (!item.isStartLoaded) {
          this.queue.push(item)
        }
      }
    }
    if (this.queue.length) {
      this.loadNext()
    }
  } else {
    _onItemLoad.call(this, undef, this.itemList)
  }
}

function loadNext () {
  if (this.queue.length && (this.activeItems.length < this.maxActiveItems)) {
    var item = this.queue.shift()
    this.activeItems.push(item)
    this.loadNext()
    item.load()
  }
}

function _onLoading (item, itemList, loadingSignal, itemPercent, percent) {
  // leave the onLoading triggered by the _onItemLoad() to prevent stacked call.
  if (item && !item.isLoaded && (itemPercent === 1)) return
  if (percent === undef) {
    this.loadedWeight = _getLoadedWeight(itemList)
    percent = this.loadedWeight / this.totalWeight
  }

  loadingSignal = loadingSignal || this.loadingSignal
  loadingSignal.dispatch(percent, item)
}

function _getLoadedWeight (itemList) {
  var loadedWeight = 0
  for (var i = 0, len = itemList.length; i < len; i++) {
    loadedWeight += itemList[i].loadedWeight
  }
  return loadedWeight
}

function _onItemLoad (item, itemList, isAlreadyLoaded) {
  this.loadedWeight = _getLoadedWeight(itemList)

  if (!isAlreadyLoaded) {
    var activeItems = this.activeItems
    var i = activeItems.length
    while (i--) {
      if(activeItems[i] === item) {
        activeItems.splice(i, 1)
        break;
      }
    }
  }

  var loadingSignal = this.loadingSignal
  if (this.loadedWeight === this.totalWeight) {
    this.isLoading = false
    this.loadedWeight = 0
    this.totalWeight = 0
    this.loadingSignal = new MinSignal()
    this._onLoading(item, itemList, loadingSignal, 1, 1)
    if (item && item.noCache) _removeItemCache(item);
  } else {
    this._onLoading(item, itemList, loadingSignal, 1, this.loadedWeight / this.totalWeight)
    if (item && item.noCache) _removeItemCache(item);
    if (!isAlreadyLoaded) {
      this.loadNext()
    }
  }
}

function _removeItemCache (item) {
  var url = item.url;
  item.content = undef;
  addedItems[url] = undef;
  loadedItems[url] = undef;
}

function _createItem (url, type, cfg) {
  cfg = cfg || {}
  if (!cfg.crossOrigin) {
    for (var domain in this.crossOriginMap) {
      if (url.indexOf(domain) === 0) {
        cfg.crossOrigin = this.crossOriginMap[domain]
        break
      }
    }
  }
  return new ITEM_CLASSES[type](url, cfg)
}

function register (ItemClass) {
  if (!ITEM_CLASSES[ItemClass.type]) {
    ITEM_CLASS_LIST.push(ItemClass)
    ITEM_CLASSES[ItemClass.type] = ItemClass
  }
}

function retrieveAll (target, type) {
  var i, retrievedTypeObj
  var len = target.length
  var retrievedTypeObjList = []
  if (len && (typeof target !== 'string')) {
    for (i = 0; i < len; i++) {
      retrievedTypeObj = retrieve(target[i], type)
      if (retrievedTypeObj) {
        retrievedTypeObjList = retrievedTypeObjList.concat(retrievedTypeObj)
      }
    }
  } else {
    retrievedTypeObj = retrieve(target, type)
    if (retrievedTypeObj) {
      retrievedTypeObjList = retrievedTypeObjList.concat(retrievedTypeObj)
    }
  }
  return retrievedTypeObjList
}

function retrieve (target, type) {
  var i, len, items, ItemClass, guessedType
  if (type) {
    ItemClass = ITEM_CLASSES[type]
    items = ItemClass.retrieve(target)
  } else {
    for (i = 0, len = ITEM_CLASS_LIST.length; i < len; i++) {
      ItemClass = ITEM_CLASS_LIST[i]
      guessedType = ItemClass.type

      if (typeof target === 'string') {
        if (testExtensions(target, ItemClass)) {
          items = [target]
          break
        }
      } else {
        items = ItemClass.retrieve(target)
        if (items && items.length && (typeof items[0] === 'string') && testExtensions(items[0], ItemClass)) {
          break
        }
      }
      items = undef
      guessedType = undef
    }
  }
  if (items) {
    return {
      type: type || guessedType,
      items: items
    }
  }
  return
}

function testExtensions (url, ItemClass) {
  if (!url) return
  var urlExtension = _getExtension(url)
  var extensions = ItemClass.extensions
  var i = extensions.length
  while (i--) {
    if (urlExtension === extensions[i]) {
      return true
    }
  }
  return false
}

function _getExtension (url) {
  return url.split('.').pop().split(/#|\?/)[0]
}

function create () {
  return new QuickLoader()
}

function check () {
  var addedUrl = []
  var notLoadedUrl = []
  for (var url in addedItems) {
    addedUrl.push(url)
    if (!loadedItems[url]) {
      notLoadedUrl.push(addedItems[url])
    }
  }
  console.log({
    added: addedUrl,
    notLoaded: notLoadedUrl
  })
}

},{"min-signal":3}],5:[function(require,module,exports){
var MinSignal = require('min-signal')
var quickLoader = require('../quickLoader')

function AbstractItem (url, cfg) {
  if (!url) return
  this.url = url
  this.loadedWeight = 0
  this.weight = 1
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
_p.dispatch = dispatch

AbstractItem.extensions = []

AbstractItem.retrieve = function () {
  return false
}

function load () {
  this.isStartLoaded = true
}

function _onLoad () {
  this.isLoaded = true
  this.loadedWeight = this.weight
  quickLoader.loadedItems[this.url] = this
  this.onLoaded.dispatch(this.content)
}

function _onLoading (percent) {
  this.loadedWeight = this.weight * percent
}

function dispatch () {
  if (this.hasLoading) {
    this.loadingSignal.remove()
  }
  this.onLoaded.dispatch(this.content)
}

},{"../quickLoader":4,"min-signal":3}],6:[function(require,module,exports){
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

},{"../quickLoader":4,"./AbstractItem":5}],7:[function(require,module,exports){
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

},{"../quickLoader":4,"./AbstractItem":5}],8:[function(require,module,exports){
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

},{"../quickLoader":4,"./AbstractItem":5,"computed-style":2}],9:[function(require,module,exports){
var TextItem = require('./TextItem')
var quickLoader = require('../quickLoader')

function JSONItem (url) {
  if (!url) return
  _super.constructor.apply(this, arguments)
}

module.exports = JSONItem
JSONItem.type = 'json'
JSONItem.extensions = ['json']
quickLoader.register(JSONItem)

JSONItem.retrieve = function () {
  return false
}

var _super = TextItem.prototype
var _p = JSONItem.prototype = new TextItem()
_p.constructor = JSONItem
_p._onLoad = _onLoad

function _onLoad () {
  if (!this.content) {
    this.content = window.JSON && window.JSON.parse ? JSON.parse(this.xmlhttp.responseText.toString()) : eval(this.xmlhttp.responseText.toString())
  }
  _super._onLoad.call(this)
}

},{"../quickLoader":4,"./TextItem":11}],10:[function(require,module,exports){
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

},{"../quickLoader":4,"./AbstractItem":5}],11:[function(require,module,exports){
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

},{"../quickLoader":4,"./XHRItem":13}],12:[function(require,module,exports){
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

},{"../quickLoader":4,"./AbstractItem":5}],13:[function(require,module,exports){
var AbstractItem = require('./AbstractItem')
var quickLoader = require('../quickLoader')

var undef

var IS_SUPPORT_XML_HTTP_REQUEST = !!window.XMLHttpRequest

function XHRItem (url) {
  if (!url) return
  _super.constructor.apply(this, arguments)
  this.responseType = this.responseType || ''
  this.method = this.method || 'GET'
}

module.exports = XHRItem
XHRItem.type = 'xhr'
XHRItem.extensions = []
quickLoader.register(XHRItem)

XHRItem.retrieve = function () {
  return false
}

var _super = AbstractItem.prototype
var _p = XHRItem.prototype = new AbstractItem()
_p.constructor = XHRItem
_p.load = load
_p._onXmlHttpChange = _onXmlHttpChange
_p._onXmlHttpProgress = _onXmlHttpProgress
_p._onLoad = _onLoad

function load () {
  _super.load.apply(this, arguments)
  var self = this
  var xmlhttp

  if (IS_SUPPORT_XML_HTTP_REQUEST) {
    xmlhttp = this.xmlhttp = new XMLHttpRequest()
  } else {
    xmlhttp = this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP')
  }
  if (this.hasLoading) {
    xmlhttp.onprogress = function (evt) {
      self._onXmlHttpProgress(evt)
    }
  }
  xmlhttp.onreadystatechange = function () {
    self._onXmlHttpChange()
  }
  xmlhttp.open(this.method, this.url, true)
  this.xmlhttp.responseType = this.responseType

  if (IS_SUPPORT_XML_HTTP_REQUEST) {
    xmlhttp.send(null)
  } else {
    xmlhttp.send()
  }
}

function _onXmlHttpProgress (evt) {
  this.loadingSignal.dispatch(evt.loaded / evt.total)
}

function _onXmlHttpChange () {
  if (this.xmlhttp.readyState === 4) {
    if (this.xmlhttp.status === 200) {
      this._onLoad(this.xmlhttp)
    }
  }
}

function _onLoad () {
  if (!this.content) {
    this.content = this.xmlhttp.response
  }
  this.xmlhttp = undef
  _super._onLoad.call(this)
}

},{"../quickLoader":4,"./AbstractItem":5}]},{},[1])(1)
});