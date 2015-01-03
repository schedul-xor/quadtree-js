require('nclosure').nclosure({additionalDeps: ['deps.js']});
expect = require('expect.js');

goog.require('schedul.qt.NodeStatus');
goog.require('schedul.qt.Tree');



///
/// ONE SINGLE EXISTING TERMINAL
///
describe('schedul.qt.Tree with one single existing terminal', function() {
  var tree = new schedul.qt.Tree();
  tree.addTerminal([0,1,2,3],true);

  it('should return build valid tree',function(){
    var r = tree.root_;
    expect(r.children_[0]).not.to.be(null);
    expect(r.children_[1]).to.be(null);
    expect(r.children_[2]).to.be(null);
    expect(r.children_[3]).to.be(null);
    expect(r.status_).to.be(schedul.qt.NodeStatus.ROOT);

    expect(r.children_[0].children_[0]).to.be(null);
    expect(r.children_[0].children_[1]).not.to.be(null);
    expect(r.children_[0].children_[2]).to.be(null);
    expect(r.children_[0].children_[3]).to.be(null);
    expect(r.children_[0].status_).to.be(schedul.qt.NodeStatus.GRAY);
    expect(r.children_[0].parent_).to.be(r);

    expect(r.children_[0].children_[1].children_[0]).to.be(null);
    expect(r.children_[0].children_[1].children_[1]).to.be(null);
    expect(r.children_[0].children_[1].children_[2]).not.to.be(null);
    expect(r.children_[0].children_[1].children_[3]).to.be(null);
    expect(r.children_[0].children_[1].status_).to.be(schedul.qt.NodeStatus.GRAY);
    expect(r.children_[0].children_[1].parent_).to.be(r.children_[0]);

    expect(r.children_[0].children_[1].children_[2].children_[0]).to.be(null);
    expect(r.children_[0].children_[1].children_[2].children_[1]).to.be(null);
    expect(r.children_[0].children_[1].children_[2].children_[2]).to.be(null);
    expect(r.children_[0].children_[1].children_[2].children_[3]).not.to.be(null);
    expect(r.children_[0].children_[1].children_[2].status_).to.be(schedul.qt.NodeStatus.GRAY);
    expect(r.children_[0].children_[1].children_[2].parent_).to.be(r.children_[0].children_[1]);

    expect(r.children_[0].children_[1].children_[2].children_[3].status_).to.be(schedul.qt.NodeStatus.EXISTING_TERMINAL);
    expect(r.children_[0].children_[1].children_[2].children_[3].parent_).to.be(r.children_[0].children_[1].children_[2]);
  });

  it('should do good for path search',function(){
    tree.forEachProbablyExistingPathsInPath([0,1],function(path,status){
      console.log(path,status);
    },this,5);
  });

  it('should do good for path search with strange path',function(){
    tree.forEachProbablyExistingPathsInPath([0,1,2,3,2],function(path,status){
      console.log(path,status);
    },this,5);
  });
});



///
/// TWO EXISTING TERMINALS
///
describe('schedul.qt.Tree with two existing terminals', function() {
  var tree = new schedul.qt.Tree();
  tree.addTerminal([0,1,2,3],true);
  tree.addTerminal([0,1,2,2],true);

  it('should return build valid tree',function(){
    var r = tree.root_;
    expect(r.children_[0]).not.to.be(null);
    expect(r.children_[1]).to.be(null);
    expect(r.children_[2]).to.be(null);
    expect(r.children_[3]).to.be(null);
    expect(r.status_).to.be(schedul.qt.NodeStatus.ROOT);

    expect(r.children_[0].children_[0]).to.be(null);
    expect(r.children_[0].children_[1]).not.to.be(null);
    expect(r.children_[0].children_[2]).to.be(null);
    expect(r.children_[0].children_[3]).to.be(null);
    expect(r.children_[0].status_).to.be(schedul.qt.NodeStatus.GRAY);
    expect(r.children_[0].parent_).to.be(r);

    expect(r.children_[0].children_[1].children_[0]).to.be(null);
    expect(r.children_[0].children_[1].children_[1]).to.be(null);
    expect(r.children_[0].children_[1].children_[2]).not.to.be(null);
    expect(r.children_[0].children_[1].children_[3]).to.be(null);
    expect(r.children_[0].children_[1].status_).to.be(schedul.qt.NodeStatus.GRAY);
    expect(r.children_[0].children_[1].parent_).to.be(r.children_[0]);

    expect(r.children_[0].children_[1].children_[2].children_[0]).to.be(null);
    expect(r.children_[0].children_[1].children_[2].children_[1]).to.be(null);
    expect(r.children_[0].children_[1].children_[2].children_[2]).not.to.be(null);
    expect(r.children_[0].children_[1].children_[2].children_[3]).not.to.be(null);
    expect(r.children_[0].children_[1].children_[2].status_).to.be(schedul.qt.NodeStatus.GRAY);
    expect(r.children_[0].children_[1].children_[2].parent_).to.be(r.children_[0].children_[1]);

    expect(r.children_[0].children_[1].children_[2].children_[2].status_).to.be(schedul.qt.NodeStatus.EXISTING_TERMINAL);
    expect(r.children_[0].children_[1].children_[2].children_[2].parent_).to.be(r.children_[0].children_[1].children_[2]);
    expect(r.children_[0].children_[1].children_[2].children_[3].status_).to.be(schedul.qt.NodeStatus.EXISTING_TERMINAL);
    expect(r.children_[0].children_[1].children_[2].children_[3].parent_).to.be(r.children_[0].children_[1].children_[2]);
  });
});



