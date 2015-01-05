goog.require('schedul.qt.Tree');
goog.require('schedul.qt.NodeStatus');


var tree = new schedul.qt.Tree();
tree.addTerminal([0,1,2,3,0,1,2,3],true,1);
tree.addTerminal([0,1,2,3,0,1,3,2],true,2);
tree.addGray([0,2,1]);
tree.forEachShallowPathsInPath([0,1],function(path,status,value){
  console.log(path);
},this);
tree.forEachShallowPathsInPath([0,1,2,3,0,1],function(path,status,value){
  console.log(path);
},this);
