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
};


/**
 * @param {!Array.<!number>} addingPath
 * @param {!boolean} isExisting
 */
schedul.qt.Tree.prototype.addTerminal = function(addingPath,isExisting){
  goog.asserts.assertArray(addingPath);
  goog.array.forEach(addingPath,function(slot,index){
    goog.asserts.assertNumber(slot);
    goog.asserts.assert(slot === 0 || slot === 1 || slot === 2 || slot === 3,slot+' is an invalid slot.');
  },this);
  goog.asserts.assertBoolean(isExisting);

  // Find the appending node
  var currentNode = this.root_;
  var appendingRootNode = null;
  var appendingPathIndex = 0;
  for(;appendingPathIndex < addingPath.length;appendingPathIndex++){
    var slot = addingPath[appendingPathIndex];
    var childNode = currentNode.getChild(slot);
    if(goog.isNull(childNode)){
      appendingRootNode = currentNode;
      break;
    }
    currentNode = childNode;
  }
  // currentNode is the appending node!

  // append rest of the nodes required
  for(var i = appendingPathIndex;i < addingPath.length;i++){
    var appendingSlot = addingPath[i];
    var status = (i === addingPath.length-1)?
      (isExisting?schedul.qt.NodeStatus.EXISTING_TERMINAL:schedul.qt.NodeStatus.EMPTY_TERMINAL):
      schedul.qt.NodeStatus.GRAY;
    var newChildNode = new schedul.qt.Node(status);
    currentNode.updateChild(newChildNode,appendingSlot);
    newChildNode.setParent(currentNode);
    var newPathCache = goog.array.clone(currentNode.getPathCache());
    newPathCache.push(appendingSlot);
    newChildNode.setPathCache(newPathCache);

    currentNode = newChildNode;
  }
  // currentNode is the new leaf!

  // Merge full nodes from leaves
  while(true){
    var parentNode = currentNode.getParent();
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
    if(foundEmptyLeaves === 0){
      // All children are existing-terminal => update parent to existing-terminal
      parentNode.setStatus(schedul.qt.NodeStatus.EXISTING_TERMINAL);
      merged = true;
    }else if(foundExistingLeaves === 0){
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

    currentNode = parentNode;
  }
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

  while(true){
    goog.array.forEach(openNodes,function(openNode,index){
      diggingPathDepthLimit = this.forEachProbablyExistingPathsInNode_(openNode,closedNodes,callback,diggingPathDepthLimit,opt_obj);
    },this);

    if(closedNodes.length === 0){ break; }

    if(diggingPathDepthLimit < 0){
      goog.array.forEach(closedNodes,function(closedNode,index){
        callback.call(opt_obj,closedNode.getPathCache(),closedNode.getStatus());
      },this);
      return;
    }

    // Swap
    var t = closedNodes;
    closedNodes = openNodes;
    openNodes = t;

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