///
/// FOUR EXISTING TERMINALS MERGED
///
describe('schedul.qt.Tree with four existing terminals merged', function() {
  var tree = new schedul.qt.Tree();
  tree.addTerminal([0,1,2,3],true);
  tree.addTerminal([0,1,2,2],true);
  tree.addTerminal([0,1,2,0],true);
  tree.addTerminal([0,1,2,1],true);

  it('should return build valid tree',function(){
    var r = tree.root_;
    expect(r.children_[0]).not.to.be(null);
    expect(r.children_[1]).to.be(null);
    expect(r.children_[2]).to.be(null);
    expect(r.children_[3]).to.be(null);
    expect(r.status_).to.be(schedul.qt.NodeStatus.ROOT);

    expect(r.children_[0].children_[0]).to.be(null);
    expect(r.children_[0].children_[1]).not.to.be(null);
    expect(r.children_[0].children_[2]).to.be(null);
    expect(r.children_[0].children_[3]).to.be(null);
    expect(r.children_[0].status_).to.be(schedul.qt.NodeStatus.GRAY);
    expect(r.children_[0].parent_).to.be(r);

    expect(r.children_[0].children_[1].children_[0]).to.be(null);
    expect(r.children_[0].children_[1].children_[1]).to.be(null);
    expect(r.children_[0].children_[1].children_[2]).not.to.be(null);
    expect(r.children_[0].children_[1].children_[3]).to.be(null);
    expect(r.children_[0].children_[1].status_).to.be(schedul.qt.NodeStatus.GRAY);
    expect(r.children_[0].children_[1].parent_).to.be(r.children_[0]);

    expect(r.children_[0].children_[1].children_[2].status_).to.be(schedul.qt.NodeStatus.EXISTING_TERMINAL);
  });
});



///
/// FOUR EMPTY TERMINALS MERGED
///
describe('schedul.qt.Tree with four empty terminals merged', function() {
  var tree = new schedul.qt.Tree();
  tree.addTerminal([0,1,2,3],false);
  tree.addTerminal([0,1,2,2],false);
  tree.addTerminal([0,1,2,0],false);
  tree.addTerminal([0,1,2,1],false);

  it('should return build valid tree',function(){
    var r = tree.root_;
    expect(r.children_[0]).not.to.be(null);
    expect(r.children_[1]).to.be(null);
    expect(r.children_[2]).to.be(null);
    expect(r.children_[3]).to.be(null);
    expect(r.status_).to.be(schedul.qt.NodeStatus.ROOT);

    expect(r.children_[0].children_[0]).to.be(null);
    expect(r.children_[0].children_[1]).not.to.be(null);
    expect(r.children_[0].children_[2]).to.be(null);
    expect(r.children_[0].children_[3]).to.be(null);
    expect(r.children_[0].status_).to.be(schedul.qt.NodeStatus.GRAY);
    expect(r.children_[0].parent_).to.be(r);

    expect(r.children_[0].children_[1].children_[0]).to.be(null);
    expect(r.children_[0].children_[1].children_[1]).to.be(null);
    expect(r.children_[0].children_[1].children_[2]).not.to.be(null);
    expect(r.children_[0].children_[1].children_[3]).to.be(null);
    expect(r.children_[0].children_[1].status_).to.be(schedul.qt.NodeStatus.GRAY);
    expect(r.children_[0].children_[1].parent_).to.be(r.children_[0]);

    expect(r.children_[0].children_[1].children_[2].status_).to.be(schedul.qt.NodeStatus.EMPTY_TERMINAL);
  });
});



