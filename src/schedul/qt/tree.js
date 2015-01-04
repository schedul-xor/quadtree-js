goog.provide('schedul.qt.Tree');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('schedul.qt.Node');
goog.require('schedul.qt.NodeStatus');



/**
 * @constructor
 */
schedul.qt.Tree = function() {
  this.root_ = new schedul.qt.Node(schedul.qt.NodeStatus.GRAY);

  /**
   * @private
   * @type {!{i:!number,node:!schedul.qt.Node}}
   */
  this.foundAppendingStatus_ = {
    i: 0,
    node: this.root_
  };
};


/**
 * @private
 * @param {!Array.<!number>} addingPath
 */
schedul.qt.Tree.prototype.findAppendingNode_ = function(addingPath) {
  var currentNode = this.root_;
  var appendingRootNode = null; // Temporary value
  var i = 0;
  for (; i < addingPath.length; i++) {
    var slot = addingPath[i];
    var childNode = currentNode.getChild(slot);
    if (goog.isNull(childNode)) {
      appendingRootNode = currentNode;
      break;
    }
    currentNode = childNode;
  }
  if (goog.isNull(appendingRootNode)) {
    appendingRootNode = currentNode;
  }
  this.foundAppendingStatus_.node = appendingRootNode;
  this.foundAppendingStatus_.i = i;
};


/**
 * @private
 * @param {!Array.<!number>} addingPath
 * @param {!schedul.qt.Node} appendingNode
 * @param {!number} appendingPathIndex
 * @param {!schedul.qt.NodeStatus} finalStatus
 */
schedul.qt.Tree.prototype.appendRestOfTheNodesRequired_ = function(addingPath, appendingNode, appendingPathIndex, finalStatus) {
  goog.asserts.assertInstanceof(appendingNode, schedul.qt.Node);
  goog.asserts.assertNumber(appendingPathIndex);
  goog.asserts.assertString(finalStatus);

  for (var i = appendingPathIndex; i < addingPath.length; i++) {
    var appendingSlot = addingPath[i];
    var status = (i < addingPath.length - 1) ?
      schedul.qt.NodeStatus.GRAY :
      finalStatus;
    var newChildNode = new schedul.qt.Node(status);
    appendingNode.updateChild(newChildNode, appendingSlot);
    newChildNode.setParent(appendingNode);
    var newPathCache = goog.array.clone(appendingNode.getPathCache());
    newPathCache.push(appendingSlot);
    newChildNode.setPathCache(newPathCache);

    appendingNode = newChildNode;
  }
  return appendingNode;
};


/**
 * @private
 * @param {!schedul.qt.Node} endNode
 */
schedul.qt.Tree.prototype.mergeParentsFromEnd_ = function(endNode) {
  goog.asserts.assertInstanceof(endNode, schedul.qt.Node);

  while (true) {
    var parentNode = endNode.getParent();
    if (goog.isNull(parentNode)) {break;}
    var thereAreStillGrayChildrenLeft = false;
    var foundExistingLeaves = 0;
    var foundEmptyLeaves = 0;
    for (var i = 0; i < 4; i++) {
      var child = parentNode.getChild(i);
      if (goog.isNull(child)) {
        thereAreStillGrayChildrenLeft = true;
      }else {
        var status = child.getStatus();
        switch (status) {
        case schedul.qt.NodeStatus.EXISTING_TERMINAL:
          foundExistingLeaves++;break;
        case schedul.qt.NodeStatus.EMPTY_TERMINAL:
          foundEmptyLeaves++;break;
        case schedul.qt.NodeStatus.SURELY_MIXED:
          foundExistingLeaves++;foundEmptyLeaves++;break;
        default:
          thereAreStillGrayChildrenLeft = true;
          break;
        }
      }
      if (thereAreStillGrayChildrenLeft) { break; } // Exiting for-loop
    }
    if (thereAreStillGrayChildrenLeft) { break; } // Exiting while-loop

    var merged = false;
    if (foundEmptyLeaves < 1) { // === 0
      // All children are existing-terminal => update parent to existing-terminal
      parentNode.setStatus(schedul.qt.NodeStatus.EXISTING_TERMINAL);
      merged = true;
    }else if (foundExistingLeaves < 1) { // === 0
      parentNode.setStatus(schedul.qt.NodeStatus.EMPTY_TERMINAL);
      merged = true;
    }else {
      parentNode.setStatus(schedul.qt.NodeStatus.SURELY_MIXED);
    }
    if (merged) {
      for (var i = 0; i < 4; i++) {
        parentNode.updateChild(null, i);
      }
    }

    endNode = parentNode;
  }
};


/**
 * @param {!Array.<!number>} addingPath
 * @param {!boolean} isExisting
 */
