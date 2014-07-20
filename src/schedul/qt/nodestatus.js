goog.provide('schedul.qt.NodeStatus');


/**
 * @enum {!number}
 */
schedul.qt.NodeStatus = {
  IS_MYSTERIOUS: 0,
  IS_SURELY_LEAF: 1,
  IS_SURELY_BRANCH: 2,
  HAS_MORE_DEEPER_STATUSES: 3
};
