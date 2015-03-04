require('nclosure').nclosure({additionalDeps: ['deps.js']});
expect = require('expect.js');

goog.require('schedul.qt.NodeStatus');
goog.require('schedul.qt.Tree');



///
/// EMPTY TREE
///
describe('empty schedul.qt.Tree', function() {
  var tree = new schedul.qt.Tree();

  var r = tree.root_;
  it('should build valid tree at level 0', function() {
    expect(r.children_[0]).to.be(null);
    expect(r.children_[1]).to.be(null);
    expect(r.children_[2]).to.be(null);
    expect(r.children_[3]).to.be(null);
    expect(r.status_).to.be(schedul.qt.NodeStatus.GRAY);
  });

  it('should work well for statusForPath(overrun_wrong_path)', function() {
    expect(tree.statusForPath([0])).to.be(schedul.qt.NodeStatus.GRAY);
  });

  it('should work well for statusForPath(overrun_wrong_path_2)', function() {
    expect(tree.statusForPath([0, 1, 2])).to.be(schedul.qt.NodeStatus.GRAY);
  });
});

///
/// ONE SINGLE EXISTING TERMINAL
///
describe('schedul.qt.Tree with one single existing terminal', function() {
  var tree = new schedul.qt.Tree();
  tree.addTerminal([0, 1, 2, 3], true, 'terminal0123');

  var r = tree.root_;
  it('should build valid tree at level 0', function() {
    expect(r.children_[0]).not.to.be(null);
    expect(r.children_[1]).to.be(null);
    expect(r.children_[2]).to.be(null);
    expect(r.children_[3]).to.be(null);
    expect(r.status_).to.be(schedul.qt.NodeStatus.GRAY);
  });

  it('should build valid tree at level 1', function() {
    expect(r.children_[0].children_[0]).to.be(null);
    expect(r.children_[0].children_[1]).not.to.be(null);
    expect(r.children_[0].children_[2]).to.be(null);
    expect(r.children_[0].children_[3]).to.be(null);
    expect(r.children_[0].status_).to.be(schedul.qt.NodeStatus.GRAY);
    expect(r.children_[0].parent_).to.be(r);
  });

  it('should build valid tree at level 2', function() {
    expect(r.children_[0].children_[1].children_[0]).to.be(null);
    expect(r.children_[0].children_[1].children_[1]).to.be(null);
    expect(r.children_[0].children_[1].children_[2]).not.to.be(null);
    expect(r.children_[0].children_[1].children_[3]).to.be(null);
    expect(r.children_[0].children_[1].status_).to.be(schedul.qt.NodeStatus.GRAY);
    expect(r.children_[0].children_[1].parent_).to.be(r.children_[0]);
  });

  it('should build valid tree at level 3', function() {
    expect(r.children_[0].children_[1].children_[2].children_[0]).to.be(null);
    expect(r.children_[0].children_[1].children_[2].children_[1]).to.be(null);
    expect(r.children_[0].children_[1].children_[2].children_[2]).to.be(null);
    expect(r.children_[0].children_[1].children_[2].children_[3]).not.to.be(null);
    expect(r.children_[0].children_[1].children_[2].status_).to.be(schedul.qt.NodeStatus.GRAY);
    expect(r.children_[0].children_[1].children_[2].parent_).to.be(r.children_[0].children_[1]);
  });

  it('should build valid tree at level 4', function() {
    expect(r.children_[0].children_[1].children_[2].children_[3].status_).to.be(schedul.qt.NodeStatus.EXISTING_TERMINAL);
    expect(r.children_[0].children_[1].children_[2].children_[3].parent_).to.be(r.children_[0].children_[1].children_[2]);
  });

  it('should work well for statusForPath(perfect_path)', function() {
    expect(tree.statusForPath([0, 1, 2, 3])).to.be(schedul.qt.NodeStatus.EXISTING_TERMINAL);
  });

  it('should work well for statusForPath(overrun_perfect_path)', function() {
    expect(tree.statusForPath([0, 1, 2, 3, 2, 1])).to.be(schedul.qt.NodeStatus.EXISTING_TERMINAL);
  });

  it('should work well for statusForPath(not_existing_path)', function() {
    expect(tree.statusForPath([0, 1, 2, 2])).to.be(schedul.qt.NodeStatus.GRAY);
  });

  it('should work well for statusForPath(partial_path)', function() {
    expect(tree.statusForPath([0, 1, 2])).to.be(schedul.qt.NodeStatus.GRAY);
  });

  it('should do good for path search', function() {
    tree.forEachShallowPathsInPath([0, 1], function(path, status) {
//      console.log(path,status);
    },this, 5);
  });

  it('should do good for path search with strange path', function() {
    tree.forEachShallowPathsInPath([0, 1, 2, 3, 2], function(path, status) {
//      console.log(path,status);
    },this, 5);
  });
});



