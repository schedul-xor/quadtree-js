goog.provide('schedul.qt.Base');

goog.require('goog.asserts');
goog.require('goog.events.EventTarget');
goog.require('ol.TileCoord');
goog.require('schedul.qt.NodeStatus');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
schedul.qt.Base = function() {
  goog.base(this);

  this.pathVessel_ = [];
};
goog.inherits(schedul.qt.Base, goog.events.EventTarget);


/**
 * Tile outlines are registered, and is recommended to override it.
 * @param {!ol.TileCoord} tile
 */
schedul.qt.Base.prototype.registerTileOutlineWithTile = function(tile) {
  goog.asserts.assertInstanceof(tile, ol.TileCoord);

  schedul.qt.Base.pathForTile(tile, this.pathVessel_);
  this.registerTileOutlineWithPath(this.pathVessel_);
};


/**
 * @param {!Array.<!number>} path
 */
schedul.qt.Base.prototype.registerTileOutlineWithPath = goog.abstractMethod;


/**
 * @param {!ol.TileCoord} requestedTile
 * @param {!ol.TileCoord} foundTile
 * @param {!schedul.qt.NodeStatus} status
 * @param {!Array.<!string>=} opt_notDirectlyRequestedButDiedTilesVessel
 */
schedul.qt.Base.prototype.overrideTileOutlineWithTile = function(requestedTile, foundTile, status, opt_notDirectlyRequestedButDiedTilesVessel) {
  goog.asserts.assertInstanceof(requestedTile, ol.TileCoord);
  goog.asserts.assertInstanceof(foundTile, ol.TileCoord);

  schedul.qt.Base.pathForTile(foundTile, this.pathVessel_);
  this.overrideTileOutlineWithPath(requestedTile, this.pathVessel_, status, opt_notDirectlyRequestedButDiedTilesVessel);
};


/**
 * @param {!ol.TileCoord} requestedTile
 * @param {!Array.<!number>} foundPath
 * @param {!schedul.qt.NodeStatus} status
 * @param {!Array.<!string>=} opt_notDirectlyRequestedButDiedTileCidsVessel
 */
schedul.qt.Base.prototype.overrideTileOutlineWithPath = function(requestedTile, foundPath, status, opt_notDirectlyRequestedButDiedTileCidsVessel) {
  goog.asserts.assertInstanceof(requestedTile, ol.TileCoord);
  goog.asserts.assertArray(foundPath);

  var requestedPath = [];
  schedul.qt.Base.pathForTile(requestedTile, requestedPath);
  this.overrideTileOutlineWithPathAndPath(requestedPath, foundPath, status, opt_notDirectlyRequestedButDiedTileCidsVessel);
};


/**
 * @param {!Array.<!number>} requestedPath
 * @param {!Array.<!number>} foundPath
 * @param {!schedul.qt.NodeStatus} status
 * @param {!Array.<!string>=} opt_notDirectlyRequestedButDiedTileCidsVessel
 */
schedul.qt.Base.prototype.overrideTileOutlineWithPathAndPath = goog.abstractMethod;


/**
 * Helper function. Calls registerTileOutlineWithTile->overrideTileOutlineWithTile
 * @param {!ol.TileCoord} tile
 * @param {!schedul.qt.NodeStatus} status
 */
schedul.qt.Base.prototype.registerAndOverrideWithTile = function(tile, status) {
  goog.asserts.assertInstanceof(tile, ol.TileCoord);

  schedul.qt.Base.pathForTile(tile, this.pathVessel_);
  this.registerTileOutlineWithPath(this.pathVessel_);
  this.overrideTileOutlineWithPathAndPath(this.pathVessel_, this.pathVessel_, status);
};


/**
 * Dense path is a path which isn't registered, nearest (not-existing) node which zoom level is minimum.
 * For example, there are only one node [0,0,0,0] registered, and you may try to search for node [0,1,1,1].
 * There are no [0,1,1,1] so the search result is "[0,1,1,1] not found". But don't you think that's too less to know?
 * When tiles are not found, you may also want to know "from where are nodes not found". For example,
 * [0,1,1,1] was not found but how about [0,1,1]? => NO. How about [0,1]? => NO. Then, how about [0]? Oh,
 * there exists [0,0,0,0], which has the same ancestor [0]. So, [0,1,1,1] has nothing inside, also [0,1,1], [0,1],
 * but not [0]. So, the tile with minimum zoom level and still has nothing inside, is [0,1]. Finally we found out
 * that the most dense path is [0,1].
 * @param {!Array.<!number>} searchingPath
 * @param {Array.<!number>=} opt_mostDensePath
 * @return {!Array.<!number>} Found path.
 */
schedul.qt.Base.prototype.mostDensePathForPath = goog.abstractMethod;


