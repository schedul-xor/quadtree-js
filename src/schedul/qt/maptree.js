goog.provide('schedul.qt.MapTree');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.object');
goog.require('javascript.SortedArray');
goog.require('ol.TileCoord');
goog.require('ol.TileRange');
goog.require('ol.tilecoord');
goog.require('schedul.qt.Base');
goog.require('schedul.qt.NodeLoadingStatus');
goog.require('schedul.qt.NodeStatus');



/**
 * @constructor
 * @extends {schedul.qt.Base}
 * @param {boolean=} opt_isCuttingOffLeaves
 */
schedul.qt.MapTree = function(opt_isCuttingOffLeaves) {
  goog.base(this);

  this.paths_ = new javascript.SortedArray();
  this.path2status_ = {};
  this.registeredMysteriousTilePaths_ = {};

  this.isCuttingOffLeaves_ = goog.isDefAndNotNull(opt_isCuttingOffLeaves) &&
    opt_isCuttingOffLeaves;
};
goog.inherits(schedul.qt.MapTree, schedul.qt.Base);


/**
 * @inheritDoc
 */
schedul.qt.MapTree.prototype.registerTileOutlineWithPath = function(path) {
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
    this.path2status_[partialPathCid] = schedul.qt.NodeStatus.IS_MYSTERIOUS;
  }
};


/**
 * @inheritDoc
 */
schedul.qt.MapTree.prototype.overrideTileOutlineWithPathAndPath =
  function(requestedPath, foundPath, status, opt_notDirectlyRequestedButDiedTileCidsVessel) {

  var i;
  var requestedPathCid = requestedPath.join('');
  goog.asserts.assert(goog.object.containsKey(this.registeredMysteriousTilePaths_, requestedPathCid));

  var foundPathCid = foundPath.join('');

  var firstIndex = this.paths_.search(foundPathCid);
  var arr = this.paths_.innerArray();
  var arrSize = this.paths_.size();

  var addNotDirectlyRequestedButDiedTilesVessel =
        function(registeredMysteriousTilePaths, pathCid) {
    if (!goog.object.containsKey(registeredMysteriousTilePaths, pathCid)) { return; }
    goog.object.remove(registeredMysteriousTilePaths, pathCid);
    if (requestedPathCid !== pathCid &&
        goog.isDefAndNotNull(opt_notDirectlyRequestedButDiedTileCidsVessel)) {
      opt_notDirectlyRequestedButDiedTileCidsVessel.push(pathCid);
    }
  };

  for (i = firstIndex; i < arrSize; i++) {
    var pathCid = arr[firstIndex];
    if (pathCid.indexOf(foundPathCid) !== 0) {
      break;
    }
    goog.object.remove(this.path2status_, pathCid);
    this.paths_.remove(pathCid);
    addNotDirectlyRequestedButDiedTilesVessel(this.registeredMysteriousTilePaths_, pathCid);
  }
  for (i = foundPathCid.length - 1; i > 0; i--) {
    foundPathCid = foundPathCid.substring(0, foundPathCid.length - 1);
    this.paths_.remove(foundPathCid);
    goog.object.remove(this.path2status_, foundPathCid);
    addNotDirectlyRequestedButDiedTilesVessel(this.registeredMysteriousTilePaths_, foundPathCid);
  }

  var lastElement = foundPath.pop();
  this.registerMysteriousPath_(foundPath);
  foundPath.push(lastElement);
  foundPathCid = foundPath.join('');
  this.paths_.insert(foundPathCid);
  this.path2status_[foundPathCid] = status;

  // Since [0,1,2,0],[0,1,2,1],[0,1,2,2],[0,1,2,3] are all done, it is sure that [0,1,2] is done.
  // If this.isCuttingOffLeaves_, remove [0,1,2,0],[0,1,2,1],[0,1,2,2],[0,1,2,3] and make [0,1,2] surely leaf.
  if (status === schedul.qt.NodeStatus.IS_SURELY_LEAF &&
      this.isCuttingOffLeaves_) {
    var buffer = [];
    var pathLength = foundPath.length;

    // If path length is 4, searching will begin from length=3
    while (--pathLength > 0) {
      buffer.push(foundPath.pop());
      var pathTxt = foundPath.join('');
      var allChildrenSurelyLeaf = true;
      for (i = 0; i < 4; i++) {
        var exPathTxt = pathTxt + i;
        if (!goog.object.containsKey(this.path2status_, exPathTxt)) {
          allChildrenSurelyLeaf = false;
          break;
        }
        var statusForChildren = this.path2status_[exPathTxt];
        if (statusForChildren !== schedul.qt.NodeStatus.IS_SURELY_LEAF) {
          allChildrenSurelyLeaf = false;
          break;
        }
      }
      if (!allChildrenSurelyLeaf) {
        break;
      }
      for (i = 0; i < 4; i++) {
        exPathTxt = pathTxt + i;
        goog.object.remove(this.path2status_, exPathTxt);
        this.paths_.remove(exPathTxt);
      }
      this.path2status_[pathTxt] = schedul.qt.NodeStatus.IS_SURELY_LEAF;
    }
    while (buffer.length > 0) {
      foundPath.push(buffer.pop());
    }
  }
};