///
/// TWO EXISTING TERMINALS
///
describe('schedul.qt.Tree with two existing terminals', function() {
  var tree = new schedul.qt.Tree();
  tree.addTerminal([0, 1, 2, 3], true, 'terminal0123');
  tree.addTerminal([0, 1, 2, 2], true, 'terminal0122');

  it('should return build valid tree', function() {
    var r = tree.root_;
    expect(r.children_[0]).not.to.be(null);
    expect(r.children_[1]).to.be(null);
    expect(r.children_[2]).to.be(null);
    expect(r.children_[3]).to.be(null);
    expect(r.status_).to.be(schedul.qt.NodeStatus.GRAY);

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
  tree.addTerminal([0, 1, 2, 3], true, 'terminal0123');
  tree.addTerminal([0, 1, 2, 2], true, 'terminal0122');
  tree.addTerminal([0, 1, 2, 0], true, 'terminal0120');
  tree.addTerminal([0, 1, 2, 1], true, 'terminal0121');

  it('should return build valid tree', function() {
    var r = tree.root_;
    expect(r.children_[0]).not.to.be(null);
    expect(r.children_[1]).to.be(null);
    expect(r.children_[2]).to.be(null);
    expect(r.children_[3]).to.be(null);
    expect(r.status_).to.be(schedul.qt.NodeStatus.GRAY);

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
  tree.addTerminal([0, 1, 2, 3], false, 'terminal0123');
  tree.addTerminal([0, 1, 2, 2], false, 'terminal0122');
  tree.addTerminal([0, 1, 2, 0], false, 'terminal0120');
  tree.addTerminal([0, 1, 2, 1], false, 'terminal0121');

  it('should return build valid tree', function() {
    var r = tree.root_;
    expect(r.children_[0]).not.to.be(null);
    expect(r.children_[1]).to.be(null);
    expect(r.children_[2]).to.be(null);
    expect(r.children_[3]).to.be(null);
    expect(r.status_).to.be(schedul.qt.NodeStatus.GRAY);

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
  tree.addTerminal([0, 1, 2, 3], false, 'terminal0123');
  tree.addTerminal([0, 1, 2, 2], true, 'terminal0122');
  tree.addTerminal([0, 1, 2, 0], true, 'terminal0120');
  tree.addTerminal([0, 1, 2, 1], false, 'terminal0121');

  it('should return build valid tree', function() {
    var r = tree.root_;
    expect(r.children_[0]).not.to.be(null);
    expect(r.children_[1]).to.be(null);
    expect(r.children_[2]).to.be(null);
    expect(r.children_[3]).to.be(null);
    expect(r.status_).to.be(schedul.qt.NodeStatus.GRAY);

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

  it('should do good for path search', function() {
    tree.forEachShallowPathsInPath([0], function(path, status) {
//      console.log(path,status);
    },this, 5);
  });
});


describe('schedul.qt.Tree with two empty, two existing terminals merged', function() {
  var tree = new schedul.qt.Tree();
  tree.addTerminal([0, 1], true, 'terminal0123');
  tree.addTerminal([0, 2], true, 'terminal0122');
  tree.addTerminal([0, 0], true, 'terminal0120');
  tree.markUnknownLeaves(false);
});


///
/// FILLING and ITERATING
///
describe('schedul.qt.Tree with two empty, two existing terminals merged', function() {
  var tree = new schedul.qt.Tree();
  tree.addTerminal([0, 1, 2, 3], true, 'terminal0123');
  tree.addTerminal([0, 1, 2, 2], true, 'terminal0122');
  tree.addTerminal([0, 1, 2, 0], true, 'terminal0120');
  tree.markUnknownLeaves(false);

  it('should return build valid tree', function() {
    var r = tree.root_;

    expect(r.children_[0]).not.to.be(null);
    expect(r.children_[1]).not.to.be(null);
    expect(r.children_[2]).not.to.be(null);
    expect(r.children_[3]).not.to.be(null);
    expect(r.children_[1].status_).to.be(schedul.qt.NodeStatus.EMPTY_TERMINAL);
    expect(r.children_[2].status_).to.be(schedul.qt.NodeStatus.EMPTY_TERMINAL);
    expect(r.children_[3].status_).to.be(schedul.qt.NodeStatus.EMPTY_TERMINAL);

    expect(r.children_[0].children_[0]).not.to.be(null);
    expect(r.children_[0].children_[1]).not.to.be(null);
    expect(r.children_[0].children_[2]).not.to.be(null);
    expect(r.children_[0].children_[3]).not.to.be(null);
    expect(r.children_[0].parent_).to.be(r);
    expect(r.children_[1].parent_).to.be(r);
    expect(r.children_[2].parent_).to.be(r);
    expect(r.children_[3].parent_).to.be(r);
    expect(r.children_[0].children_[0].status_).to.be(schedul.qt.NodeStatus.EMPTY_TERMINAL);
    expect(r.children_[0].children_[2].status_).to.be(schedul.qt.NodeStatus.EMPTY_TERMINAL);
    expect(r.children_[0].children_[3].status_).to.be(schedul.qt.NodeStatus.EMPTY_TERMINAL);

    expect(r.children_[0].children_[1].children_[2].children_[0].status_).to.be(schedul.qt.NodeStatus.EXISTING_TERMINAL);
    expect(r.children_[0].children_[1].children_[2].children_[1].status_).to.be(schedul.qt.NodeStatus.EMPTY_TERMINAL);
    expect(r.children_[0].children_[1].children_[2].children_[2].status_).to.be(schedul.qt.NodeStatus.EXISTING_TERMINAL);
    expect(r.children_[0].children_[1].children_[2].children_[3].status_).to.be(schedul.qt.NodeStatus.EXISTING_TERMINAL);

    expect(r.children_[0].children_[1].children_[0]).not.to.be(null);
    expect(r.children_[0].children_[1].children_[1]).not.to.be(null);
    expect(r.children_[0].children_[1].children_[2]).not.to.be(null);
    expect(r.children_[0].children_[1].children_[3]).not.to.be(null);
    expect(r.children_[0].children_[1].parent_).to.be(r.children_[0]);
    expect(r.children_[0].children_[1].children_[0].status_).to.be(schedul.qt.NodeStatus.EMPTY_TERMINAL);
    expect(r.children_[0].children_[1].children_[1].status_).to.be(schedul.qt.NodeStatus.EMPTY_TERMINAL);
    expect(r.children_[0].children_[1].children_[2].status_).to.be(schedul.qt.NodeStatus.SURELY_MIXED);
    expect(r.children_[0].children_[1].children_[3].status_).to.be(schedul.qt.NodeStatus.EMPTY_TERMINAL);
  });

  it('should do good for path search', function() {
    tree.forEachShallowPathsInPath([0], function(path, status) {
    },this, 5);
  });

  it('should iterate good for leaves', function() {
    tree.forEachLeaves(function(path, nodestatus, value) {
      console.log(path, nodestatus, value);
    });
  });
});



///
/// PARTIAL TREE TRANSFERRING
///
// 00011000
// 00001000
// 00001000
// 00000100
// 00000100
// 00000110
// 00000011
// 00000000
///
describe('sparse schedul.qt.Tree', function() {
  var t0 = new schedul.qt.Tree();
  var t1 = new schedul.qt.Tree();

  var T = true;
  var F = false;

  t0.at = t0.addTerminal; // Temporary alias
  t0.at([0, 0, 0], F, 0);t0.at([0, 0, 1], F, 0);t0.at([0, 1, 0], F, 0);t0.at([0, 1, 1], T, 1);t0.at([1, 0, 0], T, 1);t0.at([1, 0, 1], F, 0);t0.at([1, 1, 0], F, 0);t0.at([1, 1, 1], F, 0);
  t0.at([0, 0, 2], F, 0);t0.at([0, 0, 3], F, 0);t0.at([0, 1, 2], F, 0);t0.at([0, 1, 3], F, 0);t0.at([1, 0, 2], T, 1);t0.at([1, 0, 3], F, 0);t0.at([1, 1, 2], F, 0);t0.at([1, 1, 3], F, 0);
  t0.at([0, 2, 0], F, 0);t0.at([0, 2, 1], F, 0);t0.at([0, 3, 0], F, 0);t0.at([0, 3, 1], F, 0);t0.at([1, 2, 0], T, 1);t0.at([1, 2, 1], F, 0);t0.at([1, 3, 0], F, 0);t0.at([1, 3, 1], F, 0);
  t0.at([0, 2, 2], F, 0);t0.at([0, 2, 3], F, 0);t0.at([0, 3, 2], F, 0);t0.at([0, 3, 3], F, 0);t0.at([1, 2, 2], F, 0);t0.at([1, 2, 3], T, 1);t0.at([1, 3, 2], F, 0);t0.at([1, 3, 3], F, 0);
  t0.at([2, 0, 0], F, 0);t0.at([2, 0, 1], F, 0);t0.at([2, 1, 0], F, 0);t0.at([2, 1, 1], F, 0);t0.at([3, 0, 0], F, 0);t0.at([3, 0, 1], T, 1);t0.at([3, 1, 0], F, 0);t0.at([3, 1, 1], F, 0);
  t0.at([2, 0, 2], F, 0);t0.at([2, 0, 3], F, 0);t0.at([2, 1, 2], F, 0);t0.at([2, 1, 3], F, 0);t0.at([3, 0, 2], F, 0);t0.at([3, 0, 3], T, 1);t0.at([3, 1, 2], T, 1);t0.at([3, 1, 3], F, 0);
  t0.at([2, 2, 0], F, 0);t0.at([2, 2, 1], F, 0);t0.at([2, 3, 0], F, 0);t0.at([2, 3, 1], F, 0);t0.at([3, 2, 0], F, 0);t0.at([3, 2, 1], F, 0);t0.at([3, 3, 0], T, 1);t0.at([3, 3, 1], T, 1);
  t0.at([2, 2, 2], F, 0);t0.at([2, 2, 3], F, 0);t0.at([2, 3, 2], F, 0);t0.at([2, 3, 3], F, 0);t0.at([3, 2, 2], F, 0);t0.at([3, 2, 3], F, 0);

  t0.at([3, 3, 2, 0], T, 1);
  t0.at([3, 3, 2, 1], T, 1);
  t0.at([3, 3, 2, 2], F, 0);
  t0.at([3, 3, 2, 3], F, 0);

  t0.at([3, 3, 3, 0, 0], T, 1);
  t0.at([3, 3, 3, 0, 1], T, 1);
  t0.at([3, 3, 3, 0, 2], T, 1);
  t0.at([3, 3, 3, 0, 3], F, 0);

  t0.at([3, 3, 3, 1], F, 0);
  t0.at([3, 3, 3, 2], F, 0);
  t0.at([3, 3, 3, 3], F, 0);

  it('should transfer tiles', function() {
    for (var x = 0; x < 4; x++) {
      var path = [x];
      console.log('request path', path);
      t1.forEachShallowPathsInPath(path, function(t1path, t1status) {
        console.log('  current t1=', t1path, t1status);

        switch (t1status) {
        case schedul.qt.NodeStatus.GRAY:
          t0.forEachShallowPathsInPath(t1path, function(t0path, t0status) {

            console.log('    responded t0=', t0path, t0status);
            switch (t0status) {
            case schedul.qt.NodeStatus.EXISTING_TERMINAL:
              t1.addTerminal(t0path, true, 1);
              break;
            case schedul.qt.NodeStatus.EMPTY_TERMINAL:
              t1.addTerminal(t0path, false, 0);
              break;
            case schedul.qt.NodeStatus.GRAY:
              t1.addGray(t0path);
              break;
            case schedul.qt.NodeStatus.SURELY_MIXED:
              t1.addGray(t0path);
              break;
            }
          },this);
        }
      },this);
    }
    for (var x = 0; x < 4; x++) {
      for (var y = 0; y < 4; y++) {
          var path = [x, y];
      }
    }
  });
});
