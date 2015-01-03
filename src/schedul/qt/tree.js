goog.provide('schedul.qt.Tree');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('schedul.qt.Node');
goog.require('schedul.qt.NodeStatus');



/**
 * @constructor
 */
schedul.qt.Tree = function(){
  this.root_ = new schedul.qt.Node(schedul.qt.NodeStatus.ROOT);
  /**
   * @private
   * @type {!{i:!number,node:!schedul.qt.Node}}
   */
  this.foundAppendingStatus_ = {
    i:0,
    node:this.root_
  };
};


/**
 * @private
 * @param {!Array.<!number>} addingPath
 */
schedul.qt.Tree.prototype.findAppendingNode_ = function(addingPath){
  var currentNode = this.root_;
  var appendingRootNode = currentNode; // Temporary value
  var i = 0;
  for(;i < addingPath.length;i++){
    var slot = addingPath[i];
    var childNode = currentNode.getChild(slot);
    if(goog.isNull(childNode)){
      appendingRootNode = currentNode;
      break;
    }
    currentNode = childNode;
  }
  this.foundAppendingStatus_.node = appendingRootNode;
  this.foundAppendingStatus_.i= i;
};


/**
 * @private
 * @param {!Array.<!number>} addingPath
 * @param {!schedul.qt.Node} appendingNode
 * @param {!number} appendingPathIndex
 * @param {!schedul.qt.NodeStatus} finalStatus
 */
