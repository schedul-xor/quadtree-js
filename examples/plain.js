goog.require('ol.TileCoord');
goog.require('schedul.qt.Base');
goog.require('schedul.qt.MapTree');
goog.require('schedul.qt.NodeStatus');


var qt = new schedul.qt.MapTree();
var tile1 = [17,12345,-30000];
var tile2 = [15,12346,-32140];
var tile3 = [16,12347,-12513];
qt.registerAndOverrideWithTile(tile1,schedul.qt.NodeStatus.IS_SURELY_LEAF);
qt.registerAndOverrideWithTile(tile2,schedul.qt.NodeStatus.IS_SURELY_LEAF);
qt.registerAndOverrideWithTile(tile3,schedul.qt.NodeStatus.IS_SURELY_LEAF);

var tile4 = [16,12349,-12513];

var path = [];
schedul.qt.Base.pathForTile(tile1,path);
var result18 = qt.allOverriddenTilesForPathAndZoomLevel(path,18);
console.log(result18);
console.log(result18);
schedul.qt.Base.pathForTile(tile4,path);
var result17 = qt.allOverriddenTilesForPathAndZoomLevel(path,17);
console.log(result17);
console.log(result17);
