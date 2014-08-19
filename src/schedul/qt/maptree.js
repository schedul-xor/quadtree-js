goog.provide('schedul.qt.MapTree');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.object');
goog.require('javascript.SortedArray');
goog.require('ol.TileCoord');
goog.require('schedul.qt.Base');
goog.require('schedul.qt.NodeLoadingStatus');
goog.require('schedul.qt.NodeStatus');



/**
 * @constructor
 * @extends {schedul.qt.Base}
 */
schedul.qt.MapTree = function() {
  goog.base(this);

  this.paths_ = new javascript.SortedArray();
  this.path2status_ = {};
  this.registeredMysteriousTilePaths_ = {};
};
goog.inherits(schedul.qt.MapTree, schedul.qt.Base);


/**
 * @inheritDoc
 */
schedul.qt.MapTree.prototype.registerTileOutlineWithPath = function(path){
  goog.asserts.assertArray(path);

  this.registerMysteriousPath_(path);
};


/**
 * @private
 * @param {!Array.<!number>} path
 */
schedul.qt.MapTree.prototype.registerMysteriousPath_ = function(path) {
    goog.asserts.assertArray(path);

  var pathCid = path.join('');
    this.registeredMysteriousTilePaths_[pathCid] = 1;
  var pathCidLength = pathCid.length;
  for (var i = 1; i <= pathCidLength; i++) {
    var partialPathCid = pathCid.substring(0, i);
    if (goog.object.containsKey(this.path2status_, partialPathCid)) {
      continue;
    }
    this.paths_.insert(partialPathCid);
    this.path2status_[partialPathCid] = schedul.qt.NodeStatus.
        IS_MYSTERIOUS;
    //console.log('  added  ', partialPathCid);
    //console.log('      ', this.dump_());
  }
};


/**
 * @inheritDoc
 */
schedul.qt.MapTree.prototype.overrideTileOutlineWithPath = function(requestedTile,foundPath, status, opt_notDirectlyRequestedButDiedTileCidsVessel) {
    goog.asserts.assertInstanceof(requestedTile,ol.TileCoord);
    goog.asserts.assertArray(foundPath);

  var i;
  var requestedTilePath = [];
  schedul.qt.Base.pathForTile(requestedTile, requestedTilePath);
  var requestedTilePathCid = requestedTilePath.join('');
    goog.asserts.assert(goog.object.containsKey(this.registeredMysteriousTilePaths_,requestedTilePathCid));

  var foundPathCid = foundPath.join('');
//console.log('s override tile', requestedTilePathCid, 'with',foundPathCid);

    var firstIndex = this.paths_.search(foundPathCid);
    var arr = this.paths_.innerArray();
    var arrSize = this.paths_.size();

    var addNotDirectlyRequestedButDiedTilesVessel = function(registeredMysteriousTilePaths,pathCid){
        if(!goog.object.containsKey(registeredMysteriousTilePaths,pathCid)){ return; }
        goog.object.remove(registeredMysteriousTilePaths,pathCid);
        if(requestedTilePathCid !== pathCid && goog.isDefAndNotNull(opt_notDirectlyRequestedButDiedTileCidsVessel)){
            opt_notDirectlyRequestedButDiedTileCidsVessel.push(pathCid);
        }
    };

//    console.log('  removing arr index', firstIndex, 'where size', arrSize);
    for(i = firstIndex;i < arrSize;i++){
        var pathCid =arr[firstIndex];
//        console.log('    found', pathCid);
        if(pathCid.indexOf(foundPathCid) !== 0){
//            console.log('    ', pathCid, 'does not contain',foundPathCid, 'break');
            break;
        }
        goog.object.remove(this.path2status_, pathCid);
        this.paths_.remove(pathCid);
        addNotDirectlyRequestedButDiedTilesVessel(this.registeredMysteriousTilePaths_,pathCid);
//        console.log('  removed', pathCid);
//        console.log('      ', this.dump_());
    }
    for(i = foundPathCid.length-1;i > 0;i--){
        foundPathCid = foundPathCid.substring(0, foundPathCid.length-1);
        this.paths_.remove(foundPathCid);
        goog.object.remove(this.path2status_, foundPathCid);
        addNotDirectlyRequestedButDiedTilesVessel(this.registeredMysteriousTilePaths_,foundPathCid);
//        console.log('  removed', foundPathCid);
//        console.log('      ', this.dump_());
    }

    var lastElement = foundPath.pop();
    this.registerMysteriousPath_(foundPath);
    foundPath.push(lastElement);
    foundPathCid = foundPath.join('');
    this.paths_.insert(foundPathCid);
    this.path2status_[foundPathCid] = status;
//    console.log('  overrid', foundPathCid);
//    console.log('e override tile', this.dump_());
};