/**
 * @inheritDoc
 */
schedul.qt.MapTree.prototype.
  allOverriddenTilesForPathAndZoomLevel = function(searchingPath, zoomLevel) {
    goog.asserts.assertArray(searchingPath);
    goog.asserts.assertNumber(zoomLevel);

    var searchingPathCid = searchingPath.join('');

    var iterPaths = this.paths_.innerArray();
    var firstIndex = -1;
    var length = 0;
    var i;
    var index;
    for (i = searchingPathCid.length; i > 0; i--) {
      var searchingPathCidPrefix = searchingPathCid.substring(0, i);
      firstIndex = iterPaths.indexOf(searchingPathCidPrefix);
      if (firstIndex !== -1) {break;}
    }
    if (firstIndex !== -1) {
      for (i = 0; i < iterPaths.length - firstIndex; i++) {
        index = i + firstIndex;
        var iterPathCid = iterPaths[index];
        var lengthFixedSearchingPathCid = searchingPathCid;
        var lengthFixedIterPathCid = iterPathCid;
        if (searchingPathCid.length > iterPathCid.length) {
          lengthFixedSearchingPathCid = searchingPathCid.substring(0,
                                                                   iterPathCid.length);
        }else if (searchingPathCid.length < iterPathCid.length) {
          lengthFixedIterPathCid = iterPathCid.substring(0,
                                                         searchingPathCid.length);
        }
        if (lengthFixedSearchingPathCid !== lengthFixedIterPathCid) {
          break;
        }
      }
      length = i;
    }
    var uniqueTiles = {};
    for (i = 0; i < length; i++) {
      index = i + firstIndex;
      iterPathCid = iterPaths[index];
      var iterPathStatus = this.path2status_[iterPathCid];
      if (iterPathStatus !== schedul.qt.NodeStatus.IS_SURELY_LEAF) {
        continue;
      }
      var iterPath = iterPathCid.split('');
      if (iterPath.length > zoomLevel) {
        iterPath.length = zoomLevel;
      }
      var tile = schedul.qt.Base.tileForPath(iterPath);
      var tileHash = ol.tilecoord.hash(tile);
      uniqueTiles[tileHash] = tile;
    }
    var foundTiles = [];
    goog.object.forEach(uniqueTiles, function(tile, tileHash, o) {
      foundTiles.push(tile);
    },this);
    return foundTiles;
  };


/**
 * @inheritDoc
 */
schedul.qt.MapTree.prototype.mostDensePathForPath = function(searchingPath, opt_mostDensePath) {
  goog.asserts.assertArray(searchingPath);

  var mostDensePath = goog.isDefAndNotNull(opt_mostDensePath) ? opt_mostDensePath : [];
  var searchingPathLength = searchingPath.length;
  var tmpString = '';
  for (var i = 0; i < searchingPathLength; i++) {
    tmpString = tmpString + searchingPath[i];
    if (!goog.object.containsKey(this.path2status_, tmpString)) {
      return mostDensePath;
    }
    mostDensePath.push(searchingPath[i]);
  }
  return mostDensePath;
};


