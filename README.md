# quick-loader

quick-loader is an asset loader that loads everything. Say you have some third party libraries with their own loader modules, you can pipe the loading progress into quick-loader's loading pipeline. It also does basic loading for `image`, `json`, `jsonp`, `text`, `video` and `audio`.

## Usage

### Simple batch loading

Add several assets to the loader and get the percent of the batch loading.

```js
// assuming you are using CommonJS
var quickLoader = require('quick-loader');

// load the asset with certain type
quickLoader.add('1.jpg', {type: 'image'});

// or let it guess the type by the url extension
quickLoader.add('2.jpg');

// you can also define the weight of the asset which is 1 by default
quickLoader.add('3.jpg', {weight: 2});

quickLoader.start(function(percent){
    
    // assuming the files are loaded in the same order as above
    // it will log 0.25, 0.5, 1.0
    console.log(percent);
    
    if(percent === 1) {
        init();
        
        // the listener was removed at this point and it
        // will not have any stacked async issue so you can
        // load something else again.
        quickLoader.add(...);
        quickLoader.start(...);
    }

});

```

### Individual asset callback
You can add an onLoad callback to an individual asset.
```js
quickLoader.add('data.json', {
    onLoad: function(data) {
        console.log(data);
    }
});
quickLoader.add('img.jpg');
quickLoader.start(...);

```

### Load a single item out of the quick-loader pipeline
For all feature that works with Batch loading, it works with individual asset loading as well. Basically all you need is to change the `add()` into `load()`
```js
quickLoader.load('data.json', {
    onLoad: function(data) {
        console.log(data);
    }
});

```

### Initial content
Sometimes when you add the loading query to the batch loader, you want to have access to the asset instance immediately. This feature only works with asset types: `image`, `video` and `audio`
```js
var img = quickLoader.add('img.jpg').content;

quickLoader.start(...);

```

### No Cache
Normally after an item is loaded, the content will be stored and if you fetch the same url, it will not download the content again. But you can set `noCache` to true in the item config and bypass this feature. It will remove the reference after the file is loaded.
```js
quickLoader.load('img.jpg', {
    noCache: true
});

```

### Working with third-party library loader like THREE.JS JSON Loader
```js
quickLoader.load('mesh.json', {
    
    type: 'any',
    
    loadFunc: function(url, cb) {
        
        var loader = new THREE.JSONLoader();
        
        loader.load( url, function( geometry, material ) {
            var mesh = new THREE.Mesh( geometry, material);
            
            // tell quickLoader the item is loaded and
            // store the mesh instead as content
            cb(mesh);
        });
    }
});

```

### Individual asset preloading
You can also add listener to the individual asset. This feature only works with asset types `json`, `text` and `any`.
```js
quickLoader.add('data.json', {
    type: 'json',
    weight: 5,
    hasLoading: true,
    onLoading: function(percent){
        console.log(percent);   
    }
});
```

### Individual asset preloading with third-party library
This following example is to show you when you are using `any` asset type, you can do whatever you want. 
```js
quickLoader.add('a_fake_loader', {
    type: 'any',
    weight: 50,
    hasLoading: true,
    onLoading: function(percent) {
        console.log('loading: ' + ~~(percent * 100) + '%');
    },
    onLoad: function(content) {
        // some content here
        console.log('loaded: ' + content);
    },
    loadFunc: function(url, cb, loadingSignal) {
        var count = 0;
        var interval = setInterval(function(){
            count++;
            loadingSignal.dispatch(count / 10);
            if(count == 10) {
                clearInterval(interval);
                cb('some content here');
            }
        }, 100);
    }
});
```

### Add a chunk of assets
```js
quickLoader.addChunk(['1.jpg', '2.jpg', '3.jpg'], 'image');

// let quick-loader to guess the types
quickLoader.addChunk(['1.jpg', '2.txt', '3.json']);
```

### Add DOM Images(experimental)
It adds all images through img tag and background images.
```js
quickLoader.addChunk(document.body.querySelectorAll('*'));
```

### Multi-batch Loader instances
For some reason if you want to have 2 loaders, you can create a new one like this:
```js
var quickLoader = require('quick-loader');

var batchLoader = quickLoader.create();
batchLoader.add(...);

```

### Cross Origin
```js
var quickLoader = require('quick-loader');

// set for everything cross-origin within a domain
quickLoader.setCrossOrigin('http://mydomain/', 'anonymous')

// set cross-origin for individual load item
quickLoader.add('http://anotherdomain/image.jpg', {
  crossOrigin: 'anonymous'
})

```


## Installation
Download the standalone version **[HERE](https://raw.githubusercontent.com/edankwan/quick-loader/master/dist/quickLoader.js)**

`npm install quick-loader`


## License
quick-loader is currently under Giant Penis License (GPL) which is a deformed M.I.T license including penis text art.