goog.provide('schedul.qt.SmartTreeNode');



/**
 * @constructor
 */
schedul.qt.SmartTreeNode = function() {
  this.partialPath_ = [];
  this.children_ =
      /** @type {?Array.<?schedul.qt.SmartTreeNode>}*/ (null);
  this.zoomLevel_ = 0;
  this.loadingStatus_ = schedul.qt.NodeLoadingStatus.IDLE;
  this.status_ = schedul.qt.NodeStatus.IS_MYSTERIOUS;
};


/**
 * Empty the partial path.
 */
schedul.qt.SmartTreeNode.prototype.clearPartialPath = function() {
  this.partialPath_.length = 0;
};


/**
 * @param {!number} index
 */
schedul.qt.SmartTreeNode.prototype.pushPartialPath = function(index) {
  this.partialPath_.push(index);
};


/**
 * @return {!number}
 */
schedul.qt.SmartTreeNode.prototype.popPartialPath = function() {
  return this.partialPath_.pop();
};


/**
 * @return {!Array.<!number>}
 */
schedul.qt.SmartTreeNode.prototype.getPartialPath = function() {
  return this.partialPath_;
};


/**
 * @param {?schedul.qt.SmartTreeNode} node
 * @param {!number} index
 */
schedul.qt.SmartTreeNode.prototype.setChild = function(node, index) {
  if (goog.isNull(node)) {
    if (!goog.isNull(this.children_)) {
      this.children_[index] = null;
    }
  }else {
    if (goog.isNull(this.children_)) {
      this.children_ = [null, null, null, null];
    }
    this.children_[index] = node;
  }
};


/**
 * @param {!number} index
 * @return {?schedul.qt.SmartTreeNode}
 */
schedul.qt.SmartTreeNode.prototype.getChild = function(index) {
  if (goog.isNull(this.children_)) {
    return null;
  }
  return this.children_[index];
};


/**
 * @param {!number} zoomLevel
 */
schedul.qt.SmartTreeNode.prototype.setZoomLevel = function(zoomLevel) {
  this.zoomLevel_ = zoomLevel;
};


/**
 * @return {!number}
 */
schedul.qt.SmartTreeNode.prototype.getZoomLevel = function() {
  return this.zoomLevel_;
};


/**
 * @param {!schedul.qt.NodeLoadingStatus} status
 */
schedul.qt.SmartTreeNode.prototype.setLoadingStatus = function(status) {
  this.loadingStatus_ = status;
};


/**
 * @return {!schedul.qt.NodeLoadingStatus}
 */
schedul.qt.SmartTreeNode.prototype.getLoadingStatus = function() {
  return this.loadingStatus_;
};


/**
 * @param {!schedul.qt.NodeStatus} status
 */
schedul.qt.SmartTreeNode.prototype.setStatus = function(status) {
  this.status_ = status;
};


/**
 * @return {!schedul.qt.NodeStatus}
 */
schedul.qt.SmartTreeNode.prototype.getStatus = function() {
  return this.status_;
};


/**
 * @return {!Object}
 */
schedul.qt.SmartTreeNode.prototype.toJSON = function() {
  var children = null;
  if (!goog.isNull(this.children_)) {
    children = [null, null, null, null];
    for (var i = 0; i < 4; i++) {
      if (!goog.isNull(this.children_[i])) {
        children[i] = this.children_[i].toJSON();
      }
    }
  }
  return {
    pp: this.partialPath_,
    c: children,
    z: this.zoomLevel_,
    ls: this.loadingStatus_,
    s: this.status_
  };
};
