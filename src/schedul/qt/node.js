goog.provide('schedul.qt.Node');

goog.require('goog.asserts');
goog.require('schedul.qt.NodeStatus');



/**
 * @constructor
 * @param {?V} value
 * @param {!schedul.qt.NodeStatus=} opt_status
 * @template V
 */
schedul.qt.Node = function(value,opt_status) {
  this.value_ = value;
  this.children_ = [null, null, null, null];
  this.parent_ = null;
  this.status_ = schedul.qt.NodeStatus.GRAY;
  if (goog.isDefAndNotNull(opt_status)) {
    this.status_ = opt_status;
  }
  this.pathCache_ = [];
};


/**
 * @param {?V} value
 * @template V
 */
schedul.qt.Node.prototype.setValue = function(value){
  this.value_ = value;
};


/**
 * @return {?V}
 * @template V
 */
schedul.qt.Node.prototype.getValue = function(){
  return this.value_;
};


/**
 * @param {?schedul.qt.Node} child
 * @param {!number} slot
 */
schedul.qt.Node.prototype.updateChild = function(child, slot) {
  schedul.qt.Node.assertSlot(slot);

  if (!goog.isNull(this.children_[slot])) {
    this.children_[slot].setParent(null);
  }
  this.children_[slot] = child;
};


/**
 * @return {?schedul.qt.Node}
 */
schedul.qt.Node.prototype.getChild = function(slot) {
  return this.children_[slot];
};


/**
 * @param {?schedul.qt.Node} parent
 */
schedul.qt.Node.prototype.setParent = function(parent) {
  this.parent_ = parent;
};


/**
 * @return {?schedul.qt.Node}
 */
schedul.qt.Node.prototype.getParent = function() {
  return this.parent_;
};


/**
 * @param {!schedul.qt.NodeStatus} status
 */
schedul.qt.Node.prototype.setStatus = function(status) {
  this.status_ = status;
};


/**
 * @return {!schedul.qt.NodeStatus}
 */
schedul.qt.Node.prototype.getStatus = function() {
  return this.status_;
};


/**
 * @param {!Array.<!number>} pathCache
 */
schedul.qt.Node.prototype.setPathCache = function(pathCache) {
  schedul.qt.Node.assertPath(pathCache);

  this.pathCache_ = pathCache;
};


/**
 * @return {!Array.<!number>}
 */
schedul.qt.Node.prototype.getPathCache = function() {
  return this.pathCache_;
};


/**
 * @param {!number} slot
 */
schedul.qt.Node.assertSlot = function(slot){
  goog.asserts.assertNumber(slot,slot+'is not a number');
  goog.asserts.assert(slot === 0 || slot === 1 || slot === 2 || slot === 3, slot + ' is an invalid slot.');
};


/**
 * @param {!Array.<!number>} path
 */
schedul.qt.Node.assertPath = function(path) {
  goog.asserts.assertArray(path);
  goog.array.forEach(path, function(slot, index) {
    schedul.qt.Node.assertSlot(slot);
  });
};