schedul.qt.Tree.prototype.addTerminal = function(addingPath, isExisting) {
  schedul.qt.Node.assertPath(addingPath);
  goog.asserts.assertBoolean(isExisting);

  // Find the appending node
  this.findAppendingNode_(addingPath);
  var appendingPathIndex = this.foundAppendingStatus_.i;
  var appendingNode = this.foundAppendingStatus_.node;
  goog.asserts.assertInstanceof(appendingNode, schedul.qt.Node);

  // append rest of the nodes required
  var endNode = this.appendRestOfTheNodesRequired_(
    addingPath,
    appendingNode,
    appendingPathIndex,
    isExisting ? schedul.qt.NodeStatus.EXISTING_TERMINAL : schedul.qt.NodeStatus.EMPTY_TERMINAL);

  // Merge full nodes from leaves
  this.mergeParentsFromEnd_(endNode);
};


/**
 * @param {!Array.<!number>} addingPath
 */
schedul.qt.Tree.prototype.addGray = function(addingPath) {
  schedul.qt.Node.assertPath(addingPath);

  // Find the appending node
  this.findAppendingNode_(addingPath);
  var appendingPathIndex = this.foundAppendingStatus_.i;
  var appendingNode = this.foundAppendingStatus_.node;
  goog.asserts.assertInstanceof(appendingNode, schedul.qt.Node);

  // append rest of the nodes required
  var endNode = this.appendRestOfTheNodesRequired_(
    addingPath,
    appendingNode,
    appendingPathIndex,
    schedul.qt.NodeStatus.GRAY);
};


/**
 * @param {!Array.<!number>} targetPath
 * @param {function(this: S, !Array.<!number>,schedul.qt.NodeStatus): *} callback Callback.
 * @param {S=} opt_obj Scope.
 * @template S
 */
schedul.qt.Tree.prototype.forEachShallowPathsInPath = function(targetPath, callback, opt_obj) {
  schedul.qt.Node.assertPath(targetPath);
  goog.asserts.assertFunction(callback);

  var startingNode = this.root_;
  var startingIndex = 0;
  var isInvalidPath = false;
  for (; startingIndex < targetPath.length; startingIndex++) {
    var isTerminal = false;
    var slot = targetPath[startingIndex];
    var foundChild = startingNode.getChild(slot);
    if (goog.isDefAndNotNull(foundChild))  {
      var status = foundChild.getStatus();
      switch (status) {
      case schedul.qt.NodeStatus.EXISTING_TERMINAL:
      case schedul.qt.NodeStatus.EMPTY_TERMINAL:
        isTerminal = true;
        break;
      }
    }else{
      isInvalidPath = true;
      break;
    }
    startingNode = foundChild;
    if (isTerminal) {break;}
  }
  if (isInvalidPath) {
    var invalidRootPath = goog.array.clone(startingNode.getPathCache());
    invalidRootPath.push(targetPath[startingIndex]);
    callback.call(opt_obj, invalidRootPath, schedul.qt.NodeStatus.GRAY);
    return;
  }

  var foundNodes0 = [startingNode];
  var foundNodes1 = [];

  var openNodes = foundNodes0;
  var closedNodes = foundNodes1;

  // Dig inside current found nodes
  while (true) {
      while(openNodes.length > 0){
        var openNode = openNodes.pop();
        this.forEachShallowPathsInNode_(openNode, closedNodes, callback, opt_obj);
      }
    // Move left openNodes to closedNodes
    goog.array.forEach(openNodes,function(openNode){
      closedNodes.push(openNode);
    },this);

    if (closedNodes.length < 1) { break; }

    // Swap node arrays
    var t = closedNodes;
    closedNodes = openNodes;
    openNodes = t;

    // Empty closed nodes
    closedNodes.length = 0;
  }
};


/**
 * @private
 * @param {!schedul.qt.Node} node
 * @param {!Array.<!schedul.qt.Node>} foundChildren
 * @param {function(this: S, !Array.<!number>,schedul.qt.NodeStatus): *} callback Callback.
 * @param {S=} opt_obj Scope.
 * @template S
 */
schedul.qt.Tree.prototype.forEachShallowPathsInNode_ = function(node, foundChildren, callback, opt_obj) {
  goog.asserts.assertFunction(callback);

  var pathCache = node.getPathCache();
  var nodeStatus = node.getStatus();
  switch (nodeStatus) {
  case schedul.qt.NodeStatus.EXISTING_TERMINAL:
  case schedul.qt.NodeStatus.EMPTY_TERMINAL:
    callback.call(opt_obj, pathCache, nodeStatus);
    break;
  case schedul.qt.NodeStatus.SURELY_MIXED:
    for (var i = 0; i < 4; i++) {
      var child = node.getChild(i);
      foundChildren.push(child);
    }
    break;
  case schedul.qt.NodeStatus.GRAY:
    for (var i = 0; i < 4; i++) {
      var child = node.getChild(i);
      if (goog.isNull(child)) {
        pathCache.push(i);
        callback.call(opt_obj, pathCache, schedul.qt.NodeStatus.GRAY);
        pathCache.pop();
      }else {
        foundChildren.push(child);
      }
    }
    break;
  }
};


/**
 * @param {!Array.<!number>} path
 */
schedul.qt.Tree.prototype.statusForPath = function(path) {
  this.findAppendingNode_(path);
  var appendingNode = this.foundAppendingStatus_.node;
  if (goog.isNull(appendingNode)) {
    return schedul.qt.NodeStatus.GRAY;
  }
  return appendingNode.getStatus();
};
