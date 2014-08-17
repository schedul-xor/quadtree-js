goog.provide('schedul.qt.Base');

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
 * @param {!ol.TileCoord} tile
 */
schedul.qt.Base.prototype.registerTileOutlineWithTile = function(tile){
  goog.asserts.assertInstanceof(tile,ol.TileCoord);

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
schedul.qt.Base.prototype.overrideTileOutlineWithTile = function(requestedTile,foundTile,status,opt_notDirectlyRequestedButDiedTilesVessel){
  goog.asserts.assertInstanceof(requestedTile,ol.TileCoord);
  goog.asserts.assertInstanceof(foundTile,ol.TileCoord);

  schedul.qt.Base.pathForTile(foundTile,this.pathVessel_);
  this.overrideTileOutlineWithPath(requestedTile,this.pathVessel_,status,opt_notDirectlyRequestedButDiedTilesVessel);
};


/**
 * @param {!ol.TileCoord} requestedTile
 * @param {!Array.<!number>} foundPath
 * @param {!schedul.qt.NodeStatus} status
 * @param {!Array.<!string>=} opt_notDirectlyRequestedButDiedTileCidsVessel
 */
schedul.qt.Base.prototype.overrideTileOutlineWithPath = goog.abstractMethod;


/**
 * @param {!Array.<!number>} searchingPath
 * @param {Array.<!number>=} opt_mostDensePath
 * @return {!Array.<!number>} Found path.
 */
schedul.qt.Base.prototype.mostDensePathForPath = goog.abstractMethod;


/**
 * @param {!ol.TileCoord} searchingTile
 * @return {!Array.<!number>} Found path.
 */
schedul.qt.Base.prototype.mostDensePathForTile = function(searchingTile){
  goog.asserts.assertInstanceof(searchingTile,ol.TileCoord);

  schedul.qt.Base.pathForTile(searchingTile, this.pathVessel_);
  return this.mostDensePathForPath(this.pathVessel_);
};


/**
 * @param {!ol.TileCoord} searchingTile
 * @return {!ol.TileCoord} Found tile.
 */
schedul.qt.Base.prototype.mostDenseTileForTile = function(searchingTile){
  goog.asserts.assertInstanceof(searchingTile,ol.TileCoord);

  var mostDensePath = this.mostDensePathForTile(searchingTile);
  return schedul.qt.Base.tileForPath(mostDensePath);
};


/**
 * @param {!Array.<!number>} path
 * @param {!number=} opt_limitZ
 * @return {!ol.TileCoord}
 */
schedul.qt.Base.tileForPath = function(path, opt_limitZ) {
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
  return new ol.TileCoord(z, x, y);//z, x, y
};


/**
 * x range is from  0 to -2^n-1
 * y range is from  -1 to -2^n
 *
 * @param {!ol.TileCoord} tile
 * @param {!Array.<!number>} output
 * @param {!Array.<!number>=} opt_coordCache
 */
schedul.qt.Base.pathForTile = function(tile, output, opt_coordCache) {
    goog.asserts.assertInstanceof(tile,ol.TileCoord);
    goog.asserts.assertArray(output);

  var i, j;
  if (!goog.isDefAndNotNull(opt_coordCache)) {
    opt_coordCache = [];
  }
  for (i = opt_coordCache.length; i < tile.z + 1; i++) {
    opt_coordCache.push([]);
  }
  var k = 1 << tile.z;
  var xt = tile.x;
  var yt = -tile.y - 1;
  for (i = 0; i <= tile.z; i++) {
    opt_coordCache[i][0] = (xt & k);
    opt_coordCache[i][1] = (yt & k);
    k >>= 1;
  }
  output.length = 0;
  for (i = 0; i <= tile.z; i++) {
    var coord = opt_coordCache[i];
    var index = schedul.qt.Base.q2i(coord[0], coord[1]);
    output.push(index);
  }
};


/**
 * Result vessel will result to values [minX, minY, maxX, maxY].
 *
 * @param {!Array.<!number>}  path
 * @param {!number} zoomLevel
 * @param {!Array.<!number>} resultVessel
 */
schedul.qt.Base.tileOutlineAtZoomLevel = function(path, zoomLevel,
    resultVessel) {
  resultVessel.length = 0;
  var originalPathLength = path.length;
  var zoomLevelDelta = zoomLevel - originalPathLength + 1;
  var i;

  // Search min tile
  for (i = 0; i < zoomLevelDelta; i++) {
    path.push(0); // 0 is minimum for both X and Y
  }
  var minTile = schedul.qt.Base.tileForPath(path, zoomLevel);
  path.length = originalPathLength;
  resultVessel.push(minTile.x);
  resultVessel.push(minTile.y);

  for (i = 0; i < zoomLevelDelta; i++) {
    path.push(3); // 3 is maximum for both X and Y
  }
  var maxTile = schedul.qt.Base.tileForPath(path, zoomLevel);
  path.length = originalPathLength;
  resultVessel.push(maxTile.x);
  resultVessel.push(maxTile.y);

  // Sort the order max < min into max > min
  var t;
  if(resultVessel[0] > resultVessel[2]){
    t = resultVessel[2];
    resultVessel[2] = resultVessel[0];
    resultVessel[0] = t;
  }
  if(resultVessel[1] > resultVessel[3]){
    t = resultVessel[3];
    resultVessel[3] = resultVessel[1];
    resultVessel[1] = t;
  }
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
