goog.provide('schedul.qt.SmartTree');

goog.require('goog.asserts');
goog.require('schedul.qt.Base');
goog.require('schedul.qt.NodeLoadingStatus');
goog.require('schedul.qt.NodeStatus');
goog.require('schedul.qt.SmartTreeNode');
goog.require('ol.TileCoord');



/**
 * Patricia quad tree.
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 */
schedul.qt.SmartTree = function() {
  goog.base(this);

  this.nodePool_ = [];
  this.rootNode_ = null;
  this.tile2Path_ = {};
};
goog.inherits(schedul.qt.SmartTree, schedul.qt.Base);


/**
 * Request tile outline status.
 *
 * @param {!ol.TileCoord} tile
 * @param {!Array.<!number>=} opt_path
 * @return {!Array.<!number>}
 */
schedul.qt.SmartTree.prototype.registerTileOutlineWithPath = function(tile,
    opt_path) {
  var path = [];
  schedul.qt.Base.pathForTile(tile, path);
  if (goog.isNull(this.rootNode_)) {
    // Set root node
    var i;
    this.rootNode_ = this.allocateNode_();
    this.rootNode_.clearPartialPath();
    for (i = 0; i < path.length; i++) { this.rootNode_.pushPartialPath(path[i]
      ); }
    this.rootNode_.setStatus(schedul.qt.NodeStatus.IS_MYSTERIOUS);
  }else {
    // Merge to current tree
    this.discoverTileForNodeAndOffset(path, 0, this.rootNode_, []);
  }
  return path;
};


/**
 * @param {!ol.TileCoord} tile
 * @return {?Array.<!number>}
 */
schedul.qt.SmartTree.prototype.pathForTile = function(tile) {
  var tileUid = goog.getUid(tile);
  if (!goog.object.containsKey(this.tile2Path_, tileUid)) {
    return null;
  }
  return this.tile2Path_[tileUid];
};


/**
 * @param {!ol.TileCoord} tile
 * @param {!Array.<!number>} foundPath
 * @param {!schedul.qt.NodeStatus} status
 */
schedul.qt.SmartTree.prototype.
    overrideTileOutlineWithPath = function(requestedTile,
    foundPath, status) {
  if (goog.isNull(requestedTile) || goog.isNull(foundPath) || goog.isNull(this.
      rootNode_)) {
    return;
  }
  this.overrideTileOutlineWithPathForNodeAndOffset_(foundPath, 0, this.rootNode_,
      status);
  var tileUid = goog.getUid(requestedTile);
  this.tile2Path_[tileUid] = foundPath;
};


/**
 * @param {!Array.<!number>} path
 * @param {!number} zoomLevel
 * @return {!Array.<!ol.TileCoord>}
 */
schedul.qt.SmartTree.prototype.
    allOverriddenTilesForPathAndZoomLevel = function(path, zoomLevel) {
  var trimmedPath = [];
  for (var i = 0; i < zoomLevel + 1 && i < path.length; i++) {
    trimmedPath.push(path[i]);
  }
  var foundTiles = [];
  this.addAllOverriddenTilesInNodeForPartialPathAndLeftZoomLevel_(this.
      rootNode_, trimmedPath, [], foundTiles);
  return foundTiles;
};


/**
 * @private
 * @param {!schedul.qt.SmartTreeNode} targetNode
 * @param {!Array.<!number>} searchingPath
 * @param {!Array.<!number>} currentPathStack
 * @param {!Array.<!ol.TileCoord>} foundTilesVessel
 */
schedul.qt.SmartTree.prototype.
    addAllOverriddenTilesInNodeForPartialPathAndLeftZoomLevel_ = function(targetNode, searchingPath, currentPathStack, foundTilesVessel) {
  var initialCurrentPathStackLength = currentPathStack.length;
  var nodePath = targetNode.getPartialPath();
  var notFound = false;
  var i;
  for (i = 0;
      i < nodePath.length && i < searchingPath.length;
      i++) {
    var nodeValue = nodePath[i];
    var searchingValue = searchingPath[i];
    if (nodeValue != searchingValue) {notFound = true;break;}
    currentPathStack.push(nodeValue);
  }
  var consumedPathLength = i;
  if (!notFound) {
    var nextNode = null;
    if (nodePath.length === consumedPathLength && searchingPath.length >
        consumedPathLength) {
      var childKey = searchingPath[consumedPathLength];
      nextNode = targetNode.getChild(childKey);
      if (goog.isNull(nextNode)) {notFound = true;}
      consumedPathLength++;
      currentPathStack.push(childKey);
    }
    if (!notFound) {
      var leftSearchingPathLength = searchingPath.length -
          consumedPathLength;
      if (leftSearchingPathLength <= 0) {
        this.addAllTilesUnderNode_(targetNode, consumedPathLength,
            currentPathStack, foundTilesVessel);
      }else if (!goog.isNull(nextNode)) {
        var nextSearchingPath = [];
        for (i = nodePath.length + 1; i < searchingPath.length; i++) {
          nextSearchingPath.push(searchingPath[i]);
        }
        this.
            addAllOverriddenTilesInNodeForPartialPathAndLeftZoomLevel_(nextNode, nextSearchingPath, currentPathStack, foundTilesVessel);
      }
    }
  }
  currentPathStack.length = initialCurrentPathStackLength;
};