///
/// TWO EXISTING, TWO EMPTY TERMINALS MERGED
///
describe('schedul.qt.Tree with two empty, two existing terminals merged', function() {
  var tree = new schedul.qt.Tree();
  tree.addTerminal([0,1,2,3],false);
  tree.addTerminal([0,1,2,2],true);
  tree.addTerminal([0,1,2,0],true);
  tree.addTerminal([0,1,2,1],false);

  it('should return build valid tree',function(){
    var r = tree.root_;
    expect(r.children_[0]).not.to.be(null);
    expect(r.children_[1]).to.be(null);
    expect(r.children_[2]).to.be(null);
    expect(r.children_[3]).to.be(null);
    expect(r.status_).to.be(schedul.qt.NodeStatus.ROOT);

    expect(r.children_[0].children_[0]).to.be(null);
    expect(r.children_[0].children_[1]).not.to.be(null);
    expect(r.children_[0].children_[2]).to.be(null);
    expect(r.children_[0].children_[3]).to.be(null);
    expect(r.children_[0].status_).to.be(schedul.qt.NodeStatus.GRAY);
    expect(r.children_[0].parent_).to.be(r);

    expect(r.children_[0].children_[1].children_[0]).to.be(null);
    expect(r.children_[0].children_[1].children_[1]).to.be(null);
    expect(r.children_[0].children_[1].children_[2]).not.to.be(null);
    expect(r.children_[0].children_[1].children_[3]).to.be(null);
    expect(r.children_[0].children_[1].status_).to.be(schedul.qt.NodeStatus.GRAY);
    expect(r.children_[0].children_[1].parent_).to.be(r.children_[0]);

    expect(r.children_[0].children_[1].children_[2].status_).to.be(schedul.qt.NodeStatus.SURELY_MIXED);

  });

  it('should do good for path search',function(){
    tree.forEachProbablyExistingPathsInPath([0],function(path,status){
      console.log(path,status);
    },this,5);
  });
});



///
/// PARTIAL TREE TRANSFERRING
///
// 00001111
// 00001111
// 00011111
// 11001110
// 01110100
// 00111100
// 00011000
// 00000000
///
describe('schedul.qt.Tree with one single existing terminal', function() {
  var t0 = new schedul.qt.Tree();
  var t1 = new schedul.qt.Tree();

  t0.addTerminal([0,0,0],false);t0.addTerminal([0,0,1],false);t0.addTerminal([0,1,0],false);t0.addTerminal([0,1,1],false);t0.addTerminal([1,0,0],true);t0.addTerminal([1,0,1],true);t0.addTerminal([1,1,0],true);t0.addTerminal([1,1,1],true);
  t0.addTerminal([0,0,2],false);t0.addTerminal([0,0,3],false);t0.addTerminal([0,1,1],false);t0.addTerminal([0,1,3],false);t0.addTerminal([1,0,2],true);t0.addTerminal([1,0,3],true);t0.addTerminal([1,1,2],true);t0.addTerminal([1,1,3],true);
  t0.addTerminal([0,2,0],false);t0.addTerminal([0,2,1],false);t0.addTerminal([0,3,0],false);t0.addTerminal([0,3,1],true);t0.addTerminal([1,2,0],true);t0.addTerminal([1,2,1],true);t0.addTerminal([1,3,0],true);t0.addTerminal([1,3,1],true);
  t0.addTerminal([0,2,2],true);t0.addTerminal([0,2,3],true);t0.addTerminal([0,3,1],false);t0.addTerminal([0,3,3],false);t0.addTerminal([1,2,2],true);t0.addTerminal([1,2,3],true);t0.addTerminal([1,3,2],true);t0.addTerminal([1,3,3],false);
  t0.addTerminal([2,0,0],false);t0.addTerminal([2,0,1],true);t0.addTerminal([2,1,0],true);t0.addTerminal([2,1,1],true);t0.addTerminal([3,0,0],false);t0.addTerminal([3,0,1],true);t0.addTerminal([3,1,0],false);t0.addTerminal([3,1,1],false);
  t0.addTerminal([2,0,2],false);t0.addTerminal([2,0,3],false);t0.addTerminal([2,1,1],true);t0.addTerminal([2,1,3],true);t0.addTerminal([3,0,2],true);t0.addTerminal([3,0,3],true);t0.addTerminal([3,1,2],false);t0.addTerminal([3,1,3],false);
  t0.addTerminal([2,2,0],false);t0.addTerminal([2,2,1],false);t0.addTerminal([2,3,0],false);t0.addTerminal([2,3,1],true);t0.addTerminal([3,2,0],true);t0.addTerminal([3,2,1],false);t0.addTerminal([3,3,0],false);t0.addTerminal([3,3,1],false);
  t0.addTerminal([2,2,2],false);t0.addTerminal([2,2,3],false);t0.addTerminal([2,3,1],false);t0.addTerminal([2,3,3],false);t0.addTerminal([3,2,2],false);t0.addTerminal([3,2,3],false);t0.addTerminal([3,3,2],false);t0.addTerminal([3,3,3],false);

  it('should transfer areas in [0,1]',function(){
    // Transfer areas in [0,1]
    t0.forEachProbablyExistingPathsInPath([],function(path,status){
      console.log(path,status);
    },this,4);
  });
});
