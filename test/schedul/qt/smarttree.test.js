describe('schedul.qt.SmartTree, general',function(){
  it('should build valid tree for [0,1,2,3]',function(){
       var tree = new schedul.qt.SmartTree();
    var tile = schedul.qt.Base.tileForPath([0,1,2,3]);
      tree.registerTileOutlineWithPath(tile);
      var rootNode = tree.rootNode_;
    expect(rootNode.partialPath_.length).to.be(4);
    expect(rootNode.partialPath_[0]).to.be(0);
    expect(rootNode.partialPath_[1]).to.be(1);
    expect(rootNode.partialPath_[2]).to.be(2);
    expect(rootNode.partialPath_[3]).to.be(3);

    var path = tree.pathForTile(tile);
    expect(path).to.be(null);
  });

  it('should build and update valid tree for [0,1,2,3]',function(){
       var tree = new schedul.qt.SmartTree();
    var tile = schedul.qt.Base.tileForPath([0,1,2,3]);
    tree.registerTileOutlineWithPath(tile);
    tree.overrideTileOutlineWithPath(tile,[0,1,2,3],schedul.qt.NodeStatus.IS_SURELY_LEAF); // Echoed result
       var rootNode = tree.rootNode_;
    expect(rootNode.partialPath_.length).to.be(3);
    expect(rootNode.partialPath_[0]).to.be(0);
    expect(rootNode.partialPath_[1]).to.be(1);
    expect(rootNode.partialPath_[2]).to.be(2);

    var path = tree.pathForTile(tile);
    expect(path[0]).to.be(0);
    expect(path[1]).to.be(1);
    expect(path[2]).to.be(2);
    expect(path[3]).to.be(3);

      // Matches. [0,1,2,3] is the only answer.
      var overriddenTilesExactMatch = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2,3],3);
      // No matches.
      var overriddenTilesExactMismatch = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2,2],3);
      // Matches. [0,1,2] contains [0,1,2,3].
      var overriddenTilesUpper1Match = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2],3);
      // No matches. [0,1,3] doesn't contain [0,1,2,3].
      var overriddenTilesUpper1Mismatch = tree.allOverriddenTilesForPathAndZoomLevel([0,1,3],3);
      // Matches. [0,1] contains [0,1,2,3].
      var overriddenTilesUpper2Match = tree.allOverriddenTilesForPathAndZoomLevel([0,1],3);
      // No matches. [0,2] doesn't contain [0,1,2,3].
      var overriddenTilesUpper2Mismatch = tree.allOverriddenTilesForPathAndZoomLevel([0,2],3);
      // Matches. [0,1,2,3,2,1] will be trimmed into [0,1,2,3].
      var overriddenTilesLowerMatch = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2,3,2,1],3);
      // No matches. [0,1,2,1,2,1] will be trimmed into [0,1,2,1].
      var overriddenTilesLowerMismatch = tree.allOverriddenTilesForPathAndZoomLevel([0,1,2,1,2,1],3);

      // expect(overriddenTilesExactMatch.length).to.be(1);
      // expect(overriddenTilesExactMatch[0].x).to.be(5);
      // expect(overriddenTilesExactMatch[0].y).to.be(-4);
      // expect(overriddenTilesExactMatch[0].z).to.be(3);
      // expect(overriddenTilesExactMismatch.length).to.be(0);
      // expect(overriddenTilesUpper1Match.length).to.be(1);
      // expect(overriddenTilesUpper1Match[0].x).to.be(5);
      // expect(overriddenTilesUpper1Match[0].y).to.be(-4);
      // expect(overriddenTilesUpper1Match[0].z).to.be(3);
      // expect(overriddenTilesUpper1Mismatch.length).to.be(0);
      // expect(overriddenTilesUpper2Match.length).to.be(1);
      // expect(overriddenTilesUpper2Match[0].x).to.be(5);
      // expect(overriddenTilesUpper2Match[0].y).to.be(-4);
      // expect(overriddenTilesUpper2Match[0].z).to.be(3);
      // expect(overriddenTilesUpper2Mismatch.length).to.be(0);
      // expect(overriddenTilesLowerMatch.length).to.be(1);
      // expect(overriddenTilesLowerMatch[0].x).to.be(5);
      // expect(overriddenTilesLowerMatch[0].y).to.be(-4);
      // expect(overriddenTilesLowerMatch[0].z).to.be(3);
      // expect(overriddenTilesLowerMismatch.length).to.be(0);
  });

  it('should build valid tree for [0,1,2,3] and [0,1,1,2]',function(){
    var tree = new schedul.qt.SmartTree();
    var tile1 = schedul.qt.Base.tileForPath([0,1,2,3]);
    tree.registerTileOutlineWithPath(tile1);
    var tile2 = schedul.qt.Base.tileForPath([0,1,1,2]);
    tree.registerTileOutlineWithPath(tile2);

    var rootNode = tree.rootNode_;
    expect(rootNode.partialPath_.length).to.be(2); // [0,1]
    expect(rootNode.partialPath_[0]).to.be(0);
    expect(rootNode.partialPath_[1]).to.be(1);
    expect(rootNode.children_[2].partialPath_[0]).to.be(3);
    expect(rootNode.children_[1].partialPath_[0]).to.be(2);

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

      // expect(overriddenTilesExactMatch.length).to.be(1);
      // expect(overriddenTilesExactMismatch.length).to.be(0);
      // expect(overriddenTilesUpper1Match.length).to.be(1);
      // expect(overriddenTilesUpper1Mismatch.length).to.be(0);
      // expect(overriddenTilesUpper2Match.length).to.be(2);
      // expect(overriddenTilesUpper2Mismatch.length).to.be(0);
      // expect(overriddenTilesLowerMatch.length).to.be(1);
      // expect(overriddenTilesLowerMismatch.length).to.be(0);
  });

  it('should build and update valid tree for [0,1,2,3] and [0,1,1,2]',function(){
    var tree = new schedul.qt.SmartTree();
    var tile1 = schedul.qt.Base.tileForPath([0,1,2,3]);
    tree.registerTileOutlineWithPath(tile1);
      tree.overrideTileOutlineWithPath(tile1,[0,1,2,3],schedul.qt.NodeStatus.IS_SURELY_LEAF);
    tree.registerTileOutlineWithPath(tile1);
    var tile2 = schedul.qt.Base.tileForPath([0,1,1,2]);
    tree.registerTileOutlineWithPath(tile2);
      tree.overrideTileOutlineWithPath(tile2,[0,1,1,2],schedul.qt.NodeStatus.IS_SURELY_LEAF);

       var rootNode = tree.rootNode_;
    expect(rootNode.partialPath_.length).to.be(2); // [0,1]
    expect(rootNode.partialPath_[0]).to.be(0);
    expect(rootNode.partialPath_[1]).to.be(1);
    expect(rootNode.children_[2].children_[3].status_).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);
    expect(rootNode.children_[1].children_[2].status_).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);
  });

  it('should build valid tree for [0,1,2,3] and [0,1,1,2] and [0,1,3,0]',function(){
       var tree = new schedul.qt.SmartTree();
    var tile1 = schedul.qt.Base.tileForPath([0,1,2,3]);
       tree.registerTileOutlineWithPath(tile1);
       var tile2 = schedul.qt.Base.tileForPath([0,1,1,2]);
       tree.registerTileOutlineWithPath(tile2);
    var tile3 = schedul.qt.Base.tileForPath([0,1,3,0]);
       tree.registerTileOutlineWithPath(tile3);

       var rootNode = tree.rootNode_;
    expect(rootNode.partialPath_.length).to.be(2);
    expect(rootNode.partialPath_[0]).to.be(0);
    expect(rootNode.partialPath_[1]).to.be(1);
    expect(rootNode.children_[2].partialPath_[0]).to.be(3);
    expect(rootNode.children_[1].partialPath_[0]).to.be(2);
    expect(rootNode.children_[3].partialPath_[0]).to.be(0);
  });

  it('should build and update valid tree for [0,1,2,3] and [0,1,1,2] and [0,1,3,0]',function(){
       var tree = new schedul.qt.SmartTree();
    var tile1 = schedul.qt.Base.tileForPath([0,1,2,3]);
       tree.registerTileOutlineWithPath(tile1);
      tree.overrideTileOutlineWithPath(tile1,[0,1,2,3],schedul.qt.NodeStatus.IS_SURELY_LEAF);
       var tile2 = schedul.qt.Base.tileForPath([0,1,1,2]);
       tree.registerTileOutlineWithPath(tile2);
       tree.overrideTileOutlineWithPath(tile2,[0,1,1,2],schedul.qt.NodeStatus.IS_SURELY_LEAF);
    var tile3 = schedul.qt.Base.tileForPath([0,1,3,0]);
       tree.registerTileOutlineWithPath(tile3);
       tree.overrideTileOutlineWithPath(tile3,[0,1,3,0],schedul.qt.NodeStatus.IS_SURELY_LEAF);

       var rootNode = tree.rootNode_;
    expect(rootNode.partialPath_.length).to.be(2);
    expect(rootNode.partialPath_[0]).to.be(0);
    expect(rootNode.partialPath_[1]).to.be(1);
    expect(rootNode.children_[2].children_[3].status_).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);
    expect(rootNode.children_[1].children_[2].status_).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);
    expect(rootNode.children_[3].children_[0].status_).to.be(schedul.qt.NodeStatus.IS_SURELY_LEAF);
  });

  it('should build valid tree for [0,1,2,3,3] and [1,1,1,2,0] and [0,1,2,0,2]',function(){
       var tree = new schedul.qt.SmartTree();
    var tile1 = schedul.qt.Base.tileForPath([0,1,2,3,3]);
    tree.registerTileOutlineWithPath(tile1);
    var tile2 = schedul.qt.Base.tileForPath([1,1,1,2,0]);
    tree.registerTileOutlineWithPath(tile2);
    var tile3 = schedul.qt.Base.tileForPath([0,1,2,0,2]);
    tree.registerTileOutlineWithPath(tile3);

    var rootNode = tree.rootNode_;
    expect(rootNode.partialPath_.length).to.be(0);
    expect(rootNode.children_[0].partialPath_.length).to.be(2); // [1,2]
    expect(rootNode.children_[0].partialPath_[0]).to.be(1);
    expect(rootNode.children_[0].partialPath_[1]).to.be(2);
    expect(rootNode.children_[0].children_[3].partialPath_.length).to.be(1); // [3]
    expect(rootNode.children_[0].children_[3].partialPath_[0]).to.be(3);
    expect(rootNode.children_[0].children_[0].partialPath_.length).to.be(1); // [2]
    expect(rootNode.children_[0].children_[0].partialPath_[0]).to.be(2);
    expect(rootNode.children_[1].partialPath_.length).to.be(4); // [1,1,2,0]
    expect(rootNode.children_[1].partialPath_[0]).to.be(1);
    expect(rootNode.children_[1].partialPath_[1]).to.be(1);
    expect(rootNode.children_[1].partialPath_[2]).to.be(2);
    expect(rootNode.children_[1].partialPath_[3]).to.be(0);
  });

  it('should properly override [0,1,2,3,3] with [0,1,2,3,3]',function(){
    var tree = new schedul.qt.SmartTree();
    var tile1 = schedul.qt.Base.tileForPath([0,1,2,3,3]);
    tree.registerTileOutlineWithPath(tile1);
    tree.overrideTileOutlineWithPath(tile1,[0,1,2,3,3],schedul.qt.NodeStatus.IS_SURELY_LEAF);

    var rootNode = tree.rootNode_;
    expect(rootNode.partialPath_.length).to.be(4);
    expect(rootNode.partialPath_[0]).to.be(0);
    expect(rootNode.partialPath_[1]).to.be(1);
    expect(rootNode.partialPath_[2]).to.be(2);
    expect(rootNode.partialPath_[3]).to.be(3);
    expect(rootNode.children_[3].status_).to.be(1);
  });

  it('should properly override [0,1,2,3,3] with [0,1,2]',function(){
       var tree = new schedul.qt.SmartTree();
    var tile1 = schedul.qt.Base.tileForPath([0,1,2,3,3]);
    tree.registerTileOutlineWithPath(tile1);
    tree.overrideTileOutlineWithPath(tile1,[0,1,2],schedul.qt.NodeStatus.IS_SURELY_LEAF);

    var rootNode = tree.rootNode_;
    expect(rootNode.partialPath_.length).to.be(2);
    expect(rootNode.partialPath_[0]).to.be(0);
    expect(rootNode.partialPath_[1]).to.be(1);
    expect(rootNode.children_[2].status_).to.be(1);
  });

  it('should properly override [0,1,2,3,3] with [0,1,2], where [0,3,0,0,0] is also added',function(){
       var tree = new schedul.qt.SmartTree();
       var tile1 = schedul.qt.Base.tileForPath([0,1,2,3,3]);
       tree.registerTileOutlineWithPath(tile1);

    var tile2 = schedul.qt.Base.tileForPath([0,3,0,0,0]);
    tree.registerTileOutlineWithPath(tile2);

       tree.overrideTileOutlineWithPath(tile1,[0,1,2],schedul.qt.NodeStatus.IS_SURELY_LEAF);
    tree.overrideTileOutlineWithPath(tile2,[0,3,0,0,0],schedul.qt.NodeStatus.IS_SURELY_LEAF);

       var path = tree.pathForTile(tile1);
    expect(path.length).to.be(3);
    expect(path[0]).to.be(0);
    expect(path[1]).to.be(1);
    expect(path[2]).to.be(2);

    var tile3 = schedul.qt.Base.tileForPath([0,1,2,3,0]);
       tree.registerTileOutlineWithPath(tile3,path);
    tree.overrideTileOutlineWithPath(tile3,[0,1,2,3,0],schedul.qt.NodeStatus.IS_SURELY_LEAF);

    // Check if vessel will be filled even if the path is new and root node is already set
       var tile4 = schedul.qt.Base.tileForPath([0,2,1,1,3]);
  tree.registerTileOutlineWithPath(tile4);
   tree.overrideTileOutlineWithPath(tile4,[0,2,1,1,3],schedul.qt.NodeStatus.IS_SURELY_LEAF);

    path = tree.pathForTile(tile4);
       expect(path.length).to.be(5);
       expect(path[0]).to.be(0);
       expect(path[1]).to.be(2);
       expect(path[2]).to.be(1);
       expect(path[3]).to.be(1);
       expect(path[4]).to.be(3);

    // Check if vessel will be filled even if the path is new and root node is already set and is splitting at the end
    var tile5 = schedul.qt.Base.tileForPath([0,2,1,1,2]);
       tree.registerTileOutlineWithPath(tile5);
   tree.overrideTileOutlineWithPath(tile5,[0,2,1,1,2],schedul.qt.NodeStatus.IS_SURELY_LEAF);

    path = tree.pathForTile(tile5);
       expect(path.length).to.be(5);
       expect(path[0]).to.be(0);
       expect(path[1]).to.be(2);
       expect(path[2]).to.be(1);
       expect(path[3]).to.be(1);
       expect(path[4]).to.be(2);
  });
});