/**
 * @private
 * @param {!schedul.qt.SmartTreeNode} targetNode
 * @param {!number} alreadyConsumedPathLength
 * @param {!Array.<!number>} currentPathStack
 * @param {!Array.<!ol.TileCoord>} foundTilesVessel
 */
schedul.qt.SmartTree.prototype.addAllTilesUnderNode_ = function(targetNode,
    alreadyConsumedPathLength, currentPathStack, foundTilesVessel) {
  if (alreadyConsumedPathLength >= currentPathStack.length) {
    var tile = schedul.qt.Base.tileForPath(currentPathStack);
    foundTilesVessel.push(tile);
    return;
  }
  var i;
  var initialCurrentPathStackLength = currentPathStack.length;
  for (i = 0; i < 4; i++) {
    var child = targetNode.getChild(i);
    if (goog.isNull(child)) {continue;}

  }
};


/**
 * @private
 * @param {!Array.<!number>} path
 * @param {!number} pathOffset
 * @param {!schedul.qt.SmartTreeNode} node
 * @param {!number} splittingIndex
 */
schedul.qt.SmartTree.prototype.splitAndAppendTreeAt_ = function(path,
    pathOffset, node, splittingIndex) {
  var j;
  var treePath = node.getPartialPath();
  var treePathLength = treePath.length;
  var originalIndex = treePath[splittingIndex];

  // Create new node for treePath
  var newNodeOriginal = this.allocateNode_();
  newNodeOriginal.clearPartialPath();
  var treeFrom = splittingIndex + 1;
  var treeLimit = treePathLength;
  for (j = treeFrom; j < treeLimit; j++) {
    newNodeOriginal.pushPartialPath(treePath[j]);
  }
  newNodeOriginal.setStatus(schedul.qt.NodeStatus.IS_MYSTERIOUS);
  for (j = 0; j < 4; j++) {
    newNodeOriginal.setChild(node.getChild(j), j);
    node.setChild(null, j);
  }

  // Create new node for path (added)
  var newNodeAppended = this.allocateNode_();
  newNodeAppended.clearPartialPath();
  var pathFrom = pathOffset + splittingIndex + 1;
  var pathLimit = path.length;
  for (j = pathFrom; j < pathLimit; j++) {
    newNodeAppended.pushPartialPath(path[j]);
  }
  newNodeAppended.setStatus(schedul.qt.NodeStatus.IS_MYSTERIOUS);

  var rootFrom = pathOffset;
  var rootLimit = pathOffset + splittingIndex;
  node.clearPartialPath();
  for (j = rootFrom; j < rootLimit; j++) {
    node.pushPartialPath(path[j]);
  }
  node.setChild(newNodeOriginal, originalIndex);
  node.setChild(newNodeAppended, path[splittingIndex + pathOffset]);
};


/**
 * @private
 * @param {!Array.<!number>} path
 * @param {!number} pathOffset
 * @param {!schedul.qt.SmartTreeNode} treeNode
 * @param {!number} appendingIndex
 */
schedul.qt.SmartTree.prototype.appendTreeToBranch_ = function(path,
    pathOffset,
    treeNode, appendingIndex) {
  var j;
  // If is already splitted but only index is lacking
  var newNodeAppended = this.allocateNode_();
  newNodeAppended.clearPartialPath();
  for (j = pathOffset; j < path.length; j++) {
    newNodeAppended.pushPartialPath(path[j]);
  }
  treeNode.setChild(newNodeAppended, appendingIndex);
};


/**
 * @private
 * @param {!Array.<!number>} path
 * @param {!number} length
 * @param {!Array.<!number>=} opt_foundPathVessel
 */
schedul.qt.SmartTree.prototype.fillPathResult_ = function(path, length,
    opt_foundPathVessel) {
  if (!goog.isDef(opt_foundPathVessel)) {
    return;
  }
  var i;
  opt_foundPathVessel.length = 0;
  for (i = 0; i < length; i++) {
    if (!goog.isDef(path[i])) {
      continue;
    }
    opt_foundPathVessel.push(path[i]);
  }
};