/**
 * @inheritDoc
 */
schedul.qt.MapTree.prototype.isPathSurelyLeaf = function(path) {
  var pathTxt = path.join('');
  return goog.object.containsKey(this.path2status_, pathTxt) &&
    this.path2status_[pathTxt] === schedul.qt.NodeStatus.IS_SURELY_LEAF;
};


/**
 * @inheritDoc
 */
schedul.qt.MapTree.prototype.isPathInsideSurelyLeafTile = function(path) {
  var isFound = false;
  var popped = [];
  while (path.length > 0) {
    if (this.isPathSurelyLeaf(path)) {
      isFound = true;
      break;
    }
    popped.push(path.pop());
  }
  while (popped.length > 0) {
    path.push(popped.pop());
  }
  return isFound;
};


/**
 * @inheritDoc
 */
schedul.qt.MapTree.prototype.findNotLoadedRangesInsidePath = function(path, notLoadedVessel, loadedVessel) {
  goog.asserts.assertArray(notLoadedVessel);
  goog.asserts.assertArray(loadedVessel);

  notLoadedVessel.length = 0;
  loadedVessel.length = 0;

  var isChildOfAlreadyLoadedTile = false;
  var mostDensePath = this.mostDensePathForPath(path);
    var mostDensePathTxt = mostDensePath.join('');
  if (goog.object.containsKey(this.path2status_, mostDensePathTxt) &&
      this.path2status_[mostDensePathTxt] === schedul.qt.NodeStatus.IS_SURELY_LEAF) {
    var mostDenseTile = schedul.qt.Base.tileForPath(mostDensePath);
    loadedVessel.push(mostDenseTile);
    isChildOfAlreadyLoadedTile = true;
  }

    if (!isChildOfAlreadyLoadedTile) {
    this.findNotLoadedRangesInsidePath_(path, notLoadedVessel, loadedVessel);
  }
};


/**
 * @private
 * @param {!Array.<!number>} path
 * @param {!Array.<!ol.TileCoord>} notLoadedVessel
 * @param {!Array.<!ol.TileCoord>} loadedVessel
 */
schedul.qt.MapTree.prototype.findNotLoadedRangesInsidePath_ = function(path, notLoadedVessel, loadedVessel) {
  goog.asserts.assertArray(path);
  goog.asserts.assertArray(notLoadedVessel);
  goog.asserts.assertArray(loadedVessel);

  var pathTxt = path.join('');

  // This path seems doesn't seem to exist! Whole inside me is what's not found.
  if (!goog.object.containsKey(this.path2status_, pathTxt)) {
    var itsMeThatDoesntExistTile = schedul.qt.Base.tileForPath(path);
    notLoadedVessel.push(itsMeThatDoesntExistTile);
    return;
  }

  // I' m surely existing, and is leaf. Nothing found under me.
  if (this.path2status_[pathTxt] === schedul.qt.NodeStatus.IS_SURELY_LEAF) {
    loadedVessel.push(schedul.qt.Base.tileForPath(path));
    return;
  }

  var hasNoChildren = true;
  for (var i = 0; i < 4; i++) {
    path.push(i);
    this.findNotLoadedRangesInsidePath_(path, notLoadedVessel, loadedVessel);
    path.pop();
  }
};


/**
 * @return {!string}
 */
schedul.qt.MapTree.prototype.dump = function() {
  var d = '';
  goog.array.forEach(this.paths_.innerArray(), function(pathCid, index) {
    var status = this.path2status_[pathCid];
    d = d + pathCid + '=' + status + ', ';
  }, this);
  return d;
};


/**
 *
 */
schedul.qt.MapTree.prototype.clear = function() {
  this.paths_.clear();
  goog.object.clear(this.path2status_);
  goog.object.clear(this.registeredMysteriousTilePaths_);
};