/**
 * @param{!Array.<!number>} searchingPath
 * @param {!number} zoomLevel
 * @return {!Array.<!ol.TileCoord>}
 */
schedul.qt.MapTree.prototype.
allOverriddenTilesForPathAndZoomLevel = function(searchingPath, zoomLevel){
    goog.asserts.assertArray(searchingPath);
    goog.asserts.assertNumber(zoomLevel);

    //console.log('s search path', searchingPath);
    var searchingPathCid = searchingPath.join('');

    var iterPaths = this.paths_.innerArray();
    var firstIndex = -1;
    var length = 0;
    var i;
    var index;
    //console.log('  target', iterPaths);
    for(i = searchingPathCid.length;i >0;i--){
        var searchingPathCidPrefix = searchingPathCid.substring(0, i);
        firstIndex = iterPaths.indexOf(searchingPathCidPrefix);
        //console.log('    index of', searchingPathCidPrefix, 'is', firstIndex);
        if(firstIndex !== -1){break;}
    }
    if(firstIndex !== -1){
        for(i = 0;i<iterPaths.length-firstIndex;i++){
            index = i+firstIndex;
            var iterPathCid = iterPaths[index];
            var lengthFixedSearchingPathCid = searchingPathCid;
            var lengthFixedIterPathCid = iterPathCid;
            if(searchingPathCid.length > iterPathCid.length){
                lengthFixedSearchingPathCid = searchingPathCid.substring(0,
 iterPathCid.length);
            }else if(searchingPathCid.length < iterPathCid.length){
                lengthFixedIterPathCid = iterPathCid.substring(0,
 searchingPathCid.length);
            }
            //console.log('  try', iterPathCid, '=?', searchingPathCid,'trimmed', lengthFixedSearchingPathCid, '!=', lengthFixedIterPathCid);
            if(lengthFixedSearchingPathCid !== lengthFixedIterPathCid){
                break;
            }
        }
        length = i;
    }
    var uniqueTiles = {};
    //console.log('  found range', firstIndex, length);
    for(i = 0;i<length;i++){
        index = i+firstIndex;
        iterPathCid = iterPaths[index];
        var iterPathStatus = this.path2status_[iterPathCid];
        //console.log('    tile', iterPathCid, 'status', iterPathStatus);
        if(iterPathStatus !== schedul.qt.NodeStatus.IS_SURELY_LEAF){
            continue;
        }
        var iterPath = iterPathCid.split('');
        if(iterPath.length > zoomLevel){
            iterPath.length = zoomLevel;
        }
        var tile = schedul.qt.Base.tileForPath(iterPath);
        var tileHash = tile.hash();
        uniqueTiles[tileHash] = tile;
    }
    //console.log('e search path', searchingPath);
    var foundTiles = [];
    goog.object.forEach(uniqueTiles,function(tile,tileHash,o){
        foundTiles.push(tile);
    },this);
    return foundTiles;
};


/**
 * @inheritDoc
 */
schedul.qt.MapTree.prototype.mostDensePathForPath = function(searchingPath,opt_mostDensePath){
    goog.asserts.assertArray(searchingPath);

    var mostDensePath = goog.isDefAndNotNull(opt_mostDensePath)?opt_mostDensePath:[];
    var searchingPathLength = searchingPath.length;
    var tmpString = '';
    for(var i = 0; i < searchingPathLength;i++){
        tmpString = tmpString+searchingPath[i];
        if(!goog.object.containsKey(this.path2status_,tmpString)){
            return mostDensePath;
        }
        mostDensePath.push(searchingPath[i]);
    }
    return mostDensePath;
};


/**
 * @return {!string}
 */
schedul.qt.MapTree.prototype.dump = function(){
    var d = '';
    goog.array.forEach(this.paths_.innerArray(), function(pathCid, index){
        var status = this.path2status_[pathCid];
        d = d+pathCid+'='+status+', ';
    }, this);
    return d;
};