/**
 * @param {!Array.<!number>} path
 * @param {!number} pathOffset
 * @param {?schedul.qt.SmartTreeNode} node
 * @param {!Array.<!number>=} opt_foundPathVessel
 */
schedul.qt.SmartTree.prototype.
    discoverTileForNodeAndOffset = function(path,
    pathOffset, node, opt_foundPathVessel) {
  if (!goog.isDefAndNotNull(node)) {
    return;
  }
  if (node.getStatus() === schedul.qt.NodeStatus.IS_SURELY_LEAF) {
    this.fillPathResult_(path, pathOffset, opt_foundPathVessel);
    return;
  }
  var i;
  var leftPathLength = path.length - pathOffset;
  var treePath = node.getPartialPath();
  var treePathLength = treePath.length;
  for (i = 0;
      i < leftPathLength && i < treePathLength;
      i++) {
    var pathIndex = path[i + pathOffset];
    var treeIndex = treePath[i];
    if (pathIndex !== treeIndex) {
      this.splitAndAppendTreeAt_(path, pathOffset, node, i);
      this.fillPathResult_(path, path.length, opt_foundPathVessel);
      return;
    }
  }
  pathOffset += treePathLength;

  var nextIndex = path[pathOffset];
  if (goog.isNull(node.getChild(nextIndex))) {
    this.appendTreeToBranch_(path, pathOffset + 1, node, nextIndex);
    this.fillPathResult_(path, path.length, opt_foundPathVessel);
    return;
  }
  var nextNode = node.getChild(nextIndex);
  this.discoverTileForNodeAndOffset(path, pathOffset + 1, nextNode,
      opt_foundPathVessel);
};


/**
 * @private
 * @param {!Array.<!number>} path
 * @param {!number} pathOffset
 * @param {?schedul.qt.SmartTreeNode} node
 * @param {!schedul.qt.NodeStatus} status
 */
schedul.qt.SmartTree.prototype.
    overrideTileOutlineWithPathForNodeAndOffset_ = function(path, pathOffset, node,
    status) {
  if (goog.isNull(node)) {return;}
  var leftPathLength = path.length - pathOffset;
  var treePath = node.getPartialPath();
  var treePathLength = treePath.length;

  if (treePathLength >= leftPathLength) {
    var i;
    for (i = 0; i < treePathLength - leftPathLength; i++) {
      node.popPartialPath();
    }
    for (i = 0; i < 4; i++) {
      node.setChild(null, i);
    }
    var lastIndex = node.popPartialPath();
    var terminalNode = this.allocateNode_();
    terminalNode.clearPartialPath();
    terminalNode.setStatus(status);
    node.setChild(terminalNode, lastIndex);
    return;
  }
  pathOffset += treePathLength;
  var nextIndex = path[pathOffset];
  var nextNode = node.getChild(nextIndex);
  this.overrideTileOutlineWithPathForNodeAndOffset_(
      path, pathOffset + 1, nextNode, status);
};


/**
 * @return {?Object}
 */
schedul.qt.SmartTree.prototype.toJSON = function() {
  if (goog.isNull(this.rootNode_)) {
    return null;
  }
  return this.rootNode_.toJSON();
};


/**
 * @private
 * @return {!schedul.qt.SmartTreeNode}
 */
schedul.qt.SmartTree.prototype.allocateNode_ = function() {
  if (this.nodePool_.length === 0) {
    return new schedul.qt.SmartTreeNode();
  }
  return this.nodePool_.pop();
};


/**
 * @private
 * @param {!schedul.qt.SmartTreeNode} node
 */
schedul.qt.SmartTree.prototype.freeNode_ = function(node) {
  this.nodePool_.push(node);
};


/**
 * @private
 * @param {?schedul.qt.SmartTreeNode} node
 */
schedul.qt.SmartTree.prototype.freeNodeWithChildren_ = function(node) {
  if (goog.isNull(node)) {
    return;
  }
  for (var i = 0; i < 4; i++) {
    var child = node.getChild(i);
    if (goog.isNull(child)) {
      continue;
    }
    node.setChild(null, i);
    this.freeNodeWithChildren_(child);
  }
  this.freeNode_(node);
};


/**
 * @private
 * @param {!schedul.qt.SmartTreeNode} node
 */
schedul.qt.SmartTree.prototype.freeNodeOnlyForChildren_ = function(node) {
  for (var i = 0; i < 4; i++) {
    var child = node.getChild(i);
    this.freeNodeWithChildren_(child);
  }
};
