goog.provide('schedul.qt.Node');

goog.require('goog.asserts');
goog.require('schedul.qt.NodeStatus');



/**
 * @constructor
 * @param {!schedul.qt.NodeStatus=} opt_status
 */
schedul.qt.Node = function(opt_status){
  this.children_ = [null,null,null,null];
  this.parent_ = null;
  this.status_ = schedul.qt.NodeStatus.PROCESSING;
  if(goog.isDefAndNotNull(opt_status)){
    this.status_ = opt_status;
  }
  this.pathCache_ = [];
};


/**
 * @param {?schedul.qt.Node} child
 * @param {!number} slot
 */
schedul.qt.Node.prototype.updateChild = function(child,slot){
  goog.asserts.assert(slot === 0 || slot === 1 || slot === 2 || slot === 3,slot+' is an invalid slot.');

  if(!goog.isNull(this.children_[slot])){
    this.children_[slot].setParent(null);
  }
  this.children_[slot] = child;
};


/**
 * @return {?schedul.qt.Node}
 */
schedul.qt.Node.prototype.getChild = function(slot){
  return this.children_[slot];
};


/**
 * @param {?schedul.qt.Node} parentNode
 */
schedul.qt.Node.prototype.setParent = function(parent){
  this.parent_ = parent;
};


/**
 * @return {?schedul.qt.Node}
 */
schedul.qt.Node.prototype.getParent = function(){
  return this.parent_;
};


/**
 * @param {!schedul.qt.NodeStatus} status
 */
schedul.qt.Node.prototype.setStatus = function(status){
  this.status_ = status;
};


/**
 * @return {!schedul.qt.NodeStatus}
 */
schedul.qt.Node.prototype.getStatus = function(){
  return this.status_;
};


/**
 * @param {!Array.<!number>} pathCache
 */
schedul.qt.Node.prototype.setPathCache = function(pathCache){
  goog.asserts.assertArray(pathCache);

  this.pathCache_ = pathCache;
};


/**
 * @return {!Array.<!number>}
 */
schedul.qt.Node.prototype.getPathCache = function(){
  return this.pathCache_;
};