/**
 * @param {!ol.TileCoord} searchingTile
 * @return {!Array.<!number>} Found path.
 */
schedul.qt.Base.prototype.mostDensePathForTile = function(searchingTile) {
  goog.asserts.assertInstanceof(searchingTile, ol.TileCoord);

  schedul.qt.Base.pathForTile(searchingTile, this.pathVessel_);
  return this.mostDensePathForPath(this.pathVessel_);
};


/**
 * @param {!ol.TileCoord} searchingTile
 * @return {!ol.TileCoord} Found tile.
 */
schedul.qt.Base.prototype.mostDenseTileForTile = function(searchingTile) {
  goog.asserts.assertInstanceof(searchingTile, ol.TileCoord);

  var mostDensePath = this.mostDensePathForTile(searchingTile);
  return schedul.qt.Base.tileForPath(mostDensePath);
};


/**
 * @param {!Array.<!number>} path
 * @param {!Array.<!ol.TileCoord>} notLoadedVessel
 * @param {!Array.<!ol.TileCoord>} loadedVessel
 */
schedul.qt.Base.prototype.findNotLoadedRangesInsidePath = goog.abstractMethod;


/**
 * @param {!ol.TileCoord} tile
 * @param {!Array.<!ol.TileCoord>} notLoadedVessel
 * @param {!Array.<!ol.TileCoord>} loadedVessel
 */
schedul.qt.Base.prototype.findNotLoadedRangesInsideTile = function(tile, notLoadedVessel, loadedVessel) {
  goog.asserts.assertInstanceof(tile, ol.TileCoord);
  goog.asserts.assertArray(notLoadedVessel);
  goog.asserts.assertArray(loadedVessel);

  var path = schedul.qt.Base.pathForTile(tile);
  this.findNotLoadedRangesInsidePath(path, notLoadedVessel, loadedVessel);
};


/**
 * @param {!Array.<!number>} searchingPath
 * @param {!number} zoomLevel
 * @return {!Array.<!ol.TileCoord>}
 */
schedul.qt.Base.prototype.allOverriddenTilesForPathAndZoomLevel = goog.abstractMethod;


/**
 * @param {!ol.TileCoord} searchingTile
 * @param {!number} zoomLevel
 * @return {!Array.<!ol.TileCoord>}
 */
schedul.qt.Base.prototype.allOverriddenTilesForTileAndZoomLevel = function(searchingTile, zoomLevel) {
  goog.asserts.assertInstanceof(searchingTile, ol.TileCoord);
  goog.asserts.assertNumber(zoomLevel);

  var searchingPath = schedul.qt.Base.pathForTile(searchingTile);
  return this.allOverriddenTilesForPathAndZoomLevel(searchingPath, zoomLevel);
};



/**
 * Check if this path is a leaf. Zoom level is also checked to see if it's leaf.
 * Returns true if it exists, and is surely leaf. Returns false if it exists but it's mysterious.
 * @param {!Array.<!number>} path
 * @return {!boolean}
 */
schedul.qt.Base.prototype.isPathSurelyLeaf = goog.abstractMethod;


/**
 * @param {!ol.TileCoord} tile
 * @return {!boolean}
 */
schedul.qt.Base.prototype.isTileSurelyLeaf = function(tile) {
  goog.asserts.assertInstanceof(tile, ol.TileCoord);

  var path = schedul.qt.Base.pathForTile(tile);
  return this.isPathSurelyLeaf(path);
};


/**
 * Check if this path is part of the requested || overridden path. This should work even if
 * the given path contains very high zoom level.
 * @param {!Array.<!number>} path
 * @return {!boolean}
 */
schedul.qt.Base.prototype.isPathInsideSurelyLeafTile = goog.abstractMethod;


/**
 * @param {!ol.TileCoord} tile
 * @return {!boolean}
 */
schedul.qt.Base.prototype.isTileInsideSurelyLeafTile = function(tile) {
  goog.asserts.assertInstanceof(tile, ol.TileCoord);

  var path = schedul.qt.Base.pathForTile(tile);
  return this.isPathInsideSurelyLeafTile(path);
};


/**
 * @param {!ol.TileCoord} tile
 * @param {!number} zoomLevel
 * @param {!Array.<!number>} resultVessel
 * @return {!Array.<!number>}
 */
schedul.qt.Base.tileOutlineAtZoomLevelTile = function(tile, zoomLevel, resultVessel) {
  goog.asserts.assertInstanceof(tile, ol.TileCoord);

  var path = schedul.qt.Base.pathForTile(tile);
  schedul.qt.Base.tileOutlineAtZoomLevelPath(path, zoomLevel, resultVessel);
  return resultVessel;
};


/**
 * @private
 * @param {!Array.<!number>} arr
 * @param {!number} i
 * @param {!number} j
 */
