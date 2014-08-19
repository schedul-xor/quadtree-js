require('nclosure').nclosure({additionalDeps:['deps.js']});
expect = require('expect.js');

goog.require('schedul.qt.Base');
goog.require('schedul.qt.MapTree');
goog.require('schedul.qt.NodeStatus');

describe('schedul.qt.MapTree, general',function(){
  it('should build valid tree for [0,1,2,3]',function(){
       var tree = new schedul.qt.MapTree();
    var tile = schedul.qt.Base.tileForPath([0,1,2,3]);
      tree.registerTileOutlineWithTile(tile);
      expect(tree.paths_.array_.length).to.be(4); // [0,01,012,0123]
      expect(tree.path2status_['0123']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['012']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['01']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
  });

  it('should build and update valid tree for [0,1,2,3]',function(){
       var tree = new schedul.qt.MapTree();
    var tile = schedul.qt.Base.tileForPath([0,1,2,3]);
       var rootNode = tree.rootNode_;
      tree.registerTileOutlineWithTile(tile);
      expect(tree.paths_.array_.length).to.be(4); // [0,01,012,0123]
      tree.overrideTileOutlineWithPath(tile,[0,1,2,3],schedul.qt.NodeStatus.IS_SURELY_LEAF); // Echoed result
      expect(tree.paths_.array_.length).to.be(4); // [0,01,012,0123]
      expect(tree.path2status_['0123']).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.path2status_['012']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['01']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      var mdp012312 = tree.mostDensePathForPath([0,1,2,3,1,2],[]);
      expect(mdp012312.length).to.be(4); // [0123].length = 4
      var mdp0123 = tree.mostDensePathForPath([0,1,2,3]);
      expect(mdp0123.length).to.be(4); // [0123].length = 4
      var mdp0121 = tree.mostDensePathForPath([0,1,2,1]);
      expect(mdp0121.length).to.be(3); // [012].length = 3
      var mdp0102 = tree.mostDensePathForPath([0,1,0,2]);
      expect(mdp0102.length).to.be(2);// [01].length = 2
      var mdp0332 = tree.mostDensePathForPath([0,3,3,2]);
      expect(mdp0332.length).to.be(1);// [0].length = 1
      var mdp033312 = tree.mostDensePathForPath([0,3,3,3,1,2]);
      expect(mdp033312.length).to.be(1); // [0].length = 1
      var mdp1332 = tree.mostDensePathForPath([1,3,3,2]);
      expect(mdp1332.length).to.be(0);// [].length = 0

      // Matches. [0,1,2,3] is the only answer.
      var overriddenTilesExactMatch = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2,3],4);
      // No matches.
      var overriddenTilesExactMismatch = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2,2],4);
      // Matches. [0,1,2] contains [0,1,2,3].
      var overriddenTilesUpper1Match = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2],4);
      // No matches. [0,1,3] doesn't contain [0,1,2,3].
      var overriddenTilesUpper1Mismatch = tree.allOverriddenTilesForPathAndZoomLevel([0,1,3],4);
      // Matches. [0,1] contains [0,1,2,3].
      var overriddenTilesUpper2Match = tree.allOverriddenTilesForPathAndZoomLevel([0,1],4);
      // No matches. [0,2] doesn't contain [0,1,2,3].
      var overriddenTilesUpper2Mismatch = tree.allOverriddenTilesForPathAndZoomLevel([0,2],4);
      // Matches. [0,1,2,3,2,1] will be trimmed into [0,1,2,3].
      var overriddenTilesLowerMatch = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2,3,2,1],4);
      // No matches. [0,1,2,1,2,1] will be trimmed into [0,1,2,1].
      var overriddenTilesLowerMismatch = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2,1,2,1],4);

      expect(overriddenTilesExactMatch.length).to.be(1);
      expect(overriddenTilesExactMatch[0][1]).to.be(5);
      expect(overriddenTilesExactMatch[0][2]).to.be(-4);
      expect(overriddenTilesExactMatch[0][0]).to.be(3);
      expect(overriddenTilesExactMismatch.length).to.be(0);
      expect(overriddenTilesUpper1Match.length).to.be(1);
      expect(overriddenTilesUpper1Match[0][1]).to.be(5);
      expect(overriddenTilesUpper1Match[0][2]).to.be(-4);
      expect(overriddenTilesUpper1Match[0][0]).to.be(3);
      expect(overriddenTilesUpper1Mismatch.length).to.be(0);
      expect(overriddenTilesUpper2Match.length).to.be(1);
      expect(overriddenTilesUpper2Match[0][1]).to.be(5);
      expect(overriddenTilesUpper2Match[0][2]).to.be(-4);
      expect(overriddenTilesUpper2Match[0][0]).to.be(3);
      expect(overriddenTilesUpper2Mismatch.length).to.be(0);
      expect(overriddenTilesLowerMatch.length).to.be(1);
      expect(overriddenTilesLowerMatch[0][1]).to.be(5);
      expect(overriddenTilesLowerMatch[0][2]).to.be(-4);
      expect(overriddenTilesLowerMatch[0][0]).to.be(3);
      expect(overriddenTilesLowerMismatch.length).to.be(0);
  });

  it('should build valid tree for [0,1,2,3] and [0,1,1,2]',function(){
    var tree = new schedul.qt.MapTree();
    var tile1 = schedul.qt.Base.tileForPath([0,1,2,3]);
    tree.registerTileOutlineWithTile(tile1);
      expect(tree.paths_.array_.length).to.be(4); // [0,01,012,0123]
    var tile2 = schedul.qt.Base.tileForPath([0,1,1,2]);
    tree.registerTileOutlineWithTile(tile2);
      expect(tree.paths_.array_.length).to.be(6); // [0,01,011,0112,012,0123]

      expect(tree.path2status_['0123']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['012']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0112']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['011']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['01']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);

      var mdp012312 = tree.mostDensePathForPath([0,1,2,3,1,2]);
      expect(mdp012312.length).to.be(4); // [0123].length = 4
      var mdp0123 = tree.mostDensePathForPath([0,1,2,3]);
      expect(mdp0123.length).to.be(4); // [0123].length = 4
      var mdp0112 = tree.mostDensePathForPath([0,1,1,2]);
      expect(mdp0112.length).to.be(4); // [0112].length = 4
      var mdp0113 = tree.mostDensePathForPath([0,1,1,3]);
      expect(mdp0113.length).to.be(3); // [011].length = 3
  });

  it('should build and update valid tree for [0,1,2,3] and [0,1,1,2]',function(){
    var tree = new schedul.qt.MapTree();
    var tile1 = schedul.qt.Base.tileForPath([0,1,2,3]);
    tree.registerTileOutlineWithTile(tile1);
      expect(tree.paths_.array_.length).to.be(4); // [0,01,012,0123]
      tree.overrideTileOutlineWithPath(tile1,[0,1,2,3],schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.paths_.array_.length).to.be(4); // [0,01,012,0123]
    tree.registerTileOutlineWithTile(tile1);
      expect(tree.paths_.array_.length).to.be(4); // [0,01,012,0123]
    var tile2 = schedul.qt.Base.tileForPath([0,1,1,2]);
    tree.registerTileOutlineWithTile(tile2);
      expect(tree.paths_.array_.length).to.be(6); // [0,01,011,0112,012,0123]
      tree.overrideTileOutlineWithPath(tile2,[0,1,1,2],schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.paths_.array_.length).to.be(6); // [0,01,011,0112,012,0123]

      expect(tree.path2status_['0123']).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.path2status_['012']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0112']).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.path2status_['011']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['01']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);

      var mdp012312 = tree.mostDensePathForPath([0,1,2,3,1,2]);
      expect(mdp012312.length).to.be(4); // [0123].length = 4
      var mdp0123 = tree.mostDensePathForPath([0,1,2,3]);
      expect(mdp0123.length).to.be(4); // [0123].length = 4
      var mdp0112 = tree.mostDensePathForPath([0,1,1,2]);
      expect(mdp0112.length).to.be(4); // [0112].length = 4
      var mdp0113 = tree.mostDensePathForPath([0,1,1,3]);
      expect(mdp0113.length).to.be(3); // [011].length = 3

      // Matches. [0,1,2,3] is the only answer.
      var overriddenTilesExactMatch = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2,3],3);
      // No matches.
      var overriddenTilesExactMismatch = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2,2],3);
      // Matches. [0,1,2] contains [0,1,2,3].
      var overriddenTilesUpper1Match = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2],3);
      // No matches. [0,1,3] doesn't contain [0,1,2,3] nor [0,1,1,2].
      var overriddenTilesUpper1Mismatch = tree.allOverriddenTilesForPathAndZoomLevel([0,1,3],3);
      // Matches. [0,1] contains [0,1,2,3] and [0,1,1,2].
      var overriddenTilesUpper2Match = tree.allOverriddenTilesForPathAndZoomLevel([0,1],3);
      // No matches. [0,2] doesn't contain [0,1,2,3] nor [0,1,1,2].
      var overriddenTilesUpper2Mismatch = tree.allOverriddenTilesForPathAndZoomLevel([0,2],3);
      // Matches. [0,1,2,3,2,1] will be trimmed into [0,1,2,3].
      var overriddenTilesLowerMatch = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2,3,2,1],3);
      // No matches. [0,1,2,1,2,1] will be trimmed into [0,1,2,1].
      var overriddenTilesLowerMismatch = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2,1,2,1],3);

      expect(overriddenTilesExactMatch.length).to.be(1);
      expect(overriddenTilesExactMismatch.length).to.be(0);
      expect(overriddenTilesUpper1Match.length).to.be(1);
      expect(overriddenTilesUpper1Mismatch.length).to.be(0);
      expect(overriddenTilesUpper2Match.length).to.be(2);
      expect(overriddenTilesUpper2Mismatch.length).to.be(0);
      expect(overriddenTilesLowerMatch.length).to.be(1);
      expect(overriddenTilesLowerMismatch.length).to.be(0);
  });

  it('should build valid tree for [0,1,2,3] and [0,1,1,2] and [0,1,3,0]',function(){
       var tree = new schedul.qt.MapTree();
    var tile1 = schedul.qt.Base.tileForPath([0,1,2,3]);
       tree.registerTileOutlineWithTile(tile1);
      expect(tree.paths_.array_.length).to.be(4); // [0,01,012,0123]
       var tile2 = schedul.qt.Base.tileForPath([0,1,1,2]);
       tree.registerTileOutlineWithTile(tile2);
      expect(tree.paths_.array_.length).to.be(6); // [0,01,011,0112,012,0123]
    var tile3 = schedul.qt.Base.tileForPath([0,1,3,0]);
       tree.registerTileOutlineWithTile(tile3);
      expect(tree.paths_.array_.length).to.be(8); // [0,01,011,0112,012,0123,013,0130]

      expect(tree.path2status_['0123']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['012']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0112']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['011']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0130']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['013']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['01']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);

      var mdp012312 = tree.mostDensePathForPath([0,1,2,3,1,2]);
      expect(mdp012312.length).to.be(4); // [0123].length = 4
      var mdp0123 = tree.mostDensePathForPath([0,1,2,3]);
      expect(mdp0123.length).to.be(4); // [0123].length = 4
      var mdp0112 = tree.mostDensePathForPath([0,1,1,2]);
      expect(mdp0112.length).to.be(4); // [0112].length = 4
      var mdp0113 = tree.mostDensePathForPath([0,1,1,3]);
      expect(mdp0113.length).to.be(3); // [011].length = 3
      var mdp0130 = tree.mostDensePathForPath([0,1,3,0]);
      expect(mdp0130.length).to.be(4); // [0130].length = 4
      var mdp013 = tree.mostDensePathForPath([0,1,3,3]);
      expect(mdp013.length).to.be(3); // [013].length = 3
      var mdp010 = tree.mostDensePathForPath([0,1,0]);
      expect(mdp010.length).to.be(2); // [01].length = 2
      var mdp01 = tree.mostDensePathForPath([0,1]);
      expect(mdp01.length).to.be(2); // [01].length = 2
 });

  it('should build and update valid tree for [0,1,2,3] and [0,1,1,2] and [0,1,3,0]',function(){
       var tree = new schedul.qt.MapTree();
    var tile1 = schedul.qt.Base.tileForPath([0,1,2,3]);
       tree.registerTileOutlineWithTile(tile1);
      expect(tree.paths_.array_.length).to.be(4); // [0,01,012,0123]
      tree.overrideTileOutlineWithPath(tile1,[0,1,2,3],schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.paths_.array_.length).to.be(4); // [0,01,012,0123]
       var tile2 = schedul.qt.Base.tileForPath([0,1,1,2]);
       tree.registerTileOutlineWithTile(tile2);
      expect(tree.paths_.array_.length).to.be(6); // [0,01,011,0112,012,0123]
       tree.overrideTileOutlineWithPath(tile2,[0,1,1,2],schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.paths_.array_.length).to.be(6); // [0,01,011,0112,012,0123]
    var tile3 = schedul.qt.Base.tileForPath([0,1,3,0]);
       tree.registerTileOutlineWithTile(tile3);
      expect(tree.paths_.array_.length).to.be(8); // [0,01,011,0112,012,0123,013,0130]
       tree.overrideTileOutlineWithPath(tile3,[0,1,3,0],schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.paths_.array_.length).to.be(8); // [0,01,011,0112,012,0123,013,0130]

      expect(tree.path2status_['0123']).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.path2status_['012']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0112']).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.path2status_['011']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0130']).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.path2status_['013']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['01']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
  });

  it('should build valid tree for [0,1,2,3,3] and [1,1,1,2,0] and [0,1,2,0,2]',function(){
       var tree = new schedul.qt.MapTree();
    var tile1 = schedul.qt.Base.tileForPath([0,1,2,3,3]);
    tree.registerTileOutlineWithTile(tile1);
      expect(tree.paths_.array_.length).to.be(5); // [0,01,012,0123,01233]
    var tile2 = schedul.qt.Base.tileForPath([1,1,1,2,0]);
    tree.registerTileOutlineWithTile(tile2);
      expect(tree.paths_.array_.length).to.be(10); // [0,01,012,0123,01233,1,11,111,1112,11120]
    var tile3 = schedul.qt.Base.tileForPath([0,1,2,0,2]);
    tree.registerTileOutlineWithTile(tile3);
      expect(tree.paths_.array_.length).to.be(12); // [0,01,012,0120,01202,0123,01233,1,11,111,1112,11120]

      expect(tree.path2status_['01233']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0123']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['012']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['11120']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['1112']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['111']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['11']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['1']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['01202']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0120']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['01']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
  });

  it('should properly override [0,1,2,3,3] with [0,1,2,3,3]',function(){
    var tree = new schedul.qt.MapTree();
    var tile1 = schedul.qt.Base.tileForPath([0,1,2,3,3]);
    tree.registerTileOutlineWithTile(tile1);
      expect(tree.paths_.array_.length).to.be(5); // [0,01,012,0123,01233]
    tree.overrideTileOutlineWithPath(tile1,[0,1,2,3,3],schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.paths_.array_.length).to.be(5); // [0,01,012,0123,01233]

      expect(tree.path2status_['01233']).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.path2status_['0123']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['012']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['01']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
  });

  it('should properly override [0,1,2,3,3] with [0,1,2]',function(){
       var tree = new schedul.qt.MapTree();
    var tile1 = schedul.qt.Base.tileForPath([0,1,2,3,3]);
    tree.registerTileOutlineWithTile(tile1);
    tree.overrideTileOutlineWithPath(tile1,[0,1,2],schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.paths_.array_[0]).to.be('0');
      expect(tree.paths_.array_[1]).to.be('01');
      expect(tree.paths_.array_[2]).to.be('012');
      expect(tree.paths_.array_.length).to.be(3); // [0,01,012]

      expect(tree.path2status_['0']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['01']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['012']).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);

      // Matches. [0,1,2] is the only answer.
      var overriddenTilesExactMatch012 = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2],3);
      expect(overriddenTilesExactMatch012.length).to.be(1);
  });

  it('should properly override [0,1,2,3,3] with [0,1,2], where [0,3,0,0,0] is also added',function(){
       var tree = new schedul.qt.MapTree();
       var tile1 = schedul.qt.Base.tileForPath([0,1,2,3,3]);
       tree.registerTileOutlineWithTile(tile1);
      expect(tree.paths_.array_.length).to.be(5); // [0,01,012,0123,01233]

    var tile2 = schedul.qt.Base.tileForPath([0,3,0,0,0]);
    tree.registerTileOutlineWithTile(tile2);
      expect(tree.paths_.array_.length).to.be(9); // [0,01,012,0123,01233,03,030,0300,03000]

      tree.overrideTileOutlineWithPath(tile1,[0,1,2],schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.paths_.array_.length).to.be(7); // [0,01,012,03,030,0300,03000]
      tree.overrideTileOutlineWithPath(tile2,[0,3,0,0,0],schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.paths_.array_.length).to.be(7); // [0,01,012,03,030,0300,03000]

      expect(tree.path2status_['012']).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.path2status_['01']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['03000']).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.path2status_['0300']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['030']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['03']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['0']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);

      // Matches. [0,1,2] is the only answer.
      var overriddenTilesExactMatch012 = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2],3);
      expect(overriddenTilesExactMatch012.length).to.be(1);
      // Matches. [0,3,0,0,0] is the only answer.
      var overriddenTilesExactMatch03000 = tree.allOverriddenTilesForPathAndZoomLevel([0,3,0,0,0],3);
      expect(overriddenTilesExactMatch03000.length).to.be(1);
      // Matches. Both [0,1,2] and [0,3,0,0,0] are the answers.
      var overriddenTilesExactMatch0 = tree.allOverriddenTilesForPathAndZoomLevel([0],5);
      expect(overriddenTilesExactMatch0.length).to.be(2);

    // Check if vessel will be filled even if the path is new and root node is already set
       var tile4 = schedul.qt.Base.tileForPath([0,2,1,1,3]);
  tree.registerTileOutlineWithTile(tile4);
      expect(tree.paths_.array_.length).to.be(11); // [0,01,012,02,021,0211,02113,03,030,0300,03000]
   tree.overrideTileOutlineWithPath(tile4,[0,2,1,1,3],schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.paths_.array_.length).to.be(11); // [0,01,012,02,021,0211,02113,03,030,0300,03000]

      expect(tree.path2status_['02113']).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.path2status_['0211']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['021']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['02']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);

    // Check if vessel will be filled even if the path is new and root node is already set and is splitting at the end
    var tile5 = schedul.qt.Base.tileForPath([0,2,1,1,2]);
       tree.registerTileOutlineWithTile(tile5);
      expect(tree.paths_.array_.length).to.be(12); // [0,01,012,02,021,0211,02112,02113,03,030,0300,03000]
   tree.overrideTileOutlineWithPath(tile5,[0,2,1,1,2],schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.paths_.array_.length).to.be(12); // [0,01,012,02,021,0211,02112,02113,03,030,0300,03000]

      expect(tree.path2status_['02112']).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);
      expect(tree.path2status_['0211']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
  });

  it('should properly override [0,1,2,0],[0,1,2,1],[0,1,2,2],[0,1,2,3,1] with [0,1,2]',function(){
       var tree = new schedul.qt.MapTree();
    var tile1 = schedul.qt.Base.tileForPath([0,1,2,0]);
    tree.registerTileOutlineWithTile(tile1);
    var tile2 = schedul.qt.Base.tileForPath([0,1,2,1]);
    tree.registerTileOutlineWithTile(tile2);
    var tile3 = schedul.qt.Base.tileForPath([0,1,2,2]);
    tree.registerTileOutlineWithTile(tile3);
    var tile4 = schedul.qt.Base.tileForPath([0,1,2,3,1]);
    tree.registerTileOutlineWithTile(tile4);
      var notDirectlyRequestedButDiedTilesVessel = [];
      tree.overrideTileOutlineWithPath(tile1,[0,1,2],schedul.qt.NodeStatus.IS_SURELY_LEAF,notDirectlyRequestedButDiedTilesVessel);
      expect(tree.paths_.array_[0]).to.be('0');
      expect(tree.paths_.array_[1]).to.be('01');
      expect(tree.paths_.array_[2]).to.be('012');
      expect(tree.paths_.array_.length).to.be(3); // [0,01,012].length = 3
      expect(notDirectlyRequestedButDiedTilesVessel.length).to.be(3); // [0121,0122,01231].length = 3

      expect(tree.path2status_['0']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['01']).to.be(schedul.qt.NodeStatus.IS_MYSTERIOUS);
      expect(tree.path2status_['012']).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);

      // Matches. [0,1,2] is the only answer.
      var overriddenTilesExactMatch012 = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2],3);
      expect(overriddenTilesExactMatch012.length).to.be(1);
  });
});