schedul.qt.Tree.prototype.appendRestOfTheNodesRequired_ = function(addingPath,appendingNode,appendingPathIndex,finalStatus){
  goog.asserts.assertInstanceof(appendingNode,schedul.qt.Node);
  goog.asserts.assertNumber(appendingPathIndex);
  goog.asserts.assertNumber(finalStatus);

  for(var i = appendingPathIndex;i < addingPath.length;i++){
    var appendingSlot = addingPath[i];
    var status = (i < addingPath.length-1)?
      schedul.qt.NodeStatus.GRAY:
      finalStatus;
    var newChildNode = new schedul.qt.Node(status);
    appendingNode.updateChild(newChildNode,appendingSlot);
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
schedul.qt.Tree.prototype.mergeParents_ = function(endNode){
  goog.asserts.assertInstanceof(endNode,schedul.qt.Node);

  while(true){
    var parentNode = endNode.getParent();
    if(goog.isNull(parentNode)){break;}
    var thereAreStillGrayChildrenLeft = false;
    var foundExistingLeaves = 0;
    var foundEmptyLeaves = 0;
    for(var i = 0;i < 4;i++){
      var child = parentNode.getChild(i);
      if(goog.isNull(child)){
        thereAreStillGrayChildrenLeft = true;
      }else{
        var status = child.getStatus();
        switch(status){
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
      if(thereAreStillGrayChildrenLeft){ break; } // Exiting for-loop
    }
    if(thereAreStillGrayChildrenLeft){ break; } // Exiting while-loop

    var merged = false;
    if(foundEmptyLeaves < 1){ // === 0
      // All children are existing-terminal => update parent to existing-terminal
      parentNode.setStatus(schedul.qt.NodeStatus.EXISTING_TERMINAL);
      merged = true;
    }else if(foundExistingLeaves < 1){ // === 0
      parentNode.setStatus(schedul.qt.NodeStatus.EMPTY_TERMINAL);
      merged = true;
    }else{
      parentNode.setStatus(schedul.qt.NodeStatus.SURELY_MIXED);
    }
    if(merged){
      for(var i = 0;i < 4;i++){
        parentNode.updateChild(null,i);
      }
    }

    endNode = parentNode;
  }
};


/**
 * @param {!Array.<!number>} addingPath
 * @param {!boolean} isExisting
 */
schedul.qt.Tree.prototype.addTerminal = function(addingPath,isExisting){
  schedul.qt.Tree.assertPath_(addingPath);
  goog.asserts.assertBoolean(isExisting);

  // Find the appending node
  this.findAppendingNode_(addingPath);
  var appendingPathIndex = this.foundAppendingStatus_.i;
  var appendingNode = this.foundAppendingStatus_.node;
  goog.asserts.assertInstanceof(appendingNode,schedul.qt.Node);

  // append rest of the nodes required
  var endNode = this.appendRestOfTheNodesRequired_(
    addingPath,
    appendingNode,
    appendingPathIndex,
    isExisting?schedul.qt.NodeStatus.EXISTING_TERMINAL:schedul.qt.NodeStatus.EMPTY_TERMINAL);

  // Merge full nodes from leaves
  this.mergeParents_(endNode);
};


/**
 * @param {!Array.<!number>} addingPath
 */
schedul.qt.Tree.prototype.addGray = function(addingPath){
  schedul.qt.Tree.assertPath_(addingPath);

  // Find the appending node
  this.findAppendingNode_(addingPath);
  var appendingPathIndex = this.foundAppendingStatus_.i;
  var appendingNode = this.foundAppendingStatus_.node;
  goog.asserts.assertInstanceof(appendingNode,schedul.qt.Node);

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
 * @param {!number=} opt_diggingPathDepthLimit
 * @template S
 */
schedul.qt.Tree.prototype.forEachProbablyExistingPathsInPath = function(targetPath,callback,opt_obj,opt_diggingPathDepthLimit){
  goog.asserts.assertArray(targetPath);
  goog.asserts.assertFunction(callback);

  var diggingPathDepthLimit = opt_diggingPathDepthLimit || Infinity;

  var startingNode = this.root_;
  var startingIndex = 0;
  var isInvalidPath = false;
  for(;startingIndex < targetPath.length;startingIndex++){
    var isTerminal = false;
    var slot = targetPath[startingIndex];
    var foundChild = startingNode.getChild(slot);
    if(goog.isNull(foundChild)){
      isInvalidPath = true;
      break;
    }else{
      var status = foundChild.getStatus();
      switch(status){
      case schedul.qt.NodeStatus.EXISTING_TERMINAL:
      case schedul.qt.NodeStatus.EMPTY_TERMINAL:
        isTerminal = true;
        break;
      }
    }
    startingNode = foundChild;
    if(isTerminal){break;}
  }
  if(isInvalidPath){
    var invalidRootPath = goog.array.clone(startingNode.getPathCache());
    invalidRootPath.push(targetPath[startingIndex]);
    callback.call(opt_obj,invalidRootPath,schedul.qt.NodeStatus.GRAY);
    return;
  }

  var foundNodes0 = [startingNode];
  var foundNodes1 = [];

  var openNodes = foundNodes0;
  var closedNodes = foundNodes1;

  // Dig inside current found nodes
  while(true){
    goog.array.forEach(openNodes,function(openNode,index){
      diggingPathDepthLimit = this.forEachProbablyExistingPathsInNode_(openNode,closedNodes,callback,diggingPathDepthLimit,opt_obj);
    },this);

    if(closedNodes.length < 1){ break; }

    if(diggingPathDepthLimit < 0){
      goog.array.forEach(closedNodes,function(closedNode,index){
        callback.call(opt_obj,closedNode.getPathCache(),closedNode.getStatus());
      },this);
      return;
    }

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
 * @param {!number} diggingPathDepthLimit
 * @param {S=} opt_obj Scope.
 * @return {!number}
 * @template S
 */
schedul.qt.Tree.prototype.forEachProbablyExistingPathsInNode_ = function(node,foundChildren,callback,diggingPathDepthLimit,opt_obj){
  goog.asserts.assertFunction(callback);
  goog.asserts.assertNumber(diggingPathDepthLimit);

  var pathCache = node.getPathCache();
  switch(node.getStatus()){
  case schedul.qt.NodeStatus.EXISTING_TERMINAL:
    callback.call(opt_obj,pathCache,schedul.qt.NodeStatus.EXISTING_TERMINAL);
    diggingPathDepthLimit--;
    break;
  case schedul.qt.NodeStatus.GRAY:
  case schedul.qt.NodeStatus.ROOT:
    for(var i = 0;i < 4;i++){
      var child = node.getChild(i);
      if(goog.isNull(child)){
        pathCache.push(i);
        callback.call(opt_obj,pathCache,schedul.qt.NodeStatus.GRAY);
        diggingPathDepthLimit--;
        pathCache.pop();
      }else{
        foundChildren.push(child);
      }
    }
    break;
  case schedul.qt.NodeStatus.SURELY_MIXED:
    for(var i = 0;i < 4;i++){
      var child = node.getChild(i);
      if(child.getStatus() === schedul.qt.NodeStatus.EMPTY_TERMINAL){
        continue;
      }
      foundChildren.push(child);
    }
    break;
  }
  return diggingPathDepthLimit;
};


/**
 * @private
 * @param {!Array.<!number>} path
 */
schedul.qt.Tree.assertPath_ = function(path){
  goog.asserts.assertArray(path);
  goog.array.forEach(path,function(slot,index){
    goog.asserts.assertNumber(slot);
    goog.asserts.assert(slot === 0 || slot === 1 || slot === 2 || slot === 3,slot+' is an invalid slot.');
  });
};