schedul.qt.Base.swapArrayElements_ = function(arr, i, j) {
  goog.asserts.assertArray(arr);
  goog.asserts.assertNumber(i);
  goog.asserts.assertNumber(j);

  goog.asserts.assert(arr.length > i);
  goog.asserts.assert(arr.length > j);

  if (arr[i] > arr[j]) {
    var t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
};


/**
 * Result vessel will result to values [minX, minY, maxX, maxY].
 *
 * @param {!Array.<!number>}  path
 * @param {!number} zoomLevel
 * @param {!Array.<!number>} resultVessel
 */
schedul.qt.Base.tileOutlineAtZoomLevelPath = function(path, zoomLevel,
    resultVessel) {
  goog.asserts.assertArray(path);
  goog.asserts.assertNumber(zoomLevel);
  goog.asserts.assertArray(resultVessel);

  // Result vessel always should have length 4
  while (resultVessel.length < 4) {
    resultVessel.push(0);
  }
  var originalPathLength = path.length;
  var zoomLevelDelta = zoomLevel - originalPathLength + 1;
  var i;

  // Search min tile
  for (i = 0; i < zoomLevelDelta; i++) {
    path.push(0); // 0 is minimum for both X and Y
  }
  var minTile = schedul.qt.Base.tileForPath(path, zoomLevel);
  path.length = originalPathLength;
  var minTileX = minTile.x;
  var minTileY = minTile.y;
  resultVessel[0] = minTileX;
  resultVessel[2] = minTileY;

  for (i = 0; i < zoomLevelDelta; i++) {
    path.push(3); // 3 is maximum for both X and Y
  }
  var maxTile = schedul.qt.Base.tileForPath(path, zoomLevel);
  path.length = originalPathLength;
  var maxTileX = maxTile.x;
  var maxTileY = maxTile.y;
  resultVessel[1] = maxTileX;
  resultVessel[3] = maxTileY;

  // Sort the order max < min into max > min
  schedul.qt.Base.swapArrayElements_(resultVessel, 0, 1); // minX <-> maxX
  schedul.qt.Base.swapArrayElements_(resultVessel, 2, 3); // minY <-> maxY
};


/**
 * @param {!Array.<!number>} path
 * @param {!number=} opt_limitZ
 * @return {!ol.TileCoord}
 */
schedul.qt.Base.tileForPath = function(path, opt_limitZ) {
  goog.asserts.assertArray(path);

  var x = 0;
  var y = 0;
  var z = goog.isDefAndNotNull(opt_limitZ) ? opt_limitZ : (path.length - 1);
  for (var i = 0; i <= z; i++) {
    x <<= 1;
    y <<= 1;
    var xb = schedul.qt.Base.i2x(path[i]);
    if (xb !== 0) {
      x++;
    }
    var yb = schedul.qt.Base.i2y(path[i]);
    if (yb !== 0) {
      y++;
    }
  }
  y = -y - 1;
  return new ol.TileCoord(z, x, y);
};


/**
 * x range is from  0 to -2^n-1
 * y range is from  -1 to -2^n
 *
 * @param {!ol.TileCoord} tile
 * @param {!Array.<!number>=} opt_path
 * @param {!Array.<!number>=} opt_coordCache
 * @return {!Array.<!number>}
 */
schedul.qt.Base.pathForTile = function(tile, opt_path, opt_coordCache) {
    goog.asserts.assertInstanceof(tile, ol.TileCoord);

  var path = goog.isDefAndNotNull(opt_path) ? opt_path : [];
  var tilez = tile.z;

  var i, j;
  if (!goog.isDefAndNotNull(opt_coordCache)) {
    opt_coordCache = [];
  }
  for (i = opt_coordCache.length; i < tilez + 1; i++) {
    opt_coordCache.push([]);
  }
  var k = 1 << tilez;
  var xt = tile.x;
  var yt = -tile.y - 1;
  for (i = 0; i <= tilez; i++) {
    opt_coordCache[i][0] = (xt & k);
    opt_coordCache[i][1] = (yt & k);
    k >>= 1;
  }
  path.length = 0;
  for (i = 0; i <= tilez; i++) {
    var coord = opt_coordCache[i];
    var index = schedul.qt.Base.q2i(coord[0], coord[1]);
    path.push(index);
  }

  return path;
};


/**
 * @param {!number} x
 * @param {!number} y
 * @return {!number}
 */
schedul.qt.Base.q2i = function(x, y) {
  return (x === 0 ? 0 : 1) + (y === 0 ? 0 : 2);
};


/**
 * @param {!number} i
 * @return {!number}
 */
schedul.qt.Base.i2x = function(i) {
  return ((i & 1) === 0) ? 0 : 1;
};


/**
 * @param {!number} i
 * @return {!number}
 */
schedul.qt.Base.i2y = function(i) {
  return ((i & 2) === 0) ? 0 : 1;
};
