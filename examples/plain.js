goog.require('schedul.qt.Tree');
goog.require('schedul.qt.NodeStatus');


var tree = new schedul.qt.Tree();
tree.addTerminal([0,1,2,3,0,1,2,3],true);
tree.addTerminal([0,1,2,3,0,1,3,2],true);
tree.addGray([0,2,1]);
tree.forEachProbablyExistingPathsInPath([0,1],function(path,status){
  console.log(path);
},this,30);
tree.forEachProbablyExistingPathsInPath([0,1,2,3,0,1],function(path,status){
  console.log(path);
},this);
